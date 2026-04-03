import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { User, Shield, Star, Clock, MessageCircle, ShoppingCart, Heart, Flag, ChevronRight, CheckCircle, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getMarketplaceListingById, getMarketplaceListings } from "@/lib/marketplace";
import { BOT_LOGO_IMAGE, getBotListingById, isBotListingLocked } from "@/lib/bot-engine";
import { getLevelTier, LEVEL_TIERS } from "@/lib/levels";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Önce Supabase'den dene
      const { data: supabaseListing, error } = await supabase
        .from('listings')
        .select('*, profiles:seller_id(username, avatar)')
        .eq('id', id)
        .single();

      if (supabaseListing && !error) {
        setListing({
          id: supabaseListing.id,
          title: supabaseListing.title,
          category: supabaseListing.category,
          game: supabaseListing.game,
          seller: supabaseListing.profiles?.username || 'Bilinmiyor',
          sellerAvatar: supabaseListing.profiles?.avatar || '',
          price: `₺${supabaseListing.price}`,
          description: supabaseListing.description,
          features: supabaseListing.features || [],
          image: supabaseListing.image || BOT_LOGO_IMAGE,
          imageColor: 'bg-gradient-to-br from-slate-700/40 to-slate-900/50',
          views: supabaseListing.views || 0,
          favorites: supabaseListing.favorites || 0,
          createdAt: supabaseListing.created_at 
            ? new Date(supabaseListing.created_at).toLocaleDateString('tr-TR')
            : 'Az önce',
          tags: supabaseListing.tags || [],
          oldPrice: '',
          reviews: [],
          sellerExperience: 0,
          isBot: false,
          isPurchasable: supabaseListing.status === 'active',
        });
        setLoading(false);
        return;
      }

      // Supabase'de yoksa local/bot listesine bak
      const staticListing = getMarketplaceListingById(id);
      if (staticListing) {
        setListing(staticListing);
        setLoading(false);
        return;
      }

      const botListing = getBotListingById(id);
      if (botListing) {
        setListing({
          id: botListing.id,
          title: botListing.title,
          category: botListing.category,
          game: botListing.category,
          seller: botListing.seller,
          price: botListing.price,
          description: botListing.description,
          features: ['Canlı Vitrin', 'Anlık Güncelleme', 'Otomatik Etiketleme'],
          image: botListing.image || BOT_LOGO_IMAGE,
          imageColor: 'bg-gradient-to-br from-slate-700/40 to-slate-900/50',
          views: 512,
          favorites: 14,
          createdAt: 'Az önce',
          tags: botListing.tags,
          oldPrice: '',
          reviews: botListing.reviews || [],
          sellerAvatar: (botListing as any).sellerAvatar || '',
          sellerExperience: (botListing as any).sellerExperience ?? 0,
          isBot: true,
          isPurchasable: botListing.isPurchasable,
        });
        setLoading(false);
        return;
      }

      // BOT- ile başlayan test / kilitli ilanlar: kayıt yoksa yine de vitrin göster
      if (String(id).startsWith("BOT-")) {
        setListing({
          id: String(id),
          title: "Bot test ilanı",
          category: "CS2 / HESAP SATIŞI",
          game: "CS2",
          seller: "İtemTR Bot",
          sellerAvatar: "",
          price: "₺99,90",
          description: "Bu ilan bot tarafından oluşturulmuş test ilanıdır.",
          features: ["Test"],
          image: BOT_LOGO_IMAGE,
          imageColor: "bg-gradient-to-br from-slate-700/40 to-slate-900/50",
          views: 0,
          favorites: 0,
          createdAt: "Az önce",
          tags: ["test"],
          oldPrice: "",
          reviews: [],
          sellerExperience: 0,
          isBot: true,
          isPurchasable: false,
        });
        setLoading(false);
        return;
      }

      setListing(null);
      setLoading(false);
    };

    fetchListing();
  }, [id]);

  const relatedListings = getMarketplaceListings().filter((item) => item.id !== listing?.id).slice(0, 4);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <NavMenu />
        <main className="container py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">İlan bulunamadı</h1>
          <p className="text-muted-foreground">Bağlantı geçersiz olabilir veya ilan kaldırılmış olabilir.</p>
          <Link to="/category"><Button>Kategorilere Dön</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isLocked = useMemo(() => isBotListingLocked(id), [id]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    // Bot ilanları için mevcut değil uyarısı
    if (isLocked) {
      toast.error("Ürün şu an mevcut değil.");
      return;
    }
    
    setIsCheckingOut(true);
    
    try {
      // 1. Kullanıcı giriş kontrolü
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error("Satın almak için giriş yapmalısınız.");
        navigate(`/login?redirect=${encodeURIComponent(`/listing/${id}`)}`);
        return;
      }
      
      // 2. Kendi ilanını kontrolü
      if (listing.seller === currentUser.username) {
        toast.error("Kendi ilanınızı satın alamazsınız.");
        return;
      }
      
      // 3. Fiyat parse
      const priceNumber = Number(String(listing.price).replace(/[^\d,]/g, "").replace(",", "."));
      
      // 4. Bakiye kontrolü
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', currentUser.id)
        .single();
      
      const userBalance = Number(profile?.balance) || 0;
      
      if (userBalance < priceNumber) {
        toast.error("Yetersiz bakiye!", {
          description: `Gerekli: ₺${priceNumber.toFixed(2)} | Bakiyeniz: ₺${userBalance.toFixed(2)}`,
          action: {
            label: "Bakiye Yükle",
            onClick: () => navigate("/deposit"),
          },
        });
        return;
      }
      
      // 5. Checkout'a yönlendir
      const checkoutDraft = {
        id: String(listing.id),
        title: listing.title,
        category: listing.category,
        seller: listing.seller,
        price: listing.price,
        image: listing.image,
        buyerBalance: userBalance,
        buyerId: currentUser.id,
      };
      localStorage.setItem("itemtr_checkout_listing", JSON.stringify(checkoutDraft));
      
      navigate(`/checkout?listingId=${listing.id}`);
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-foreground transition-colors cursor-pointer">{listing.game || listing.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-foreground transition-colors cursor-pointer">{listing.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={`relative w-full h-64 md:h-80 rounded-2xl ${listing.imageColor || "bg-gradient-to-br from-slate-700/40 to-slate-900/50"} overflow-hidden`}>
              {listing.image ? <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" /> : null}
              
              {/* PVP SERVER OVERLAY */}
              {listing.category === "PVP Serverlar" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                  <div className="border-y-4 border-primary bg-black/60 px-10 py-5 w-full text-center">
                    <span className="text-4xl font-black italic uppercase tracking-[0.4em] text-gold-flash drop-shadow-[0_0_25px_rgba(250,204,21,0.9)]">
                      SERVER TANITIMI
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-vitrin text-vitrin-foreground text-xs font-bold uppercase tracking-wide">Vitrin İlanı</span>
                  <h1 className="text-xl font-bold text-foreground mt-2">{listing.title}</h1>
                  <p className="text-sm text-primary font-medium mt-1">{listing.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {listing.createdAt || "2 saat önce"}</span>
                <span>{listing.views || 0} görüntülenme</span>
                <span>{listing.favorites || 0} favori</span>
              </div>

              <div className="flex flex-wrap gap-2">{(listing.features || []).map((f) => <span key={f} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />{f}</span>)}</div>
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span 
                      key={tag} 
                      onClick={() => navigate(`/category?q=${encodeURIComponent(tag)}`)}
                      className="rounded-lg border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">İlan Açıklaması</h3>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{listing.description}</pre>
              </div>

              {listing.reviews && listing.reviews.length > 0 && (
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest text-[10px]">Değerlendirmeler ({listing.reviews.length})</h3>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-3 w-3 fill-accent" />
                      <span className="text-xs font-bold">4.9 / 5.0</span>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {listing.reviews.map((review: any) => (
                      <div key={review.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={review.avatar} alt={review.user} className="w-6 h-6 rounded-full" />
                            <span className="text-xs font-bold text-foreground italic">{review.user}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-2.5 w-2.5", i < review.rating ? "fill-accent text-accent" : "text-muted")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                        <p className="text-[9px] text-muted-foreground/60 text-right uppercase font-bold">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {listing.category !== "PVP Serverlar" ? (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-white/70 uppercase leading-none mb-0.5 tracking-tight">İlan fiyatı:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#00CED1] drop-shadow-[0_0_12px_rgba(0,206,209,0.4)]">{listing.price}</span>
                    {listing.oldPrice && <span className="text-sm text-muted-foreground line-through">{listing.oldPrice}</span>}
                  </div>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut || isLocked}
                  className={cn(
                    "w-full rounded-xl h-12 text-base font-semibold gap-2",
                    isLocked && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                  )}
                >
                  {isCheckingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  {isLocked ? "Ürün Satışta Değil" : isCheckingOut ? "Kontrol Ediliyor..." : "Satın Al"}
                </Button>
                {isLocked && (
                  <p className="text-[11px] text-center text-amber-500/90 font-bold uppercase tracking-wide leading-snug">
                    Gerçek kullanıcılar bu bot ilanını satın alamaz.
                  </p>
                )}
                <div className="flex gap-2"><Button variant="outline" className="flex-1 rounded-xl gap-2" type="button"><Heart className="h-4 w-4" />Favorile</Button><Link to="/messages" className="flex-1"><Button variant="outline" className="w-full rounded-xl gap-2"><MessageCircle className="h-4 w-4" />Mesaj Gönder</Button></Link></div>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-2" type="button"><Flag className="h-4 w-4" />İlanı Şikayet Et</Button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-primary uppercase italic tracking-tighter">SERVER TANITIMI</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Bu bir server tanıtım ilanıdır. Daha fazla bilgi için açıklama kısmını inceleyebilir veya satıcı ile iletişime geçebilirsiniz.</p>
                <div className="flex gap-2"><Button variant="outline" className="flex-1 rounded-xl gap-2" type="button"><Heart className="h-4 w-4" />Favorile</Button><Link to="/messages" className="flex-1"><Button variant="outline" className="w-full rounded-xl gap-2"><MessageCircle className="h-4 w-4" />Mesaj Gönder</Button></Link></div>
              </div>
            )}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="bg-[#1a1f2e] px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-border">
                Satıcı Bilgileri
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {listing.sellerAvatar ? (
                          <img src={listing.sellerAvatar} alt={listing.seller} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-card leading-none">
                        82
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-0.5">
                      <h3 className="text-sm font-black text-foreground leading-tight flex flex-col">
                        {listing.category === "PVP Serverlar" && (
                          <span className="text-[9px] font-black italic uppercase text-gold-flash tracking-tight mb-0.5 animate-pulse">
                            ServerSahibi
                          </span>
                        )}
                        {listing.seller}
                      </h3>
                      <TooltipProvider>
                        <div className="flex gap-1.5">
                          <Tooltip>
                            <TooltipTrigger>
                              <Shield className="h-5 w-5 text-success fill-success/20 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/90 border-border text-[11px] max-w-[200px] p-2 leading-relaxed">
                              <p className="font-bold text-success mb-1 uppercase tracking-tight">Kimlik Onaylı Satıcı</p>
                              Bu üyenin kimlik bilgileri sistemimizde kayıtlıdır ve doğrulanmıştır.
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500/20 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/90 border-border text-[11px] max-w-[200px] p-2 leading-relaxed">
                              <p className="font-bold text-blue-500 mb-1 uppercase tracking-tight">Başarılı İşlem</p>
                              Bu üye platform üzerinde çok sayıda başarılı satış gerçekleştirmiştir.
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500/20 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/90 border-border text-[11px] max-w-[200px] p-2 leading-relaxed">
                              <p className="font-bold text-yellow-500 mb-1 uppercase tracking-tight">Efsane Satıcı</p>
                              Müşteriler tarafından en yüksek puanları almış güvenilir profil.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-foreground leading-none">1.243</div>
                    <div className="text-[10px] text-success uppercase font-black tracking-tight mt-1">Başarılı İşlem</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  <Link to={`/seller/${listing.seller}`} className="col-span-3">
                    <Button variant="outline" size="sm" className="w-full h-9 rounded-lg gap-2 text-[11px] font-bold border-border bg-secondary/30 hover:bg-secondary/50">
                      <User className="h-3.5 w-3.5" /> Satıcı Profili
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="h-9 p-0 rounded-lg border-border bg-secondary/30 hover:bg-secondary/50">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 px-2 rounded-lg gap-2 text-[11px] font-bold border-border bg-secondary/30 hover:bg-secondary/50">
                    <Clock className="h-3.5 w-3.5" /> SMS
                  </Button>
                </div>

                <div className="flex flex-col items-center justify-center pt-3 pb-2 border-t border-border/50 bg-gradient-to-b from-secondary/5 to-secondary/20">
                  <div className="flex flex-col items-center gap-2 w-full">
                    {/* Ana Rütbe Badge */}
                    {(() => {
                      const sellerXp = (listing.sellerExperience ?? 0) * 150;
                      const tier = getLevelTier(sellerXp);
                      return (
                        <div className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 shadow-lg",
                          "bg-gradient-to-r",
                          tier.bgGradient,
                          tier.borderColor
                        )}>
                          <span className="text-2xl">{tier.badge}</span>
                          <div className="flex flex-col">
                            <span className={cn("text-xs font-black uppercase tracking-wider", tier.textColor)}>
                              {tier.title} Satıcı
                            </span>
                            <span className="text-[9px] text-white/60">{tier.description}</span>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Tüm Rütbeler - Mini */}
                    <div className="flex flex-wrap justify-center gap-1 w-full">
                      {LEVEL_TIERS.map((tier) => {
                        const sellerXp = (listing.sellerExperience ?? 0) * 150;
                        const isActive = sellerXp >= tier.minXp;
                        const isNext = !isActive && sellerXp >= (LEVEL_TIERS[tier.level - 2]?.minXp ?? 0);
                        
                        return (
                          <Tooltip key={tier.level}>
                            <TooltipTrigger asChild>
                              <div 
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                  isActive 
                                    ? cn("bg-gradient-to-r", tier.bgGradient, tier.borderColor, tier.textColor)
                                    : isNext
                                      ? "bg-white/10 border-white/20 text-white/40 animate-pulse"
                                      : "bg-white/5 border-white/10 text-white/20 grayscale"
                                )}
                              >
                                <span>{tier.badge}</span>
                                <span className="hidden sm:inline">{tier.title}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/90 border-border">
                              <div className="space-y-1">
                                <p className={cn("font-bold", tier.textColor)}>{tier.badge} {tier.title}</p>
                                <p className="text-[10px] text-white/70">{tier.description}</p>
                                <p className="text-[9px] text-white/50">Min. XP: {tier.minXp}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* İtemTR.com Güvenli Alışveriş Card */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3 relative overflow-hidden group hover:border-success/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-success opacity-40"></div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">İtemTR.com Güvenli Alışveriş</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    İtemTR.com alışveriş süreci sona erene kadar ücretinizi güvene almaktadır. Alışveriş sonrası süreçte iade, teknik destek gibi konulardan ürünün satıcısı sorumludur.
                  </p>
                </div>
              </div>
            </div>

            {/* Yardım Card */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3 relative overflow-hidden group hover:border-blue-500/30 transition-colors cursor-pointer">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-40"></div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Yardıma mı ihtiyacınız var?</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Buraya tıklayarak yardım merkezi sayfamıza ulaşabilir, üyelerimiz tarafından sıkça sorulan sorular yardım merkezinden listelenmektedir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Benzer İlanlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {relatedListings.map((item) => (
              <ListingCard 
                key={item.id} 
                {...item} 
                section={item.section || "new"}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetail;
