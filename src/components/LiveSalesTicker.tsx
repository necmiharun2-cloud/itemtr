import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_SALES = [
  { user: "M****t", item: "Valorant 2850 VP", time: "Az önce", type: "VP" },
  { user: "A****t", item: "Steam 100 TL Cüzdan Kodu", time: "2 dk önce", type: "Key" },
  { user: "S****n", item: "CS2 Random Prime Hesap", time: "5 dk önce", type: "Account" },
  { user: "E****e", item: "Roblox 1000 Robux", time: "8 dk önce", type: "Item" },
  { user: "O****z", item: "Discord Nitro 1 Ay", time: "12 dk önce", type: "Nitro" },
];

const LiveSalesTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DUMMY_SALES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const currentSale = DUMMY_SALES[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-full duration-700">
      <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4 group min-w-[280px]">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-success flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" /> Canlı Satış
            </span>
            <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs font-bold text-foreground">
            <span className="text-primary">{currentSale.user}</span> {currentSale.item} satın aldı.
          </p>
          <p className="text-[10px] text-muted-foreground">{currentSale.time}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveSalesTicker;
