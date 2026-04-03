import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop",
    title: "ROBLOX\nİLAN PAZARI",
    description: "Roblox İlan Pazarı İtemTR'de! Hemen Al, Hemen Sat, Kazancını Katla!",
    link: "/category/roblox",
    color: "from-blue-900/80 via-transparent to-transparent"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop",
    title: "VALORANT\nİLAN PAZARI",
    description: "En ucuz fiyatlarla Valorant Point ve skinli hesaplar burada.",
    link: "/category/valorant",
    color: "from-red-900/80 via-transparent to-transparent"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1552824236-077641c1d1fa?q=80&w=2000&auto=format&fit=crop",
    title: "STEAM\nCÜZDAN KODU",
    description: "Steam bakiyeni anında yükle, oyun keyfini doyasıya yaşa.",
    link: "/category/steam",
    color: "from-slate-900/80 via-transparent to-transparent"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2000&auto=format&fit=crop",
    title: "CS2\nSKİN & KASA",
    description: "Nadir skinler ve kasalar en güvenli yoldan senin olsun.",
    link: "/category/cs2",
    color: "from-orange-900/80 via-transparent to-transparent"
  }
];

export const HomeSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <div 
      className="w-full overflow-hidden relative group py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Wrapper that determines the width of the active slide */}
      <div className="relative w-[90%] md:w-[75%] lg:w-[65%] mx-auto">
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={slide.id} className="min-w-full px-2 md:px-3">
              <div 
                className={cn(
                  "relative h-full w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] transition-all duration-700 aspect-[16/9] md:aspect-[21/9]",
                  current === i 
                    ? "scale-100 opacity-100 shadow-2xl shadow-black/50" 
                    : "scale-[0.88] opacity-50 brightness-50 cursor-pointer hover:brightness-75"
                )}
                onClick={current !== i ? () => setCurrent(i) : undefined}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title.replace('\n', ' ')}
                  className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
                />
                
                {/* Gradient overlay mimicking itemsatis style (darker on left/bottom) */}
                <div className={cn("absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent")} />
                <div className={cn("absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-80")} />
                
                <div className={cn(
                  "absolute inset-0 flex flex-col justify-end p-6 md:p-12 transition-all duration-700 delay-100",
                  current === i ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                )}>
                  <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-black text-white uppercase italic tracking-tighter drop-shadow-2xl leading-[0.9] whitespace-pre-line">
                    {slide.title}
                  </h2>
                  <p className="mt-3 text-[10px] md:text-sm lg:text-base text-gray-200 font-medium max-w-xl drop-shadow-lg leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="mt-6 flex">
                    <a 
                      href={slide.link}
                      className="group/btn relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/20 px-6 py-3.5 flex items-center gap-2 text-white transition-all hover:bg-white/10 hover:border-white/40 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" />
                      <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest mt-0.5">
                        Hemen Alışverişe Başla!
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Navigation Arrow */}
      <button 
        onClick={prev}
        className="absolute left-2 md:left-6 lg:left-12 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 p-3 md:p-4 text-white opacity-0 md:opacity-100 transition-all group-hover:opacity-100 hover:bg-black/80 hover:scale-110 hover:border-white/30 z-10 shadow-xl"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Right Navigation Arrow */}
      <button 
        onClick={next}
        className="absolute right-2 md:right-6 lg:right-12 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 p-3 md:p-4 text-white opacity-0 md:opacity-100 transition-all group-hover:opacity-100 hover:bg-black/80 hover:scale-110 hover:border-white/30 z-10 shadow-xl"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Optional: Add custom animations to globals or use existing ones (shimmer is handled via standard tailwind if defined, or degrades gracefully) */}
    </div>
  );
};

export default HomeSlider;
