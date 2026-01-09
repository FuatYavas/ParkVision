# ParkVision - Proje İlerleme Raporu
**Son Güncelleme:** 9 Ocak 2026

---

## 1. YÖNETİCİ ÖZETİ

ParkVision, YOLOv8 tabanlı bilgisayarlı görü teknolojisi kullanarak gerçek zamanlı park yeri algılama ve rezervasyon sistemi sunan kapsamlı bir akıllı otopark yönetim platformudur. Proje, mobil uygulama, web yönetim paneli, backend API ve bilgisayarlı görü modülünden oluşmaktadır. 

**Önemli Gelişme:** Roboflow YOLOv8 modeli başarıyla entegre edildi ve 5 farklı otopark görselinde gerçek zamanlı detection testi tamamlandı.

---

## 2. KULLANILAN YAPAY ZEKA MODELİ

### 2.1 Roboflow Model Bilgileri

| Özellik | Değer |
|---------|-------|
| **Model Tipi** | YOLOv8 Object Detection |
| **Model ID** | car-parking-xutja/1 |
| **API Endpoint** | https://serverless.roboflow.com |
| **Sınıflar** | space-empty, space-occupied |
| **Kullanım** | REST API (Python + PIL) |
| **Durum** | ✅ **Aktif ve Çalışıyor** |

### 2.2 Model Performansı

**Test Sonuçları (5 Otopark Görseli):**
- Resim 1: 98 detection
- Resim 2: 41 detection
- Resim 3: 41 detection
- Resim 4: 43 detection
- Resim 5: 39 detection

**Renk Kodlaması:**
- 🟢 Yeşil: Boş park yerleri (space-empty)
- 🔴 Kırmızı: Dolu park yerleri (space-occupied)

### 2.3 Model Kullanım Akışı

```
Kamera Görüntüsü → process_parking_images.py → Roboflow API → 
Bounding Box Drawing → Backend API → Mobil Uygulama (Gerçek Zamanlı)
```

---

## 3. MEVCUT DURUM ANALİZİ

### 3.1 Genel İlerleme Durumu

| Bileşen | Tamamlanma Oranı | Durum |
|---------|------------------|-------|
| Backend API | %90 | ✅ Tamamlandı |
| Veritabanı | %95 | ✅ Tamamlandı |
| Mobil Uygulama | %85 | ✅ CV entegrasyonu yapıldı |
| Web Yönetim Paneli | %40 | 🟡 Temel yapı hazır |
| CV Modülü | %80 | ✅ Roboflow entegre edildi |
| Docker Altyapısı | %100 | ✅ Tamamlandı |

**Toplam Proje İlerlemesi: ~%78**

---

### 3.2 Backend API Durumu

#### Tamamlanan Özellikler

| Endpoint | Açıklama | Durum |
|----------|----------|-------|
| `POST /register` | Kullanıcı kaydı | ✅ Tamamlandı |
| `POST /token` | JWT ile giriş | ✅ Tamamlandı |
| `GET /users/me` | Kullanıcı profili | ✅ Tamamlandı |
| `PUT /users/profile` | Profil güncelleme | ✅ Tamamlandı |
| `PUT /users/profile/password` | Şifre değiştirme | ✅ Tamamlandı |
| `GET/POST /users/vehicles` | Araç yönetimi | ✅ Tamamlandı |
| `GET /parking-lots/` | Otopark listesi | ✅ Tamamlandı |
| `GET /parking-lots/{id}` | Otopark detayı | ✅ Tamamlandı |
| `POST /reservations/` | Rezervasyon oluşturma | ✅ Tamamlandı |
| `DELETE /reservations/{id}/cancel` | Rezervasyon iptali | ✅ Tamamlandı |
| `POST /reservations/validate` | Kod doğrulama | ✅ Tamamlandı |
| `POST /reports/` | Durum bildirimi | ✅ Tamamlandı |
| `WS /ws/{client_id}` | WebSocket bağlantısı | ✅ Tamamlandı |

#### Teknoloji Yığını
- **Framework:** FastAPI + Uvicorn
- **Veritabanı:** PostgreSQL 15
- **Önbellek:** Redis 7
- **Kimlik Doğrulama:** JWT + bcrypt
- **ORM:** SQLModel

#### Veritabanı Şeması
```
User ─────────── Vehicle (1:N)
  │
  └─────────── Reservation (1:N)
                    │
ParkingLot ──── ParkingSpot (1:N)
  │                 │
  └─── Camera       └─── Report (N:1)
```

---

### 3.3 Mobil Uygulama Durumu

#### Tamamlanan Ekranlar

| Ekran | Özellik | Durum |
|-------|---------|-------|
| OnboardingScreen | Tanıtım ekranı | ✅ Tamamlandı |
| LoginScreen | Giriş | ✅ Tamamlandı |
| RegisterScreen | Kayıt | ✅ Tamamlandı |
| MapScreen | Harita görünümü | ✅ Tamamlandı |
| ParkingDetailScreen | Otopark detayı | ✅ Tamamlandı |
| ProfileScreen | Profil menüsü | ✅ Tamamlandı |
| PersonalInfoScreen | Kişisel bilgiler | ✅ Tamamlandı |
| VehiclesScreen | Araç yönetimi | ✅ Tamamlandı |
| NavigationScreen | GPS navigasyon | ✅ Tamamlandı |

#### Kısmen Tamamlanan Ekranlar

| Ekran | Eksik | Durum |
|-------|-------|-------|
| ReservationScreen | API entegrasyonu beklemede |  Mock veri kullanılıyor |
| MyReservationsScreen | Gerçek veri çekimi |  Mock veri kullanılıyor |
| FindMyCarScreen | Tam navigasyon |  Temel işlev mevcut |

