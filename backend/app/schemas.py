from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ParkingLotBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    hourly_rate: float

class ParkingLotCreate(ParkingLotBase):
    pass

class ParkingLotRead(ParkingLotBase):
    id: int
    is_active: bool
    
    class Config:
        orm_mode = True

# Vehicle Schemas
class VehicleBase(BaseModel):
    plate_number: str
    brand: str
    model: str
    color: str
    vehicle_type: str

class VehicleCreate(VehicleBase):
    pass

class VehicleRead(VehicleBase):
    id: int
    owner_id: int
    
    class Config:
        orm_mode = True

# Reservation Schemas
class ReservationBase(BaseModel):
    spot_id: int
    start_time: datetime
    end_time: datetime

class ReservationCreate(ReservationBase):
    pass

class ReservationRead(ReservationBase):
    id: int
    user_id: int
    reservation_code: str
    status: str
    
    class Config:
        orm_mode = True

# Report Schemas
class ReportBase(BaseModel):
    parking_lot_id: int
    spot_id: Optional[int] = None
    report_type: str

class ReportCreate(ReportBase):
    pass

class ReportRead(ReportBase):
    id: int
    user_id: int
    timestamp: datetime
    is_verified: bool
    
    class Config:
        orm_mode = True
