import { Info, ChevronRight, TrendingUp, Clock, Star, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import ListingCard from "./ListingCard";
import { ListingGridSkeleton } from "./ListingSkeleton";
import { Link } from "react-router-dom";
import type { MarketplaceListing, ListingSection } from "@/lib/marketplace";
import { getSectionMeta } from "@/lib/marketplace";
import { Button } from "./ui/button";

type FeaturedListingsProps = {
  section: ListingSection;
  listings: MarketplaceListing[];
  initialCount?: number;
};

const FeaturedListings = ({ section, listings, initialCount = 10 }: FeaturedListingsProps) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(true);
  const meta = getSectionMeta(section);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [section]);
  
  const displayedListings = listings.slice(0, visibleCount);
  const hasMore = listings.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-bold text-foreground">{meta.title}</h2>
          <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span>{listings.length.toLocaleString("tr-TR")} aktif ilan</span>
          </div>
        </div>
        <Link to={meta.ctaHref} className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
          {meta.ctaLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
          <Info className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{meta.subtitle}</p>
          <p className="text-xs text-muted-foreground">
            {section === "vitrin" && "Vitrin dışı ilanlar bu alana alınmaz."}
            {section === "new" && "Vitrin ilanları ve PVP server tanıtımları ayrı bölümlerde tutulur."}
            {section === "pvp" && "Bu ilanlar sadece PVP Serverlar sayfası ve özel tanıtım alanında listelenir."}
          </p>
        </div>
        <Link
          to={meta.ctaHref}
          className="ml-auto hidden whitespace-nowrap rounded-xl bg-success/20 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/30 md:inline-flex"
        >
          {meta.ctaLabel}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Son güncelleme: az önce</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent" /> Ortalama puan: 4.8</span>
        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-success" /> Güvenli havuz sistemi aktif</span>
      </div>
      {isLoading ? (
        <ListingGridSkeleton count={initialCount} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayedListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} section={listing.section} />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button 
            variant="secondary"
            onClick={handleShowMore}
            className="rounded-xl px-8 py-2.5 text-sm font-medium transition-colors"
          >
            Daha Fazla Göster
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturedListings;
