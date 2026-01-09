# Otopark Resimleri

Bu klasöre 8 adet otopark resmi eklenmesi gerekiyor.

## Gereksinimler

- **Dosya Adları**: `parking1.jpg`, `parking2.jpg`, `parking3.jpg`, `parking4.jpg`, `parking5.jpg`, `parking6.jpg`, `parking7.jpg`, `parking8.jpg`
- **Boyut**: 1200x800px (16:9 oran)
- **Format**: JPG/JPEG
- **İçerik**: Elazığ'daki gerçek otoparkların fotoğrafları veya benzer otopark görselleri

## Önerilen Konumlar

1. **İstinyePark AVM** (parking1.jpg) - Kapalı otopark
2. **Elazığ Çarşı Merkezi** (parking2.jpg) - Açık otopark
3. **Fırat Üniversitesi Kampüs** (parking3.jpg) - Kampüs otoparkı
4. **Harput Kalesi Yakını** (parking4.jpg) - Turistik alan otoparkı
5. **Stadyum Otoparkı** (parking5.jpg) - Açık alan
6. **AVM Kapalı Alan** (parking6.jpg) - Kapalı otopark
7. **Şehir Merkezi Sokak** (parking7.jpg) - Cadde üzeri park
8. **Hastane Otoparkı** (parking8.jpg) - Kamu alanı

## Kullanım

Resimler `mobile_app/data/mockData.js` dosyasında aşağıdaki şekilde referans edilir:

```javascript
image: require('../assets/images/parking1.jpg')
```

Resimleri ekledikten sonra uygulamayı yeniden başlatın (Expo cache temizlemek için `expo start -c`).

## Alternatif

Eğer gerçek fotoğraflar bulunamazsa, [Unsplash](https://unsplash.com/s/photos/parking-lot) veya [Pexels](https://www.pexels.com/search/parking/) üzerinden lisanssız otopark fotoğrafları indirilebilir.

### Örnek Unsplash Arama Sorguları:
- "parking lot aerial view"
- "parking garage interior"
- "outdoor parking"
- "multi-story car park"
