# ParkVision Docker Setup Guide

ParkVision artik sadece **Docker + PostgreSQL** kullanacak sekilde yapilandirilmistir.

## Gereksinimler

- Docker Desktop (Windows/Mac) veya Docker Engine (Linux)
- Docker Compose

## Hizli Baslangic

### 1. Projeyi Klonlayip Docker'i Baslatma

```bash
# Proje dizinine gidin
cd ParkVision

# Docker servislerini baslatin (arka planda)
docker-compose up -d
```

Bu komut asagidaki servisleri baslatir:
- **backend**: FastAPI sunucusu (port 8000)
- **db**: PostgreSQL 15 veritabani (port 5432)
- **redis**: Redis cache (port 6379)

### 2. Veritabanini Seed Etme (Test Verisi)

```bash
# Container icinde seed script'i calistirin
docker-compose exec backend python seed_data.py
```

Bu komut asagidaki test verilerini olusturur:
- 3 kullanici (admin, manager, driver)
- 3 park alani (350 toplam park yeri)
- 1 test araci

### 3. Uygulamalara Erisim

- **Backend API**: http://localhost:8000
- **API Dokumantasyonu**: http://localhost:8000/docs
- **Web Admin Panel**: `cd web_admin && npm run dev` (http://localhost:5174)
- **Mobil Uygulama**: `cd mobile_app && npx expo start`

## Test Hesaplari

Seed script'i calistirdiktan sonra su hesaplarla giris yapabilirsiniz:

### Admin Hesabi
- Email: `admin@parkvision.com`
- Sifre: `admin123`

### Manager Hesabi
- Email: `manager@parkvision.com`
- Sifre: `manager123`

### Driver Hesabi
- Email: `driver@parkvision.com`
- Sifre: `driver123`

## Komutlar

### Docker Servislerini Yonetme

```bash
# Servisleri baslat (arka planda)
docker-compose up -d

# Servisleri durdur
docker-compose down

# Servisleri durdur ve volumeleri sil (veritabani silinir!)
docker-compose down -v

# Servislerin durumunu kontrol et
docker-compose ps

# Loglari goruntule
docker-compose logs -f

# Sadece backend loglarini goruntule
docker-compose logs -f backend
```

### Backend Container'a Erisim

```bash
# Backend container'ina bash ile baglan
docker-compose exec backend bash

# Python shell aç
docker-compose exec backend python

# Veritabani migration'lari calistir
docker-compose exec backend alembic upgrade head

# Yeni migration olustur
docker-compose exec backend alembic revision --autogenerate -m "migration message"
```

### Veritabanini Sifirdan Olusturma

```bash
# Servisleri durdur ve volumeleri sil
docker-compose down -v

# Servisleri tekrar baslat
docker-compose up -d

# Veritabanini seed et
docker-compose exec backend python seed_data.py
```

## Ortam Degiskenleri (Environment Variables)

Backend icin ortam degiskenlerini `backend/.env` dosyasinda tanimlayabilirsiniz.

Ornek dosya icin `backend/.env.example` dosyasina bakin:

```bash
# .env.example'dan .env olustur
cp backend/.env.example backend/.env

# .env dosyasini duzenle
nano backend/.env  # veya favori editor'unuz
```

## PostgreSQL Veritabanina Dogrudan Baglanma

```bash
# PostgreSQL container'ina psql ile baglan
docker-compose exec db psql -U user -d parkvision
```

Psql komutlari:
```sql
-- Tabloları listele
\dt

-- Kullanıcıları gör
SELECT * FROM user;

-- Park yerlerini gör
SELECT * FROM parkinglot;

-- Çıkış
\q
```

## Sorun Giderme

### Port zaten kullaniliyor hatasi

Eger `port is already allocated` hatasi aliyorsaniz:

1. Port'u kullanan servisi bulun:
```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

2. Servisi durdurun veya `docker-compose.yml` dosyasinda portu degistirin.

### Container baslamiyor

```bash
# Container'lari yeniden olustur
docker-compose up -d --build --force-recreate

# Tum Docker cache'i temizle (dikkatli kullanin!)
docker system prune -a
```

### Veritabani baglanti hatasi

Backend icindeki `DATABASE_URL` ortam degiskenini kontrol edin:
```
DATABASE_URL=postgresql://user:password@db:5432/parkvision
```

Dikkat: Docker Compose kullanirken host adı `localhost` degil `db` olmali.

## Legacy Dosyalar

Eski SQLite kullanan dosyalar `backend/legacy/` klasorune tasinmistir:
- `legacy/database.py` - SQLite konfigurasyonu
- `legacy/main.py` - Eski API implementasyonu
- `legacy/models.py` - Eski veri modelleri
- `legacy/auth.py` - Eski auth modulu
- `legacy/parkvision.db` - Eski SQLite veritabani

Bu dosyalar artik kullanilmiyor ve sadece referans amacli saklanmaktadir.

## Yeni Yapi

Aktif backend yapisi:
```
backend/
├── app/
│   ├── core/
│   │   ├── config.py       # Ayarlar
│   │   └── security.py     # JWT & password hashing
│   ├── routers/
│   │   ├── auth.py         # Kimlik dogrulama
│   │   ├── parking.py      # Park yeri yonetimi
│   │   ├── reservations.py # Rezervasyon
│   │   ├── users.py        # Kullanici yonetimi
│   │   └── reports.py      # Raporlar
│   ├── database.py         # PostgreSQL baglanti
│   ├── models.py           # Veri modelleri (SQLModel)
│   ├── schemas.py          # Pydantic schemas
│   └── main.py             # FastAPI app
├── seed_data.py            # Test verisi
├── requirements.txt        # Python bagimliliklari
├── Dockerfile              # Docker imaj
└── .env.example            # Ornek env dosyasi
```

## Mobil Uygulama API Konfigurasyonu

Mobil uygulama Docker backend'e baglanmak icin `mobile_app/api.js` dosyasindaki `API_BASE_URL`'i guncelleyin:

```javascript
// Yerel network IP'nizi bulun
const API_BASE_URL = "http://192.168.1.XXX:8000";

// veya localhost (sadece emulator icin)
const API_BASE_URL = "http://localhost:8000";
```

## Daha Fazla Bilgi

- FastAPI Dokumantasyonu: https://fastapi.tiangolo.com/
- Docker Compose Dokumantasyonu: https://docs.docker.com/compose/
- PostgreSQL Dokumantasyonu: https://www.postgresql.org/docs/
- SQLModel Dokumantasyonu: https://sqlmodel.tiangolo.com/
