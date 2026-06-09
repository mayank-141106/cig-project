from sqlalchemy import (
    Column, String, Boolean, Integer, Float,
    DateTime, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid
import enum

def generate_uuid():
    return str(uuid.uuid4())


# ─── Enums ────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PHOTOGRAPHER = "PHOTOGRAPHER"
    CLUB_MEMBER = "CLUB_MEMBER"
    VIEWER = "VIEWER"

class MediaType(str, enum.Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"

class NotificationType(str, enum.Enum):
    LIKE = "LIKE"
    COMMENT = "COMMENT"
    TAG = "TAG"
    UPLOAD = "UPLOAD"


# ─── Users ────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=generate_uuid)
    email         = Column(String, unique=True, nullable=False, index=True)
    username      = Column(String, unique=True, nullable=False, index=True)
    full_name     = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url    = Column(String, nullable=True)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    club_memberships = relationship("ClubMember", back_populates="user")
    uploaded_media   = relationship("Media", back_populates="uploader")
    likes            = relationship("Like", back_populates="user")
    comments         = relationship("Comment", back_populates="user")
    favourites       = relationship("Favourite", back_populates="user")
    notifications    = relationship("Notification", back_populates="user", foreign_keys="Notification.user_id")
    facial_matches   = relationship("FacialIndex", back_populates="user")


# ─── Clubs ────────────────────────────────────────────

class Club(Base):
    __tablename__ = "clubs"

    id          = Column(String, primary_key=True, default=generate_uuid)
    name        = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    logo_url    = Column(String, nullable=True)
    created_by  = Column(String, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("ClubMember", back_populates="club")
    events  = relationship("Event", back_populates="club")


# ─── Club Members ─────────────────────────────────────

class ClubMember(Base):
    __tablename__ = "club_members"

    id        = Column(String, primary_key=True, default=generate_uuid)
    user_id   = Column(String, ForeignKey("users.id"), nullable=False)
    club_id   = Column(String, ForeignKey("clubs.id"), nullable=False)
    role      = Column(Enum(UserRole), default=UserRole.CLUB_MEMBER, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="club_memberships")
    club = relationship("Club", back_populates="members")


# ─── Events ───────────────────────────────────────────

class Event(Base):
    __tablename__ = "events"

    id          = Column(String, primary_key=True, default=generate_uuid)
    club_id     = Column(String, ForeignKey("clubs.id"), nullable=False)
    created_by  = Column(String, ForeignKey("users.id"), nullable=False)
    name        = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category    = Column(String, nullable=True)   # e.g. "Workshop", "Trip", "Fest"
    date        = Column(DateTime(timezone=True), nullable=True)
    is_public   = Column(Boolean, default=True)
    cover_url   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    club   = relationship("Club", back_populates="events")
    albums = relationship("Album", back_populates="event")


# ─── Albums ───────────────────────────────────────────

class Album(Base):
    __tablename__ = "albums"

    id          = Column(String, primary_key=True, default=generate_uuid)
    event_id    = Column(String, ForeignKey("events.id"), nullable=False)
    name        = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    event  = relationship("Event", back_populates="albums")
    media  = relationship("Media", back_populates="album")


# ─── Media ────────────────────────────────────────────

class Media(Base):
    __tablename__ = "media"

    id            = Column(String, primary_key=True, default=generate_uuid)
    album_id      = Column(String, ForeignKey("albums.id"), nullable=False)
    uploader_id   = Column(String, ForeignKey("users.id"), nullable=False)
    s3_key        = Column(String, nullable=False)        # full resolution
    thumbnail_key = Column(String, nullable=True)         # compressed version
    media_type    = Column(Enum(MediaType), default=MediaType.PHOTO)
    caption       = Column(String, nullable=True)
    is_public     = Column(Boolean, default=True)
    width         = Column(Integer, nullable=True)
    height        = Column(Integer, nullable=True)
    file_size     = Column(Integer, nullable=True)        # bytes
    uploaded_at   = Column(DateTime(timezone=True), server_default=func.now())

    album        = relationship("Album", back_populates="media")
    uploader     = relationship("User", back_populates="uploaded_media")
    tags         = relationship("MediaTag", back_populates="media")
    likes        = relationship("Like", back_populates="media")
    comments     = relationship("Comment", back_populates="media")
    favourites   = relationship("Favourite", back_populates="media")
    facial_index = relationship("FacialIndex", back_populates="media")


# ─── Tags ─────────────────────────────────────────────

class Tag(Base):
    __tablename__ = "tags"

    id   = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False, index=True)

    media = relationship("MediaTag", back_populates="tag")


class MediaTag(Base):
    __tablename__ = "media_tags"

    id         = Column(String, primary_key=True, default=generate_uuid)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    tag_id     = Column(String, ForeignKey("tags.id"), nullable=False)
    confidence = Column(Float, nullable=True)    # Rekognition confidence score

    media = relationship("Media", back_populates="tags")
    tag   = relationship("Tag", back_populates="media")


# ─── Social ───────────────────────────────────────────

class Like(Base):
    __tablename__ = "likes"

    id         = Column(String, primary_key=True, default=generate_uuid)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User", back_populates="likes")
    media = relationship("Media", back_populates="likes")


class Comment(Base):
    __tablename__ = "comments"

    id         = Column(String, primary_key=True, default=generate_uuid)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User", back_populates="comments")
    media = relationship("Media", back_populates="comments")


class Favourite(Base):
    __tablename__ = "favourites"

    id         = Column(String, primary_key=True, default=generate_uuid)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User", back_populates="favourites")
    media = relationship("Media", back_populates="favourites")


# ─── Notifications ────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id              = Column(String, primary_key=True, default=generate_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False)   # recipient
    triggered_by    = Column(String, ForeignKey("users.id"), nullable=True)    # who caused it
    type            = Column(Enum(NotificationType), nullable=False)
    message         = Column(String, nullable=False)
    related_media_id= Column(String, ForeignKey("media.id"), nullable=True)
    is_read         = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])


# ─── Facial Recognition Index ─────────────────────────

class FacialIndex(Base):
    __tablename__ = "facial_index"

    id                   = Column(String, primary_key=True, default=generate_uuid)
    user_id              = Column(String, ForeignKey("users.id"), nullable=False)
    media_id             = Column(String, ForeignKey("media.id"), nullable=False)
    rekognition_face_id  = Column(String, nullable=True)   # face ID returned by AWS
    confidence           = Column(Float, nullable=True)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User", back_populates="facial_matches")
    media = relationship("Media", back_populates="facial_index")