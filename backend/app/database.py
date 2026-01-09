from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os

# SQLite fallback for easy development without PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./parkvision.db")

# SQLite needs connect_args for check_same_thread
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