#### Henüz Başlanmamış Ekranlar

| Ekran | Açıklama | Durum |
|-------|----------|-------|
| FavoritesScreen | Favori otoparklar | ❌ Placeholder |
| NotificationsScreen | Bildirim ayarları | ❌ Placeholder |
| AppearanceScreen | Tema ayarları | ❌ Placeholder |

#### Teknoloji Yığını
- **Framework:** React Native 0.81.5
- **Build Tool:** Expo 54.0.25
- **Navigasyon:** React Navigation (Google)
- **Harita:** React Native Maps
- **HTTP İstemci:** Axios
---

### 3.4 Bilgisayarlı Görü Modülü Durumu

#### Mevcut Durum
- ❌ CV API entegrasyonu yapılmadı
- ❌ Gerçek zamanlı görüntü işleme aktif değil
- ❌ Backend ile doluluk senkronizasyonu yok
- ⚠️ Temel sınıf yapıları mevcut

---

## 4. PROJENİN BİTİŞ DURUMU (HEDEFLENİEN)

### 4.1 Tamamlanmış Sistemin Genel Görünümü

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ParkVision EKOSİSTEMİ                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   KAMERALAR  │───▶│              │───▶│  BACKEND     │          │
│  │  (IP/USB)    │    │  YOLOv8 API  │    │  FastAPI     │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│                                                  │                  │
│         ┌────────────────────────────────────────┼────────────┐     │
│         │                                        │            │     │
│         ▼                                        ▼            ▼     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  MOBİL APP   │    │  WEB ADMIN   │    │  VERİTABANI  │          │
│  │  iOS/Android │    │  Panel       │    │  PostgreSQL  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Hedeflenen Özellikler (Proje Bitişinde)

#### A. Bilgisayarlı Görü Modülü
| Özellik | Açıklama |
|---------|----------|
| Roboflow Entegrasyonu | Park yeri algılama modeli tam entegre |
| Gerçek Zamanlı İşleme | Saniyede 1+ kare işleme kapasitesi |
| Çoklu Kamera Desteği | Aynı anda birden fazla kamera akışı |
| Otomatik Durum Güncelleme | Backend API'ye anlık bildirim |
| Doğruluk Oranı | %90+ park yeri tespit başarısı |

#### B. Mobil Uygulama
| Özellik | Açıklama |
|---------|----------|
| Gerçek Zamanlı Doluluk | WebSocket ile anlık güncelleme |
| Akıllı Rezervasyon | QR kod ile giriş/çıkış |
| Navigasyon | Seçilen otoparka yol tarifi |
| Push Bildirimler | Rezervasyon hatırlatmaları |
| Favori Otoparklar | Hızlı erişim listesi |
| Araç Bulma | Park edilen aracın konumu |
| Karanlık Mod | Tema seçeneği |


#### C. Backend API
| Özellik | Açıklama |
|---------|----------|
| Email Bildirimleri | SMTP entegrasyonu |
| Push Bildirimler | Firebase Cloud Messaging |
| Rate Limiting | API kullanım limitleri |

---

## 5. KALAN İŞLER VE ÖNCELİKLER

### 5.1 Yüksek Öncelikli (Kritik)

| # | Görev | Bileşen | Açıklama |
|---|-------|---------|----------|
| 1 | Gerçek Zamanlı Görüntü İşleme | CV Modülü | Kamera → Model → Backend akışı |
| 2 | WebSocket Doluluk Güncellemesi | Backend | CV sonuçlarının yayınlanması |

### 5.2 Orta Öncelikli (Önemli)

| # | Görev | Bileşen | Açıklama |
|---|-------|---------|----------|
| 3 | Web Admin Backend Bağlantısı | Web Admin | Dashboard gerçek veriler |
| 4 | Bildirim Sistemi | Backend | Email/Push altyapısı |

### 5.3 Düşük Öncelikli (Geliştirme)

| # | Görev | Bileşen | Açıklama |
|---|-------|---------|----------|
| 5 | Favori Otoparklar | Mobil App | Kaydetme özelliği |
| 6 | Tema/Dil Ayarları | Mobil App | Kullanıcı tercihleri |
| 7 | Gelişmiş Raporlama | Web Admin | Analitik dashboard |

---

## 6. ROBOFLOW ENTEGRASYON PLANI

### 6.1 Veri Akışı

```
1. Kamera görüntüsü alınır (streamer.py)
         │
         ▼
2. Roboflow API'ye gönderilir (detector.py)
         │
         ▼
3. Tahmin sonuçları alınır (JSON)
         │
         ▼
4. Park yeri durumları güncellenir (processor.py)
         │
         ▼
5. Backend API'ye PUT isteği (/parking-spots/{id}/status)
         │
         ▼
6. WebSocket ile mobil uygulamaya yayın
```

---



## 7. RİSK DEĞERLENDİRMESİ

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Roboflow API kesintisi | Düşük | Yüksek | Offline model yedekleme |
| Düşük algılama doğruluğu | Orta | Yüksek | Model fine-tuning |
| Yüksek API maliyeti | Orta | Orta | İstek optimizasyonu |
| Ağ gecikmesi | Orta | Orta | Yerel önbellekleme |
| Kamera arızası | Düşük | Orta | Yedek kamera sistemi |

---

## 8. SONUÇ

ParkVision projesi, akıllı otopark yönetimi için kapsamlı bir çözüm sunmaktadır. Mevcut durumda:

- **Backend:** %90 tamamlanmış, production-ready durumda
- **Mobil Uygulama:** %75 tamamlanmış, temel özellikler çalışıyor
- **Web Admin:** %40 tamamlanmış, temel yapı hazır
- **CV Modülü:** %10 tamamlanmış, Model entegrasyonu bekliyor

---
