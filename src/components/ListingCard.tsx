import { useState } from "react";
import { User, Heart, Eye, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getLevelTier } from "@/lib/levels";
import { toast } from "sonner";

interface ListingCardProps {
  id?: string | number;
  title: string;
  category: string;
  seller: string;
  price: string;
  oldPrice?: string;
  imageColor?: string;
  emoji?: string;
  image?: string;
  views?: number;
  isAutoDelivery?: boolean;
  tags?: string[];
  section?: "vitrin" | "new" | "pvp";
  sellerXp?: number;
}

const badgeMap = {
  vitrin: { label: "Vitrin İlanı", className: "bg-[hsl(var(--badge-vitrin))] text-[hsl(var(--badge-vitrin-foreground))]" },
  new: { label: "Yeni İlan", className: "bg-success text-success-foreground" },
  pvp: { label: "PVP Server", className: "bg-primary text-primary-foreground" },
} as const;

const ListingCard = ({
  id,
  title,
  category,
  seller,
  price,
  oldPrice,
  imageColor = "bg-gradient-to-br from-slate-600/40 to-slate-700/30",
  emoji = "🎮",
  image,
  views = Math.floor(Math.random() * 500 + 50),
  isAutoDelivery = false,
  tags = [],
  section = "vitrin",
  sellerXp = 0,
}: ListingCardProps) => {
  const [favorite, setFavorite] = useState(false);
  const isPvp = category === "PVP Serverlar";
  const currentPrice = Number(String(price).replace(/[^\d,]/g, "").replace(",", "."));
  const previousPrice = oldPrice ? Number(String(oldPrice).replace(/[^\d,]/g, "").replace(",", ".")) : 0;
  const discount = oldPrice && previousPrice > 0 ? Math.round((1 - currentPrice / previousPrice) * 100) : 0;
  const badge = badgeMap[section];

  // Ensure id is valid
  const listingId = id ? String(id) : "1";

  const handleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    toast.success(next ? "İlan favorilere eklendi." : "İlan favorilerden çıkarıldı.");
  };

  const handlePreview = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toast.info("İlan detayına yönlendiriliyorsunuz.");
  };


  return (
    <Link
      to={`/listing/${listingId}`}
      className="group block h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative">
        <div className={cn("flex h-36 w-full items-center justify-center overflow-hidden relative", imageColor)}>
          {image ? (
            <img 
              src={image} 
              alt={title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <span className="text-4xl opacity-60 transition-transform group-hover:scale-110">{emoji}</span>
          )}

          {/* PVP SERVER OVERLAY */}
          {isPvp && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
              <div className="border-y-2 border-primary bg-black/60 px-4 py-2 w-full text-center">
                <span className="text-[14px] font-black italic uppercase tracking-[0.2em] text-gold-flash drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
                  SERVER TANITIMI
                </span>
              </div>
            </div>
          )}
        </div>
        <span className={cn("absolute left-2 top-2 rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide", badge.className)}>{badge.label}</span>
        {discount > 0 && <span className="absolute right-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">-{discount}%</span>}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors group-hover:bg-black/20 group-hover:opacity-100">
          <button
            className={cn(
              "rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/40",
              favorite && "bg-primary/90 hover:bg-primary",
            )}
            type="button"
            onClick={handleFavorite}
            aria-label="Favorilere ekle"
          >
            <Heart className={cn("h-4 w-4 text-white", favorite && "fill-white")} />
          </button>
          <button className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/40" type="button" onClick={handlePreview} aria-label="İlanı görüntüle">
            <Eye className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="truncate text-xs text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1">
                {isPvp && <span className="text-[9px] font-black italic uppercase text-gold-flash tracking-tight shrink-0">ServerSahibi</span>}
                {seller}
              </span>
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {views}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-primary">{category}</p>
          {isAutoDelivery && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
              <Zap className="h-3 w-3" /> Oto
            </span>
          )}
        </div>
        <h3 className="min-h-[2.5rem] line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">{title}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/category?q=${encodeURIComponent(tag)}`;
                }}
                className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="min-w-0 flex flex-col">
            {!isPvp ? (
              <>
                <span className="text-[9px] font-bold text-white/70 uppercase leading-none mb-0.5 tracking-tight">İlan fiyatı:</span>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-base font-black text-[#00CED1] drop-shadow-[0_0_8px_rgba(0,206,209,0.3)]">{price}</span>
                  {oldPrice && <span className="whitespace-nowrap text-xs text-muted-foreground line-through">{oldPrice}</span>}
                </div>
              </>
            ) : (
              <span className="text-xs font-black text-primary uppercase italic tracking-widest">Server Tanıtımı</span>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            {(() => {
              const levelInfo = getLevelTier(sellerXp);
              return (
                <span 
                  className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight whitespace-nowrap border",
                    levelInfo.bgGradient,
                    levelInfo.textColor,
                    levelInfo.borderColor
                  )}
                  title={levelInfo.description}
                >
                  <span className="mr-1">{levelInfo.badge}</span>
                  {levelInfo.title}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
