import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const articles = [
  { title: "CS2 Yeni Güncelleme Detayları", date: "30 Mar 2026", gradient: "from-orange-600 to-red-600" },
  { title: "Valorant Yeni Ajan Sızdırıldı!", date: "29 Mar 2026", gradient: "from-red-500 to-pink-600" },
  { title: "Steam Yaz İndirimleri Başlıyor", date: "28 Mar 2026", gradient: "from-blue-500 to-cyan-600" },
  { title: "Roblox Güvenli Alışveriş Rehberi", date: "27 Mar 2026", gradient: "from-green-500 to-emerald-600" },
  { title: "Discord Nitro Fırsatları", date: "26 Mar 2026", gradient: "from-indigo-500 to-purple-600" },
];

const BlogCarousel = () => {
  const [offset, setOffset] = useState(0);
  const visible = 3;
  const max = Math.max(0, articles.length - visible);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Son Haberler</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(Math.max(0, offset - 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(Math.min(max, offset + 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link to="/blog" className="text-sm text-primary hover:underline ml-2">Tümü →</Link>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300" style={{ transform: `translateX(-${offset * (100 / visible)}%)` }}>
          {articles.map((a, i) => (
            <Link key={i} to="/blog" className="min-w-[calc(33.333%-11px)] bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all group">
              <div className={`h-24 bg-gradient-to-r ${a.gradient}`} />
              <div className="p-3 space-y-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogCarousel;
