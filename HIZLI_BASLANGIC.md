# ÇIRAK Sistemi - Hızlı Başlangıç

## ✅ YAPILDI: Tamamlanan İşlemler

1. ✅ Widget portföy sitesine entegre edildi
2. ✅ Admin paneli production build alındı
3. ✅ Kullanım kılavuzu oluşturuldu

## 🚀 Nasıl Kullanılır?

### 1. Backend'i Başlat (HER ZAMAN İLK ADIM!)

```bash
cd "c:\Users\drej0\Desktop\ÇIRAK WEB"
node server/index.js
```

### 2. Portföy Sitesini Aç

**Yöntem 1: Çift Tıklama**
```
PORTFÖT SİTE\dist\index.html dosyasına çift tıklayın
```

**Yöntem 2: Live Server**
```
VS Code'da index.html'i açın → Sağ tık → "Open with Live Server"
```

### 3. Admin Paneline Eriş

**Tarayıcıda:**
```
http://localhost:5000/admin
```

**VEYA**
```
ÇIRAK WEB\dist\admin.html dosyasına çift tıklayın
```

---

## 🐛 Widget Sorunu: "Mesaj gönderince sayfa yenileniyor"

### Olası Sebepler:

1. **Backend çalışmıyor**
   - Çözüm: `node server/index.js` komutunu çalıştırın

2. **CORS hatası**
   - Çözüm: `server/.env` dosyasında `ALLOWED_ORIGINS=*` ekleyin

3. **Widget script yüklenemedi**
   - Çözüm: F12 → Network → widget.js kontrol edin

4. **React form submit**
   - Çözüm: Widget'ta form yok, button kullanılıyor (sorun olmamalı)

### Test Adımları:

```
1. Backend'i başlat: node server/index.js
2. Portföy sitesini aç: PORTFÖT SİTE\dist\index.html
3. F12 → Console → Hataları kontrol et
4. Widget'a tıkla → Mesaj gönder
5. Console'da "Failed to fetch" hatası varsa backend çalışmıyor
```

---

## 📂 Dosya Konumları

```
ÇIRAK WEB/
├── server/index.js          ← Backend (node server/index.js)
├── dist/admin.html          ← Admin Panel
└── PORTFÖT SİTE/
    └── dist/
        ├── index.html       ← Portföy Sitesi + Widget
        └── widget.js        ← Widget Script
```

---

## 🎯 Sonraki Adımlar

1. Backend'i başlatın
2. Portföy sitesini açın
3. Widget'ı test edin
4. Eğer sorun devam ederse:
   - F12 → Console'daki hataları bana gönderin
   - Backend terminal çıktısını kontrol edin

---

**Detaylı Kılavuz:** `KULLANIM_KILAVUZU.md`
