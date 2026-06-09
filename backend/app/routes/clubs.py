from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.models import Club, ClubMember, UserRole
from app.schemas.clubs import ClubCreate, ClubResponse
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/clubs", tags=["clubs"])


@router.post("/", response_model=ClubResponse)
def create_club(
    data: ClubCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check name not already taken
    if db.query(Club).filter(Club.name == data.name).first():
        raise HTTPException(status_code=400, detail="Club name already exists")

    club = Club(
        name=data.name,
        description=data.description,
        created_by=current_user.id
    )
    db.add(club)
    db.flush()  # get club.id before commit

    # Creator automatically becomes admin member
    membership = ClubMember(
        user_id=current_user.id,
        club_id=club.id,
        role=UserRole.ADMIN
    )
    db.add(membership)
    db.commit()
    db.refresh(club)
    return club


@router.get("/", response_model=list[ClubResponse])
def get_all_clubs(db: Session = Depends(get_db)):
    return db.query(Club).all()


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: str, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.get("/{club_id}/members")
def get_club_members(
    club_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    members = db.query(ClubMember).filter(ClubMember.club_id == club_id).all()
    return [
        {
            "user_id": m.user_id,
            "username": m.user.username,
            "full_name": m.user.full_name,
            "role": m.role,
            "joined_at": m.joined_at
        }
        for m in members
    ]


@router.post("/{club_id}/join")
def join_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    existing = db.query(ClubMember).filter(
        ClubMember.club_id == club_id,
        ClubMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    membership = ClubMember(
        user_id=current_user.id,
        club_id=club_id,
        role=UserRole.CLUB_MEMBER
    )
    db.add(membership)
    db.commit()
    return {"message": "Joined club successfully"}