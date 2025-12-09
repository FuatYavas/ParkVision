"""
Seed script to populate the database with initial test data
Run this script to create sample parking lots and spots

Usage:
  docker-compose exec backend python seed_data.py
"""
import sys
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

from sqlmodel import Session
from app.database import engine, get_session
from app import models
from app.core.security import get_password_hash

def create_test_data():
    """Create initial test data"""
    db = Session(engine)
    
    try:
        print("[SEED] Seeding database with test data...")
        
        # Create tables if they don't exist
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
        print("[OK] Database tables created")
        
        # Check if data already exists
        from sqlmodel import select
        existing_users_result = db.exec(select(models.User))
        existing_users = len(list(existing_users_result))
        if existing_users > 0:
            print(f"[WARN] Database already has {existing_users} users. Skipping seed...")
            return
        
        # Create test users
        print("\n[USER] Creating test users...")
        
        # Hash passwords first to avoid issues
        admin_pwd = get_password_hash("admin123")
        manager_pwd = get_password_hash("manager123")
        driver_pwd = get_password_hash("driver123")
        
        users = [
            models.User(
                email="admin@parkvision.com",
                password_hash=admin_pwd,
                full_name="Admin User",
                phone="1234567890"
            ),
            models.User(
                email="manager@parkvision.com",
                password_hash=manager_pwd,
                full_name="Parking Manager",
                phone="1234567891"
            ),
            models.User(
                email="driver@parkvision.com",
                password_hash=driver_pwd,
                full_name="Test Driver",
                phone="1234567892"
            ),
        ]
        
        for user in users:
            db.add(user)
            print(f"   [OK] Created user: {user.email}")
        
        db.commit()
        
        # Create test parking lots
        print("\n[PARKING] Creating test parking lots...")
        parking_lots = [
            models.ParkingLot(
                name="City Center Parking",
                address="123 Main Street, Downtown",
                latitude=40.7128,
                longitude=-74.0060,
                capacity=50,
                hourly_rate=5.0
            ),
            models.ParkingLot(
                name="University Campus Parking",
                address="456 University Ave",
                latitude=40.7580,
                longitude=-73.9855,
                capacity=100,
                hourly_rate=3.0
            ),
            models.ParkingLot(
                name="Shopping Mall Parking",
                address="789 Mall Road",
                latitude=40.7489,
                longitude=-73.9680,
                capacity=200,
                hourly_rate=4.0
            ),
        ]
        
        for lot in parking_lots:
            db.add(lot)
            print(f"   [OK] Created parking lot: {lot.name} (Capacity: {lot.capacity})")
        
        db.commit()
        
        # Create parking spots for each lot
        print("\n[SPOTS] Creating parking spots...")
        db.refresh(parking_lots[0])  # Refresh to get IDs
        db.refresh(parking_lots[1])
        db.refresh(parking_lots[2])

        for lot in parking_lots:
            for i in range(1, lot.capacity + 1):
                status = "occupied" if i % 3 == 0 else "empty"  # Make every 3rd spot occupied for demo
                spot = models.ParkingSpot(
                    spot_number=f"{lot.name[0]}{lot.id:02d}-{i:03d}",
                    parking_lot_id=lot.id,
                    status=status,
                    roi_coordinates=f"{50 + (i % 10) * 120},{50 + (i // 10) * 150},{100},{200}"
                )
                db.add(spot)

            occupied_count = sum(1 for i in range(1, lot.capacity + 1) if i % 3 == 0)
            available_count = lot.capacity - occupied_count
            print(f"   [OK] Created {lot.capacity} spots for {lot.name}")
            print(f"      [STATS] {available_count} available, {occupied_count} occupied")
        
        db.commit()
        
        # Create a test vehicle
        print("\n[VEHICLE] Creating test vehicles...")
        driver = db.exec(select(models.User).where(models.User.email == "driver@parkvision.com")).first()
        if driver:
            vehicle = models.Vehicle(
                plate_number="34ABC123",
                brand="Toyota",
                model="Corolla",
                color="White",
                vehicle_type="sedan",
                owner_id=driver.id
            )
            db.add(vehicle)
            print(f"   [OK] Created vehicle: {vehicle.plate_number} for {driver.full_name}")
        
        db.commit()
        
        # Print summary
        print("\n" + "="*60)
        print("[SUCCESS] Database seeded successfully!")
        print("="*60)
        print("\n[SUMMARY]:")
        print(f"   Users: {len(list(db.exec(select(models.User))))}")
        print(f"   Parking Lots: {len(list(db.exec(select(models.ParkingLot))))}")
        print(f"   Parking Spots: {len(list(db.exec(select(models.ParkingSpot))))}")
        print(f"   Vehicles: {len(list(db.exec(select(models.Vehicle))))}")
        
        print("\n[ACCOUNTS] Test Accounts:")
        print("   Admin:")
        print("      Email: admin@parkvision.com")
        print("      Password: admin123")
        print("   Manager:")
        print("      Email: manager@parkvision.com")
        print("      Password: manager123")
        print("   Driver:")
        print("      Email: driver@parkvision.com")
        print("      Password: driver123")
        
        print("\n[ACCESS] Access the application:")
        print("   Backend API: http://localhost:8000")
        print("   API Docs: http://localhost:8000/docs")
        print("   Web Admin: http://localhost:5174")
        print("   Mobile App: Scan QR code from Expo")
        
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
