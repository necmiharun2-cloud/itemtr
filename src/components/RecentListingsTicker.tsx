import { useState, useEffect } from "react";
import { PlusCircle, Zap, X } from "lucide-react";
import { getBotHistory } from "@/lib/bot-engine";

const RecentListingsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    const history = getBotHistory();
    // Get last 10 bot listings
    const last10 = [...history].slice(-10).reverse();
    setRecentListings(last10);

    const timer = setInterval(() => {
      setRecentListings(prev => {
        // Refresh history to see if new ones added
        const latestHistory = getBotHistory();
        return [...latestHistory].slice(-10).reverse();
      });
      setCurrentIndex((prev) => (prev + 1) % (recentListings.length || 1));
    }, 6000);
    
    return () => clearInterval(timer);
  }, [recentListings.length]);

  if (!isVisible || recentListings.length === 0) return null;

  const currentItem = recentListings[currentIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-full duration-700">
      <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4 group min-w-[300px]">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          <PlusCircle className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary flex items-center gap-1 uppercase tracking-widest italic leading-none">
              <Zap className="h-3 w-3 fill-primary" /> YENİ EKLENEN
            </span>
            <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">
             <span className="text-primary/70">{currentItem.category}</span> {currentItem.title}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-bold italic uppercase">{currentItem.seller}</p>
            <p className="text-xs font-black text-primary">₺{currentItem?.price?.split(" ")[0]?.replace(/[^0-9,.]/g, "").replace(/[.,]\d{2}$/, "") || "0"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentListingsTicker;
