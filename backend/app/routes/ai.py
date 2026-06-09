from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from app.models.models import Media, FacialIndex, User
from app.services.ai_service import generate_tags_for_media, find_faces_in_photo
from app.services.cloudinary_service import upload_image
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/tag/{media_id}")
def tag_media(
    media_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Trigger AI tagging for a media item"""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Run in background so API responds immediately
    background_tasks.add_task(generate_tags_for_media, media_id, db)
    return {"message": "Tagging started", "media_id": media_id}


@router.post("/tag-all")
def tag_all_media(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Tag all untagged media items"""
    untagged = db.query(Media).filter(~Media.tags.any()).limit(20).all()
    for media in untagged:
        background_tasks.add_task(generate_tags_for_media, media.id, db)
    return {"message": f"Tagging {len(untagged)} items in background"}


@router.post("/selfie")
async def upload_selfie(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Upload a reference selfie for facial recognition"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image")

    file_bytes = await file.read()
    result = upload_image(file_bytes, folder="cig-selfies")

    # Save URL as user's avatar
    user = db.query(User).filter(User.id == current_user.id).first()
    user.avatar_url = result["url"]
    db.commit()

    return {
        "message": "Selfie uploaded successfully",
        "selfie_url": result["url"]
    }


@router.post("/find-my-photos")
def find_my_photos(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Scan all photos for current user's face"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user.avatar_url:
        raise HTTPException(
            status_code=400,
            detail="Please upload a reference selfie first"
        )

    # Get recent media not yet scanned for this user
    scanned_ids = [
        fi.media_id for fi in
        db.query(FacialIndex).filter(FacialIndex.user_id == current_user.id).all()
    ]
    to_scan = (
        db.query(Media)
        .filter(Media.id.notin_(scanned_ids))
        .filter(Media.media_type == "PHOTO")
        .limit(30)
        .all()
    )

    for media in to_scan:
        background_tasks.add_task(find_faces_in_photo, media.id, db)

    return {
        "message": f"Scanning {len(to_scan)} photos in background",
        "scanning_count": len(to_scan)
    }


@router.get("/my-photos")
def get_my_photos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all photos where current user's face was detected"""
    matches = (
        db.query(FacialIndex)
        .filter(FacialIndex.user_id == current_user.id)
        .order_by(FacialIndex.created_at.desc())
        .all()
    )
    return [
        {
            "id": m.media.id,
            "url": m.media.s3_key,
            "thumbnail_url": m.media.thumbnail_key,
            "confidence": m.confidence,
            "uploaded_at": m.media.uploaded_at,
            "uploader": m.media.uploader.username,
            "tags": [mt.tag.name for mt in m.media.tags]
        }
        for m in matches
        if m.media
    ]


@router.get("/search")
def search_media(
    q: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Search media by tag name, event name, or uploader"""
    from app.models.models import Tag, MediaTag, Album, Event
    from sqlalchemy import or_

    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query too short")

    q = q.strip().lower()

    # Search by tag
    tag_matches = (
        db.query(Media)
        .join(MediaTag)
        .join(Tag)
        .filter(Tag.name.ilike(f"%{q}%"))
        .limit(20)
        .all()
    )

    # Search by uploader username
    from app.models.models import User as UserModel
    user_matches = (
        db.query(Media)
        .join(UserModel, Media.uploader_id == UserModel.id)
        .filter(UserModel.username.ilike(f"%{q}%"))
        .limit(10)
        .all()
    )

    all_media = {m.id: m for m in tag_matches + user_matches}

    return [
        {
            "id": m.id,
            "url": m.s3_key,
            "thumbnail_url": m.thumbnail_key,
            "caption": m.caption,
            "uploader": m.uploader.username,
            "tags": [mt.tag.name for mt in m.tags],
            "uploaded_at": m.uploaded_at
        }
        for m in all_media.values()
    ]