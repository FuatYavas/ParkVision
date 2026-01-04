from typing import List, Annotated
from datetime import datetime, timedelta
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Reservation, User, ParkingSpot, ReservationStatus, SpotStatus
from app.schemas import ReservationCreate, ReservationRead
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation_in: ReservationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if spot exists
    spot = session.get(ParkingSpot, reservation_in.spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail="Parking spot not found")
    
    # Check if spot is available (simplified logic)
    if spot.status != SpotStatus.EMPTY:
         raise HTTPException(status_code=400, detail="Parking spot is not available")

    # Generate reservation code
    reservation_code = str(uuid.uuid4())[:8].upper()
    
    # Calculate start and end times based on duration_minutes
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(minutes=reservation_in.duration_minutes)
    
    reservation = Reservation(
        user_id=current_user.id,
        spot_id=reservation_in.spot_id,
        start_time=start_time,
        end_time=end_time,
        reservation_code=reservation_code,
        status=ReservationStatus.ACTIVE
    )
    
    # Update spot status
    spot.status = SpotStatus.RESERVED
    session.add(spot)
    
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation

@router.get("/", response_model=List[ReservationRead])
def read_reservations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Reservation).where(Reservation.user_id == current_user.id)
    reservations = session.exec(statement).all()
    return reservations

@router.get("/my", response_model=List[ReservationRead])
def read_my_reservations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all reservations for current user (alias for /)"""
    statement = select(Reservation).where(Reservation.user_id == current_user.id)
    reservations = session.exec(statement).all()
    return reservations

@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
def cancel_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this reservation")
        
    if reservation.status != ReservationStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Reservation is not active")
    
    reservation.status = ReservationStatus.CANCELLED
    
    # Free up the spot
    spot = session.get(ParkingSpot, reservation.spot_id)
    if spot:
        spot.status = SpotStatus.EMPTY
        session.add(spot)
        
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation

@router.post("/validate")
def validate_reservation(
    code: str,
    session: Session = Depends(get_session)
):
    statement = select(Reservation).where(Reservation.reservation_code == code)
    reservation = session.exec(statement).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    if reservation.status != ReservationStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Reservation is not active")
        
    return {"status": "valid", "reservation_id": reservation.id}
