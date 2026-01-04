from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta

from app.database import get_session
from app.models import ParkingLot, Reservation, User, ReservationStatus, ParkingSpot, SpotStatus
from app.routers.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Admin dashboard istatistikleri"""
    
    # Toplam otopark sayısı
    total_parking_lots = session.exec(
        select(func.count(ParkingLot.id))
    ).one()
    
    # Aktif rezervasyon sayısı
    active_reservations = session.exec(
        select(func.count(Reservation.id)).where(
            Reservation.status == ReservationStatus.ACTIVE
        )
    ).one()
    
    # Toplam kullanıcı sayısı
    total_users = session.exec(
        select(func.count(User.id))
    ).one()
    
    # Bugünkü rezervasyon sayısı
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_reservations = session.exec(
        select(func.count(Reservation.id)).where(
            Reservation.start_time >= today_start
        )
    ).one()
    
    # Toplam ve dolu spot sayıları
    total_spots = session.exec(
        select(func.count(ParkingSpot.id))
    ).one()
    
    occupied_spots = session.exec(
        select(func.count(ParkingSpot.id)).where(
            ParkingSpot.status == SpotStatus.OCCUPIED
        )
    ).one()
    
    occupancy_rate = (occupied_spots / total_spots * 100) if total_spots > 0 else 0
    
    # Toplam gelir (tamamlanan rezervasyonlar)
    total_revenue = session.exec(
        select(func.sum(Reservation.total_price)).where(
            Reservation.status == ReservationStatus.COMPLETED
        )
    ).one() or 0
    
    # Bugünkü gelir
    today_revenue = session.exec(
        select(func.sum(Reservation.total_price)).where(
            Reservation.start_time >= today_start,
            Reservation.status.in_([ReservationStatus.ACTIVE, ReservationStatus.COMPLETED])
        )
    ).one() or 0
    
    return {
        "total_parking_lots": total_parking_lots,
        "active_reservations": active_reservations,
        "total_users": total_users,
        "today_reservations": today_reservations,
        "total_spots": total_spots,
        "occupied_spots": occupied_spots,
        "available_spots": total_spots - occupied_spots,
        "occupancy_rate": round(occupancy_rate, 2),
        "total_revenue": float(total_revenue),
        "today_revenue": float(today_revenue)
    }

@router.get("/occupancy-trend")
def get_occupancy_trend(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Son N günün doluluk trend'i"""
    
    trend_data = []
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for i in range(days):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        # O günkü rezervasyon sayısı
        day_reservations = session.exec(
            select(func.count(Reservation.id)).where(
                Reservation.start_time >= day_start,
                Reservation.start_time < day_end
            )
        ).one()
        
        trend_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "reservations": day_reservations
        })
    
    trend_data.reverse()  # Eskiden yeniye sırala
    return trend_data

@router.get("/revenue-trend")
def get_revenue_trend(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Son N günün gelir trend'i"""
    
    trend_data = []
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for i in range(days):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        # O günkü gelir
        day_revenue = session.exec(
            select(func.sum(Reservation.total_price)).where(
                Reservation.start_time >= day_start,
                Reservation.start_time < day_end,
                Reservation.status.in_([ReservationStatus.ACTIVE, ReservationStatus.COMPLETED])
            )
        ).one() or 0
        
        trend_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "revenue": float(day_revenue)
        })
    
    trend_data.reverse()
    return trend_data

@router.get("/parking-lots-status")
def get_parking_lots_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Tüm otoparkların anlık durumu"""
    
    parking_lots = session.exec(select(ParkingLot)).all()
    
    result = []
    for lot in parking_lots:
        # Bu otoparkın spotları
        spots = session.exec(
            select(ParkingSpot).where(ParkingSpot.parking_lot_id == lot.id)
        ).all()
        
        total_spots = len(spots)
        occupied = sum(1 for spot in spots if spot.status == SpotStatus.OCCUPIED)
        available = total_spots - occupied
        
        result.append({
            "id": lot.id,
            "name": lot.name,
            "address": lot.address,
            "total_spots": total_spots,
            "occupied_spots": occupied,
            "available_spots": available,
            "occupancy_rate": round((occupied / total_spots * 100) if total_spots > 0 else 0, 2)
        })
    
    return result
