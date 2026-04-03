import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, ChevronRight, Zap, ShieldCheck, Star } from "lucide-react";
import ListingCard from "./ListingCard";

const vitrinListings = [
  { id: "V-1", title: "3000 Saat Prime CS2 + Global Hesap", price: "249", seller: "IlkanShop", category: "CS2", tags: ["Oto Teslim", "Global"], isVitrin: true, image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200", discount: "-25%" },
  { id: "V-2", title: "Valorant Radiant Elmas Rank Hesap", price: "4.500", seller: "MarcusStore", category: "Valorant", tags: ["Ranked", "Skins"], isVitrin: true, image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2?q=80&w=1200", discount: "-50%" },
  { id: "V-3", title: "5000 Robux - Hemen Teslimat", price: "1.099", seller: "RZShop", category: "Roblox", tags: ["Hızlı"], isVitrin: true, image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2?q=80&w=1200", discount: "-15%" },
  { id: "V-4", title: "Steam 100 TL Cüzdan Kodu 7/24", price: "100", seller: "NitroShop", category: "Steam", tags: ["Bakiye"], isVitrin: true, image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1200", discount: "-10%" },
  { id: "V-5", title: "League of Legends Smurf Hesap Unranked", price: "45", seller: "EloMaster", category: "League of Legends", tags: ["Fresh"], isVitrin: true, image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200", discount: "-75%" },
  { id: "V-6", title: "Discord 1 Yıllık Nitro Premium", price: "599", seller: "NitroShop", category: "Discord", tags: ["Promo"], isVitrin: true, image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1200", discount: "-30%" },
  { id: "V-7", title: "Metin2 10 GB Won (Ezel)", price: "285", seller: "WonSatici", category: "Metin2", tags: ["Yang"], isVitrin: true, image: "https://images.unsplash.com/photo-1605398417491-10640b68631c?q=80&w=1200", discount: "-20%" },
  { id: "V-8", title: "Knight Online 10 GB Gold Bar", price: "420", seller: "KOSatici", category: "Knight Online", tags: ["GB"], isVitrin: true, image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200", discount: "-25%" },
  { id: "V-9", title: "Discord 1 Aylık Nitro Boost", price: "55", seller: "NitroShop", category: "Discord", tags: ["Promo"], isVitrin: true, discount: "-50%" },
  { id: "V-10", title: "Valorant Silver Rank Hesap", price: "120", seller: "EloMaster", category: "Valorant", tags: ["Smurf"], isVitrin: true, discount: "-30%" },
];

const VitrinShowcase = () => {
  return (
    <section className="space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative flex items-center justify-between bg-card/60 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
             <Crown className="w-32 h-32 text-primary" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 animate-gold-glow">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                 Pazar <span className="text-primary not-italic">Vitrinı</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[9px] font-black uppercase tracking-widest border border-success/20">
                    <ShieldCheck className="h-3 w-3" /> GÜVENLİ TİCARET
                 </span>
                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                    <Zap className="h-3 w-3" /> ANINDA TESLİMAT
                 </span>
              </div>
            </div>
          </div>
          <Link to="/category" className="relative z-10">
            <Button variant="outline" className="rounded-2xl border-white/10 h-14 px-8 bg-transparent hover:bg-primary hover:text-white transition-all font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl group/btn">
              TÜMÜNÜ KEŞFET <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {vitrinListings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
      
      <div className="flex items-center justify-center pt-4">
         <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         <div className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] italic">
            VITRIN ILANLARI HER GÜN GÜNCELLENIR
         </div>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
};

export default VitrinShowcase;
