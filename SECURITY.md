# ItemTR Güvenlik Rehberi

## Canlıya Çıkmadan Önce Yapılması Gerekenler

### 1. Ortam Değişkenlerini Ayarla

`.env.local` dosyası oluştur ve şu değişkenleri ayarla:

```bash
# ZORUNLU: Güçlü bir admin şifresi belirle
VITE_ADMIN_PASSWORD=YourSecureRandomPassword123!

# Opsiyonel: Demo kullanıcı şifresi (test için)
VITE_DEMO_PASSWORD=AnotherSecurePassword456!
```

**Önemli:** `.env.local` dosyası `.gitignore` tarafından korunur ve GitHub'a gönderilmez.

### 2. Admin Şifresini Değiştir

- Varsayılan admin şifresi: `admin@itemtr.com`
- Canlıya çıkmadan önce mutlaka `VITE_ADMIN_PASSWORD` değişkenini ayarla
- Şifre konsole loglanmaz, güvenle saklanır

### 3. Bilinen Güvenlik Sınırlamaları

Bu proje **frontend-only** bir MVP'dir. Aşağıdaki sınırlamalar vardır:

| Özellik | Durum | Risk Seviyesi |
|---------|-------|---------------|
| localStorage Auth | ⚠️ Tüm veriler tarayıcıda | Orta |
| Plain Text Şifreler | ⚠️ Hash yok | Yüksek |
| XSS Koruması | ✅ React tarafından sağlanır | Düşük |
| CSRF Koruması | ✅ Gerekli değil (token-based değil) | Düşük |

### 4. Gerçek Backend İçin

Gerçek bir canlı ortam için şunlar gereklidir:

- [ ] Firebase Auth veya Supabase Auth entegrasyonu
- [ ] Server-side şifre hash'leme (bcrypt/argon2)
- [ ] JWT token tabanlı auth
- [ ] Rate limiting (brute force koruması)
- [ ] HTTPS zorunluluğu

### 5. Deploy Öncesi Checklist

- [ ] `VITE_ADMIN_PASSWORD` ayarlandı mı?
- [ ] Demo kullanıcı şifresi değiştirildi mi?
- [ ] `.env.local` `.gitignore`'da korunuyor mu?
- [ ] `console.warn` mesajları kontrol edildi mi?
- [ ] Build hatası yok mu? (`bun run build`)

### 6. Acil Durum

Admin şifresi unutulursa:
1. Tarayıcı localStorage'ı temizle
2. Yeni admin şifresi ile tekrar dene
3. Hala sorun varsa: `localStorage.clear()` console'dan çalıştır

---

**Son Güncelleme:** 2026-04-02
