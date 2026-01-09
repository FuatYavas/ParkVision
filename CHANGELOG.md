# Changelog

Tüm önemli değişiklikler bu dosyada dokümante edilir.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versiyon: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Planlanan
- WebSocket gerçek zamanlı güncellemeler
- Push notifications (remote)
- Ödeme entegrasyonu (Stripe/İyzico)
- QR kod giriş/çıkış sistemi
- Plaka tanıma (LPR)

## [0.8.0] - 2026-01-09

### Added
- ✨ Roboflow YOLOv8 model entegrasyonu
- 🎨 CV detection görselleştirme (bounding boxes)
- 📱 Her otopark için özel CV sonuçları (5 görsel)
- 🟢🔴 Renk kodlu park yeri gösterimi (yeşil=boş, kırmızı=dolu)
- 📝 `process_parking_images.py` - Otomatik görüntü işleme scripti
- 📚 Kapsamlı README.md dokümantasyonu
- 📖 CONTRIBUTING.md - Katkıda bulunma rehberi
- 🔧 CV Module README güncellemesi

### Changed
- 📊 İlerleme raporu güncellendi (%78 tamamlanma)
- 🎯 Model bilgileri güncellendi (car-parking-xutja/1)
- 📱 Mobile app RUN_GUIDE.md genişletildi

### Fixed
- 🐛 Renk sınıflandırma hatası düzeltildi (space-occupied artık kırmızı)
- 🎨 Bounding box çizim algoritması iyileştirildi

## [0.7.0] - 2025-12-XX

### Added
- 🗺️ Harita iyileştirmeleri
- 📍 Canlı konum güncellemeleri
- 🚗 "Arabamı Bul" özelliği
- 📱 Demo Mode (backend olmadan test)

### Changed
- ♻️ MapScreen refactor edildi
- 🎨 UI/UX iyileştirmeleri

## [0.6.0] - 2025-11-XX

### Added
- 🔔 Local push notifications
- 📅 Rezervasyon sistemi
- 🚗 Araç yönetimi
- 📊 Kullanıcı profil sayfası

### Changed
- 🔐 JWT authentication iyileştirildi
- 🗄️ Database schema güncellemesi

## [0.5.0] - 2025-10-XX

### Added
- 🎨 Web Admin Panel (React + Vite)
- 📊 Dashboard (gelir/doluluk grafikleri)
- 🏢 Otopark CRUD işlemleri
- 👥 Kullanıcı yönetimi

### Changed
- 🎨 TailwindCSS entegrasyonu
- 📱 Responsive design

## [0.4.0] - 2025-09-XX

### Added
- 📱 Mobile App temel yapı (React Native + Expo)
- 🗺️ Google Maps entegrasyonu
- 🔍 Otopark arama ve filtreleme
- 🧭 Navigasyon ekranı

### Changed
- 🎨 Onboarding ekranları eklendi
- 🔐 Login/Register flow iyileştirildi

## [0.3.0] - 2025-08-XX

### Added
- 🗄️ PostgreSQL database setup
- 📊 SQLModel ORM entegrasyonu
- 🔴 Redis cache layer
- 🔄 Alembic migrations

### Changed
- 🏗️ Backend yapısı refactor edildi
- 📦 Docker Compose konfigürasyonu

## [0.2.0] - 2025-07-XX

### Added
- 🚀 FastAPI backend
- 🔐 JWT authentication
- 📡 REST API endpoints:
  - `/token` - Login
  - `/api/parking-lots/` - Otopark listesi
  - `/api/reservations/` - Rezervasyon
- 📝 Swagger UI dokümantasyonu

## [0.1.0] - 2025-06-XX

### Added
- 🎉 Proje başlangıcı
- 📋 Gereksinim analizi
- 🎨 Proje yapısı oluşturuldu
- 🐳 Docker altyapısı
- 📚 İlk dokümantasyon

---

## Versiyon Notları

### [0.8.0] Önemli Değişiklikler
Bu versiyon CV modülünün tam entegrasyonunu getiriyor:
- Gerçek YOLOv8 model çıktıları
- 5 farklı otopark için özel detection görselleri
- Profesyonel bounding box görselleştirme
- Confidence score gösterimi

**Breaking Changes:** Yok

**Migration:** Gerekmiyor

### Bilinen Sorunlar
- WebSocket henüz aktif değil (gelecek versiyonda)
- Remote push notifications çalışmıyor (Expo Go sınırlaması)
- CV modülü Docker'da sürekli çalışmıyor (manuel trigger gerekiyor)

### Performans
- API response time: <200ms (ortalama)
- CV processing: ~2-3 saniye/görsel
- Mobile app load time: <2 saniye

---

**Güncel Versiyon:** 0.8.0  
**Son Güncelleme:** 9 Ocak 2026  
**Proje Durumu:** Aktif Geliştirme 🚀
