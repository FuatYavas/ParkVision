from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers import auth, parking, reservations, users, reports, cv, dashboard
from app.core.config import settings
from app.websockets import manager

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# CORS - Allow all origins for mobile development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for mobile development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(reservations.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(cv.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to ParkVision API"}


@app.get("/health")
def health_check():
    """Health check endpoint for CV module and monitoring"""
    return {"status": "healthy", "service": "ParkVision API"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
