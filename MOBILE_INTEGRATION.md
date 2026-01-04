# ParkVision Mobile App Integration Guide

## ✅ Integration Status

The mobile app has been successfully configured to connect with the ParkVision backend API.

### Updated: January 4, 2026

## 🔧 Configuration Changes

### 1. Backend API URL
- **Development IP**: `http://172.16.0.2:8000`
- **Emulator/Localhost**: `http://localhost:8000`
- Uses `__DEV__` flag for automatic switching

### 2. API Endpoints Updated

#### Fixed Endpoints (Dash → Underscore)
- ✅ `/parking-lots/` (was `/parking_lots/`)
- ✅ `/cv/parking-lots/{id}/detections` (for parking spots)

#### Implemented Workarounds
- ✅ `getNearbyParkingLots()` - Client-side filtering with Haversine distance calculation
- ✅ `saveLocation()` - Local placeholder until backend endpoint ready
- ✅ `reportSpotStatus()` - Uses CV spot update endpoint
- ✅ `getOccupancyStatistics()` - Calculated from parking lot data

## 🚀 Running the Mobile App

### Prerequisites
1. Ensure backend is running:
   ```bash
   docker ps | grep parkvision
   ```

2. Check you can reach the backend:
   ```bash
   curl http://172.16.0.2:8000/health
   ```

### Start the App

```bash
cd mobile_app
npm install  # If not already installed
npm start
```

Then scan the QR code with Expo Go app on your phone, or:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web

## 📱 Testing the Integration

### 1. Test Authentication
```javascript
// In the app:
// Register: test@example.com / testpass123
// Login with same credentials
```

### 2. Test Parking Lots
- View list of parking lots
- See real-time availability
- Check parking spot details

### 3. Test Reservations
- Create a reservation
- View your reservations
- Cancel a reservation

## 🔗 Available API Functions

### Authentication
- `login(username, password)` ✅
- `register(email, password, fullName)` ✅
- `getCurrentUser()` ✅

### Parking
- `getParkingLots()` ✅
- `getParkingSpots(lotId)` ✅ (via CV detection)
- `getNearbyParkingLots(lat, lon, radius)` ✅ (client-side)

### Reservations
- `createReservation(spotId, duration)` ✅
- `getMyReservations()` ✅
- `cancelReservation(reservationId)` ✅

### User Profile
- `updateProfile(data)` ✅
- `changePassword(current, new)` ✅

### Vehicles
- `getMyVehicles()` ✅
- `createVehicle(data)` ✅
- `updateVehicle(id, data)` ✅
- `deleteVehicle(id)` ✅

### Reporting
- `reportSpotStatus(spotId, isOccupied, confidence)` ✅ (via CV)

## 🔍 Backend Endpoints Reference

| Mobile Function | Backend Endpoint | Status |
|----------------|------------------|---------|
| login | POST /token | ✅ |
| register | POST /register | ✅ |
| getParkingLots | GET /parking-lots/ | ✅ |
| getParkingSpots | GET /cv/parking-lots/{id}/detections | ✅ |
| createReservation | POST /reservations/ | ✅ |
| getMyReservations | GET /reservations/my | ✅ |
| getCurrentUser | GET /users/me | ✅ |
| getMyVehicles | GET /users/vehicles | ✅ |

## 🐛 Troubleshooting

### Cannot connect to backend

1. **Check backend is running**:
   ```bash
   docker ps | grep parkvision
   ```

2. **Check IP address**:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
   Update the IP in `mobile_app/api.js` if changed.

3. **Test connectivity**:
   ```bash
   curl http://YOUR_IP:8000/health
   ```

4. **Check firewall**:
   - Windows: Allow port 8000 in Windows Defender Firewall
   - Mac: System Preferences → Security & Privacy → Firewall

### App crashes or API errors

1. Clear Expo cache:
   ```bash
   npx expo start -c
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Check backend logs:
   ```bash
   docker logs parkvision_backend --tail 50
   ```

## 📝 TODO: Backend Endpoints to Implement

These features have client-side workarounds but would benefit from proper backend implementation:

1. **Nearby Search Endpoint**
   - Endpoint: `GET /parking-lots/nearby?latitude={lat}&longitude={lon}&radius_km={radius}`
   - Currently: Client-side filtering

2. **Crowdsourcing Endpoint**
   - Endpoint: `POST /crowdsource/report`
   - Currently: Using CV spot update endpoint

3. **Statistics Endpoint**
   - Endpoint: `GET /statistics/occupancy`
   - Currently: Calculated from parking lot list

4. **Save Location Endpoint**
   - Endpoint: `POST /locations/save`
   - Currently: Local placeholder only

## 🎯 Next Steps

1. ✅ Backend API configured and tested
2. ✅ Mobile app API client updated
3. ⏳ Test with physical device
4. ⏳ Implement missing backend endpoints
5. ⏳ Add WebSocket support for real-time updates
6. ⏳ Add push notifications

## 📚 Resources

- Backend API Docs: http://172.16.0.2:8000/docs
- Backend Health: http://172.16.0.2:8000/health
- Mobile App Guide: `mobile_app/RUN_GUIDE.md`
