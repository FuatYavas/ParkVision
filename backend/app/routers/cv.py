"""
CV Module API Endpoints
Handles parking space detection updates from the CV module
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
import json

from app.database import get_session
from app.models import ParkingLot, ParkingSpot, SpotStatus
from app.schemas import ParkingLotStatusUpdate, ParkingSpotStatusUpdate, CVEvent
from app.websockets import manager

router = APIRouter(prefix="/cv", tags=["cv"])


@router.put("/parking-lots/{parking_lot_id}/status")
async def update_parking_lot_status(
    parking_lot_id: int,
    status_update: ParkingLotStatusUpdate,
    session: Session = Depends(get_session)
):
    """
    Update the status of a parking lot from CV module detection results.
    This endpoint is called by the CV module after processing camera frames.
    """
    # Verify parking lot exists
    parking_lot = session.get(ParkingLot, parking_lot_id)
    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )

    # Update parking lot capacity info if needed
    if status_update.total_spots > 0:
        parking_lot.capacity = status_update.total_spots

    session.add(parking_lot)
    session.commit()

    # Broadcast update via WebSocket
    ws_message = json.dumps({
        "type": "parking_lot_update",
        "parking_lot_id": parking_lot_id,
        "data": {
            "total_spots": status_update.total_spots,
            "empty_spots": status_update.empty_spots,
            "occupied_spots": status_update.occupied_spots,
            "occupancy_rate": status_update.occupancy_rate,
            "updated_at": datetime.utcnow().isoformat()
        }
    })

    await manager.broadcast(ws_message)

    return {
        "success": True,
        "parking_lot_id": parking_lot_id,
        "status": {
            "total_spots": status_update.total_spots,
            "empty_spots": status_update.empty_spots,
            "occupied_spots": status_update.occupied_spots,
            "occupancy_rate": status_update.occupancy_rate
        }
    }


@router.put("/parking-spots/{spot_id}/status")
async def update_spot_status(
    spot_id: int,
    status_update: ParkingSpotStatusUpdate,
    session: Session = Depends(get_session)
):
    """
    Update the status of a single parking spot.
    """
    spot = session.get(ParkingSpot, spot_id)
    if not spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking spot not found"
        )

    # Map status string to enum
    status_map = {
        "empty": SpotStatus.EMPTY,
        "occupied": SpotStatus.OCCUPIED,
        "reserved": SpotStatus.RESERVED
    }

    new_status = status_map.get(status_update.status.lower())
    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {status_update.status}. Must be one of: empty, occupied, reserved"
        )

    spot.status = new_status
    spot.last_updated = datetime.utcnow()

    session.add(spot)
    session.commit()

    # Broadcast update via WebSocket
    ws_message = json.dumps({
        "type": "spot_update",
        "spot_id": spot_id,
        "parking_lot_id": spot.parking_lot_id,
        "data": {
            "status": status_update.status,
            "confidence": status_update.confidence,
            "updated_at": spot.last_updated.isoformat()
        }
    })

    await manager.broadcast(ws_message)

    return {
        "success": True,
        "spot_id": spot_id,
        "status": status_update.status
    }


@router.post("/events")
async def receive_cv_event(event: CVEvent):
    """
    Receive and broadcast CV detection events.
    Used for real-time updates to connected clients.
    """
    ws_message = json.dumps({
        "type": event.event_type,
        "parking_lot_id": event.parking_lot_id,
        "data": event.data,
        "timestamp": datetime.utcnow().isoformat()
    })

    await manager.broadcast(ws_message)

    return {"success": True, "event_type": event.event_type}


@router.get("/parking-lots/{parking_lot_id}/detections")
def get_latest_detections(
    parking_lot_id: int,
    session: Session = Depends(get_session)
):
    """
    Get the latest detection data for a parking lot.
    Returns all spots and their current status.
    """
    parking_lot = session.get(ParkingLot, parking_lot_id)
    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )

    # Get all spots for this parking lot
    spots = session.exec(
        select(ParkingSpot).where(ParkingSpot.parking_lot_id == parking_lot_id)
    ).all()

    empty_count = sum(1 for s in spots if s.status == SpotStatus.EMPTY)
    occupied_count = sum(1 for s in spots if s.status == SpotStatus.OCCUPIED)
    reserved_count = sum(1 for s in spots if s.status == SpotStatus.RESERVED)

    return {
        "parking_lot_id": parking_lot_id,
        "parking_lot_name": parking_lot.name,
        "summary": {
            "total": len(spots),
            "empty": empty_count,
            "occupied": occupied_count,
            "reserved": reserved_count,
            "occupancy_rate": occupied_count / len(spots) if spots else 0
        },
        "spots": [
            {
                "id": s.id,
                "spot_number": s.spot_number,
                "status": s.status.value,
                "last_updated": s.last_updated.isoformat() if s.last_updated else None
            }
            for s in spots
        ]
    }
