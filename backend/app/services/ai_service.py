import cloudinary.uploader
import cloudinary
import requests
import tempfile
import os
from deepface import DeepFace
from sqlalchemy.orm import Session
from app.models.models import Media, Tag, MediaTag, FacialIndex, User
from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def download_image_to_temp(url: str) -> str:
    """Download image from URL to a temp file, return path"""
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    suffix = ".jpg"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(response.content)
    tmp.close()
    return tmp.name


def generate_tags_for_media(media_id: str, db: Session) -> list:
    """
    Try Cloudinary auto-tagging first.
    Falls back to DeepFace emotion/attribute detection.
    """
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        return []

    tags_to_add = []

    try:
        # Try Cloudinary categorization (works if Imagga add-on is enabled)
        result = cloudinary.uploader.explicit(
            media.s3_key,
            type="fetch",
            categorization="imagga_tagging",
            auto_tagging=0.5
        )
        tags_data = result.get("tags", [])
        tags_to_add = [t["tag"] for t in tags_data if t.get("confidence", 0) > 0.5]
    except Exception:
        pass

    # Fallback: use DeepFace to detect faces and emotions
    if not tags_to_add and media.media_type == "PHOTO":
        try:
            img_path = download_image_to_temp(media.s3_key)
            try:
                analysis = DeepFace.analyze(
                    img_path,
                    actions=["emotion", "age", "gender"],
                    enforce_detection=False,
                    silent=True
                )
                if isinstance(analysis, list):
                    analysis = analysis[0]

                # Add emotion tag
                emotion = analysis.get("dominant_emotion")
                if emotion:
                    tags_to_add.append(emotion)

                # Add gender tag
                gender = analysis.get("dominant_gender", "")
                if gender:
                    tags_to_add.append(gender.lower())

                # Add age group tag
                age = analysis.get("age", 0)
                if age:
                    if age < 18:
                        tags_to_add.append("youth")
                    elif age < 35:
                        tags_to_add.append("young adult")
                    else:
                        tags_to_add.append("adult")

                tags_to_add.append("people")
            except Exception:
                # No face detected — add generic tag
                tags_to_add.append("photo")
            finally:
                os.unlink(img_path)
        except Exception:
            tags_to_add = ["media"]

    # Save tags to DB
    saved = []
    for tag_name in set(tags_to_add):
        tag_name = tag_name.strip().lower()
        if not tag_name:
            continue
        # Get or create tag
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.flush()

        # Avoid duplicate media_tags
        exists = db.query(MediaTag).filter(
            MediaTag.media_id == media_id,
            MediaTag.tag_id == tag.id
        ).first()
        if not exists:
            media_tag = MediaTag(media_id=media_id, tag_id=tag.id, confidence=0.8)
            db.add(media_tag)
            saved.append(tag_name)

    db.commit()
    return saved


def find_faces_in_photo(media_id: str, db: Session) -> list:
    """
    For a given media item, check if any registered user's
    reference selfie matches a face in the photo.
    Returns list of matched user_ids.
    """
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media or media.media_type != "PHOTO":
        return []

    # Get all users with reference selfies
    users_with_selfie = db.query(User).filter(
        User.avatar_url.isnot(None),
        User.avatar_url.like("%cloudinary%")
    ).all()

    if not users_with_selfie:
        return []

    matched_users = []
    photo_path = None

    try:
        photo_path = download_image_to_temp(media.s3_key)

        for user in users_with_selfie:
            selfie_path = None
            try:
                selfie_path = download_image_to_temp(user.avatar_url)
                result = DeepFace.verify(
                    img1_path=selfie_path,
                    img2_path=photo_path,
                    enforce_detection=False,
                    silent=True
                )
                if result.get("verified"):
                    # Check if already indexed
                    existing = db.query(FacialIndex).filter(
                        FacialIndex.user_id == user.id,
                        FacialIndex.media_id == media_id
                    ).first()
                    if not existing:
                        fi = FacialIndex(
                            user_id=user.id,
                            media_id=media_id,
                            confidence=1 - result.get("distance", 0.4)
                        )
                        db.add(fi)
                    matched_users.append(user.id)
            except Exception:
                pass
            finally:
                if selfie_path and os.path.exists(selfie_path):
                    os.unlink(selfie_path)

        db.commit()
    except Exception:
        pass
    finally:
        if photo_path and os.path.exists(photo_path):
            os.unlink(photo_path)

    return matched_users