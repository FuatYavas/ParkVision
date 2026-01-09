# ParkVision CV Module
**Bilgisayarlı Görü Modülü - YOLOv8 Parking Detection**

Roboflow tabanlı gerçek zamanlı park yeri tespiti modülü.

## 🎯 Genel Bakış

Bu modül, otopark kameralarından alınan görüntüleri Roboflow YOLOv8 modeli ile işleyerek boş ve dolu park yerlerini tespit eder.

## 🛠️ Teknoloji Stack

- **Model:** YOLOv8 Object Detection
- **Platform:** Roboflow Serverless API
- **Model ID:** `car-parking-xutja/1`
- **Language:** Python 3.9-3.12
- **Libraries:** PIL, requests

## 📦 Kurulum

### Gereksinimler
```bash
pip install -r requirements.txt
```

**requirements.txt:**
```txt
Pillow>=10.0.0
requests>=2.31.0
```

## 🚀 Kullanım

### 1. Tek Resim İşleme

```bash
cd ..
python process_parking_images.py
```

Bu script:
- `parkresim/` klasöründeki tüm `.jpg` dosyalarını işler
- Her resim için Roboflow API'ye istek gönderir
- Bounding box'ları çizer (yeşil=boş, kırmızı=dolu)
- Sonuçları `mobile_app/assets/images/cv_processed_*.jpg` olarak kaydeder

### 2. API Konfigürasyonu

`process_parking_images.py` dosyasında:

```python
# Roboflow configuration
API_KEY = "0Zmk2YMfrmOASiUGMQSG"
MODEL_ID = "car-parking-xutja/1"
API_URL = f"https://serverless.roboflow.com/{MODEL_ID}"
```

## 📊 Model Çıktısı

### Detection Sınıfları
- `space-empty` - Boş park yeri (yeşil)
- `space-occupied` - Dolu park yeri (kırmızı)

### Örnek API Response
```json
{
  "predictions": [
    {
      "x": 123.4,
      "y": 567.8,
      "width": 50.0,
      "height": 80.0,
      "confidence": 0.92,
      "class": "space-occupied"
    },
    {
      "x": 234.5,
      "y": 567.8,
      "width": 50.0,
      "height": 80.0,
      "confidence": 0.88,
      "class": "space-empty"
    }
  ]
}
```

## 🎨 Bounding Box Görselleştirme

```python
# Renk kodları
EMPTY_COLOR = (34, 197, 94)    # Yeşil - RGB
OCCUPIED_COLOR = (239, 68, 68)  # Kırmızı - RGB

# Çizim özellikleri
- 3 piksel kalınlığında dikdörtgen
- Üstte class adı + confidence score
- Label arka planı renkli kutu
```

## 📈 Performans Metrikleri

**Test Sonuçları (5 Görsel):**
- Ortalama detection/görsel: 52.4
- API yanıt süresi: ~2-3 saniye/görsel
- Toplam işleme süresi: ~15 saniye (5 görsel)

| Görsel | Detection Sayısı | Başarı |
|--------|------------------|--------|
| cv_processed_1.jpg | 98 | ✅ |
| cv_processed_2.jpg | 41 | ✅ |
| cv_processed_3.jpg | 41 | ✅ |
| cv_processed_4.jpg | 43 | ✅ |
| cv_processed_5.jpg | 39 | ✅ |

## 🔧 Troubleshooting

### API 403 Forbidden
```bash
# API key'i kontrol edin
curl -X POST https://serverless.roboflow.com/car-parking-xutja/1 \
  -F "file=@test.jpg" \
  -F "api_key=YOUR_API_KEY"
```

### PIL Import Error
```bash
pip install --upgrade Pillow
```

### Font Yükleme Hatası
Script varsayılan font'a düşer, problem olmaz:
```python
try:
    font = ImageFont.truetype("arial.ttf", 14)
except:
    font = ImageFont.load_default()
```

## 📁 Dosya Yapısı

```
cv_module/
├── detector.py              # Detector sınıfı (legacy)
├── processor.py             # Stream processor
├── api_client.py            # Backend client
├── config.py                # Konfigürasyon
├── requirements.txt         # Python dependencies
├── test_detection.py        # Test script
└── README.md               # Bu dosya

../process_parking_images.py # Ana işleme scripti
```

## 🔄 Backend Entegrasyonu

CV modülü backend'e tespit sonuçlarını gönderebilir:

```python
# Backend API endpoint
PUT /cv/parking-lots/{id}/status

# Request body
{
  "spots": [
    {
      "spot_number": "A1",
      "status": "empty",
      "confidence": 0.92
    }
  ]
}
```

## 🐳 Docker Kullanımı

```bash
# Build
docker-compose build cv_module

# Run
docker-compose up cv_module

# Test
docker exec -it parkvision_cv python test_detection.py --image /app/test.jpg
```

## 📝 Notlar

- Model API limitleri için Roboflow pricing sayfasını kontrol edin
- Production'da rate limiting ekleyin
- Büyük görüntüler için resize öneririz (max 1280px)
- Confidence threshold: Default (Roboflow tarafından ayarlanır)

## 🔗 Kaynaklar

- [Roboflow Docs](https://docs.roboflow.com)
- [YOLOv8 Documentation](https://docs.ultralytics.com)
- [Proje Ana README](../README.md)

---

**Model Sahibi:** Roboflow Universe  
**Son Test:** 9 Ocak 2026  
**Status:** ✅ Aktif ve Çalışıyor
