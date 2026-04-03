import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Star, MessageSquare, CheckCircle2, User, ThumbsUp, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reviews = () => {
  const allReviews = [
    { user: "Gokhan_41", item: "Valorant Random Hesap", rating: 5, date: "2 saat önce", comment: "Cok hizli teslimat yapildi, satici cok ilgili tesekkurler." },
    { user: "Emirhan_TR", item: "Roblox 1000 Robux", rating: 5, date: "5 saat önce", comment: "Sorunsuz aldim yuklendi hemen." },
    { user: "Selin_01", item: "Netflix 1 Aylık UHD", rating: 5, date: "1 gün önce", comment: "Anında teslim edildi, sorunsuz çalışıyor." },
    { user: "DenizX", item: "CS2 Prime Accounts", rating: 4, date: "1 gün önce", comment: "Herşey güzeldi, sadece biraz geç cevap geldi ama sonunda sorunsuz aldım." },
    { user: "OyunTutkunu", item: "Knight Online Gold Bar", rating: 5, date: "2 gün önce", comment: "Güvenilir, her zaman buradan alıyorum." },
    { user: "KralSatici", item: "Steam 100 TL Cüzdan Kodu", rating: 5, date: "2 gün önce", comment: "Otomatik teslimat efsane, 1 saniyede geldi." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-12 space-y-12">
        <section className="text-center space-y-4">
           <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <TrendingUp className="h-4 w-4" /> Kullanıcı Deneyimi
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Müşteri Yorumları</h1>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tüm alışverişler gerçek ve sistem onaylıdır. İtemTR.com'da güven önceliğimizdir.</p>
        </section>

        {/* Global Rating Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2">
              <div className="flex gap-1 text-primary">
                 {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-primary shadow-[0_0_15px_rgba(245,158,11,0.5)]" />)}
              </div>
              <p className="text-4xl font-black text-white">4.9 / 5.0</p>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest italic">Toplam 148,000+ Değerlendirme</p>
           </Card>

           <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-center">
                 <p className="text-sm font-bold text-muted-foreground uppercase">Hızlı Teslimat</p>
                 <p className="text-3xl font-black text-white">%98.4</p>
                 <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[98.4%]" />
                 </div>
              </div>
              <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-center">
                 <p className="text-sm font-bold text-muted-foreground uppercase">Müşteri Memnuniyeti</p>
                 <p className="text-3xl font-black text-white">%99.1</p>
                 <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-success h-full w-[99.1%]" />
                 </div>
              </div>
           </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {allReviews.map((rev, i) => (
             <Card key={i} className="bg-card border-border rounded-3xl hover:border-primary/40 transition-all group hover:-translate-y-1 shadow-2xl">
                <CardHeader className="pb-2">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/40 transition-colors">
                            <User className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <div>
                            <p className="font-bold text-foreground flex items-center gap-1">
                               {rev.user} <CheckCircle2 className="h-3 w-3 text-success" />
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black">{rev.date}</p>
                         </div>
                      </div>
                      <div className="flex items-center">
                         {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{rev.item}</p>
                   </div>
                   <p className="text-sm text-foreground/80 italic leading-relaxed">"{rev.comment}"</p>
                </CardContent>
                <div className="px-6 pb-6 flex items-center justify-between text-xs text-muted-foreground font-bold">
                   <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                      <ThumbsUp className="h-3 w-3" /> Faydalı (0)
                   </span>
                   <Badge variant="outline" className="border-border text-[9px] uppercase tracking-tighter">Doğrulanmış İşlem</Badge>
                </div>
             </Card>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
