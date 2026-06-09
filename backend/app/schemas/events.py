from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    is_public: bool = True

class EventResponse(BaseModel):
    id: str
    club_id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    date: Optional[datetime]
    is_public: bool
    cover_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True