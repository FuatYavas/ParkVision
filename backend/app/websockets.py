"""
WebSocket Connection Manager for ParkVision
Handles real-time updates to connected clients
"""
from typing import List, Dict, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        # All active connections
        self.active_connections: List[WebSocket] = []
        # Connections subscribed to specific parking lots
        self.parking_lot_subscriptions: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        # Remove from all parking lot subscriptions
        for parking_lot_id in self.parking_lot_subscriptions:
            self.parking_lot_subscriptions[parking_lot_id].discard(websocket)

    async def subscribe_to_parking_lot(self, websocket: WebSocket, parking_lot_id: int):
        """Subscribe a client to updates for a specific parking lot"""
        if parking_lot_id not in self.parking_lot_subscriptions:
            self.parking_lot_subscriptions[parking_lot_id] = set()
        self.parking_lot_subscriptions[parking_lot_id].add(websocket)

    async def unsubscribe_from_parking_lot(self, websocket: WebSocket, parking_lot_id: int):
        """Unsubscribe a client from a parking lot's updates"""
        if parking_lot_id in self.parking_lot_subscriptions:
            self.parking_lot_subscriptions[parking_lot_id].discard(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_text(message)
        except Exception:
            self.disconnect(websocket)

    async def send_json(self, data: dict, websocket: WebSocket):
        """Send JSON data to a specific client"""
        try:
            await websocket.send_json(data)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_json(self, data: dict):
        """Broadcast JSON data to all connected clients"""
        await self.broadcast(json.dumps(data))

    async def broadcast_to_parking_lot(self, parking_lot_id: int, message: str):
        """Broadcast a message to clients subscribed to a specific parking lot"""
        if parking_lot_id not in self.parking_lot_subscriptions:
            return

        disconnected = []
        for connection in self.parking_lot_subscriptions[parking_lot_id]:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_parking_update(
        self,
        parking_lot_id: int,
        total_spots: int,
        empty_spots: int,
        occupied_spots: int
    ):
        """Broadcast a parking lot status update"""
        message = json.dumps({
            "type": "parking_update",
            "parking_lot_id": parking_lot_id,
            "total_spots": total_spots,
            "empty_spots": empty_spots,
            "occupied_spots": occupied_spots,
            "occupancy_rate": occupied_spots / total_spots if total_spots > 0 else 0
        })

        # Broadcast to all (for now) and subscribed clients
        await self.broadcast(message)


manager = ConnectionManager()
