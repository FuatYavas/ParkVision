"""
Notification Service for ParkVision
Handles push notifications, emails, and SMS alerts
"""

from typing import List, Dict, Optional
from datetime import datetime
import json

class NotificationService:
    """
    Service for sending notifications to users
    In production, integrate with Firebase Cloud Messaging, SendGrid, Twilio, etc.
    """
    
    def __init__(self):
        self.notification_queue = []
        
    def send_push_notification(self, user_id: int, title: str, body: str, data: Optional[Dict] = None):
        """Send push notification to mobile app"""
        notification = {
            "type": "push",
            "user_id": user_id,
            "title": title,
            "body": body,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # In production, integrate with FCM (Firebase Cloud Messaging)
        # fcm.send_to_user(user_id, notification)
        
        self.notification_queue.append(notification)
        print(f"[PUSH] User {user_id}: {title} - {body}")
        return notification
    
    def send_email(self, email: str, subject: str, body: str, html: Optional[str] = None):
        """Send email notification"""
        notification = {
            "type": "email",
            "email": email,
            "subject": subject,
            "body": body,
            "html": html,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # In production, integrate with SendGrid, AWS SES, etc.
        # sendgrid.send(email, subject, body, html)
        
        self.notification_queue.append(notification)
        print(f"[EMAIL] To {email}: {subject}")
        return notification
    
    def send_sms(self, phone: str, message: str):
        """Send SMS notification"""
        notification = {
            "type": "sms",
            "phone": phone,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # In production, integrate with Twilio, AWS SNS, etc.
        # twilio.send_sms(phone, message)
        
        self.notification_queue.append(notification)
        print(f"[SMS] To {phone}: {message}")
        return notification
    
    def notify_reservation_created(self, user_id: int, spot_number: str, parking_lot_name: str):
        """Notify user about successful reservation"""
        return self.send_push_notification(
            user_id=user_id,
            title="Reservation Confirmed",
            body=f"Your spot {spot_number} at {parking_lot_name} is reserved!",
            data={"type": "reservation_created"}
        )
    
    def notify_reservation_expiring(self, user_id: int, spot_number: str, minutes_left: int):
        """Notify user that reservation is about to expire"""
        return self.send_push_notification(
            user_id=user_id,
            title="Reservation Expiring Soon",
            body=f"Your reservation for spot {spot_number} expires in {minutes_left} minutes",
            data={"type": "reservation_expiring"}
        )
    
    def notify_spot_available(self, user_id: int, parking_lot_name: str, available_spots: int):
        """Notify user about available parking spots"""
        return self.send_push_notification(
            user_id=user_id,
            title="Parking Available",
            body=f"{available_spots} spots available at {parking_lot_name}",
            data={"type": "spot_available"}
        )
    
    def notify_parking_full(self, user_id: int, parking_lot_name: str):
        """Notify user that parking lot is full"""
        return self.send_push_notification(
            user_id=user_id,
            title="Parking Lot Full",
            body=f"{parking_lot_name} is currently full",
            data={"type": "parking_full"}
        )
    
    def get_notifications(self, user_id: Optional[int] = None, limit: int = 50) -> List[Dict]:
        """Get recent notifications"""
        notifications = self.notification_queue
        
        if user_id:
            notifications = [n for n in notifications if n.get("user_id") == user_id]
        
        return notifications[-limit:]
    
    def clear_notifications(self):
        """Clear notification queue"""
        self.notification_queue = []

# Global notification service instance
notification_service = NotificationService()

