from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.models import (
    Like, Comment, Favourite, Media,
    Notification, NotificationType
)
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/social", tags=["social"])


# ─── LIKES ────────────────────────────────────────────

@router.post("/like/{media_id}")
def toggle_like(
    media_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    existing = db.query(Like).filter(
        Like.media_id == media_id,
        Like.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False, "like_count": len(media.likes) - 1}

    like = Like(user_id=current_user.id, media_id=media_id)
    db.add(like)

    # Notify uploader if it's not the same user
    if media.uploader_id != current_user.id:
        notif = Notification(
            user_id=media.uploader_id,
            triggered_by=current_user.id,
            type=NotificationType.LIKE,
            message=f"{current_user.username} liked your photo",
            related_media_id=media_id
        )
        db.add(notif)

    db.commit()
    return {"liked": True, "like_count": len(media.likes) + 1}


@router.get("/likes/{media_id}")
def get_likes(media_id: str, db: Session = Depends(get_db)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"like_count": len(media.likes)}


# ─── COMMENTS ─────────────────────────────────────────

@router.post("/comment/{media_id}")
def add_comment(
    media_id: str,
    content: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    comment = Comment(
        user_id=current_user.id,
        media_id=media_id,
        content=content.strip()
    )
    db.add(comment)

    # Notify uploader
    if media.uploader_id != current_user.id:
        notif = Notification(
            user_id=media.uploader_id,
            triggered_by=current_user.id,
            type=NotificationType.COMMENT,
            message=f"{current_user.username} commented on your photo",
            related_media_id=media_id
        )
        db.add(notif)

    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "content": comment.content,
        "username": current_user.username,
        "created_at": comment.created_at
    }


@router.get("/comments/{media_id}")
def get_comments(media_id: str, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(
        Comment.media_id == media_id
    ).order_by(Comment.created_at.asc()).all()

    return [
        {
            "id": c.id,
            "content": c.content,
            "username": c.user.username,
            "avatar_url": c.user.avatar_url,
            "created_at": c.created_at
        }
        for c in comments
    ]


@router.delete("/comment/{comment_id}")
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


# ─── FAVOURITES ───────────────────────────────────────

@router.post("/favourite/{media_id}")
def toggle_favourite(
    media_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    existing = db.query(Favourite).filter(
        Favourite.media_id == media_id,
        Favourite.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"favourited": False}

    fav = Favourite(user_id=current_user.id, media_id=media_id)
    db.add(fav)
    db.commit()
    return {"favourited": True}


@router.get("/favourites")
def get_my_favourites(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    favs = db.query(Favourite).filter(
        Favourite.user_id == current_user.id
    ).all()
    return [
        {
            "id": f.media.id,
            "url": f.media.s3_key,
            "thumbnail_url": f.media.thumbnail_key,
            "caption": f.media.caption,
            "uploaded_at": f.media.uploaded_at
        }
        for f in favs
    ]


# ─── NOTIFICATIONS ────────────────────────────────────

@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

    return [
        {
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "is_read": n.is_read,
            "related_media_id": n.related_media_id,
            "created_at": n.created_at
        }
        for n in notifs
    ]


@router.post("/notifications/read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}