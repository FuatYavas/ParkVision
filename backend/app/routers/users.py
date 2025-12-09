from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import User, Vehicle, VehicleType
from app.schemas import UserRead, UserCreate, UserUpdate, PasswordChange, VehicleCreate, VehicleRead
from app.routers.auth import get_current_user
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.get("/profile", response_model=UserRead)
def read_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile (alias for /me)"""
    return current_user

@router.put("/profile", response_model=UserRead)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user profile information"""
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = session.exec(
            select(User).where(User.email == user_update.email)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email

    # Update other fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.put("/profile/password")
def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Change user password"""
    # Verify current password
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update to new password
    current_user.password_hash = get_password_hash(password_change.new_password)
    session.add(current_user)
    session.commit()

    return {"message": "Password updated successfully"}

@router.get("/vehicles", response_model=List[VehicleRead])
def read_user_vehicles(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all vehicles for current user"""
    vehicles = session.exec(
        select(Vehicle).where(Vehicle.owner_id == current_user.id)
    ).all()
    return vehicles

@router.post("/vehicles", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add a new vehicle for current user"""
    # Check if plate number already exists
    existing_vehicle = session.exec(
        select(Vehicle).where(Vehicle.plate_number == vehicle_in.plate_number)
    ).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle with this plate number already exists"
        )

    vehicle = Vehicle(
        plate_number=vehicle_in.plate_number,
        brand=vehicle_in.brand,
        model=vehicle_in.model,
        color=vehicle_in.color,
        vehicle_type=vehicle_in.vehicle_type,
        owner_id=current_user.id
    )
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle

@router.put("/vehicles/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: VehicleCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a vehicle"""
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this vehicle")

    # Check if plate number is being changed and if it's already taken
    if vehicle_update.plate_number != vehicle.plate_number:
        existing_vehicle = session.exec(
            select(Vehicle).where(Vehicle.plate_number == vehicle_update.plate_number)
        ).first()
        if existing_vehicle:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle with this plate number already exists"
            )

    vehicle.plate_number = vehicle_update.plate_number
    vehicle.brand = vehicle_update.brand
    vehicle.model = vehicle_update.model
    vehicle.color = vehicle_update.color
    vehicle.vehicle_type = vehicle_update.vehicle_type

    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a vehicle"""
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this vehicle")

    session.delete(vehicle)
    session.commit()
    return {"message": "Vehicle deleted successfully"}
