from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClubCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ClubResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    logo_url: Optional[str]
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True