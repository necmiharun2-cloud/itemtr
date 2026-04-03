import { Swords, Key, Gift, Smartphone, Gamepad2, MessageSquare, Crown, Target } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { icon: Swords, name: "CS2", slug: "cs2", gradient: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-400", count: "12,450" },
  { icon: Target, name: "Valorant", slug: "valorant", gradient: "from-red-500/20 to-red-600/10", iconColor: "text-red-400", count: "8,320" },
  { icon: Key, name: "CD-Key", slug: "cd-key", gradient: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400", count: "5,670" },
  { icon: Gift, name: "Hediye Kartları", slug: "hediye-kartlari", gradient: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-400", count: "3,210" },
  { icon: Smartphone, name: "Sosyal Medya", slug: "sosyal-medya", gradient: "from-pink-500/20 to-pink-600/10", iconColor: "text-pink-400", count: "9,870" },
  { icon: Gamepad2, name: "Roblox", slug: "roblox", gradient: "from-green-500/20 to-green-600/10", iconColor: "text-green-400", count: "7,430" },
  { icon: MessageSquare, name: "Discord", slug: "discord", gradient: "from-indigo-500/20 to-indigo-600/10", iconColor: "text-indigo-400", count: "4,560" },
  { icon: Crown, name: "LoL", slug: "lol", gradient: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-400", count: "6,890" },
];

const CategoryGrid = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Popüler Kategoriler</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/category/${cat.slug}`}
            className={`bg-gradient-to-br ${cat.gradient} bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/40 transition-all group`}
          >
            <cat.icon className={`h-8 w-8 ${cat.iconColor} group-hover:scale-110 transition-transform`} />
            <div>
              <p className="text-sm font-semibold text-foreground">{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat.count} ilan</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
