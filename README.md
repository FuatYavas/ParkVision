# ParkVision - Akıllı Otopark Yönetim Sistemi 🚗

Bilgisayar görüsü (Computer Vision) tabanlı gerçek zamanlı akıllı otopark yönetim ve rezervasyon platformu.

## 📋 İçindekiler
- [Genel Bakış](#genel-bakış)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Özellikler](#özellikler)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Katkıda Bulunma](#katkıda-bulunma)

## 🎯 Genel Bakış

ParkVision, YOLOv8 tabanlı nesne tespiti kullanarak otopark doluluk oranını gerçek zamanlı izleyen, kullanıcıların yer rezervasyonu yapabileceği ve navigasyon alabileceği kapsamlı bir akıllı otopark çözümüdür.

### Ana Bileşenler
- **Backend API** (FastAPI + PostgreSQL + Redis)
- **CV Module** (YOLOv8 + Roboflow)
- **Mobile App** (React Native + Expo)
- **Web Admin** (React + Vite)
- **Flutter Mobile** (İsteğe bağlı alternatif)

## 🛠️ Teknoloji Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Auth:** JWT (OAuth2)
- **ORM:** SQLModel

### CV Module
- **Model:** YOLOv8 (Roboflow)
- **API:** Serverless Roboflow
- **Processing:** Python + PIL
- **Model ID:** `car-parking-xutja/1`

### Mobile App
- **Framework:** React Native
- **Runtime:** Expo SDK 54
- **Navigation:** React Navigation 6
- **Maps:** react-native-maps
- **State:** React Hooks

### Web Admin
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router 6

## 📁 Proje Yapısı

```
ParkVision/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── main.py            # App entry point
│   ├── alembic/               # Database migrations
│   └── requirements.txt
│
├── cv_module/                 # Computer Vision Module
│   ├── detector.py            # YOLOv8 detector
│   ├── processor.py           # Image processor
│   ├── api_client.py          # Backend API client
│   └── requirements.txt
│
├── mobile_app/                # React Native Mobile App
│   ├── screens/               # App screens
│   ├── data/mockData.js       # Mock data (development)
│   ├── hooks/                 # Custom hooks
│   ├── assets/images/         # CV processed images
│   └── package.json
│
├── web_admin/                 # React Admin Panel
│   ├── src/
│   │   ├── pages/             # Admin pages
│   │   ├── components/        # Reusable components
│   │   └── api.js             # API client
│   └── package.json
│
├── docker-compose.yml         # Container orchestration
└── process_parking_images.py # CV image processor
```

## 🚀 Kurulum

### Ön Gereksinimler
- Docker & Docker Compose
- Node.js 18+
- Python 3.9-3.12 (CV modülü için)
- Expo Go (mobil test için)

### 1. Docker ile Hızlı Başlangıç

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları takip et
docker-compose logs -f
```

**Servisler:**
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Swagger UI: http://localhost:8000/docs

### 2. Mobile App Kurulum

```bash
cd mobile_app
npm install
npx expo start
```

Expo Go uygulamasıyla QR kodu tarayın veya `a` basarak Android emulator'da açın.

**Demo Mod:** Login ekranında "Demo Mode" butonuna basarak backend olmadan test edebilirsiniz.

### 3. Web Admin Kurulum

```bash
cd web_admin
npm install
npm run dev
```

Web admin: http://localhost:5173

### 4. CV Module Kurulum (İsteğe Bağlı)

```bash
cd cv_module
pip install -r requirements.txt

# Test detection
python test_detection.py --image test_images/parking.jpg --visualize
```

## 🎮 Kullanım

### Backend API Test

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/token \
  -d "username=admin&password=admin"

# Otopark listesi
curl http://localhost:8000/api/parking-lots/
```

### CV Detection İşleme

5 otopark görselini Roboflow modeli ile işlemek için:

```bash
python process_parking_images.py
```

Bu script:
- `parkresim/` klasöründeki resimleri alır
- Roboflow YOLOv8 modeline gönderir
- Bounding box'ları çizer (yeşil=boş, kırmızı=dolu)
- `mobile_app/assets/images/cv_processed_*.jpg` olarak kaydeder

### Mobile App - API URL Ayarı

WiFi IP adresinizi güncelleyin:

```javascript
// mobile_app/api.js
const API_URL = 'http://192.168.1.XXX:8000/api';  // IP'nizi yazın
```

## ✨ Özellikler

### Kullanıcı Özellikleri
- ✅ Gerçek zamanlı otopark doluluk görüntüleme
- ✅ CV detection sonuçları (YOLOv8 bounding boxes)
- ✅ Harita üzerinde yakındaki otoparklar
- ✅ Otopark rezervasyonu
- ✅ Navigasyon entegrasyonu
- ✅ Geçmiş rezervasyonlar
- ✅ Araç yönetimi
- ✅ Push notifications (local)

### Admin Özellikleri
- ✅ Dashboard (gelir, doluluk grafikleri)
- ✅ Otopark yönetimi (CRUD)
- ✅ Kamera yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Raporlama

### CV Özellikleri
- ✅ Gerçek zamanlı park yeri tespiti
- ✅ Boş/dolu sınıflandırma
- ✅ Confidence score gösterimi
- ✅ 5 farklı otopark görüntüsü
- ✅ REST API entegrasyonu

## 📡 API Dokümantasyonu

### Ana Endpoints

**Authentication**
- `POST /token` - Login (OAuth2 password flow)

**Parking Lots**
- `GET /api/parking-lots/` - Tüm otoparklar
- `GET /api/parking-lots/{id}` - Detay
- `POST /api/parking-lots/` - Yeni otopark (admin)

**Reservations**
- `GET /api/reservations/my` - Kullanıcının rezervasyonları
- `POST /api/reservations/` - Yeni rezervasyon
- `DELETE /api/reservations/{id}` - İptal

**CV Integration**
- `PUT /cv/parking-lots/{id}/status` - CV modülünden doluluk güncelleme

**WebSocket**
- `WS /ws/{client_id}` - Gerçek zamanlı güncellemeler

Detaylı API dokümantasyonu: http://localhost:8000/docs

## 🔧 Konfigürasyon

### Environment Variables

**Backend** (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@db:5432/parkvision
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key
```

**CV Module** (`cv_module/.env`)
```env
ROBOFLOW_API_KEY=your-api-key
ROBOFLOW_MODEL=car-parking-xutja/1
BACKEND_URL=http://backend:8000
```

### Docker Compose Override

Yerel geliştirme için `docker-compose.override.yml` oluşturun:

```yaml
version: '3.8'
services:
  backend:
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0
```

## 📊 Proje Durumu

**Tamamlanma:** ~75%

✅ **Tamamlanan:**
- Backend API (auth, parking, reservations)
- CV Module (Roboflow entegrasyonu)
- Mobile App (ana akış + CV görüntüleme)
- Web Admin (dashboard, CRUD işlemleri)
- Docker deployment

🚧 **Devam Eden:**
- WebSocket gerçek zamanlı güncellemeler
- Push notifications (remote)
- Ödeme entegrasyonu
- QR kod giriş/çıkış sistemi

📝 **Planlanan:**
- Plaka tanıma (LPR)
- AR navigasyon
- Dinamik fiyatlandırma
- Tahminleme AI

Detaylı ilerleme: [ILERLEME_RAPORU.md](ILERLEME_RAPORU.md)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Harika özellik eklendi'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı
```
feat: Yeni özellik
fix: Hata düzeltme
docs: Dokümantasyon
style: Kod formatı
refactor: Kod düzenleme
test: Test ekleme
chore: Diğer değişiklikler
```

## 📄 Lisans

Bu proje BMU401 Bilgisayar Mühendisliği Tasarım Dersi kapsamında geliştirilmiştir.

## 📞 İletişim

Proje Sahibi: [GitHub](https://github.com/yourusername/parkvision)

## 🙏 Teşekkürler

- [Roboflow](https://roboflow.com) - YOLOv8 model hosting
- [Expo](https://expo.dev) - React Native development
- [FastAPI](https://fastapi.tiangolo.com) - Backend framework

---

**Not:** Detaylı kurulum rehberleri için ilgili klasörlerdeki README dosyalarını kontrol edin:
- [Mobile App Rehberi](mobile_app/RUN_GUIDE.md)
- [Mobile Backend Entegrasyonu](MOBILE_INTEGRATION.md)
- [CV Module Detayları](cv_module/README.md)
