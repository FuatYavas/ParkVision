from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import ParkingLot, User
from app.schemas import ParkingLotCreate, ParkingLotRead
from app.routers.auth import get_current_user

router = APIRouter(prefix="/parking-lots", tags=["parking"])

@router.get("/", response_model=List[ParkingLotRead])
def read_parking_lots(
    skip: int = 0, 
    limit: int = 100, 
    session: Session = Depends(get_session)
):
    parking_lots = session.exec(select(ParkingLot).offset(skip).limit(limit)).all()
    return parking_lots

@router.post("/", response_model=ParkingLotRead, status_code=status.HTTP_201_CREATED)
def create_parking_lot(
    parking_lot: ParkingLotCreate, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # In a real app, check if user is admin
    db_parking_lot = ParkingLot.from_orm(parking_lot)
    session.add(db_parking_lot)
    session.commit()
    session.refresh(db_parking_lot)
    return db_parking_lot

@router.get("/{parking_lot_id}", response_model=ParkingLotRead)
def read_parking_lot(parking_lot_id: int, session: Session = Depends(get_session)):
    parking_lot = session.get(ParkingLot, parking_lot_id)
    if not parking_lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return parking_lot
