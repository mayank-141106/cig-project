from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.models import Event, Club, ClubMember, Album, UserRole
from app.schemas.events import EventCreate, EventResponse
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["events"])


def check_club_permission(club_id: str, user_id: str, db: Session, min_role=UserRole.CLUB_MEMBER):
    membership = db.query(ClubMember).filter(
        ClubMember.club_id == club_id,
        ClubMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this club")
    return membership


@router.post("/{club_id}", response_model=EventResponse)
def create_event(
    club_id: str,
    data: EventCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    membership = check_club_permission(club_id, current_user.id, db)

    # Only admin or photographer can create events
    if membership.role not in [UserRole.ADMIN, UserRole.PHOTOGRAPHER]:
        raise HTTPException(status_code=403, detail="Only admins and photographers can create events")

    event = Event(
        club_id=club_id,
        created_by=current_user.id,
        name=data.name,
        description=data.description,
        category=data.category,
        date=data.date,
        is_public=data.is_public
    )
    db.add(event)
    db.flush()

    # Auto-create a default album for the event
    default_album = Album(
        event_id=event.id,
        name="General",
        description="Default album"
    )
    db.add(default_album)
    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=list[EventResponse])
def get_public_events(
    db: Session = Depends(get_db),
    category: str = None,
    sort_by: str = "created_at"
):
    query = db.query(Event).filter(Event.is_public == True)

    if category:
        query = query.filter(Event.category == category)

    if sort_by == "name":
        query = query.order_by(Event.name)
    elif sort_by == "date":
        query = query.order_by(Event.date.desc())
    else:
        query = query.order_by(Event.created_at.desc())

    return query.all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not event.is_public:
        check_club_permission(event.club_id, current_user.id, db)

    return event


@router.get("/{event_id}/albums")
def get_event_albums(
    event_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not event.is_public:
        check_club_permission(event.club_id, current_user.id, db)

    albums = db.query(Album).filter(Album.event_id == event_id).all()
    return [
        {"id": a.id, "name": a.name, "description": a.description, "created_at": a.created_at}
        for a in albums
    ]