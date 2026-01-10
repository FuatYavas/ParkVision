# ParkVision AI Agent Instructions

## Project Overview
ParkVision is a real-time smart parking management system with computer vision. The architecture consists of 5 independent components that communicate via REST APIs and WebSocket:

1. **Backend (FastAPI)** - Core API at `backend/` with PostgreSQL + Redis
2. **CV Module (Python)** - YOLOv8 parking detection via Roboflow at `cv_module/`
3. **Mobile App (React Native)** - Expo-based driver app at `mobile_app/`
4. **Flutter Mobile (WIP)** - Alternative Flutter app at `mobile/`
5. **Web Admin (React + Vite)** - Management dashboard at `web_admin/`

**Data Flow**: Camera → CV Module → Backend API → WebSocket → Mobile/Web clients

## Critical Development Patterns

### Backend API Conventions
- **URL Format**: Use dashes in routes (`/parking-lots/`, NOT `/parking_lots/`)
- **Auth**: JWT tokens with OAuth2 password flow. See [backend/app/core/security.py](backend/app/core/security.py) for token creation
- **Database**: SQLModel ORM with relationship pattern:
  ```python
  User → Vehicle (1:N)
  User → Reservation (1:N)  
  ParkingLot → ParkingSpot (1:N) → Reservation
  ```
- **Enums**: Use string enums (`SpotStatus`, `ReservationStatus`) defined in [backend/app/models.py](backend/app/models.py)
- **WebSocket**: Use singleton `manager` from [backend/app/websockets.py](backend/app/websockets.py) for real-time updates
- **CV Integration**: CV module posts to `/cv/parking-lots/{id}/status` endpoint - see [backend/app/routers/cv.py](backend/app/routers/cv.py)

### Mobile App (React Native) Specifics
- **API URL**: Hardcoded WiFi IP in [mobile_app/api.js](mobile_app/api.js) - update when network changes. Use `__DEV__` ternary for dev/prod URLs
- **Auth Storage**: JWT token stored in AsyncStorage, auto-injected via axios interceptor in [mobile_app/api.js](mobile_app/api.js)
- **Mock Data**: Fallback to [mobile_app/data/mockData.js](mobile_app/data/mockData.js) when backend unavailable
- **OAuth2 Login**: Use `application/x-www-form-urlencoded` format for `/token` endpoint, NOT JSON
- **Theme System**: NEVER use hardcoded colors (`#000`, `#333`, `#666`). Always use `colors` from `useTheme()` hook:
  ```javascript
  const { colors, isDark } = useTheme();
  // Use: colors.text, colors.textSecondary, colors.background, colors.card, colors.primary
  ```
- **AsyncStorage Patterns**: Reservation state persisted to `user_reservations` key. See [mobile_app/screens/FindMyCarScreen.js](mobile_app/screens/FindMyCarScreen.js) for load/save examples
- **Navigation**: Use `navigation.navigate('Main', { screen: 'Home' })` for nested navigator targets
- **Mock Data Fixed Values**: `generateMockSpots()` uses `fixedOccupiedCount` for lotId=2 (Merkez Park) to ensure exactly 5 occupied, 20 empty spots
- **Notification Handling**: Expo Go limitations require local-only notifications. LogBox filters in [mobile_app/App.js](mobile_app/App.js) suppress expo-notifications warnings
- **Client-Side Logic**: `getNearbyParkingLots()` uses Haversine distance calculation since backend lacks geospatial queries

### CV Module Integration
- **Roboflow API**: Uses YOLOv8 model `car-parking-xutja/1`, key stored in docker-compose.yml env vars
- **Processing Modes**: `image`, `video`, `stream` - see [cv_module/processor.py](cv_module/processor.py) argparse
- **Backend Updates**: Posts detection results every `PROCESSING_INTERVAL` (default 2s) to backend
- **Spot Mapping**: CV detections must map to existing `ParkingSpot` records via spot_number

## Essential Commands

### Docker Operations (Primary Development Method)
```powershell
# Start all services
docker-compose up -d

# View logs for specific service
docker-compose logs -f backend  # or cv_module, db, redis

# Restart after code changes
docker-compose restart backend

# Full rebuild (after dependency changes)
docker-compose up --build
```

### Backend Local Development (Without Docker)
```powershell
cd backend
pip install -r requirements.txt
# Start with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Mobile App Testing
```powershell
cd mobile_app
npm install
npm start  # Opens Expo dev server
# Press 'a' for Android emulator, 'i' for iOS, scan QR for physical device

