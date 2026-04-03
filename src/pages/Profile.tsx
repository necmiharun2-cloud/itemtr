import { useParams, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { User, Star, Shield, Calendar, MapPin, MessageCircle, Clock, CheckCircle, Package, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sellerData = {
  username: "IlkanShop",
  rating: 4.9,
  totalSales: 1243,
  totalReviews: 987,
  joinDate: "Mart 2022",
  lastSeen: "3 dakika önce",
  location: "İstanbul",
  verified: true,
  description: "CS2, Valorant ve diğer oyunlarda güvenli hesap satışı. 7/24 destek. Anında teslimat garantisi.",
  stats: {
    totalListings: 48,
    activeSales: 32,
    satisfaction: 98,
  },
};

const sellerListings = [
  { title: "Yeşil Faktör! Teslimat! 300 Övgü CS2 Hesap", category: "CS2", seller: "IlkanShop", price: "49,90 ₺", oldPrice: "199,00 ₺", imageColor: "bg-gradient-to-br from-orange-600/40 to-yellow-700/30" },
  { title: "1000 Saat CS2 Hesap Prime", category: "CS2", seller: "IlkanShop", price: "129,90 ₺", imageColor: "bg-gradient-to-br from-blue-600/40 to-cyan-700/30" },
  { title: "Faceit Level 8 CS2 Hesap", category: "CS2", seller: "IlkanShop", price: "199,90 ₺", imageColor: "bg-gradient-to-br from-purple-600/40 to-violet-700/30" },
  { title: "Gold Nova CS2 Hesap", category: "CS2", seller: "IlkanShop", price: "89,90 ₺", oldPrice: "149,90 ₺", imageColor: "bg-gradient-to-br from-amber-600/40 to-yellow-700/30" },
  { title: "Steam Level 50 Hesap", category: "Steam", seller: "IlkanShop", price: "59,90 ₺", imageColor: "bg-gradient-to-br from-sky-600/40 to-blue-700/30" },
  { title: "Valorant Diamond Hesap", category: "Valorant", seller: "IlkanShop", price: "299,90 ₺", imageColor: "bg-gradient-to-br from-red-600/40 to-pink-700/30" },
];

const reviews = [
  { user: "Ahmet K.", rating: 5, comment: "Çok hızlı teslimat, hesap sorunsuz çalışıyor. Teşekkürler!", date: "2 gün önce" },
  { user: "Mehmet Y.", rating: 5, comment: "Güvenilir satıcı, tavsiye ederim.", date: "5 gün önce" },
  { user: "Ali R.", rating: 4, comment: "Hesap güzel ama teslimat biraz geç oldu.", date: "1 hafta önce" },
];

const tabs = ["İlanlar", "Değerlendirmeler", "Hakkında"];

const Profile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("İlanlar");

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{sellerData.username}</h1>
                {sellerData.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <Shield className="h-3 w-3" /> Onaylı Satıcı
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{sellerData.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-accent"><Star className="h-3.5 w-3.5 fill-accent" /> {sellerData.rating} ({sellerData.totalReviews})</span>
                <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {sellerData.totalSales} satış</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {sellerData.joinDate}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {sellerData.location}</span>
                <span className="flex items-center gap-1 text-success"><Clock className="h-3.5 w-3.5" /> {sellerData.lastSeen}</span>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl gap-2 shrink-0">
              <MessageCircle className="h-4 w-4" /> Mesaj Gönder
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{sellerData.stats.totalListings}</p>
              <p className="text-xs text-muted-foreground">Toplam İlan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{sellerData.stats.activeSales}</p>
              <p className="text-xs text-muted-foreground">Aktif İlan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">%{sellerData.stats.satisfaction}</p>
              <p className="text-xs text-muted-foreground">Memnuniyet</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "İlanlar" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sellerListings.map((listing, i) => (
              <Link key={i} to={`/listing/${i + 1}`}>
                <ListingCard {...listing} />
              </Link>
            ))}
          </div>
        )}

        {activeTab === "Değerlendirmeler" && (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{review.user}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Hakkında" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Satıcı Hakkında</h3>
            <p className="text-sm text-muted-foreground">{sellerData.description}</p>
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Kimlik doğrulama tamamlandı</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>E-posta doğrulama tamamlandı</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Telefon doğrulama tamamlandı</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
