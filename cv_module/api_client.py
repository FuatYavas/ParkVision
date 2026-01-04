"""
Backend API Client for CV Module
Sends detection results to the ParkVision backend
"""
import logging
import requests
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from config import BACKEND_API_URL, BACKEND_API_KEY

logger = logging.getLogger(__name__)


@dataclass
class ParkingUpdate:
    """Represents a parking lot status update"""
    parking_lot_id: int
    total_spots: int
    empty_spots: int
    occupied_spots: int
    occupancy_rate: float
    detections: List[Dict[str, Any]]


class BackendClient:
    """
    Client for communicating with ParkVision backend API
    """

    def __init__(self, base_url: str = None, api_key: str = None):
        """
        Initialize the backend client

        Args:
            base_url: Backend API URL
            api_key: Optional API key for authentication
        """
        self.base_url = (base_url or BACKEND_API_URL).rstrip("/")
        self.api_key = api_key or BACKEND_API_KEY
        self.session = requests.Session()

        if self.api_key:
            self.session.headers["X-API-Key"] = self.api_key

        self.session.headers["Content-Type"] = "application/json"

    def health_check(self) -> bool:
        """Check if backend is reachable"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Backend health check failed: {e}")
            return False

    def update_parking_lot_status(
        self,
        parking_lot_id: int,
        total_spots: int,
        empty_spots: int,
        occupied_spots: int,
        detections: List[Dict] = None
    ) -> bool:
        """
        Update the status of a parking lot

        Args:
            parking_lot_id: ID of the parking lot
            total_spots: Total number of detected spots
            empty_spots: Number of empty spots
            occupied_spots: Number of occupied spots
            detections: Raw detection data (optional)

        Returns:
            True if update was successful
        """
        try:
            payload = {
                "total_spots": total_spots,
                "empty_spots": empty_spots,
                "occupied_spots": occupied_spots,
                "occupancy_rate": occupied_spots / total_spots if total_spots > 0 else 0,
                "detections": detections or []
            }

            response = self.session.put(
                f"{self.base_url}/cv/parking-lots/{parking_lot_id}/status",
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                logger.info(f"Updated parking lot {parking_lot_id}: {empty_spots}/{total_spots} empty")
                return True
            else:
                logger.error(f"Failed to update: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"API request failed: {e}")
            return False

    def update_spot_status(
        self,
        spot_id: int,
        status: str,
        confidence: float = 1.0
    ) -> bool:
        """
        Update the status of a single parking spot

        Args:
            spot_id: ID of the parking spot
            status: "empty", "occupied", or "reserved"
            confidence: Detection confidence (0-1)

        Returns:
            True if update was successful
        """
        try:
            payload = {
                "status": status,
                "confidence": confidence
            }

            response = self.session.put(
                f"{self.base_url}/cv/parking-spots/{spot_id}/status",
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                logger.debug(f"Updated spot {spot_id} to {status}")
                return True
            else:
                logger.error(f"Failed to update spot: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Spot update failed: {e}")
            return False

    def get_parking_lots(self) -> List[Dict]:
        """Get list of all parking lots"""
        try:
            response = self.session.get(f"{self.base_url}/parking-lots/", timeout=10)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Failed to get parking lots: {e}")
            return []

    def get_cameras(self, parking_lot_id: int = None) -> List[Dict]:
        """Get list of cameras, optionally filtered by parking lot"""
        try:
            url = f"{self.base_url}/cameras/"
            if parking_lot_id:
                url += f"?parking_lot_id={parking_lot_id}"

            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Failed to get cameras: {e}")
            return []

    def send_detection_event(
        self,
        parking_lot_id: int,
        event_type: str,
        data: Dict[str, Any]
    ) -> bool:
        """
        Send a detection event to the backend (for WebSocket broadcast)

        Args:
            parking_lot_id: ID of the parking lot
            event_type: Type of event ("status_update", "alert", etc.)
            data: Event data

        Returns:
            True if event was sent successfully
        """
        try:
            payload = {
                "parking_lot_id": parking_lot_id,
                "event_type": event_type,
                "data": data
            }

            response = self.session.post(
                f"{self.base_url}/cv/events",
                json=payload,
                timeout=10
            )

            return response.status_code in [200, 201, 202]

        except Exception as e:
            logger.error(f"Failed to send event: {e}")
            return False
