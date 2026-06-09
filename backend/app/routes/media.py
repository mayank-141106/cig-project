from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.models import Media, Album, Event, ClubMember
from app.services.cloudinary_service import delete_image
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/album/{album_id}")
def get_album_media(
    album_id: str,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    offset = (page - 1) * limit
    media_list = (
        db.query(Media)
        .filter(Media.album_id == album_id)
        .order_by(Media.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total = db.query(Media).filter(Media.album_id == album_id).count()

    return {
        "items": [
            {
                "id": m.id,
                "url": m.s3_key,
                "thumbnail_url": m.thumbnail_key,
                "media_type": m.media_type,
                "caption": m.caption,
                "uploader": m.uploader.username,
                "uploaded_at": m.uploaded_at,
                "like_count": len(m.likes),
                "comment_count": len(m.comments)
            }
            for m in media_list
        ],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{media_id}")
def get_media_detail(
    media_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    return {
        "id": media.id,
        "url": media.s3_key,
        "thumbnail_url": media.thumbnail_key,
        "media_type": media.media_type,
        "caption": media.caption,
        "is_public": media.is_public,
        "width": media.width,
        "height": media.height,
        "uploader": media.uploader.username,
        "uploaded_at": media.uploaded_at,
        "tags": [mt.tag.name for mt in media.tags],
        "like_count": len(media.likes),
        "comment_count": len(media.comments)
    }


@router.delete("/{media_id}")
def delete_media(
    media_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Only uploader can delete
    if media.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Delete from Cloudinary using the public_id
    # public_id is embedded in the URL, extract it
    delete_image(media.s3_key)
    db.delete(media)
    db.commit()
    return {"message": "Deleted successfully"}

from fastapi.responses import Response
from app.services.watermark_service import add_watermark
from app.models.models import ClubMember

@router.get("/{media_id}/download")
def download_media(
    media_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Get user role for watermark
    album = media.album
    event = album.event
    membership = db.query(ClubMember).filter(
        ClubMember.club_id == event.club_id,
        ClubMember.user_id == current_user.id
    ).first()

    role = membership.role.value if membership else "Viewer"
    watermark_text = f"{event.club.name} | {event.name} | {role}"

    try:
        image_bytes = add_watermark(media.s3_key, watermark_text)
        return Response(
            content=image_bytes,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'attachment; filename="cig-media-{media_id}.jpg"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")