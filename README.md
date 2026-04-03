# ItemTR - Oyun Hesabı Pazaryeri

Türkiye'nin en güvenilir oyun hesabı pazaryeri! Modern, yüksek performanslı React + TypeScript + Supabase tabanlı web uygulaması.

## 🚀 Özellikler

- ✅ **Gerçek Zamanlı İlanlar** - Anlık listeleme ve arama
- ✅ **Kullanıcı Kimlik Doğrulama** - Supabase Auth ile güvenli giriş
- ✅ **Alıcı Koruma Sistemi** - Güvenli ödeme ve teslimat
- ✅ **7/24 Canlı Destek** - Mesajlaşma ve ticket sistemi
- ✅ **Admin Panel** - Tam yönetim kontrolü
- ✅ **Responsive Tasarım** - Mobil uyumlu premium UI
- ✅ **SEO Optimize** - Arama motoru dostu yapı
- ✅ **PVP Server Tanıtım** - Oyun sunucu tanıtımları

## 🛠️ Teknolojiler

- **Frontend:** React 18 + TypeScript + Vite 6
- **Styling:** Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel/Cloudflare ready
- **State Management:** React Query + Zustand

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Repo klonla:**
```bash
git clone https://github.com/necmiharun2-cloud/itemtr.git
cd itemtr
```

2. **Bağımlılıkları yükle:**
```bash
npm install
```

3. **Environment variables oluştur:**
```bash
cp .env.example .env.local
```

4. **Supabase ayarları:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Development server başlat:**
```bash
npm run dev
```

6. **Tarayıcıda aç:** http://localhost:8080

## 🚀 Deployment

### Vercel
1. Vercel Dashboard'a git
2. GitHub'dan `itemtr` reposunu import et
3. Framework: **Vite**
4. Environment variables ekle
5. Deploy

### Cloudflare Pages
1. Cloudflare Dashboard → Pages
2. GitHub reposunu bağla
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

## 📁 Proje Yapısı

```
src/
├── components/     # UI bileşenleri
├── pages/         # Sayfa bileşenleri
├── lib/           # Yardımcı fonksiyonlar
├── hooks/         # Custom hooks
└── types/         # TypeScript tipleri
```

## 🎯 Ana Sayfalar

- `/` - Ana sayfa ve ilanlar
- `/login` - Giriş
- `/register` - Kayıt
- `/dashboard` - Kullanıcı paneli
- `/admin` - Yönetim paneli
- `/add-listing` - İlan ekle
- `/listing/{id}` - İlan detayı

## 🔧 Geliştirme

### Mevcut Komutlar
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Build preview
npm run lint     # ESLint kontrolü
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Development
NODE_ENV=development
```

## 📊 QA Test Sonuçları

✅ **Tamamlanan Testler:**
- Kayıt ve profil oluşturma
- İlan ekleme (Supabase entegrasyonu)
- Dashboard dinamik veri
- Route guards ve permissions
- Admin panel fonksiyonları
- SEO optimizasyonları
- Responsive tasarım

## 🤝 Katkı

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/AmazingFeature`)
3. Commit yap (`git commit -m 'Add some AmazingFeature'`)
4. Push yap (`git push origin feature/AmazingFeature`)
5. Pull Request aç

## 📄 Lisans

MIT License - [LICENSE](LICENSE) dosyasına bakınız

## 📞 İletişim

- **Web:** https://itemtr.com
- **E-posta:** destek@itemtr.com
- **GitHub:** https://github.com/necmiharun2-cloud/itemtr

---

**ItemTR** - Güvenli Oyun Hesabı Alışveriş Platformu 🎮
