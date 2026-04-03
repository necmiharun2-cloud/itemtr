import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop",
    title: "Valorant VP ve Hesap Satışı",
    description: "En ucuz fiyatlarla Valorant Point ve skinli hesaplar burada.",
    link: "/category/valorant",
    color: "from-red-600/20 to-transparent"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1552824236-077641c1d1fa?q=80&w=2000&auto=format&fit=crop",
    title: "Steam Cüzdan Kodu",
    description: "Steam bakiyeni anında yükle, oyun keyfini doyasıya yaşa.",
    link: "/category/steam",
    color: "from-blue-600/20 to-transparent"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2000&auto=format&fit=crop",
    title: "CS2 Skin ve Kasa",
    description: "Nadir skinler ve kasalar en güvenli yoldan senin olsun.",
    link: "/category/cs2",
    color: "from-orange-600/20 to-transparent"
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
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <div 
      className="group relative w-full overflow-hidden rounded-2xl bg-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full aspect-[21/9] md:aspect-[3/1]">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="h-full w-full object-cover"
            />
            <div className={cn("absolute inset-0 bg-gradient-to-r", slide.color)} />
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
                {slide.title}
              </h2>
              <p className="mt-2 text-sm md:text-lg text-white/80 font-medium max-w-md drop-shadow-lg">
                {slide.description}
              </p>
              <a 
                href={slide.link}
                className="mt-6 w-fit rounded-xl bg-primary px-8 py-3 text-sm font-black uppercase italic tracking-widest text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                HEMEN İNCELE
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 blur-sm transition-all group-hover:opacity-100 group-hover:blur-0 hover:bg-black/40"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 blur-sm transition-all group-hover:opacity-100 group-hover:blur-0 hover:bg-black/40"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current === i ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSlider;
