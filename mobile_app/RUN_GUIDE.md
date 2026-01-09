# ParkVision Mobil Uygulama Çalıştırma Kılavuzu
**Son Güncelleme:** 9 Ocak 2026

Mobil uygulamayı (React Native + Expo SDK 54) görüntülemek ve test etmek için aşağıdaki adımları izleyin.

## 📱 1. Hazırlık

### Gereksinimler
- Node.js 18+ kurulu olmalı
- Telefonunuzda **Expo Go** uygulaması
- Bilgisayar ve telefon **aynı Wi-Fi ağında** olmalı

### Expo Go İndirme
- [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [iOS (App Store)](https://apps.apple.com/us/app/expo-go/id982107779)

## 🚀 2. Kurulum ve Başlatma

### Bağımlılıkları Yükle
```bash
cd mobile_app
npm install
```

### Uygulamayı Başlat
```bash
npx expo start
```

**Cache temizleyerek başlatma (önerilen):**
```bash
npx expo start --clear
```

Bu komut çalıştıktan sonra ekranda bir **QR Kod** ve kontrol menüsü göreceksiniz.

## 📲 3. Uygulamayı Görüntüleme

### Seçenek A: Kendi Telefonunuzda (Önerilen)
1. Telefonunuzda **Expo Go** uygulamasını açın
2. **Android:** "Scan QR Code" → Terminal'deki QR'ı tarat
3. **iOS:** Kamera uygulaması → QR'ı tarat → Bildirime tıkla

### Seçenek B: Demo Mode (Backend Olmadan Test)
1. Uygulama login ekranında
2. **"Demo Mode ile Gir"** butonuna tıklayın
3. Mock data ile tüm özellikleri test edebilirsiniz

### Seçenek C: Android Emülatör
1. Android Studio → AVD Manager → Bir emulator başlatın
2. Terminal'de `a` tuşuna basın

### Seçenek D: Web Tarayıcı
1. Terminal'de `w` tuşuna basın
2. Bazı native özellikler (kamera, push notification) çalışmayabilir

## 🔧 4. Backend Bağlantısı (Opsiyonel)

### API URL Ayarlama
Backend'e bağlanmak için WiFi IP adresinizi güncelleyin:

```javascript
// mobile_app/api.js
const API_URL = 'http://192.168.1.XXX:8000/api';  // IP'nizi yazın
```

**IP adresinizi öğrenme:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### Backend Başlatma
```bash
# Docker ile
docker-compose up -d backend

# Manuel
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## ✨ 5. Özellikler ve Test Senaryoları

### CV Detection Görselleri
- 5 farklı otopark için gerçek YOLOv8 model sonuçları
- Her otopark farklı detection görüntüsü gösterir
- Yeşil box = Boş, Kırmızı box = Dolu
- Dosyalar: `assets/images/cv_processed_1-5.jpg`

### Test Edilebilir Ekranlar
- ✅ Onboarding (ilk açılış)
- ✅ Login/Register
- ✅ Map (harita + otopark marker'ları)
- ✅ Parking Detail (CV detection + rezervasyon)
- ✅ Reservations (geçmiş rezervasyonlar)
- ✅ Profile (kullanıcı bilgileri)
- ✅ Vehicles (araç yönetimi)
- ✅ Navigation (Google Maps entegrasyonu)

### Demo Kullanıcılar (Mock Data)
```javascript
Email: demo@parkvision.com
Password: demo123

// veya
Email: user@test.com
Password: 123456
```

## 🐛 Sık Karşılaşılan Sorunlar

### Problem: QR kod taratılamıyor
**Çözüm:**
```bash
# Cache temizle
npx expo start --clear

# QR'ı yenile
# Terminal'de 'c' tuşuna bas
```

### Problem: "Network Error" veya API bağlanamıyor
**Çözüm:**
1. Backend çalışıyor mu kontrol et: `curl http://localhost:8000/health`
2. WiFi IP doğru mu kontrol et: `api.js` dosyasında `API_URL`
3. Telefon ve PC aynı ağda mı?
4. **Demo Mode** kullan (backend gerektirmez)

### Problem: "Port 8081 is being used"
**Çözüm:** Expo otomatik olarak 8082'ye geçecektir, sorun değil.

### Problem: Metro Bundler hatası
**Çözüm:**
```bash
# node_modules temizle
rm -rf node_modules
npm install

# Cache temizle
npx expo start --clear
```

### Problem: CV görselleri yüklenmiyor
**Çözüm:**
```bash
# Assets'lerin doğru yüklendiğinden emin ol
ls mobile_app/assets/images/cv_processed_*.jpg

# Uygulama yeniden yükle (r tuşu)
```

## 🎮 Klavye Kısayolları

Expo çalışırken terminalde kullanabileceğiniz komutlar:

- `a` - Android emulator'de aç
- `i` - iOS simulator'de aç (Mac only)
- `w` - Web browser'da aç
- `r` - Uygulamayı yenile
- `m` - Menüyü aç/kapat
- `c` - Terminali temizle
- `?` - Tüm komutları göster

## 📚 Ek Kaynaklar

- [Expo Dokümantasyonu](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Proje Ana README](../README.md)
- [Mobile Backend Entegrasyonu](../MOBILE_INTEGRATION.md)

## 🔄 Hot Reload

Kod değişiklikleri yapıldığında uygulama otomatik olarak yenilenir. Eğer çalışmazsa:
- Android/iOS: Cihazı sallayın → "Reload" seçin
- Terminal: `r` tuşuna basın

## 📊 Performance

İlk açılış yavaş olabilir. Sonraki açılışlar hızlıdır. Production build için:
```bash
npx expo build:android  # Android APK
npx expo build:ios      # iOS IPA (Mac gerekli)
```

---

**Not:** Demo Mode kullanarak backend olmadan tüm özellikleri test edebilirsiniz!
