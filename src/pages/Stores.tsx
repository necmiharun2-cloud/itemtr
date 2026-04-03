import { Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { User, Star, Shield, Package, Search } from "lucide-react";
import { useState } from "react";

const stores = [
  { username: "IlkanShop", rating: 4.9, sales: 1243, listings: 48, verified: true, category: "CS2, Valorant" },
  { username: "RZShop", rating: 4.8, sales: 2156, listings: 72, verified: true, category: "Roblox, TikTok, Spotify" },
  { username: "MarcusStore", rating: 4.7, sales: 876, listings: 35, verified: true, category: "Valorant, LoL" },
  { username: "FurkanMarket", rating: 4.6, sales: 654, listings: 28, verified: false, category: "Steam, Random Hesap" },
  { username: "DigiShop", rating: 4.8, sales: 1567, listings: 56, verified: true, category: "Netflix, Spotify" },
  { username: "GameVault", rating: 4.5, sales: 432, listings: 22, verified: true, category: "Minecraft, Roblox" },
  { username: "TopSeller", rating: 4.9, sales: 3210, listings: 95, verified: true, category: "CS2, Steam" },
  { username: "QuickSell", rating: 4.3, sales: 321, listings: 15, verified: false, category: "CS2, Valorant" },
];

const Stores = () => {
  const [search, setSearch] = useState("");
  const filtered = stores.filter((s) => s.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mağazalar</h1>
            <p className="text-sm text-muted-foreground mt-1">{stores.length} kayıtlı mağaza</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Mağaza ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((store) => (
            <Link
              key={store.username}
              to={`/seller/${store.username}`}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{store.username}</h3>
                    {store.verified && <Shield className="h-3.5 w-3.5 text-success" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{store.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-accent"><Star className="h-3 w-3 fill-accent" /> {store.rating}</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {store.sales} satış</span>
                <span>{store.listings} ilan</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;