# Build APK for production
npx eas-cli login
npx eas build -p android --profile preview
```

### CV Module Testing
```bash
# Test with image
python cv_module/processor.py --mode image --source test_images/parking.jpg --visualize

# Live stream processing
python cv_module/processor.py --mode stream --source 0 --parking-lot-id 1
```

### Database Management
```powershell
# Access PostgreSQL container
docker exec -it parkvision_db psql -U user -d parkvision

# Run migrations (when available)
cd backend
alembic upgrade head

# Seed initial data
python seed_data.py
```

## Integration Points

### Backend ↔ CV Module
- CV calls `PUT /cv/parking-lots/{id}/status` with detection results
- Backend updates `ParkingSpot.status` and broadcasts via WebSocket
- See schema in [backend/app/schemas.py](backend/app/schemas.py): `ParkingLotStatusUpdate`, `ParkingSpotStatusUpdate`

### Backend ↔ Mobile
- Mobile uses axios instance with JWT interceptor in [mobile_app/api.js](mobile_app/api.js)
- Real-time updates via WebSocket at `ws://SERVER/ws/{client_id}`
- CORS allows all origins for mobile development (security note)

### Backend ↔ Web Admin
- React app proxies API requests in development
- Token stored in localStorage
- See [web_admin/src/api.js](web_admin/src/api.js) for API client

## Common Issues & Solutions

**Mobile can't connect to backend**: Update `API_URL` in [mobile_app/api.js](mobile_app/api.js) to your computer's WiFi IP. Test with `curl http://YOUR_IP:8000/health`

**Dark theme text invisible**: Check for hardcoded colors (`#000`, `#333`, `#666`). Replace with `colors.text` or `colors.textSecondary` from ThemeContext

**CV module not detecting**: Check `ROBOFLOW_API_KEY` in docker-compose.yml, verify `CONFIDENCE_THRESHOLD` (default 0.5)

**WebSocket not working**: Ensure Redis is running (`docker ps | grep redis`). WebSocket manager requires Redis for pub/sub

**Database schema mismatch**: Run `docker-compose down -v` to reset volumes, then `docker-compose up -d` to recreate

**AsyncStorage data not persisting**: Always use `JSON.stringify()` when saving and `JSON.parse()` when loading complex objects

**Expo notification warnings**: Filter in LogBox.ignoreLogs and console method overrides - see [mobile_app/App.js](mobile_app/App.js) pattern

**APK build fails**: Check [mobile_app/app.json](mobile_app/app.json) for incompatible properties (e.g., `edgeToEdgeEnabled` on older Android)

## File Structure Patterns

- **Routers**: One per domain in [backend/app/routers/](backend/app/routers/) - auth, parking, reservations, users, reports, cv
- **Models**: Single file [backend/app/models.py](backend/app/models.py) with SQLModel tables
- **Schemas**: Pydantic request/response schemas in [backend/app/schemas.py](backend/app/schemas.py)
- **Mobile Screens**: React components in [mobile_app/screens/](mobile_app/screens/) with navigation in [mobile_app/App.js](mobile_app/App.js)
- **CV Config**: Environment-based config in [cv_module/config.py](cv_module/config.py)

## Testing & Verification

After changes:
1. **Backend**: Check `docker-compose logs backend` for errors
2. **API**: Test with `curl http://localhost:8000/health`
3. **Mobile**: Verify API connection on app startup (login screen)
4. **CV**: Run `test_detection.py` with sample image before full integration
5. **Theme**: Test both light and dark modes - check for hardcoded colors
6. **AsyncStorage**: Verify persistence by closing/reopening app

## Development Tips
- **Mobile Theme System**: Always use `const { colors, isDark } = useTheme()` - never hardcode colors
- **Mock Data Control**: To fix occupancy for specific lots, set `fixedOccupiedCount` in `generateMockSpots()`
- **Navigation Flow**: Reservation success navigates to Home, not FindMyCar (allows user to check map)
- **Expo Go Limitations**: Push notifications require local-only implementation, WebSocket for real-time updates
- **EAS Build**: Use cloud build if Java/Android Studio not installed - requires Expo account

See [README.md](README.md) for detailed setup and [MOBILE_INTEGRATION.md](MOBILE_INTEGRATION.md) for mobile-specific troubleshooting.
