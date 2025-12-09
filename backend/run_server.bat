@echo off
echo Starting ParkVision Backend Server...
echo Listening on 0.0.0.0:8000 (Accessible from network)
cd /d %~dp0
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
