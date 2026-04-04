import { 
  Gamepad2, 
  Users, 
  Smartphone, 
  Zap, 
  Briefcase, 
  Gift, 
  Key, 
  CircleDollarSign, 
  Globe, 
  UserSquare2, 
  Megaphone,
  Monitor,
  Dices,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { label: "Hesap Satışı", count: "148,240 İlan", icon: Users, color: "from-blue-600 to-indigo-600", image: "https://itemtr.com/storage/images/categories/hesap-satis-1588600000.webp" },
  { label: "Item & Skin", count: "542,100 İlan", icon: Gamepad2, color: "from-orange-600 to-red-600", image: "https://itemtr.com/storage/images/categories/item-skin-1588600000.webp" },
  { label: "ID Yükleme (Top Up)", count: "12,500 İlan", icon: Smartphone, color: "from-emerald-600 to-teal-600", image: "https://itemtr.com/storage/images/categories/yukleme-1588600000.webp" },
  { label: "Epin", count: "85,600 İlan", icon: Zap, color: "from-yellow-500 to-amber-600", image: "https://itemtr.com/storage/images/categories/epin-1588600000.webp" },
  { label: "Boost Hizmetleri", count: "4,900 İlan", icon: Zap, color: "from-purple-600 to-indigo-700", image: "https://itemtr.com/storage/images/categories/boost-1588600000.webp" },
  { label: "Yazılım Ürünleri", count: "1,450 İlan", icon: Briefcase, color: "from-cyan-600 to-blue-700", image: "https://itemtr.com/storage/images/categories/yazilim-1588600000.webp" },
  { label: "Hediye Kartları", count: "3,200 İlan", icon: Gift, color: "from-pink-600 to-rose-700", image: "https://itemtr.com/storage/images/categories/hediye-kart-1588600000.webp" },
  { label: "CD Key", count: "7,100 İlan", icon: Key, color: "from-slate-600 to-slate-800", image: "https://itemtr.com/storage/images/categories/cd-key-1588600000.webp" },
  { label: "Oyun Parası", count: "116,700 İlan", icon: CircleDollarSign, color: "from-green-600 to-emerald-700", image: "https://itemtr.com/storage/images/categories/para-1588600000.webp" },
  { label: "Sosyal Medya", count: "42,300 İlan", icon: Globe, color: "from-indigo-600 to-blue-800", image: "https://itemtr.com/storage/images/categories/sosyal-1588600000.webp" },
  { label: "Freelancer", count: "2,100 İlan", icon: UserSquare2, color: "from-violet-600 to-purple-800", image: "https://itemtr.com/storage/images/categories/freelancer-1588600000.webp" },
  { label: "Reklam Satışı", count: "1,300 İlan", icon: Megaphone, color: "from-red-600 to-rose-800", image: "https://itemtr.com/storage/images/categories/reklam-1588600000.webp" },
  { label: "Platformlar", count: "5,400 İlan", icon: Monitor, color: "from-teal-600 to-cyan-800", image: "https://itemtr.com/storage/images/categories/platformlar-1588600000.webp" },
  { label: "Random Hesaplar", count: "125,000 İlan", icon: Dices, color: "from-orange-500 to-red-700", image: "https://itemtr.com/storage/images/categories/random-1588600000.webp" },
  { label: "Diğer Ürünler", count: "8,900 İlan", icon: Layers, color: "from-stone-600 to-stone-800", image: "https://itemtr.com/storage/images/categories/diger-1588600000.webp" },
];

const FullCategoryGrid = () => {
  return (
    <section className="space-y-8 py-10">
      <div className="flex flex-col gap-2 items-center text-center">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
          TÜM <span className="text-primary not-italic">KATEGORİLER</span>
        </h2>
        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] opacity-40">Türkiye'nin En Kapsamlı Oyun Pazaryeri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((cat, i) => (
          <Link 
            key={i} 
            to="/category" 
            className="group relative h-48 rounded-[2.5rem] overflow-hidden bg-card border border-white/5 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 p-1"
          >
            {/* Background Image/Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-30 transition-all duration-700`} />
            
            <div className="relative h-full w-full bg-card rounded-[2.2rem] border border-white/5 overflow-hidden flex flex-col p-6 items-center text-center justify-between group-hover:bg-white/5 transition-colors">
               <div className="p-4 rounded-3xl bg-secondary/50 border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500 scale-100 group-hover:rotate-[15deg]">
                  <cat.icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
               </div>
               
               <div className="space-y-1">
                  <h3 className="font-black text-white italic uppercase tracking-tighter text-sm leading-none group-hover:text-primary transition-colors">{cat.label}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{cat.count}</p>
               </div>
            </div>
            
            {/* Decorative Corner Glow */}
            <div className={`absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br ${cat.color} blur-[50px] opacity-20 group-hover:opacity-60 transition-opacity`} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FullCategoryGrid;
