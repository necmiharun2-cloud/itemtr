import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PromoBanner from "@/components/PromoBanner";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import HeroCarousel from "@/components/HeroCarousel";
import HomeSlider from "@/components/HomeSlider";
import GameCategories from "@/components/GameCategories";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryTabs from "@/components/CategoryTabs";
import FeaturedListings from "@/components/FeaturedListings";
import BlogCarousel from "@/components/BlogCarousel";
import CustomerReviews from "@/components/CustomerReviews";
import InstagramWidget from "@/components/InstagramWidget";
import SeoBlock from "@/components/SeoBlock";
import LiveSupport from "@/components/LiveSupport";
import Footer from "@/components/Footer";
import StoryCategories from "@/components/StoryCategories";
import LiveSalesTicker from "@/components/LiveSalesTicker";
import RecentListingsTicker from "@/components/RecentListingsTicker";
import { OrganizationSchema, WebSiteSchema } from "@/components/SchemaMarkup";
import { Search, TrendingUp, ShieldCheck, Zap, CheckCircle, Lock, Clock, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNewListings, getPvpServerListings, getVitrinListings, type MarketplaceListing } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [vitrinListings, setVitrinListings] = useState<MarketplaceListing[]>(getVitrinListings());
  const [newListings, setNewListings] = useState<MarketplaceListing[]>(getNewListings());
  const [pvpListings, setPvpListings] = useState<MarketplaceListing[]>(getPvpServerListings());

  useEffect(() => {
    const syncListings = () => {
      setVitrinListings(getVitrinListings());
      setNewListings(getNewListings());
      setPvpListings(getPvpServerListings());
    };

    syncListings();
    window.addEventListener("itemtr-marketplace-updated", syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
      window.removeEventListener("itemtr-marketplace-updated", syncListings);
      window.removeEventListener("storage", syncListings);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Schema Markup for SEO */}
      <OrganizationSchema />
      <WebSiteSchema />
      
      <PromoBanner />
      <TopBar />
      <Header />
      <NavMenu />
      <StoryCategories />

      <section className="relative overflow-hidden bg-background pt-16 pb-6 md:pt-24 md:pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.08),transparent_50%)]" />
        <div className="container relative z-10 text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="space-y-4">
              {/* SEO: Ana H1 - Daha inandırıcı başlık */}
              <h1 className="text-4xl font-black italic tracking-tighter text-white md:text-6xl uppercase">
                Doğrulanmış Satıcılarla <span className="text-primary not-italic">Güvenli Oyun Hesabı</span> Pazaryeri
              </h1>
              <p className="text-lg font-medium text-muted-foreground opacity-80 uppercase tracking-widest text-[10px] md:text-xs">
                Alıcı Korumalı, Hızlı ve Şeffaf Alışverişin Adresi İtemTR.com
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container space-y-12 pb-8 pt-4">
        <HomeSlider />
        <RecentListingsTicker />
        <GameCategories />
        <CategoryTabs />
        <FeaturedListings section="vitrin" listings={vitrinListings} />
        <FeaturedListings section="new" listings={newListings} />
        <FeaturedListings section="pvp" listings={pvpListings} />
        <CategoryGrid />
        
        {/* SEO: Nasıl Çalışır Bölümü */}
        <section className="py-12 border-t border-border">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-center mb-8">
            Nasıl <span className="text-primary">Çalışır?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Search, title: "İlan Bul", desc: "Valorant, Steam, PUBG ve daha fazlası için güvenilir satıcı ilanlarını incele" },
              { icon: CheckCircle, title: "Güvenli Ödeme", desc: "Alıcı korumalı sistemle ödemeni yap, paranı güvende kalsın" },
              { icon: Clock, title: "Anında Teslimat", desc: "Doğrulanmış satıcılarla dakikalar içinde hesabını teslim al" },
              { icon: HeadphonesIcon, title: "7/24 Destek", desc: "Sorun yaşarsan uzman destek ekibimiz yanınında" }
            ].map((step, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO: Alıcı Koruması Bölümü */}
        <section className="py-12 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Alıcı <span className="text-primary">Koruma</span> Sistemi
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                İtemTR olarak her satın alma işleminde alıcıyı koruyoruz. Ödemenizi yapıyorsunuz, 
                ancak satıcıya ödeme, siz ürünü teslim alana ve onaylayana kadar güvende kalıyor. 
                Sorun yaşarsanız 7/24 destek ekibimiz devreye giriyor.
              </p>
              <ul className="space-y-2">
                {[
                  "Para transferi öncesi hesap doğrulama",
                  "Teslimat sonrası 24 saat içinde şikayet hakkı",
                  "Uyuşmazlık durumunda tarafsız inceleme",
                  "Satıcı puanlama ve değerlendirme sistemi"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-3xl font-black text-primary">%100</p>
              <p className="text-sm text-muted-foreground">Güvenli Ödeme Garantisi</p>
            </div>
          </div>
        </section>

        {/* SEO: Popüler Kategoriler Metin */}
        <section className="py-12 border-t border-border">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-center mb-8">
            Popüler <span className="text-primary">Kategoriler</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Valorant Hesap Satışı</h3>
              <p className="text-sm text-muted-foreground">
                VP yüklü, skinli ve ranklı Valorant hesapları güvenilir satıcılardan. 
                Anında teslimat ve alıcı koruması ile güvenle satın al.
              </p>
              <Link to="/category/valorant" className="text-primary text-sm font-medium hover:underline">
                Valorant Hesapları İncele →
              </Link>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Steam Hesap Satışı</h3>
              <p className="text-sm text-muted-foreground">
                Oyun dolu, cüzdan kodları ve random Steam hesapları. 
                Doğrulanmış satıcılarla güvenli alışveriş.
              </p>
              <Link to="/category/steam" className="text-primary text-sm font-medium hover:underline">
                Steam Hesapları İncele →
              </Link>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">PUBG Mobile UC</h3>
              <p className="text-sm text-muted-foreground">
                UC yüklü hesaplar ve Unknown Cash satışı. 
                Hızlı teslimat ve uygun fiyat garantisi.
              </p>
              <Link to="/category/pubg-mobile" className="text-primary text-sm font-medium hover:underline">
                PUBG Mobile İncele →
              </Link>
            </div>
          </div>
        </section>

        <BlogCarousel />
        <CustomerReviews />
        <InstagramWidget />
        <SeoBlock />
      </main>

      <LiveSupport />
      <LiveSalesTicker />
      <Footer />
    </div>
  );
};

export default Index;
