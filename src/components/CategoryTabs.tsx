import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { slugifyCategory } from "@/lib/marketplace";

const tabs = [
  { name: "Tümü", emoji: "" },
  { name: "Instagram", emoji: "📸" },
  { name: "Roblox", emoji: "🎮" },
  { name: "TikTok", emoji: "🎵" },
  { name: "Minecraft", emoji: "⛏️" },
  { name: "OpenAI", emoji: "🤖" },
  { name: "Steam", emoji: "🎮" },
  { name: "YouTube", emoji: "▶️" },
  { name: "Discord", emoji: "💬" },
  { name: "PVP Serverlar", emoji: "⚔️" },
];

const subCategories = [
  { name: "Steam", emoji: "🎯" },
  { name: "Discord", emoji: "💬" },
  { name: "Valorant Random Hesap", emoji: "🎲" },
  { name: "Steam Random Key", emoji: "🔑" },
  { name: "ARC Raiders", emoji: "🚀" },
  { name: "Valorant", emoji: "🎯" },
  { name: "PUBG Mobile", emoji: "🔫" },
  { name: "FC 26", emoji: "⚽" },
  { name: "Mail Hesapları", emoji: "📧" },
  { name: "PVP Serverlar", emoji: "⚔️" },
];

const CategoryTabs = () => {
  const [active, setActive] = useState("Tümü");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.name === "Tümü" ? "/category" : tab.name === "PVP Serverlar" ? "/pvp-serverlar" : `/category/${slugifyCategory(tab.name)}`}
            onClick={() => setActive(tab.name)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              active === tab.name ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.name === "Tümü" ? <LayoutGrid className="h-3.5 w-3.5" /> : <span className="text-base">{tab.emoji}</span>}
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {subCategories.map((sub) => (
          <Link
            key={sub.name}
            to={sub.name === "PVP Serverlar" ? "/pvp-serverlar" : `/category/${slugifyCategory(sub.name)}`}
            className="group flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
          >
            <span className="text-base transition-transform group-hover:scale-110">{sub.emoji}</span>
            {sub.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
