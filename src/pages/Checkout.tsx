import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Shield, ChevronLeft, CreditCard, Wallet, Lock, Info, CheckCircle2, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BOT_LOGO_IMAGE, getBotListingById, isBotListingLocked } from "@/lib/bot-engine";
import { safeJSONParse } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

type CheckoutItem = { id: string; title: string; category: string; seller: string; price: string; image?: string; isBot?: boolean; isPurchasable?: boolean; sellerId?: string; };
const defaultCheckoutItem: CheckoutItem = { id: "1", title: "Yeşil Faktör! Teslimat! 300 Övgü CS2 Hesap", category: "CS2 / HESAP SATIŞI", seller: "ILKANSHOP", price: "49,90 ₺" };
const formatMoney = (value: string) => { const parsed = Number(String(value).replace(/[^0-9.,]/g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : 49.9; };

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isSuccess, setIsSuccess] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem>(defaultCheckoutItem);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    const listingId = searchParams.get("listingId");
    const draftRaw = localStorage.getItem("itemtr_checkout_listing");
    const draft = safeJSONParse<CheckoutItem | null>(draftRaw, null);
    
    // Load user balance
    const loadBalance = async () => {
      const user = await getCurrentUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        setUserBalance(Number(data?.balance) || 0);
      }
    };
    loadBalance();
    
    if (listingId && isBotListingLocked(listingId)) { setBlockedReason("Ürün satışta değil"); toast.error("Ürün satışta değil"); return; }
    if (listingId && draft?.id === listingId && draft.isPurchasable !== false) { setCheckoutItem({ ...draft, seller: draft.seller.toUpperCase(), category: draft.category.toUpperCase() }); return; }
    if (listingId) { const listing = getBotListingById(listingId); if (listing) setCheckoutItem({ id: listing.id, title: listing.title, seller: listing.seller.toUpperCase(), category: listing.category.toUpperCase(), price: listing.price, image: listing.image, isBot: listing.isBot, isPurchasable: listing.isPurchasable }); }
  }, [searchParams]);

  const numericTotal = useMemo(() => formatMoney(checkoutItem.price), [checkoutItem.price]);
  const serviceFee = useMemo(() => Number((numericTotal * 0.07).toFixed(2)), [numericTotal]);
  const grandTotal = useMemo(() => Number((numericTotal + serviceFee).toFixed(2)), [numericTotal, serviceFee]);
  
  const handlePayment = async () => { 
    if (blockedReason) { toast.error(blockedReason); return; } 
    if (!agreed) { toast.error("Lütfen mesafeli satış sözleşmesini onaylayın."); return; }
    if (userBalance < grandTotal) {
      toast.error("Yetersiz bakiye!", {
        description: `Gerekli: ₺${grandTotal.toFixed(2)} | Bakiyeniz: ₺${userBalance.toFixed(2)}`,
        action: { label: "Bakiye Yükle", onClick: () => navigate("/deposit") }
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }
      
      // Get seller ID
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', checkoutItem.seller)
        .single();
      
      if (!sellerProfile) {
        toast.error("Satıcı bulunamadı.");
        setIsProcessing(false);
        return;
      }
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: currentUser.id,
          seller_id: sellerProfile.id,
          listing_id: checkoutItem.id,
          status: 'pending',
          total_amount: grandTotal,
          quantity: 1,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Process payment using RPC
      const { data: transferResult, error: transferError } = await supabase
        .rpc('transfer_funds_atomic', {
          p_buyer_id: currentUser.id,
          p_seller_id: sellerProfile.id,
          p_amount: numericTotal,
          p_description: `Sipariş #${order.id.slice(0, 8)} - ${checkoutItem.title}`
        });
      
      if (transferError || !transferResult?.success) {
        // Rollback order if payment fails
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
        toast.error("Ödeme işlemi başarısız: " + (transferResult?.error || transferError?.message));
        setIsProcessing(false);
        return;
      }
      
      // Update order to completed
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
      
      setIsProcessing(false);
      setIsSuccess(true); 
      toast.success("Ödemeniz başarıyla tamamlandı!"); 
      window.setTimeout(() => navigate("/orders"), 2000); 
    } catch (error) {
      setIsProcessing(false);
      toast.error("Ödeme işlemi sırasında bir hata oluştu.");
      console.error(error);
    }
  };

  if (blockedReason) return <div className="min-h-screen bg-background"><TopBar /><Header /><NavMenu /><main className="container py-12"><Card className="max-w-2xl mx-auto rounded-[2.5rem] bg-card border-red-500/20 shadow-2xl overflow-hidden"><CardContent className="p-10 text-center space-y-8"><div className="w-24 h-24 rounded-[2rem] bg-red-500/10 border border-red-400/20 flex items-center justify-center mx-auto text-red-400"><AlertTriangle className="h-12 w-12" /></div><div className="space-y-3"><h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ürün Satışta Değil</h1><p className="text-sm text-muted-foreground leading-relaxed">Seçtiğiniz ilan bot tarafından oluşturulmuş test ilanıdır. Gerçek kullanıcılar bu ilanı satın alamaz.</p></div><div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-5 text-left"><img src={BOT_LOGO_IMAGE} alt="itemTR bot ilan görseli" className="w-28 h-20 rounded-2xl object-cover border border-white/10" /><div><p className="text-[10px] font-black text-red-400 uppercase tracking-widest">SATIŞ KİLİDİ AKTİF</p><p className="text-lg font-black text-white italic mt-1">{checkoutItem.title}</p><p className="text-xs text-muted-foreground mt-1">Uyarı: {blockedReason}</p></div></div><div className="flex flex-col sm:flex-row gap-3 justify-center"><Button onClick={() => navigate(-1)} className="h-12 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]">İlana Geri Dön</Button><Link to="/category"><Button variant="outline" className="h-12 rounded-2xl px-8 bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px]">Diğer İlanlara Göz At</Button></Link></div></CardContent></Card></main><Footer /></div>;
  if (isSuccess) return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4"><div className="w-full max-w-md bg-card rounded-[2.5rem] border border-white/5 p-10 text-center space-y-8 animate-in zoom-in-95 fade-in duration-700 shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-success opacity-50" /><div className="w-24 h-24 bg-success/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-success/20 rotate-12"><CheckCircle2 className="h-12 w-12 text-success" /></div><div className="space-y-2"><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sipariş Başarılı!</h2><p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">Ödemeniz Güvenle Alındı</p></div><p className="text-muted-foreground text-sm leading-relaxed px-4">Sipariş detaylarınıza ve ürün teslimat bilgilerine siparişlerim sayfasından anlık olarak ulaşabilirsiniz.</p><Button onClick={() => navigate("/orders")} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">Siparişlerime Git</Button></div></div>;

  return (
    <div className="min-h-screen bg-background"><TopBar /><Header /><NavMenu />
      <main className="container py-10 pb-20"><div className="mb-10 flex items-center justify-between gap-4"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-primary hover:bg-primary/10"><ChevronLeft className="h-6 w-6" /></Button><div><div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-1 italic"><Shield className="h-3 w-3" /> GÜVENLİ ÖDEME ADIMI</div><h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Ödeme <span className="text-primary not-italic">Özeti</span></h1></div></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10"><div className="lg:col-span-2 space-y-8"><Card className="border-white/5 bg-card/40 backdrop-blur-md overflow-hidden rounded-[2.5rem] shadow-2xl"><CardHeader className="bg-white/5 border-b border-white/5 p-8"><CardTitle className="text-xl font-black uppercase italic tracking-tighter text-white">SATIN ALINAN ÜRÜN</CardTitle></CardHeader><CardContent className="p-8"><div className="flex flex-col md:flex-row gap-8"><div className="w-32 h-32 rounded-[2rem] border border-white/10 flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group bg-slate-900">{checkoutItem.image ? <img src={checkoutItem.image} alt={checkoutItem.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-900/40" />}<div className="absolute inset-0 bg-black/20" /><Zap className="h-10 w-10 text-white opacity-20 group-hover:scale-125 transition-transform absolute" /></div><div className="flex-1 space-y-3"><p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] italic">{checkoutItem.category}</p><h3 className="font-black text-2xl text-white italic tracking-tighter leading-tight uppercase">{checkoutItem.title}</h3><div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest pt-2"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> ADET: 1</span><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-success" /> SATICI: {checkoutItem.seller}</span></div></div><div className="text-right flex flex-col justify-center"><p className="text-xs text-muted-foreground font-bold uppercase mb-1">Fiyat</p><p className="text-3xl font-black text-white italic tracking-tighter">₺{numericTotal.toFixed(2)}</p></div></div></CardContent></Card><div className="space-y-6"><h3 className="font-black text-xl text-white px-2 uppercase italic tracking-tighter">ÖDEME YÖNTEMİ SEÇİN</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><button type="button" onClick={() => setPaymentMethod("wallet")} className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${paymentMethod === "wallet" ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xl" : "border-white/5 bg-card hover:bg-white/5"}`}>{paymentMethod === "wallet" && <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="h-12 w-12 text-primary" /></div>}<div className="flex items-center gap-4 mb-4"><div className={`p-4 rounded-2xl ${paymentMethod === "wallet" ? "bg-primary/20 text-primary shadow-lg" : "bg-white/5 text-muted-foreground"}`}><Wallet className="h-6 w-6" /></div><div><span className="font-black text-md text-white uppercase italic tracking-tighter leading-none block">SİTE BAKİYESİ</span><span className="text-[10px] font-black text-success mt-1 block uppercase">₺150.00 MEVCUT</span></div></div><p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">Mevcut bakiyenizden anında ödeme yapın. Kesinti uygulanmaz.</p></button><button type="button" onClick={() => setPaymentMethod("card")} className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${paymentMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xl" : "border-white/5 bg-card hover:bg-white/5"}`}>{paymentMethod === "card" && <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="h-12 w-12 text-primary" /></div>}<div className="flex items-center gap-4 mb-4"><div className={`p-4 rounded-2xl ${paymentMethod === "card" ? "bg-primary/20 text-primary shadow-lg" : "bg-white/5 text-muted-foreground"}`}><CreditCard className="h-6 w-6" /></div><div><span className="font-black text-md text-white uppercase italic tracking-tighter leading-none block">KREDİ / BANKA KARTI</span><span className="text-[10px] font-black text-muted-foreground mt-1 block uppercase">ANINDA / 3D SECURE</span></div></div><p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">PayTR güvencesiyle taksitli veya peşin ödeme yapın.</p></button></div></div><div className="p-8 bg-success/5 rounded-[2.5rem] border border-success/20 flex items-start gap-6 relative overflow-hidden group"><div className="absolute top-0 right-0 p-8 opacity-5"><Shield className="w-32 h-32 text-success" /></div><div className="p-4 bg-success/10 rounded-2xl text-success border border-success/20 shadow-lg group-hover:scale-110 transition-transform"><Lock className="h-8 w-8 shrink-0" /></div><div><h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">GÜVENLİ HAVUZ SİSTEMİ (ESCROW)</h4><p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-widest opacity-70">Ödemeniz güvenle sistemimizde tutulur. Siz ürünü teslim alıp onaylayana kadar satıcıya aktarılmaz. İtemTR.com güvencesi altındasınız.</p></div></div></div><div className="space-y-6"><Card className="border-white/5 bg-card/40 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-8"><CardHeader className="p-8 border-b border-white/5"><CardTitle className="text-xl font-black uppercase italic tracking-tighter text-white">SİPARİŞ ÖZETİ</CardTitle></CardHeader><CardContent className="p-8 space-y-6"><div className="space-y-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Ürün Bedeli</span><span className="font-black text-white italic">₺{numericTotal.toFixed(2)}</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Hizmet Bedeli</span><span className="font-black text-white italic">₺{serviceFee.toFixed(2)}</span></div></div><Separator className="bg-white/5" /><div className="flex items-center justify-between"><span className="text-sm font-black uppercase tracking-widest text-primary">TOPLAM</span><span className="text-2xl font-black text-primary italic tracking-tighter">₺{grandTotal.toFixed(2)}</span></div><div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5"><Checkbox id="agreement" checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} className="mt-1" /><label htmlFor="agreement" className="text-[10px] text-muted-foreground font-bold leading-normal cursor-pointer uppercase tracking-widest opacity-60"><Link to="/legal/sales" className="text-primary hover:underline">MESAFELİ SATIŞ SÖZLEŞMESİ</Link>'Nİ VE <Link to="/legal/terms" className="text-primary hover:underline">KULLANIM KOŞULLARI</Link>'NI OKUDUM, KABUL EDİYORUM.</label></div></CardContent><CardFooter className="p-8 pt-0 flex flex-col gap-4"><Button onClick={handlePayment} className="w-full h-16 bg-primary hover:bg-primary/90 text-white text-xl font-black uppercase italic tracking-widest rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">ÖDEMEYİ TAMAMLA</Button><div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50"><Shield className="h-4 w-4 text-success" /> GÜVENLİ ALTYAPI: PAYTR</div></CardFooter></Card><div className="p-6 bg-primary/5 border border-white/5 rounded-[1.5rem] space-y-3"><h4 className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-[0.2em] italic"><Info className="h-4 w-4" /> BİLGİLENDİRME</h4><p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-60 italic">Sipariş sonrasında ürün bilgilerinde hata olması durumunda 24 saat içinde talep açılmalıdır.</p></div></div></div>
      </main><Footer /></div>
  );
};

export default Checkout;
