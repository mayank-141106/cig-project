from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models.models import Media, Album, Event, ClubMember, MediaType
from app.services.cloudinary_service import upload_image
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/{album_id}")
async def upload_media(
    album_id: str,
    files: List[UploadFile] = File(...),
    caption: str = Form(None),
    is_public: bool = Form(True),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check album exists
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    # Check user is a club member
    event = db.query(Event).filter(Event.id == album.event_id).first()
    membership = db.query(ClubMember).filter(
        ClubMember.club_id == event.club_id,
        ClubMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this club")

    uploaded = []
    errors = []

    for file in files:
        try:
            # Validate file type
            if file.content_type not in ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES:
                errors.append({"file": file.filename, "error": "File type not allowed"})
                continue

            # Read file
            file_bytes = await file.read()

            # Validate file size
            if len(file_bytes) > MAX_FILE_SIZE:
                errors.append({"file": file.filename, "error": "File too large (max 50MB)"})
                continue

            # Determine media type
            media_type = MediaType.VIDEO if file.content_type in ALLOWED_VIDEO_TYPES else MediaType.PHOTO

            # Upload to Cloudinary
            folder = f"cig-media/{event.club_id}/{event.id}"
            result = upload_image(file_bytes, folder=folder)

            # Save to database
            media = Media(
                album_id=album_id,
                uploader_id=current_user.id,
                s3_key=result["url"],
                thumbnail_key=result["thumbnail_url"],
                media_type=media_type,
                caption=caption,
                is_public=is_public,
                width=result["width"],
                height=result["height"],
                file_size=result["file_size"]
            )
            db.add(media)
            db.flush()
            uploaded.append({
                "id": media.id,
                "url": result["url"],
                "thumbnail_url": result["thumbnail_url"],
                "media_type": media_type
            })

        except Exception as e:
            errors.append({"file": file.filename, "error": str(e)})

    db.commit()

    return {
        "uploaded": uploaded,
        "errors": errors,
        "total_uploaded": len(uploaded),
        "total_failed": len(errors)
    }