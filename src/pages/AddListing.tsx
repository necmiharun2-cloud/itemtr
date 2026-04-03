import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Upload, CheckCircle2, ShoppingCart, ShoppingBag, Zap, ShieldCheck, List, Server, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addMarketplaceListing, type ListingSection, createListing } from "@/lib/marketplace";
import { getCurrentUser, rewardCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const STANDARD_CATEGORIES = [
  "Oyun Hesapları",
  "E-Pin & Cüzdan Kodu",
  "Oyun İçi Item/Skin",
  "Karakter/Boost",
  "Yazılım & Lisans",
  "Sosyal Medya Hizmetleri",
];

const PVP_CATEGORIES = ["PVP Server Tanıtımı", "Metin2 PVP", "Knight Online PVP", "Minecraft Network", "Açılış Banner Tanıtımı"];

const STANDARD_GAMES = ["Counter-Strike 2", "Valorant", "League of Legends", "Roblox", "Minecraft", "Steam", "Mobile Legends", "PUBG Mobile"];
const PVP_GAMES = ["PVP Serverlar", "Metin2", "Knight Online", "Minecraft", "Rise Online"];

const AddListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<"sale" | "buy">("sale");
  const [listingArea, setListingArea] = useState<ListingSection>("new");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    game: "",
    description: "",
    price: "",
    deliveryType: "auto",
    image: "",
  });

  const isPvpArea = listingArea === "pvp";
  const categoryOptions = useMemo(() => (isPvpArea ? PVP_CATEGORIES : STANDARD_CATEGORIES), [isPvpArea]);
  const gameOptions = useMemo(() => (isPvpArea ? PVP_GAMES : STANDARD_GAMES), [isPvpArea]);

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.category || !formData.game)) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    if (step === 2 && !formData.description) {
      toast.error("Lütfen bir açıklama girin.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.price) {
      toast.error("Lütfen fiyat girin.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      // Get user profile for username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // Create listing in Supabase
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          title: formData.title,
          category: formData.category,
          game: formData.game,
          description: formData.description,
          price: Number(formData.price),
          seller_id: user.id,
          status: 'active',
          section: listingArea,
          is_auto_delivery: !isPvpArea && formData.deliveryType === "auto",
          is_vitrin: false,
          views: 0,
          favorites: 0,
          image: formData.image || null,
          features: isPvpArea ? ["Server tanıtımı", "Özel sayfa yayını"] : ["Yeni ilan", formData.deliveryType === "auto" ? "Otomatik teslim" : "Manuel teslim"],
          tags: isPvpArea ? ["PVP", formData.game] : [formData.game, listingType === "sale" ? "Satış" : "Alım"],
        })
        .select()
        .single();

      if (error) {
        console.error("[AddListing] Error creating listing:", error);
        toast.error("İlan oluşturulurken hata oluştu: " + error.message);
        setIsSubmitting(false);
        return;
      }

      // Reward user for first listing
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const reward = await rewardCurrentUser("first_listing");
        toast.success(`${isPvpArea ? "PVP server tanıtımınız" : listingType === "sale" ? "İlanınız" : "Alım ilanınız"} başarıyla oluşturuldu!`, {
          description: reward.awardedXp > 0
            ? `+${reward.awardedXp} TP kazandınız. ${isPvpArea ? "PVP Serverlar alanında ve ana sayfadaki PVP bölümünde gösterilecektir." : "Yeni ilanlar alanında yayına alınacaktır."}`
            : isPvpArea ? "PVP Serverlar alanında ve ana sayfadaki PVP bölümünde gösterilecektir." : "Yeni ilanlar alanında yayına alınacaktır.",
        });
      }

      navigate(`/listing/${listing.id}`);
    } catch (error) {
      console.error("[AddListing] Submit error:", error);
      toast.error("İlan oluşturulurken beklenmeyen bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container max-w-4xl space-y-8 py-12">
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/5 bg-card/60 p-8 shadow-2xl backdrop-blur-md md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl bg-white/5 transition-all hover:bg-primary">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                YENİ <span className="text-primary not-italic">İLAN</span> OLUŞTUR
              </h1>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {isPvpArea ? "PVP SERVER TANITIM ALANI" : listingType === "sale" ? "SATIŞ YAP" : "ALIM İLANI VER"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex rounded-2xl border border-white/5 bg-secondary/80 p-1.5 shadow-inner">
              <button
                onClick={() => setListingType("sale")}
                className={`flex items-center gap-2 rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all ${listingType === "sale" ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:text-white"}`}
              >
                <ShoppingBag className="h-4 w-4" /> SATIŞ
              </button>
              <button
                onClick={() => setListingType("buy")}
                className={`flex items-center gap-2 rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all ${listingType === "buy" ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:text-white"}`}
              >
                <ShoppingCart className="h-4 w-4" /> ALIM
              </button>
            </div>

            <div className="flex rounded-2xl border border-white/5 bg-secondary/80 p-1.5 shadow-inner">
              <button
                onClick={() => {
                  setListingArea("new");
                  setFormData((prev) => ({ ...prev, category: "", game: "" }));
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${listingArea === "new" ? "bg-success text-white shadow-xl" : "text-muted-foreground hover:text-white"}`}
              >
                <Zap className="h-4 w-4" /> Standart İlan
              </button>
              <button
                onClick={() => {
                  setListingArea("pvp");
                  setFormData((prev) => ({ ...prev, category: "", game: "" }));
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${listingArea === "pvp" ? "bg-blue-600 text-white shadow-xl" : "text-muted-foreground hover:text-white"}`}
              >
                <Server className="h-4 w-4" /> PVP Serverlar
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="group flex flex-1 items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-sm font-black transition-all ${step >= s ? "scale-110 border-primary bg-primary text-white shadow-2xl shadow-primary/20" : "border-white/5 bg-card text-muted-foreground"}`}>
                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
              </div>
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step > s ? "bg-primary" : "bg-white/5"}`} />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <Card className="overflow-hidden rounded-[2.5rem] border-white/5 bg-card/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardHeader className="border-b border-white/5 bg-white/5 p-10">
                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">İLAN DETAYLARI</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Temel bilgileri doldurarak devam edin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-10">
                <div className="space-y-3">
                  <Label htmlFor="title" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">İLAN BAŞLIĞI *</Label>
                  <Input
                    id="title"
                    placeholder={isPvpArea ? "Örn: RiseNetwork 1 Nisan Açılış Tanıtımı" : listingType === "sale" ? "Örn: 3000 Saatlik Prime CS2 Hesap" : "Örn: 200 TL Değerinde Valorant VP Arıyorum"}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold focus:bg-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">KATEGORİ *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold">
                        <SelectValue placeholder="Kategori Seçin" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-card">
                        {categoryOptions.map((c) => (
                          <SelectItem key={c} value={c} className="py-3 text-[10px] font-bold uppercase tracking-widest">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">OYUN / PLATFORM *</Label>
                    <Select value={formData.game} onValueChange={(v) => setFormData({ ...formData, game: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold">
                        <SelectValue placeholder="Oyun Seçin" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-card">
                        {gameOptions.map((g) => (
                          <SelectItem key={g} value={g} className="py-3 text-[10px] font-bold uppercase tracking-widest">{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-10 pt-0">
                <Button type="button" onClick={handleNext} className="h-14 w-full rounded-2xl bg-primary text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] hover:bg-primary/90 active:scale-95">
                  SONRAKİ ADIM <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card className="overflow-hidden rounded-[2.5rem] border-white/5 bg-card/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardHeader className="border-b border-white/5 bg-white/5 p-10">
                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">İÇERİK VE GÖRSEL</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">İlanınızı detaylandırın.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-10">
                <div className="space-y-3">
                  <Label htmlFor="description" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">AÇIKLAMA *</Label>
                  <Textarea
                    id="description"
                    placeholder={isPvpArea ? "Server açılış tarihi, özellikler, oranlar, hedef kitle ve iletişim detaylarını yazın..." : "İlan içeriği, hesap detayları, teslimat süreci vb..."}
                    className="min-h-[250px] rounded-[2rem] border-white/10 bg-white/5 p-8 text-sm font-medium leading-relaxed focus:bg-white/10"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="image" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">HD GÖRSEL URL</Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold focus:bg-white/10"
                  />
                </div>
                <div className="space-y-4 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary p-2 text-white shadow-xl shadow-primary/20">
                      <Upload className="h-5 w-5" />
                    </div>
                    <h4 className="text-md font-black uppercase italic tracking-tight">HD Görsel Koruması</h4>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest leading-relaxed text-muted-foreground opacity-60">Görselleriniz otomatik optimize edilir ve İtemTR.com filigranı ile korunur.</p>
                  <Button type="button" variant="outline" className="h-12 w-full rounded-xl border-dashed border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/10">GÖRSEL URL KULLAN</Button>
                </div>
              </CardContent>
              <CardFooter className="flex gap-4 p-10 pt-0">
                <Button type="button" variant="outline" onClick={handleBack} className="h-14 w-40 rounded-2xl border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">GERİ</Button>
                <Button type="button" onClick={handleNext} className="h-14 flex-1 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">SONRAKİ ADIM</Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card className="overflow-hidden rounded-[2.5rem] border-white/5 bg-card/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardHeader className="border-b border-white/5 bg-white/5 p-10">
                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">FİYAT VE TESLİMAT</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Son adımı tamamlayarak yayına alın.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 p-10">
                <div className="space-y-4">
                  <Label htmlFor="price" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">FİYATLANDIRMA *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="h-20 rounded-[2rem] border-white/10 bg-white/5 px-12 text-4xl font-black italic tracking-tighter focus:bg-white/10"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <span className="absolute left-6 top-1/2 mt-1 -translate-y-1/2 text-3xl font-black text-primary">₺</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-success/10 bg-success/5 p-4 text-[10px] font-black uppercase tracking-widest text-success">
                    <ShieldCheck className="h-4 w-4" /> Net Kazancınız: ₺{(Number(formData.price || 0) * 0.9).toFixed(2)}
                  </div>
                </div>

                {!isPvpArea && (
                  <div className="space-y-4">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">TESLİMAT PROTOKOLÜ</Label>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryType: "auto" })}
                        className={`group relative overflow-hidden rounded-[2rem] border-2 p-8 text-left transition-all ${formData.deliveryType === "auto" ? "scale-[1.02] border-primary bg-primary/10 shadow-2xl shadow-primary/20" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                      >
                        <div className={`mb-4 w-fit rounded-lg p-2 ${formData.deliveryType === "auto" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                          <Zap className="h-5 w-5" />
                        </div>
                        <h4 className="text-md font-black uppercase italic tracking-tight text-white">Otomatik Teslimat</h4>
                        <p className="mt-2 text-[10px] font-medium uppercase leading-relaxed tracking-widest text-muted-foreground opacity-60">Sistem bilgileri alıcıya anında iletir. 7/24 kesintisiz satış.</p>
                        {formData.deliveryType === "auto" && <div className="absolute right-4 top-4"><CheckCircle2 className="h-5 w-5 text-primary" /></div>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryType: "manual" })}
                        className={`group relative overflow-hidden rounded-[2rem] border-2 p-8 text-left transition-all ${formData.deliveryType === "manual" ? "scale-[1.02] border-primary bg-primary/10 shadow-2xl shadow-primary/20" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                      >
                        <div className={`mb-4 w-fit rounded-lg p-2 ${formData.deliveryType === "manual" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                          <List className="h-5 w-5" />
                        </div>
                        <h4 className="text-md font-black uppercase italic tracking-tight text-white">Manuel Teslimat</h4>
                        <p className="mt-2 text-[10px] font-medium uppercase leading-relaxed tracking-widest text-muted-foreground opacity-60">Teslimatı sohbette koordine edersiniz. Güvenli havuz sistemi aktiftir.</p>
                        {formData.deliveryType === "manual" && <div className="absolute right-4 top-4"><CheckCircle2 className="h-5 w-5 text-primary" /></div>}
                      </button>
                    </div>
                  </div>
                )}

                {isPvpArea && (
                  <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/10 p-8">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/20 p-3 text-blue-300">
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black uppercase italic tracking-tight text-white">PVP Server Tanıtım Akışı</h4>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bu ilan yeni ilanlara değil, PVP Serverlar alanına düşer.</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">Oluşturduğunuz PVP server tanıtımı hem özel PVP sayfasında hem de ana sayfadaki PVP tanıtım bölümünde gösterilir.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-4 p-10 pt-0">
                <Button type="button" variant="outline" onClick={handleBack} className="h-14 w-40 rounded-2xl border-white/10 text-[10px] font-black uppercase tracking-widest">GERİ</Button>
                <Button type="submit" disabled={isSubmitting} className="h-16 flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95">
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> YÜKLENİYOR...</>
                  ) : (
                    "İLANINIZI YAYINLAYIN"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddListing;
