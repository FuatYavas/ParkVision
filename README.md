# ParkVision - Akıllı Otopark Yönetim Sistemi

> Yapay zeka destekli gerçek zamanlı otopark doluluk izleme, rezervasyon ve navigasyon platformu

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org)
[![React Native](https://img.shields.io/badge/react--native-0.81.5-blue.svg)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com)

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Özellikler](#-özellikler)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Proje Yapısı](#-proje-yapısı)
- [Konfigürasyon](#-konfigürasyon)
- [Testler](#-testler)
- [Deployment](#-deployment)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## 🎯 Genel Bakış

ParkVision, bilgisayar görüsü (Computer Vision) ve yapay zeka teknolojilerini kullanarak akıllı şehir altyapısına katkı sağlayan, ölçeklenebilir bir otopark yönetim sistemidir. Sistem, gerçek zamanlı park yeri tespiti, kullanıcı rezervasyon yönetimi ve detaylı raporlama özellikleri sunarak şehir içi park etme deneyimini optimize eder.

### Temel Hedefler

- **Gerçek Zamanlı İzleme**: YOLOv8 tabanlı nesne tespiti ile anlık doluluk takibi
- **Kullanıcı Deneyimi**: Mobil uygulama üzerinden kolayca rezervasyon ve navigasyon
- **Veri Analitiği**: Doluluk trendleri, gelir raporları ve kullanım istatistikleri
- **Ölçeklenebilirlik**: Mikroservis mimarisi ile çoklu otopark yönetimi

### Ana Bileşenler

| Bileşen | Teknoloji | Açıklama |
|---------|-----------|----------|
| **Backend API** | FastAPI + PostgreSQL | RESTful API servisi, kimlik doğrulama ve veri yönetimi |
| **CV Module** | YOLOv8 + Roboflow | Gerçek zamanlı park yeri tespit motoru |
| **Mobile App** | React Native + Expo | İOS/Android kullanıcı uygulaması |
| **Web Admin** | React + Vite | Yönetici kontrol paneli |
| **Cache Layer** | Redis | Yüksek performanslı veri önbelleği |

## ✨ Özellikler

### 🎯 Kullanıcı Özellikleri

#### Akıllı Park Yeri Bulma
- 🗺️ **Harita Tabanlı Arama**: Yakındaki otoparkları harita üzerinde görüntüleme
- 📍 **Mesafe Hesaplama**: Haversine algoritması ile gerçek zamanlı mesafe ölçümü
- 🎨 **CV Detection**: YOLOv8 model çıktılarını bounding box ile görselleştirme
- 📊 **Doluluk Göstergesi**: Boş/dolu park yeri oranlarını renk kodlu gösterim

#### Rezervasyon Yönetimi
- ⏱️ **Hızlı Rezervasyon**: Tek dokunuşla park yeri ayırtma
- 🔔 **Bildirimler**: Rezervasyon durumu hakkında anlık bilgilendirme
- 📅 **Geçmiş**: Tüm rezervasyonları görüntüleme ve raporlama
- 💰 **Ücret Hesaplama**: Dinamik saatlik ücretlendirme sistemi

#### Navigasyon ve Lokasyon
- 🧭 **Turn-by-Turn Navigation**: Google Maps entegrasyonu
- 🚗 **Arabamı Bul**: Araç konumunu harita üzerinde gösterme
- 📏 **Yürüme Mesafesi**: Park yerine kadar tahmini yürüme süresi

#### Kullanıcı Hesabı
- 🔐 **Güvenli Kimlik Doğrulama**: JWT token tabanlı OAuth2 sistemi
- 🚘 **Araç Yönetimi**: Çoklu araç ekleme 
- 👤 **Profil Yönetimi**: Kişisel bilgiler ve ayarlar
- 🌙 **Tema Desteği**: Açık/koyu mod ve sistem teması senkronizasyonu

### 👨‍💼 Admin Özellikleri


#### Otopark Yönetimi
- 🏢 **CRUD İşlemleri**: Otopark ekleme, güncelleme, silme
- 🎯 **Konum Yönetimi**: Koordinat tabanlı otopark konumlandırma
- 💰 **Dinamik Fiyatlandırma**: Saatlik ücret ayarlama
- 📸 **Kamera Yönetimi**: CV modülü için kamera bağlantıları

### 🤖 CV Module Özellikleri

#### Nesne Tespiti
- 🎯 **YOLOv8 Model**: Roboflow'da eğitilmiş özel parking detection modeli
- 🟢 **Boş/Dolu Sınıflandırma**: İki sınıflı nesne algılama (`space-empty`, `space-occupied`)
- 📊 **Confidence Score**: %50+ güvenilirlik eşiği
- 🎨 **Bounding Box**: Tespit edilen park yerlerinin görsel işaretlenmesi (yeşil=boş, kırmızı=dolu)


#### Backend Entegrasyonu
- 🔄 **Otomatik Güncelleme**: 2 saniye aralıklarla backend'e veri gönderimi
- 📡 **REST API**: HTTP PUT isteği ile durum güncellemesi
- 📝 **Logging**: Detaylı işlem kayıtları

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                         ParkVision Platform                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                                    ┌──────────────┐
│   Camera     │───────┐                    ┌──────│  Mobile App  │
│   Feeds      │       │                    │      │ (React Native)│
└──────────────┘       │                    │      └──────────────┘
                       ▼                    │
                 ┌──────────┐               │
                 │    CV    │               ▼
                 │  Module  │         ┌────────────┐
                 │ (YOLOv8) │────────▶│  Backend   │
                 └──────────┘         │  (FastAPI) │
                                      └────────────┘
┌──────────────┐                           │  ▲
│  Web Admin   │───────────────────────────┘  │
│(React + Vite)│                              │
└──────────────┘                              │
                                              ▼
                    ┌──────────────────────────────────────┐
                    │  PostgreSQL  │   Redis   │ WebSocket│
                    │  (Database)  │  (Cache)  │  (WS)    │
                    └──────────────────────────────────────┘
```

### Veri Akışı

1. **Detection Flow**: Kamera → CV Module → Backend API → WebSocket → Clients
2. **Reservation Flow**: Mobile App → Backend API → Database → WebSocket → Other Clients
3. **Admin Flow**: Web Admin → Backend API → Database

### API Communication

- **REST API**: JSON formatında HTTP istekleri
- **WebSocket**: Gerçek zamanlı bidirectional iletişim
- **Authentication**: JWT Bearer token ile güvenli erişim

## 🛠️ Teknoloji Stack

### Backend Teknolojileri

#### Core Framework
- **FastAPI 0.104+**: Modern, yüksek performanslı Python web framework
  - Otomatik API dokümantasyonu (Swagger/OpenAPI)
  - Async/await desteği
  - Type hints ile güvenli geliştirme
  
  
#### Cache & Queue
- **Redis 7**: In-memory data store
  - Session management
  - WebSocket pub/sub
  - Rate limiting
  
#### Authentication
- **JWT (JSON Web Tokens)**: Stateless authentication
- **OAuth2 Password Flow**: Güvenli login sistemi
- **Passlib + bcrypt**: Password hashing

### Computer Vision Stack

#### AI/ML Framework
- **YOLOv8**: State-of-the-art object detection
  - Real-time inference
  - Pre-trained model fine-tuning
  
#### Image Processing
- **OpenCV (cv2)**: Görüntü işleme kütüphanesi
- **PIL/Pillow**: Resim manipülasyonu
- **NumPy**: Matris işlemleri

#### Cloud AI Platform
- **Roboflow**: Model hosting ve inference API
  - Serverless deployment
  - Auto-scaling
  - Model versioning

### Mobile App Stack

#### Framework
- **React Native 0.81.5**: Cross-platform mobile development
- **Expo SDK 54**: Development platform
  - Over-the-air updates
  - Native API access
  - Cloud build (EAS)
  
#### Navigation & UI
- **React Navigation 7**: Native-like navigation
  - Stack, Tab, Drawer navigators
  - Deep linking support
- **React Native Maps**: Google Maps entegrasyonu
- **Expo Location**: GPS ve konum servisleri
  
#### State Management
- **React Hooks**: Built-in state management
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client
  - Request/response interceptors
  - Auto token injection

#### Notifications
- **Expo Notifications**: Local push notifications
  - Scheduled notifications
  - Badge management

### Web Admin Stack

#### Frontend
- **React 18**: Modern UI library
  - Concurrent rendering
  - Automatic batching
- **Vite 5**: Next-generation build tool
  - Lightning-fast HMR
  - Optimized production builds
  
#### Styling
- **TailwindCSS 3**: Utility-first CSS framework
  - JIT compilation
  - Dark mode support
  - Responsive design utilities
  
#### Routing
- **React Router 6**: Client-side routing
  - Nested routes
  - Lazy loading

### DevOps & Infrastructure

#### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
  - Service networking
  - Volume management
  
#### API Documentation
- **Swagger UI**: Interactive API documentation
- **ReDoc**: Alternative API documentation view
  
#### Version Control
- **Git**: Source code management
- **GitHub**: Repository hosting

## 📁 Proje Yapısı

```
ParkVision/
├── backend/                         # FastAPI Backend Service
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Konfigürasyon yönetimi
│   │   │   └── security.py         # JWT ve authentication
│   │   ├── routers/
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── parking.py          # Otopark CRUD endpoints
│   │   │   ├── reservations.py    # Rezervasyon yönetimi
│   │   │   ├── users.py            # Kullanıcı yönetimi
│   │   │   ├── reports.py          # Raporlama endpoints
│   │   │   └── cv.py               # CV Module integration
│   │   ├── models.py                # SQLModel database models
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── database.py              # Database connection
│   │   ├── websockets.py            # WebSocket manager
│   │   └── main.py                  # FastAPI application entry
│   ├── alembic/                     # Database migrations
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Backend container definition
│
├── cv_module/                       # Computer Vision Module
│   ├── detector.py                  # YOLOv8 detection logic
│   ├── processor.py                 # Image/video processing
│   ├── api_client.py                # Backend API client
│   ├── streamer.py                  # Video stream handler
│   ├── config.py                    # CV module configuration
│   ├── test_detection.py            # Test script
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # CV container definition
│
├── mobile_app/                      # React Native Mobile Application
│   ├── screens/                     # Application screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── MapScreen.js             # Ana harita ekranı
│   │   ├── ParkingDetailScreen.js  # Otopark detay ve CV görüntüleme
│   │   ├── ReservationScreen.js    # Park yeri seçim ve rezervasyon
│   │   ├── MyReservationsScreen.js
│   │   ├── FindMyCarScreen.js      # Araç lokasyon ve navigasyon
│   │   ├── ProfileScreen.js
│   │   ├── VehiclesScreen.js
│   │   └── ...
│   ├── context/
│   │   └── ThemeContext.js          # Dark/Light theme management
│   ├── services/
│   │   └── notificationService.js   # Push notifications
│   ├── data/
│   │   └── mockData.js              # Development mock data
│   ├── assets/
│   │   └── images/                  # CV processed images
│   ├── api.js                       # Axios API client
│   ├── App.js                       # App entry point
│   ├── package.json
│   └── eas.json                     # Expo Application Services config
│
├── web_admin/                       # React Web Admin Panel
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Ana dashboard
│   │   │   ├── ParkingLots.jsx      # Otopark yönetimi
│   │   │   ├── Cameras.jsx          # Kamera yönetimi
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   └── Sidebar.jsx          # Navigation sidebar
│   │   ├── api.js                   # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .github/
│   └── copilot-instructions.md      # AI agent development guidelines
├── docker-compose.yml               # Multi-container orchestration
└── README.md                        # This file
```

## 🚀 Kurulum

### Ön Gereksinimler

- **Docker** (20.10+) & **Docker Compose** (2.0+)
- **Node.js** (18+) & **npm** (9+)
- **Python** (3.9-3.12) - CV modülü için
- **Expo Go** App - Mobil test için (iOS/Android)
- **Git** - Version control

### 1. Projeyi Klonlama

```bash
git clone https://github.com/yourusername/parkvision.git
cd parkvision
```

### 2. Docker ile Hızlı Başlangıç (Önerilen)

```bash
# Tüm servisleri başlat (backend, db, redis, cv_module)
docker-compose up -d

# Logları takip et
docker-compose logs -f backend

# Servislerin durumunu kontrol et
docker-compose ps
```

**Erişilebilir Servisler:**

| Servis | URL | Açıklama |
|--------|-----|----------|
| Backend API | http://localhost:8000 | RESTful API |
| Swagger UI | http://localhost:8000/docs | İnteraktif API dokümantasyonu |
| ReDoc | http://localhost:8000/redoc | Alternatif API dokümantasyonu |
| PostgreSQL | localhost:5432 | Database (user: user, db: parkvision) |
| Redis | localhost:6379 | Cache layer |

### 3. Mobile App Kurulum

```bash
cd mobile_app

# Bağımlılıkları yükle
npm install

# Development server başlat
npx expo start
```

**Çalıştırma Seçenekleri:**
- **Expo Go (Önerilen)**: QR kodu tarayarak fiziksel cihazda test
- **Android Emulator**: Terminal'de `a` tuşuna bas
- **iOS Simulator**: Terminal'de `i` tuşuna bas (macOS only)

**API Bağlantı Ayarı:**

`mobile_app/api.js` dosyasında bilgisayarınızın IP adresini güncelleyin:

```javascript
const API_URL = __DEV__
    ? 'http://192.168.1.XXX:8000'  // Kendi IP adresinizi yazın
    : 'https://api.parkvision.com';
```

> **Not**: IP adresinizi öğrenmek için: `ipconfig` (Windows) veya `ifconfig` (Mac/Linux)

**Demo Mode**: Backend olmadan test etmek için login ekranında "Demo Mode" butonuna basın.

### 4. Web Admin Kurulum

```bash
cd web_admin

# Bağımlılıkları yükle
npm install

# Development server başlat
npm run dev
```

Web admin paneli: http://localhost:5173

**Varsayılan Admin Girişi:**
- Email: `admin@parkvision.com`
- Password: `admin123`

### 5. CV Module Test (İsteğe Bağlı)

```bash
cd cv_module

# Python bağımlılıklarını yükle
pip install -r requirements.txt

# Test görüntüsü ile detection çalıştır
python test_detection.py --image test_images/parking.jpg --visualize

# Roboflow API key'inizi test edin
python processor.py --mode image --source test_images/parking.jpg
```

## 🎮 Kullanım

### Backend API Test

```bash
# Health check
curl http://localhost:8000/health

# Login (JWT token al)
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"

# Otopark listesi
curl http://localhost:8000/api/parking-lots/

# Token ile authentication required endpoint
curl http://localhost:8000/api/reservations/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### CV Detection Çalıştırma

5 otopark görselini Roboflow modeli ile işlemek için:

```bash
python process_parking_images.py
```

Bu script:
1. `parkresim/` klasöründeki resimleri alır
2. Roboflow YOLOv8 modeline gönderir
3. Bounding box'ları çizer (yeşil=boş, kırmızı=dolu)
4. `mobile_app/assets/images/cv_processed_*.jpg` olarak kaydeder
5. Mobile app'te görüntülenir

### WebSocket Bağlantısı

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/client_123');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## 📡 API Dokümantasyonu

### Authentication

#### POST /token
Login ve JWT token alma

**Request:**
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Parking Lots

#### GET /api/parking-lots/
Tüm otoparkları listele

**Response:**
```json
[
  {
    "id": 1,
    "name": "Merkez Park",
    "address": "Merkez, 23119 Elazığ",
    "latitude": 38.6753,
    "longitude": 39.2215,
    "capacity": 25,
    "current_occupancy": 5,
    "hourly_rate": 10.0,
    "is_active": true
  }
]
```

#### GET /api/parking-lots/{id}
Belirli bir otoparkın detaylarını getir

#### POST /api/parking-lots/ (Admin)
Yeni otopark ekle

**Request:**
```json
{
  "name": "Yeni Otopark",
  "address": "Adres bilgisi",
  "latitude": 38.123456,
  "longitude": 39.123456,
  "capacity": 50,
  "hourly_rate": 15.0
}
```

### Reservations

#### GET /api/reservations/my
Kullanıcının rezervasyonları

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### POST /api/reservations/
Yeni rezervasyon oluştur

**Request:**
```json
{
  "parking_spot_id": 123,
  "vehicle_id": 456,
  "start_time": "2026-01-10T14:00:00Z",
  "end_time": "2026-01-10T16:00:00Z"
}
```

#### DELETE /api/reservations/{id}
Rezervasyon iptal et

### CV Integration

#### PUT /cv/parking-lots/{parking_lot_id}/status
CV modülünden doluluk güncelleme (Internal API)

**Request:**
```json
{
  "total_spots": 25,
  "empty_spots": 20,
  "occupied_spots": 5,
  "spot_statuses": [
    {
      "spot_number": "A1",
      "status": "empty",
      "confidence": 0.95
    }
  ]
}
```

### WebSocket Events

#### WS /ws/{client_id}
Gerçek zamanlı güncellemeler

**Event Types:**
- `parking_lot_update`: Doluluk değişikliği
- `reservation_created`: Yeni rezervasyon
- `reservation_cancelled`: İptal edilen rezervasyon

**Detaylı dokümantasyon**: http://localhost:8000/docs

## 🔧 Konfigürasyon

### Environment Variables

#### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/parkvision

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_STR=/api
PROJECT_NAME=ParkVision
```

#### CV Module (`cv_module/.env`)

```env
# Roboflow API
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_MODEL=car-parking-xutja/1
ROBOFLOW_VERSION=1

# Backend Integration
BACKEND_API_URL=http://backend:8000
PROCESSING_INTERVAL=2.0

# Detection
CONFIDENCE_THRESHOLD=0.5
LOG_LEVEL=INFO
```

#### Mobile App (`mobile_app/.env`)

```env
# API URL (geliştirme için local IP)
API_URL=http://192.168.1.100:8000

# Google Maps (opsiyonel)
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Docker Compose Override

Yerel geliştirme ayarları için `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  backend:
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    environment:
      - LOG_LEVEL=DEBUG

  cv_module:
    volumes:
      - ./cv_module:/app
    environment:
      - LOG_LEVEL=DEBUG
```

## 🧪 Testler

### Backend Tests

```bash
cd backend

# Pytest ile tüm testleri çalıştır
pytest

# Coverage raporu
pytest --cov=app --cov-report=html

# Belirli bir test dosyası
pytest tests/test_auth.py -v
```

### CV Module Tests

```bash
cd cv_module

# Detection testi
python test_detection.py --image test_images/parking.jpg --visualize

# Roboflow API bağlantı testi
python -c "from detector import ParkingDetector; d = ParkingDetector(); print('OK')"
```

### Mobile App Tests

```bash
cd mobile_app

# Metro bundler başlat
npm start

# Manuel test: Expo Go ile QR kod tarayın
# Tüm ekranları test edin:
# - Login/Register flow
# - Harita görünümü
# - Rezervasyon akışı
# - Profil yönetimi
```

### API Integration Tests

```bash
# Backend çalışırken
cd backend
pytest tests/test_integration.py -v

# Postman collection'ı import edin (varsa)
# newman ile otomatik test
newman run postman_collection.json
```

## 🚀 Deployment

### Production Docker Build

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Veya manuel build
docker build -t parkvision-backend:latest ./backend
docker build -t parkvision-cv:latest ./cv_module
```

### Mobile App Build

#### Android APK

```bash
cd mobile_app

# EAS Build ile (önerilen)
npx eas-cli login
npx eas build -p android --profile preview

# Build tamamlandığında APK linkini alın
# https://expo.dev/accounts/[username]/projects/parkvision/builds
```

#### iOS IPA

```bash
# EAS Build (Apple Developer hesabı gerekli)
npx eas build -p ios --profile preview
```

### Web Admin Build

```bash
cd web_admin

# Production build
npm run build

# Build klasörünü statik sunucu ile serve edin
# Örnek: nginx, Apache, Vercel, Netlify
```

### Environment-Specific Configs

**Staging:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

**Production:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz!

### Quick Start

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Message Convention

```bash
feat: Yeni özellik
fix: Bug düzeltme
docs: Dokümantasyon
style: Kod formatı
refactor: Kod düzenleme
test: Test ekleme
chore: Build/config değişiklikleri
```

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 📞 İletişim

**Proje Ekibi**: BMU401 Bilgisayar Mühendisliği Tasarım Dersi

**GitHub**: [github.com/yourusername/parkvision](https://github.com/yourusername/parkvision)

## 🙏 Teşekkürler

- [Roboflow](https://roboflow.com) - YOLOv8 model hosting
- [Expo](https://expo.dev) - React Native development platform
- [FastAPI](https://fastapi.tiangolo.com) - Modern Python web framework
- [PostgreSQL](https://www.postgresql.org) - Güçlü açık kaynak veritabanı
- [Redis](https://redis.io) - In-memory data structure store

## 📚 Ek Kaynaklar

- [.github/copilot-instructions.md](.github/copilot-instructions.md) - AI agent development guidelines
- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
- [Roboflow Universe](https://universe.roboflow.com/car-parking-xutja) - YOLOv8 Model

---

**Not**: Bu proje Fırat Üniversitesi Bilgisayar Mühendisliği Bölümü BMU401 Tasarım Dersi kapsamında geliştirilmiştir.

**Geliştirme Durumu**: ✅ Aktif Geliştirme | 📊 Tamamlanma: ~85%
