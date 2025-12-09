from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

# Enums
class VehicleType(str, Enum):
    SEDAN = "sedan"
    SUV = "suv"
    HATCHBACK = "hatchback"
    MINIVAN = "minivan"
    MOTORCYCLE = "motorcycle"

class SpotStatus(str, Enum):
    EMPTY = "empty"
    OCCUPIED = "occupied"
    RESERVED = "reserved"

class ReservationStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ReportType(str, Enum):
    VACANT = "vacant"
    OCCUPIED = "occupied"

# Models

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: str
    phone_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    vehicles: List["Vehicle"] = Relationship(back_populates="owner")
    reservations: List["Reservation"] = Relationship(back_populates="user")
    history: List["ParkingHistory"] = Relationship(back_populates="user")
    reports: List["Report"] = Relationship(back_populates="user")

class Vehicle(SQLModel, table=True):
    __tablename__ = "vehicles"
    id: Optional[int] = Field(default=None, primary_key=True)
    plate_number: str = Field(unique=True, index=True)
    brand: str
    model: str
    color: str
    vehicle_type: VehicleType
    owner_id: int = Field(foreign_key="users.id")
    
    owner: User = Relationship(back_populates="vehicles")
    history: List["ParkingHistory"] = Relationship(back_populates="vehicle")

class ParkingLot(SQLModel, table=True):
    __tablename__ = "parking_lots"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    hourly_rate: float
    is_active: bool = True
    
    spots: List["ParkingSpot"] = Relationship(back_populates="parking_lot")
    cameras: List["Camera"] = Relationship(back_populates="parking_lot")
    reports: List["Report"] = Relationship(back_populates="parking_lot")

class ParkingSpot(SQLModel, table=True):
    __tablename__ = "parking_spots"
    id: Optional[int] = Field(default=None, primary_key=True)
    parking_lot_id: int = Field(foreign_key="parking_lots.id")
    spot_number: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: SpotStatus = Field(default=SpotStatus.EMPTY)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    parking_lot: ParkingLot = Relationship(back_populates="spots")
    reservations: List["Reservation"] = Relationship(back_populates="spot")
    history: List["ParkingHistory"] = Relationship(back_populates="spot")

class Camera(SQLModel, table=True):
    __tablename__ = "cameras"
    id: Optional[int] = Field(default=None, primary_key=True)
    parking_lot_id: int = Field(foreign_key="parking_lots.id")
    stream_url: str
    is_active: bool = True
    
    parking_lot: ParkingLot = Relationship(back_populates="cameras")

class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    spot_id: int = Field(foreign_key="parking_spots.id")
    start_time: datetime
    end_time: datetime
    reservation_code: str = Field(unique=True)
    status: ReservationStatus = Field(default=ReservationStatus.ACTIVE)
    
    user: User = Relationship(back_populates="reservations")
    spot: ParkingSpot = Relationship(back_populates="reservations")

class ParkingHistory(SQLModel, table=True):
    __tablename__ = "parking_history"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    vehicle_id: int = Field(foreign_key="vehicles.id")
    spot_id: int = Field(foreign_key="parking_spots.id")
    entry_time: datetime
    exit_time: Optional[datetime] = None
    total_cost: Optional[float] = None
    
    user: User = Relationship(back_populates="history")
    vehicle: Vehicle = Relationship(back_populates="history")
    spot: ParkingSpot = Relationship(back_populates="history")

class Report(SQLModel, table=True):
    __tablename__ = "reports"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    parking_lot_id: int = Field(foreign_key="parking_lots.id")
    spot_id: Optional[int] = Field(default=None, foreign_key="parking_spots.id")
    report_type: ReportType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False
    
    user: User = Relationship(back_populates="reports")
    parking_lot: ParkingLot = Relationship(back_populates="reports")
