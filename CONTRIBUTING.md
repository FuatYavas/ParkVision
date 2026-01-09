# ParkVision'a Katkıda Bulunma Rehberi

ParkVision projesine katkıda bulunmak istediğiniz için teşekkürler! 🎉

## 🚀 Başlamadan Önce

1. Projeyi fork edin
2. Local'de çalıştırabildiğinizden emin olun
3. [README.md](README.md) dosyasını okuyun
4. Mevcut issues'ları kontrol edin

## 📝 Geliştirme Akışı

### 1. Branch Oluşturma

```bash
# Feature için
git checkout -b feature/amazing-feature

# Bug fix için
git checkout -b fix/bug-description

# Dokümantasyon için
git checkout -b docs/documentation-update
```

### 2. Kod Yazma

#### Code Style

**Backend (Python)**
```python
# PEP 8 standardına uyun
# Type hints kullanın
def get_parking_lot(lot_id: int) -> ParkingLot:
    """Get parking lot by ID."""
    pass

# Docstring ekleyin
# Snake case kullanın: parking_lot_id
```

**Frontend (JavaScript/React)**
```javascript
// Camel case kullanın: parkingLotId
// Arrow function tercih edin
const ParkingDetail = ({ lot }) => {
    // Component logic
};

// Anlamlı değişken isimleri
const isLoading = true;
const parkingData = fetchData();
```

#### Commit Mesajları

Conventional Commits formatını kullanın:

```bash
feat: Yeni özellik eklendi
fix: Bug düzeltildi
docs: Dokümantasyon güncellendi
style: Kod formatı düzenlendi
refactor: Kod yeniden yapılandırıldı
test: Test eklendi/güncellendi
chore: Build/tooling değişiklikleri
perf: Performans iyileştirmesi
```

**Örnekler:**
```bash
git commit -m "feat: CV detection bounding box görselleştirme eklendi"
git commit -m "fix: Login ekranında crash düzeltildi"
git commit -m "docs: README.md dosyası güncellendi"
```

### 3. Testing

```bash
# Backend tests
cd backend
pytest

# Mobile app (manuel test)
cd mobile_app
npx expo start

# CV module test
python process_parking_images.py
```

### 4. Pull Request

1. Değişikliklerinizi push edin
2. GitHub'da Pull Request oluşturun
3. Açıklayıcı bir başlık ve açıklama yazın
4. İlgili issue'ları bağlayın (#123)

**PR Template:**
```markdown
## Değişiklikler
- Feature X eklendi
- Bug Y düzeltildi

## Test
- [ ] Local'de test edildi
- [ ] Mobil uygulamada test edildi
- [ ] Backend API test edildi

## Ekran Görüntüleri
(Varsa ekleyin)

## İlgili Issues
Closes #123
```

## 🐛 Bug Raporlama

Issue açarken şunları ekleyin:

```markdown
**Bug Açıklaması:**
Kısa ve net açıklama

**Adımlar:**
1. X sayfasına git
2. Y butonuna tıkla
3. Hata görülüyor

**Beklenen Davranış:**
Ne olması gerekiyordu?

**Ekran Görüntüleri:**
Varsa ekleyin

**Ortam:**
- OS: Windows 10
- Browser: Chrome 120
- Mobile: Android 13
- App Version: 1.0.0
```

## ✨ Feature Önerisi

```markdown
**Feature Açıklaması:**
Hangi özellik eklensin?

**Neden Gerekli:**
Problemi çözüyor mu? Değer katıyor mu?

**Önerilen Çözüm:**
Nasıl implement edilebilir?

**Alternatifler:**
Başka çözümler düşündünüz mü?
```

## 📚 Dokümantasyon

- README dosyalarını güncel tutun
- Kod yorumları ekleyin (complex logic için)
- API endpoint'lerini dokümante edin
- Yeni özellikler için kullanım örnekleri ekleyin

## 🔍 Code Review

PR'ınız review edilecektir. Şunlara dikkat edin:

- [ ] Kod temiz ve okunabilir
- [ ] Test edildi
- [ ] Dokümantasyon eklendi/güncellendi
- [ ] Commit mesajları açıklayıcı
- [ ] Conflict yok

## 🎯 Öncelikli Alanlar

Katkı yapabileceğiniz alanlar:

### Kolay (Başlangıç)
- Dokümantasyon iyileştirmeleri
- UI/UX düzeltmeleri
- Test coverage artırma
- Bug fixes

### Orta
- Yeni UI component'leri
- API endpoint'leri
- Bildirim sistemi
- QR kod entegrasyonu

### İleri
- WebSocket gerçek zamanlı güncellemeler
- Plaka tanıma (LPR)
- Ödeme entegrasyonu
- AR navigasyon

## 💬 İletişim

- **Issues:** GitHub Issues kullanın
- **Discussions:** GitHub Discussions'da soru sorun
- **Email:** [proje email]

## 📜 Lisans

Katkıda bulunarak, kodunuzun proje lisansı altında yayınlanmasını kabul edersiniz.

---

**Teşekkürler!** ParkVision'a katkıda bulunduğunuz için 🙏
