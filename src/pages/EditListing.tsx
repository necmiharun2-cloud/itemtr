import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ChevronLeft, CheckCircle2, ShoppingBag, ShoppingCart, Zap, Server, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type ListingSection } from "@/lib/marketplace";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

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

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Load listing data
  useEffect(() => {
    const loadListing = async () => {
      if (!id) {
        toast.error("İlan ID'si bulunamadı");
        navigate("/dashboard");
        return;
      }

      try {
        const appUser = await getCurrentUser();
        if (!appUser) {
          toast.error("Oturumunuz sonlanmış");
          navigate("/login");
          return;
        }

        const { data: listing, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .eq("seller_id", appUser.id)
          .single();

        if (error || !listing) {
          toast.error("İlan bulunamadı veya erişim izniniz yok");
          navigate("/dashboard");
          return;
        }

        setFormData({
          title: listing.title || "",
          category: listing.category || "",
          game: listing.game || "",
          description: listing.description || "",
          price: listing.price?.toString() || "",
          deliveryType: listing.is_auto_delivery ? "auto" : "manual",
          image: listing.image || "",
        });
        setListingArea(listing.section || "new");
        setLoading(false);
      } catch (error) {
        console.error("[EditListing] Load error:", error);
        toast.error("İlan yüklenirken hata oluştu");
        navigate("/dashboard");
      }
    };

    loadListing();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.game || !formData.price) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setSaving(true);

    try {
      const appUser = await getCurrentUser();
      if (!appUser) {
        toast.error("Oturumunuz sonlanmış.");
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("listings")
        .update({
          title: formData.title,
          category: formData.category,
          game: formData.game,
          description: formData.description,
          price: Number(formData.price),
          image: formData.image || null,
          section: listingArea,
          is_auto_delivery: !isPvpArea && formData.deliveryType === "auto",
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq("seller_id", appUser.id);

      if (error) {
        console.error("[EditListing] Update error:", error);
        toast.error("İlan güncellenirken hata oluştu: " + error.message);
        setSaving(false);
        return;
      }

      toast.success("İlan başarıyla güncellendi!");
      navigate("/dashboard");
    } catch (error) {
      console.error("[EditListing] Submit error:", error);
      toast.error("İlan güncellenirken beklenmeyen bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

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
                İLANI <span className="text-primary not-italic">DÜZENLE</span>
              </h1>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                İlan bilgilerinizi güncelleyin
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="overflow-hidden rounded-[2.5rem] border-white/5 bg-card/40 shadow-2xl backdrop-blur-md">
            <CardHeader className="border-b border-white/5 bg-white/5 p-10">
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter">İLAN DETAYLARI</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Temel bilgileri güncelleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <div className="space-y-3">
                <Label htmlFor="title" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">İLAN BAŞLIĞI *</Label>
                <Input
                  id="title"
                  placeholder="İlan başlığı"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold focus:bg-white/10"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">KATEGORİ *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold z-50">
                      <SelectValue placeholder="Kategori Seçin" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="rounded-xl border-white/10 bg-card z-[100] max-h-[300px] overflow-y-auto">
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c} className="py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary/20">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">OYUN / PLATFORM *</Label>
                  <Select value={formData.game} onValueChange={(v) => setFormData({ ...formData, game: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold z-50">
                      <SelectValue placeholder="Oyun Seçin" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="rounded-xl border-white/10 bg-card z-[100] max-h-[300px] overflow-y-auto">
                      {gameOptions.map((g) => (
                        <SelectItem key={g} value={g} className="py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary/20">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="price" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">FİYAT (TL) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Örn: 150"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold focus:bg-white/10"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">AÇIKLAMA</Label>
                <Textarea
                  id="description"
                  placeholder="İlan açıklaması..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[150px] rounded-2xl border-white/10 bg-white/5 px-6 py-4 font-medium focus:bg-white/10"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="image" className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">GÖRSEL URL</Label>
                <Input
                  id="image"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold focus:bg-white/10"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 bg-white/5 p-10">
              <Button type="submit" disabled={saving} className="h-14 w-full rounded-2xl bg-primary text-base font-black uppercase italic tracking-widest shadow-xl">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    KAYDEDİLİYOR...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    DEĞİŞİKLİKLERİ KAYDET
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
