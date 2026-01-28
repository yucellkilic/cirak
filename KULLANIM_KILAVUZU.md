# ÇIRAK Widget ve Admin Panel Kullanım Kılavuzu

## 📁 Dosya Yapısı

```
ÇIRAK WEB/
├── dist/                    ← Admin Panel (Production Build)
│   ├── admin.html          ← Admin Panel Ana Sayfa
│   ├── assets/             ← Admin Panel Assets
│   └── ...
│
└── PORTFÖT SİTE/
    └── dist/               ← Portföy Sitesi
        ├── index.html      ← Portföy Ana Sayfa (Widget Entegreli)
        ├── widget.js       ← ÇIRAK Widget Script
        └── assets/         ← Portföy Assets
```

---

## 🚀 1. Backend Server'ı Başlatma

**Her zaman ilk adım!**

```bash
cd "c:\Users\drej0\Desktop\ÇIRAK WEB"
node server/index.js
```

**Çıktı:**
```
✅ ÇIRAK Backend running on http://localhost:5000
✅ Admin Panel: http://localhost:5000/admin
```

---

## 🎨 2. Portföy Sitesini Açma (Widget ile)

### Yöntem 1: Çift Tıklama (Önerilen)
```
PORTFÖT SİTE/dist/index.html dosyasına çift tıklayın
```

### Yöntem 2: Live Server (VS Code)
```
1. VS Code'da PORTFÖT SİTE/dist/index.html'i açın
2. Sağ tık → "Open with Live Server"
```

**Widget Özellikleri:**
- ✅ Sağ alt köşede görünür
- ✅ Tıklayınca açılır
- ✅ Mesaj gönderebilirsiniz
- ✅ Backend'e bağlıdır (localhost:5000)

---

## ⚙️ 3. Admin Paneline Erişim

### Yöntem 1: Backend ile Birlikte (Önerilen)
```
http://localhost:5000/admin
```

### Yöntem 2: Standalone (Sadece Görüntüleme)
```
1. ÇIRAK WEB/dist/admin.html dosyasına çift tıklayın
2. VEYA Live Server ile açın
```

**Admin Panel Özellikleri:**
- ✅ Intent yönetimi
- ✅ Fallback yönetimi
- ✅ Snapshot kontrolü
- ✅ Test konsolu
- ✅ Analytics

---

## 🔧 4. Widget Sorun Giderme

### Sorun: "Mesaj gönderince sayfa yenileniyor"

**Çözüm 1: Backend Çalışıyor mu?**
```bash
# Terminal'de kontrol edin:
node server/index.js
```

**Çözüm 2: Console Hatalarını Kontrol Edin**
```
1. F12 tuşuna basın (Developer Tools)
2. Console sekmesine gidin
3. Kırmızı hataları kontrol edin
```

**Çözüm 3: CORS Hatası**
```javascript
// server/.env dosyasında:
ALLOWED_ORIGINS=http://localhost:5500,file://,*
```

**Çözüm 4: Widget Script Yüklendi mi?**
```
F12 → Network → widget.js dosyasını kontrol edin
```

---

## 📊 5. Tam Çalışma Senaryosu

### Adım 1: Backend'i Başlat
```bash
cd "c:\Users\drej0\Desktop\ÇIRAK WEB"
node server/index.js
```

### Adım 2: Portföy Sitesini Aç
```
PORTFÖT SİTE/dist/index.html'e çift tıkla
```

### Adım 3: Widget'ı Test Et
```
1. Sağ alttaki chat ikonuna tıkla
2. "Merhaba" yaz ve gönder
3. ÇIRAK'tan cevap gelecek
```

### Adım 4: Admin Panelini Aç
```
Tarayıcıda: http://localhost:5000/admin
```

### Adım 5: Intent Ekle/Düzenle
```
1. Admin Panel → Intents
2. "Add Intent" butonuna tıkla
3. Bilgileri doldur
4. "Publish" butonuna tıkla
```

---

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata 1: "Failed to fetch"
**Sebep:** Backend çalışmıyor
**Çözüm:** `node server/index.js` komutunu çalıştırın

### Hata 2: "CORS Error"
**Sebep:** CORS ayarları yanlış
**Çözüm:** `server/.env` dosyasında `ALLOWED_ORIGINS` ayarlayın

### Hata 3: "Widget görünmüyor"
**Sebep:** widget.js yüklenemedi
**Çözüm:** 
```html
<!-- index.html'de kontrol edin: -->
<script src="./widget.js"></script>
```

### Hata 4: "Sayfa yenileniyor"
**Sebep:** Form submit eventi
**Çözüm:** Widget'ta form yok, button click kullanılıyor (zaten düzeltildi)

---

## 📝 Notlar

1. **Backend her zaman çalışmalı:** Widget ve Admin Panel backend'e bağlıdır
2. **Port 5000 kullanılıyor:** Başka uygulama bu portu kullanıyorsa çakışma olur
3. **Production Deployment:** 
   - `PORTFÖT SİTE/dist` klasörünü hosting'e yükleyin
   - `widget.js` içinde API URL'ini production URL ile değiştirin
4. **Admin Panel Production:**
   - `ÇIRAK WEB/dist` klasörünü ayrı bir subdomain'e yükleyin
   - Örnek: `admin.yourdomain.com`

---

## 🎯 Hızlı Başlangıç Komutları

```bash
# Backend Başlat
cd "c:\Users\drej0\Desktop\ÇIRAK WEB"
node server/index.js

# Portföy Sitesi
# PORTFÖT SİTE/dist/index.html'e çift tıkla

# Admin Panel
# Tarayıcıda: http://localhost:5000/admin
```

---

**Son Güncelleme:** 2026-01-20  
**Durum:** ✅ Çalışıyor
