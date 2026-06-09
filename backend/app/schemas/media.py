from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaResponse(BaseModel):
    id: str
    album_id: str
    uploader_id: str
    s3_key: str
    thumbnail_key: Optional[str]
    media_type: str
    caption: Optional[str]
    is_public: bool
    width: Optional[int]
    height: Optional[int]
    file_size: Optional[int]
    uploaded_at: datetime

    class Config:
        from_attributes = True