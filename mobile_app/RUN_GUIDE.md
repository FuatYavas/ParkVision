# ParkVision Mobil Uygulama Çalıştırma Kılavuzu

Mobil uygulamayı (React Native + Expo) görüntülemek için aşağıdaki adımları izleyin.

## 1. Hazırlık
- Telefonunuza **Expo Go** uygulamasını indirin:
  - [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS (App Store)](https://apps.apple.com/us/app/expo-go/id982107779)
- Bilgisayarınız ve telefonunuzun **aynı Wi-Fi ağında** olduğundan emin olun.

## 2. Uygulamayı Başlatma
Terminalde (komut satırında) proje dizinine gidin ve uygulamayı başlatın:

```bash
cd mobile_app
npx expo start
```

Bu komut çalıştıktan sonra ekranda bir **QR Kod** göreceksiniz.

## 3. Uygulamayı Görüntüleme

### Seçenek A: Kendi Telefonunuzda (Önerilen)
1. Telefonunuzda **Expo Go** uygulamasını açın.
2. **Android:** "Scan QR Code" seçeneğine tıklayın ve terminaldeki QR kodu okutun.
3. **iOS:** Normal kamera uygulamasını açıp QR kodu okutun, çıkan bildirime tıklayın.

### Seçenek B: Android Emülatör
1. Bilgisayarınızda Android Studio ve bir sanal cihaz (AVD) açık olsun.
2. Terminalde `npx expo start` çalışırken klavyeden **`a`** tuşuna basın.

### Seçenek C: Web Tarayıcı
1. Terminalde `npx expo start` çalışırken klavyeden **`w`** tuşuna basın.
2. Uygulama tarayıcınızda açılacaktır (Bazı mobil özellikler çalışmayabilir).

## Sık Karşılaşılan Sorunlar
- **Bağlantı Hatası:** Telefon ve bilgisayarın aynı Wi-Fi ağında olduğunu kontrol edin.
- **QR Kod Çalışmıyor:** Terminalde `c` tuşuna basarak QR kodu yeniden oluşturun.
- **Metro Bundler Hatası:** `npx expo start --clear` komutuyla önbelleği temizleyerek başlatın.
