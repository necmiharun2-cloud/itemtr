import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Gift, Clock, Users, Trophy, ChevronRight } from "lucide-react";

const giveaways = [
  { id: 1, title: "Steam 50₺ Cüzdan Kodu", sponsor: "GameStore", participants: 1243, endsIn: "2 gün", prize: "50₺", gradient: "from-blue-600 to-cyan-500" },
  { id: 2, title: "Valorant 1000 VP", sponsor: "VPShop", participants: 892, endsIn: "5 gün", prize: "1000 VP", gradient: "from-red-600 to-pink-500" },
  { id: 3, title: "Netflix 1 Aylık Premium", sponsor: "DigiKeys", participants: 2105, endsIn: "1 gün", prize: "1 Ay", gradient: "from-red-700 to-red-500" },
  { id: 4, title: "Discord Nitro 1 Ay", sponsor: "NitroShop", participants: 1567, endsIn: "3 gün", prize: "Nitro", gradient: "from-indigo-600 to-purple-500" },
  { id: 5, title: "Roblox 800 Robux", sponsor: "RobuxTR", participants: 3201, endsIn: "6 gün", prize: "800 Robux", gradient: "from-green-600 to-emerald-500" },
  { id: 6, title: "Spotify 3 Aylık Premium", sponsor: "MusicKeys", participants: 1890, endsIn: "4 gün", prize: "3 Ay", gradient: "from-green-500 to-green-700" },
];

const pastWinners = [
  { name: "user***23", prize: "Steam 100₺", date: "25 Mar 2026" },
  { name: "gam***kr", prize: "Valorant 2000 VP", date: "22 Mar 2026" },
  { name: "pro***41", prize: "Netflix 1 Ay", date: "20 Mar 2026" },
];

const Giveaways = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">Çekilişler</h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Ücretsiz çekilişlere katıl, harika ödüller kazan! Her gün yeni çekilişler ekleniyor.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{giveaways.length}</p>
              <p className="text-xs text-muted-foreground">Aktif Çekiliş</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">12,450+</p>
              <p className="text-xs text-muted-foreground">Toplam Katılımcı</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">320+</p>
              <p className="text-xs text-muted-foreground">Kazanan</p>
            </div>
          </div>
        </div>

        {/* Active Giveaways */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways.map((g) => (
            <div key={g.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all group">
              <div className={`h-28 bg-gradient-to-r ${g.gradient} flex items-center justify-center`}>
                <Gift className="h-12 w-12 text-white/80" />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{g.title}</h3>
                <p className="text-xs text-muted-foreground">Sponsor: <span className="text-foreground">{g.sponsor}</span></p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{g.participants} katılımcı</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{g.endsIn} kaldı</span>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Katıl
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Past Winners */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Son Kazananlar</h2>
          </div>
          <div className="space-y-3">
            {pastWinners.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.date}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-accent">{w.prize}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Giveaways;
