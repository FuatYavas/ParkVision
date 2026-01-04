# ParkVision CV Module

Otopark boş yer tespiti için görüntü işleme modülü. Roboflow üzerinde eğitilmiş bir model kullanarak park yerlerinin durumunu tespit eder ve backend API'ye bildirir.

## Kurulum

### Gereksinimler
- Python 3.9+
- OpenCV
- Roboflow SDK

### Bağımlılıkları Yükle
```bash
pip install -r requirements.txt
```

## Kullanım

### 1. Resim ile Test
```bash
python processor.py --mode image --source /path/to/parking_image.jpg --visualize
```

### 2. Video ile Çalıştırma
```bash
python processor.py --mode video --source /path/to/video.mp4
```

### 3. Webcam ile Canlı Test
```bash
python processor.py --mode stream --source 0
```

### 4. IP Kamera (RTSP)
```bash
python processor.py --mode stream --source "rtsp://username:password@ip:port/stream"
```

## Parametreler

| Parametre | Açıklama | Varsayılan |
|-----------|----------|------------|
| `--mode`, `-m` | İşleme modu: `image`, `video`, `stream` | `image` |
| `--source`, `-s` | Görüntü/video kaynağı | Config dosyasından |
| `--parking-lot-id`, `-p` | Otopark ID | `1` |
| `--backend-url`, `-b` | Backend API URL | `http://localhost:8000` |
| `--output`, `-o` | Çıktı dosyası yolu | - |
| `--visualize`, `-v` | Görselleştirme penceresi göster | `False` |

## Ortam Değişkenleri

```bash
export ROBOFLOW_API_KEY="your_api_key"
export BACKEND_API_URL="http://localhost:8000"
export PROCESSING_INTERVAL="2.0"
export CONFIDENCE_THRESHOLD="0.5"
export LOG_LEVEL="INFO"
```

## Docker ile Çalıştırma

```bash
# Backend ve CV modülünü birlikte başlat
docker-compose up -d

# Sadece CV modülünü çalıştır
docker-compose up cv_module
```

### Test Resmi ile Çalıştırma
```bash
docker-compose run cv_module python processor.py \
  --mode image \
  --source /app/test_images/parking.jpg \
  --parking-lot-id 1
```

## API Entegrasyonu

CV modülü tespit sonuçlarını backend'e şu endpoint'ler üzerinden gönderir:

- `PUT /cv/parking-lots/{id}/status` - Otopark durumu güncelleme
- `PUT /cv/parking-spots/{id}/status` - Tek park yeri güncelleme
- `POST /cv/events` - WebSocket event gönderme

## Model Bilgileri

- **Platform:** Roboflow
- **Model:** parking-space-iudkx
- **Sınıflar:** empty (boş), occupied (dolu)

## Sistem Akışı

```
Kamera/Resim → Roboflow Inference → Tespit Sonuçları
                                           ↓
                                    Backend API
                                           ↓
                                    WebSocket Broadcast
                                           ↓
                                    Mobil Uygulama
```
