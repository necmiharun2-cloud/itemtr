import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const packages = [
  {
    id: "starter",
    name: "Başlangıç",
    price: "149,90",
    duration: "24 Saat",
    features: ["Ana sayfa alt vitrin", "Kategori sayfasında öne çıkar", "1 ilan için geçerli", "Hızlı aktivasyon"],
  },
  {
    id: "pro",
    name: "Mağaza Pro",
    price: "349,90",
    duration: "3 Gün",
    featured: true,
    features: ["Ana sayfa üst vitrin", "Kategori + arama sonuçlarında rozet", "3 ilan için geçerli", "Satış dönüşümü odaklı görünürlük"],
  },
  {
    id: "elite",
    name: "Elite Vitrin",
    price: "799,90",
    duration: "7 Gün",
    features: ["Ana sayfa premium alan", "Mağaza rozeti ve ekstra vurgu", "10 ilana kadar kapsama", "Öncelikli destek"],
  },
];

const Vitrin = () => {
  const handlePurchase = (pkg: typeof packages[number]) => {
    localStorage.setItem("itemtr_vitrin_package", JSON.stringify({
      ...pkg,
      purchasedAt: new Date().toISOString(),
      status: "Aktif",
    }));
    toast.success("Vitrin paketi seçildi", {
      description: `${pkg.name} paketi kullanıcı panelinize işlendi.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-10 space-y-8">
        <section className="rounded-[2.5rem] border border-white/5 bg-card/60 backdrop-blur-md p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Crown className="h-40 w-40 text-primary" />
          </div>
          <div className="max-w-3xl space-y-4 relative z-10">
            <Badge className="bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest text-[10px] font-black">
              Itemsatis Tarzı Vitrin
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
              İlanını daha görünür hale getir.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Vitrin paketleri sayesinde ilanların ana sayfada, kategori sonuçlarında ve mağaza görünümünde daha fazla öne çıkar.
              Özellikle yeni mağazalar ve hızlı satış isteyen satıcılar için optimize edildi.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`rounded-[2rem] border shadow-2xl ${pkg.featured ? "border-primary/40 bg-primary/5" : "border-white/5 bg-card"}`}
            >
              <CardHeader className="p-8 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl font-black italic text-white tracking-tighter">{pkg.name}</CardTitle>
                  {pkg.featured && (
                    <Badge className="bg-primary text-white uppercase text-[9px] font-black tracking-widest">Önerilen</Badge>
                  )}
                </div>
                <CardDescription className="text-muted-foreground">
                  <span className="text-4xl text-white font-black italic">₺{pkg.price}</span>
                  <span className="ml-2 text-xs uppercase tracking-widest">{pkg.duration}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                  {pkg.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePurchase(pkg)}
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Paketi Seç
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Crown, title: "Daha fazla görünürlük", desc: "Ana sayfa ve kategori sayfalarında daha üst sıralarda görün." },
            { icon: Zap, title: "Daha hızlı satış", desc: "Öne çıkan ilanlar daha fazla tıklama ve dönüşüm alır." },
            { icon: CheckCircle2, title: "Panel entegrasyonu", desc: "Satın aldığın paket kullanıcı paneline otomatik yansır." },
          ].map((item) => (
            <Card key={item.title} className="rounded-[2rem] bg-card border-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black italic text-white">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Vitrin;
