import { useState, useRef, useEffect } from "react";
import { LayoutGrid, ShoppingBag, ShoppingCart, Store, Key, CreditCard, Gift, Users, Plus, Dice5, ChevronDown, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { slugifyCategory } from "@/lib/marketplace";

const navItems = [
  { icon: ShoppingBag, label: "İlan Pazarı", href: "/category" },
  { icon: ShoppingCart, label: "Alım İlanları", href: "/dashboard?tab=purchases" },
  { icon: Store, label: "Mağazalar", href: "/stores" },
  { icon: Key, label: "CD-Key", href: "/category/steam" },
  { icon: CreditCard, label: "Top Up", href: "/category/pubg-mobile" },
  { icon: Gift, label: "Hediye Kartları", href: "/category/steam" },
  { icon: Users, label: "Topluluk", href: "/support" },
];

const megaMenuCategories = [
  { icon: "🎮", name: "CS2", items: ["Hesap Satışı", "Skin Satışı", "Item Satışı", "Rank Boost"] },
  { icon: "🎯", name: "Valorant", items: ["Hesap Satışı", "VP Satışı", "Rank Boost", "Skin Satışı"] },
  { icon: "🟢", name: "Roblox", items: ["Robux Satışı", "Hesap Satışı", "Game Pass", "Item Satışı"] },
  { icon: "📸", name: "Instagram", items: ["Takipçi", "Beğeni", "İzlenme", "Hesap Satışı"] },
  { icon: "🎵", name: "TikTok", items: ["Takipçi", "Beğeni", "İzlenme", "Coin Satışı"] },
  { icon: "💬", name: "Discord", items: ["Nitro", "Server Boost", "Hesap Satışı", "Bot Satışı"] },
  { icon: "🎮", name: "Steam", items: ["Cüzdan Kodu", "Random Key", "Hesap Satışı", "Gift Card"] },
  { icon: "⚔️", name: "PVP Serverlar", items: ["Metin2 Tanıtımı", "Knight Tanıtımı", "Açılış Bannerı", "Network Duyurusu"] },
];

const NavMenu = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    setMegaOpen(true);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setMegaOpen(false), 200);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="relative border-b border-border bg-card/50">
      <div className="container">
        <div className="flex flex-col gap-2 py-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <div ref={megaRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
              <button className="flex whitespace-nowrap rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Kategoriler</span>
                <ChevronDown className={`ml-2 h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 grid w-[640px] grid-cols-4 gap-3 rounded-xl border border-border bg-card p-4 shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-top-2 duration-200">
                  {megaMenuCategories.map((cat) => {
                    const href = cat.name === "PVP Serverlar" ? "/pvp-serverlar" : `/category/${slugifyCategory(cat.name)}`;
                    return (
                      <div key={cat.name} className="space-y-1.5">
                        <Link to={href} className="flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
                          <span className="text-lg">{cat.icon}</span>
                          {cat.name}
                        </Link>
                        {cat.items.map((item) => (
                          <Link key={item} to={href} className="block pl-7 text-xs text-muted-foreground transition-colors hover:text-foreground">
                            {item}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 py-1">
            <Link to="/giveaways" className="flex shrink-0 items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20">
              <Dice5 className="h-4 w-4" />
              Çekilişler
            </Link>
            <Link to="/pvp-serverlar" className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all animate-gold-flash border border-yellow-500/20 shadow-lg">
              <Server className="h-4 w-4" />
              PVP Serverlar
            </Link>
            <Link to="/add-listing" className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-md">
              <Plus className="h-4 w-4" />
              İlan Ekle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
