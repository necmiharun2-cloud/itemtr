import { MessageCircle, Shield, CreditCard, Headphones, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="border-b border-border">
        <div className="container grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Güvenli Alışveriş</p>
              <p className="text-xs text-muted-foreground">256-bit SSL koruması</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
              <CreditCard className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Kolay Ödeme</p>
              <p className="text-xs text-muted-foreground">Kredi kartı & kripto</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Headphones className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">7/24 Destek</p>
              <p className="text-xs text-muted-foreground">Canlı destek hattı</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--badge-vitrin))]/10">
              <MessageCircle className="h-5 w-5 text-[hsl(var(--badge-vitrin))]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Topluluk</p>
              <p className="text-xs text-muted-foreground">Discord & forum</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-secondary/30">
        <div className="container flex flex-wrap items-center justify-center gap-8 py-4 text-center">
          <div>
            <p className="text-xl font-bold text-primary">150K+</p>
            <p className="text-xs text-muted-foreground">Kayıtlı Üye</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-success">85K+</p>
            <p className="text-xs text-muted-foreground">Tamamlanan İşlem</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-accent">4.7</p>
            <p className="text-xs text-muted-foreground">Ortalama Puan</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-foreground">25K+</p>
            <p className="text-xs text-muted-foreground">Aktif İlan</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">İ</div>
              <span className="text-lg font-bold text-foreground">İtem<span className="text-primary">TR.com</span></span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Türkiye'nin güvenli dijital ürün pazaryeri. Oyun hesapları, e-pin, PVP server tanıtımı ve sosyal medya hizmetleri tek çatı altında.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Link to="/blog" className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
              <Link to="/giveaways" className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </Link>
              <Link to="/blog" className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </Link>
              <Link to="/support" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(88,60%,45%)]/20 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Kurumsal</h4>
            <ul className="space-y-2">
              {[
                { label: "Hakkımızda", to: "/legal/terms" },
                { label: "İletişim", to: "/support" },
                { label: "Kariyer", to: "/blog" },
                { label: "Blog", to: "/blog" },
                { label: "Yayıncılar", to: "/stores" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Yardım</h4>
            <ul className="space-y-2">
              {[
                { label: "Destek Merkezi", to: "/support" },
                { label: "S.S.S", to: "/sss" },
                { label: "Güvenli Ticaret", to: "/legal/terms" },
                { label: "İade Politikası", to: "/legal/refund" },
                { label: "Nasıl Çalışır?", to: "/sss" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Popüler Kategoriler</h4>
            <ul className="space-y-2">
              {[
                { label: "CS2", to: "/category/cs2" },
                { label: "Valorant", to: "/category/valorant" },
                { label: "Roblox", to: "/category/roblox" },
                { label: "Steam", to: "/category/steam" },
                { label: "PVP Serverlar", to: "/pvp-serverlar" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Hesabım</h4>
            <ul className="space-y-2">
              {[
                { label: "Giriş Yap", to: "/login" },
                { label: "Bakiye Yükle", to: "/deposit" },
                { label: "İlan Ekle", to: "/add-listing" },
                { label: "Çekilişler", to: "/giveaways" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/register" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <ChevronRight className="h-3 w-3" />
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-wrap items-center justify-center gap-3 py-4">
          {["💳 Visa", "💳 Mastercard", "💳 Troy", "🏦 Papara", "🏦 Havale/EFT", "₿ Bitcoin", "💲 USDT", "🎮 Steam"].map((method) => (
            <span key={method} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              {method}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">İ</div>
            <span>© 2026 İtemTR.com. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal/terms" className="transition-colors hover:text-foreground">Kullanım Şartları</Link>
            <Link to="/legal/refund" className="transition-colors hover:text-foreground">Gizlilik Politikası</Link>
            <Link to="/legal/kvkk" className="transition-colors hover:text-foreground">KVKK</Link>
            <Link to="/sss" className="transition-colors hover:text-foreground">Çerez Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
