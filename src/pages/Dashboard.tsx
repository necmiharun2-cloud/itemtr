import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  Package,
  LineChart,
  Heart,
  LifeBuoy,
  Shield,
  Settings,
  CreditCard,
  Trash2,
  Eye,
  Plus,
  Camera,
  Smartphone,
  Mail,
  Lock,
  History,
  CheckCircle2,
  Upload,
  Star,
  Wallet,
  Crown,
  Zap,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn, safeJSONParse } from "@/lib/utils";
import { AUTH_CHANGED_EVENT, getCurrentUser, rewardCurrentUser, updateCurrentUser } from "@/lib/auth";
import { getLevelTier } from "@/lib/levels";
import { createSupportConversation, getConversationSummary, getSupportTicketsForCurrentUser, getVisibleConversations, MESSAGING_EVENT } from "@/lib/messaging";
import { getWalletTransactions, getUserBalance } from "@/lib/wallet";
import { supabase } from "@/lib/supabase";
import { seedNotifications, getNotifications, markAllNotificationsRead } from "@/lib/notifications";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type DashboardTab =
  | "overview"
  | "wallet"
  | "kyc"
  | "messages"
  | "cart"
  | "purchases"
  | "listings"
  | "sales"
  | "favorites"
  | "support"
  | "security"
  | "profile";

type UserProfile = {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number;
  rating: number;
  isVerified: boolean;
};

type Ticket = {
  id: string;
  subject: string;
  status: "Beklemede" | "Cevaplandı";
  date: string;
  type: string;
};

type Listing = {
  id: number;
  title: string;
  price: string;
  views: number;
  stock: number;
  status: "Aktif" | "Pasif";
};

type WalletTxn = {
  id: string;
  type: string;
  amount: string;
  date: string;
  color: string;
};

const initialProfile: UserProfile = {
  name: "Mert Gezer",
  username: "MertG_",
  email: "demo@itemtr.com",
  phone: "0532 000 00 00",
  avatar: "https://ui-avatars.com/api/?name=Mert&background=random",
  balance: 1250,
  rating: 4.8,
  isVerified: false,
};

const initialTickets: Ticket[] = [
  { id: "T-1021", subject: "Bakiye yükleme sorunu", status: "Beklemede", date: "31 Mar 2026", type: "Finans" },
  { id: "T-0985", subject: "İlan reddi hakkında", status: "Cevaplandı", date: "28 Mar 2026", type: "İlan" },
];

const initialListings: Listing[] = [
  { id: 1, title: "3000 Saat Prime CS2 Hesap", price: "249,90", views: 1240, stock: 1, status: "Aktif" },
  { id: 2, title: "Valorant Silver Hesap", price: "150,00", views: 450, stock: 5, status: "Aktif" },
];

const initialWalletTxns: WalletTxn[] = [
  { id: "TXN123", type: "Yükleme", amount: "+₺500", date: "30 Mar 14:02", color: "text-success" },
  { id: "TXN124", type: "Satın Alım", amount: "-₺120", date: "28 Mar 22:15", color: "text-red-500" },
];

const salesRows = [
  { id: "S-104", item: "Steam Cüzdan Kodu", buyer: "Kaan07", amount: "₺190,00", status: "Tamamlandı" },
  { id: "S-103", item: "Discord Nitro", buyer: "ErenShop", amount: "₺599,90", status: "Teslim Edildi" },
];

const cartItems = [
  { id: 1, title: "CS2 Prime Hesap", seller: "TopSeller", price: 249.9 },
  { id: 2, title: "Discord Nitro 1 Yıl", seller: "NitroShop", price: 599.9 },
];

const orders = [
  { id: "ORD-9921", item: "Valorant Hesap", status: "Teslim Edildi", amount: "₺150,00" },
  { id: "ORD-9910", item: "Steam 100 TL Kod", status: "Onay Bekliyor", amount: "₺100,00" },
];

const favorites = [
  { id: 10, title: "Global Elite CS2 Hesap", price: "₺199,90", seller: "TopSeller" },
  { id: 11, title: "5000 Robux Hemen Teslim", price: "₺1.099,90", seller: "RZShop" },
];

const loginHistory = [
  { id: 1, ip: "176.234.11.90", device: "Windows Chrome", date: "Bugün 14:20", status: "Başarılı" },
  { id: 2, ip: "176.234.11.90", device: "iPhone Safari", date: "Dün 22:15", status: "Başarılı" },
];

const getInitialTab = (location: ReturnType<typeof useLocation>): DashboardTab => {
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab") as DashboardTab | null;
  if (location.pathname.includes("support-tickets")) return "support";
  if (
    tab &&
    ["overview", "wallet", "kyc", "messages", "cart", "purchases", "listings", "sales", "favorites", "support", "security", "profile"].includes(tab)
  ) {
    return tab;
  }
  return "overview";
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DashboardTab>(getInitialTab(location));
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [supportTickets, setSupportTickets] = useState<Ticket[]>(initialTickets);
  const [activeListings, setActiveListings] = useState<Listing[]>(initialListings);
  const [walletTxns, setWalletTxns] = useState<WalletTxn[]>(initialWalletTxns);
  const [ticketForm, setTicketForm] = useState({ subject: "", type: "Genel", message: "" });
  const [vitrinPackage, setVitrinPackage] = useState<{ name: string; duration: string } | null>(null);
  const [panelNotifications, setPanelNotifications] = useState<NotificationItem[]>([]);
  // GERÇEK VERİ STATE'LERİ
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [realOrders, setRealOrders] = useState<typeof orders>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState(() => getLevelTier(0));
  const [messagePreview, setMessagePreview] = useState<Array<{id: string; user: string; text: string; time: string}>>([]);

  useEffect(() => {
    const savedListings = localStorage.getItem("itemtr_user_listings");
    const savedWallet = localStorage.getItem("itemtr_wallet_txns");

    setActiveListings(safeJSONParse(savedListings, initialListings));
    setWalletTxns(safeJSONParse(savedWallet, initialWalletTxns));

    const syncUserState = async () => {
      setIsLoading(true);
      try {
        const current = await getCurrentUser();
        if (!current) {
          navigate("/login");
          return;
        }

        setUserProfile({
          name: current.name,
          username: current.username,
          email: current.email,
          phone: current.phone,
          avatar: current.avatar,
          balance: current.balance,
          rating: current.rating,
          isVerified: current.isVerified,
        });

      // GERÇEK WALLET VERİLERİNİ ÇEK
      const [transactions, balance] = await Promise.all([
        getWalletTransactions(current.id),
        getUserBalance(current.id),
      ]);

      setUserProfile(prev => ({
        ...prev,
        balance: balance ?? prev.balance,
      }));

      // Wallet transactions formatla
      const formattedTxns = transactions.map((txn: any) => ({
        id: txn.id?.slice(0, 8).toUpperCase() || 'TXN' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: txn.type === "deposit" ? "Yükleme" : 
              txn.type === "withdraw" ? "Para Çekme" :
              txn.type === "purchase" ? "Satın Alım" :
              txn.type === "sale" ? "Satış" : "İşlem",
        amount: `${txn.amount >= 0 ? "+" : "-"}₺${Math.abs(txn.amount).toFixed(2)}`,
        date: new Date(txn.created_at).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
        }),
        color: txn.amount >= 0 ? "text-success" : "text-red-500",
      }));

      setWalletTxns(formattedTxns.length > 0 ? formattedTxns : initialWalletTxns);
      
      // Toplam kazancı hesapla
      const earnings = transactions
        .filter((t: any) => t.type === "sale" || t.type === "deposit")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      setTotalEarnings(earnings);
      
      // GERÇEK SİPARİŞLERİ ÇEK
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${current.id},seller_id.eq.${current.id}`)
        .order('created_at', { ascending: false });
        
      if (!ordersError && ordersData) {
        const formattedOrders = ordersData.map((order: any) => ({
          id: order.id?.slice(0, 8).toUpperCase() || 'ORD-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
          item: order.listing_id ? `İlan #${order.listing_id.slice(0, 4)}` : 'Ürün',
          status: order.status === 'completed' ? 'Teslim Edildi' : 
                  order.status === 'pending' ? 'Onay Bekliyor' : 'İşleniyor',
          amount: `₺${Number(order.total_amount).toFixed(2)}`,
        }));
        setRealOrders(formattedOrders);
        
        // Bekleyen sipariş sayısı
        const pending = ordersData.filter((o: any) => o.status === 'pending').length;
        setPendingOrders(pending);
      }
      
      // GERÇEK İLANLARI ÇEK
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', current.id)
        .eq('status', 'active');
        
      if (!listingsError && listingsData) {
        const formattedListings = listingsData.map((listing: any, index: number) => ({
          id: index + 1,
          title: listing.title,
          price: `₺${Number(listing.price).toFixed(2)}`,
          views: listing.views || 0,
          stock: listing.stock || 1,
          status: "Aktif" as const,
        }));
        setActiveListings(formattedListings.length > 0 ? formattedListings : initialListings);
      }
      
      setSupportTickets((await getSupportTicketsForCurrentUser()).map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        date: ticket.date,
        type: ticket.category,
      })));
      
      setLevelInfo(getLevelTier(current.levelState.xp));
      
      setMessagePreview(
        (await getVisibleConversations())
          .slice(0, 3)
          .map((conversation) => {
            const summary = getConversationSummary(conversation, current.username);
            return {
              id: conversation.id,
              user: summary.counterpart?.name || summary.title,
              text: summary.lastMessage,
              time: summary.time,
            };
          }),
      );
      } catch (err) {
        console.error("[Dashboard] syncUserState", err);
        toast.error("Panel verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    const onSync = () => {
      void syncUserState();
    };

    void syncUserState();
    window.addEventListener(AUTH_CHANGED_EVENT, onSync);
    window.addEventListener(MESSAGING_EVENT, onSync);
    window.addEventListener("storage", onSync);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onSync);
      window.removeEventListener(MESSAGING_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("itemtr_user_listings", JSON.stringify(activeListings));
  }, [activeListings]);

  useEffect(() => {
    localStorage.setItem("itemtr_wallet_txns", JSON.stringify(walletTxns));
  }, [walletTxns]);

  useEffect(() => {
    setActiveTab(getInitialTab(location));
  }, [location]);

  useEffect(() => {
    const raw = localStorage.getItem("itemtr_vitrin_package");
    setVitrinPackage(safeJSONParse<{ name: string; duration: string } | null>(raw, null));
  }, [activeTab]);

  useEffect(() => {
    seedNotifications();
    const syncNotifications = () => setPanelNotifications(getNotifications());
    syncNotifications();
    window.addEventListener("itemtr-notifications-updated", syncNotifications);
    return () => window.removeEventListener("itemtr-notifications-updated", syncNotifications);
  }, []);

  const markDashboardNotificationsRead = () => markAllNotificationsRead();

  const setTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`);
  };

  const saveProfile = async () => {
    const previous = await getCurrentUser();
    const updated = await updateCurrentUser((user) => ({
      ...user,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      avatar: userProfile.avatar,
    }));

    if (updated && previous) {
      if (!previous.phone && updated.phone) await rewardCurrentUser("phone_verified");
      // Add more rewards if needed
    }

    toast.success("Profil bilgileri kaydedildi.");
  };

  const resetProfile = async () => {
    const current = await getCurrentUser();
    if (!current) return;
    setUserProfile({
      name: current.name,
      username: current.username,
      email: current.email,
      phone: current.phone,
      avatar: current.avatar,
      balance: current.balance,
      rating: current.rating,
      isVerified: current.isVerified,
    });
    toast.success("Profil son kayıtlı değerlere döndürüldü.");
  };

  const verifyKyc = async () => {
    await updateCurrentUser((user) => ({ ...user, isVerified: true }));
    const reward = await rewardCurrentUser("identity_verified");
    setLevelInfo(getLevelTier(reward.user?.levelState.xp || levelInfo.currentXp));
    toast.success("Kimlik doğrulama adımı tamamlandı.", {
      description: reward.awardedXp > 0 ? `+${reward.awardedXp} TP kazandınız.` : undefined,
    });
  };

  const addBalance = async (amount: number) => {
    const wasZero = userProfile.balance <= 0;
    await updateCurrentUser((user) => ({ ...user, balance: user.balance + amount }));
    const reward = await rewardCurrentUser(wasZero ? "first_deposit" : "deposit");
    setLevelInfo(getLevelTier(reward.user?.levelState.xp || levelInfo.currentXp));
    setWalletTxns((prev) => [
      { id: `TXN${Date.now()}`, type: "Panel Yükleme", amount: `+₺${amount}`, date: "Bugün", color: "text-success" },
      ...prev,
    ]);
    toast.success("Bakiye güncellendi.", {
      description: reward.awardedXp > 0 ? `+${reward.awardedXp} TP kazandınız.` : undefined,
    });
  };

  const withdrawBalance = async () => {
    if (userProfile.balance < 100) {
      toast.error("Para çekmek için en az ₺100 bakiye gerekli.");
      return;
    }
    await updateCurrentUser((user) => ({ ...user, balance: user.balance - 100 }));
    setWalletTxns((prev) => [
      { id: `TXN${Date.now()}`, type: "Para Çekme", amount: "-₺100", date: "Bugün", color: "text-red-500" },
      ...prev,
    ]);
    toast.success("Para çekme talebi oluşturuldu.");
  };

  const deleteListing = (id: number) => {
    setActiveListings((prev) => prev.filter((item) => item.id !== id));
    toast.success("İlan kaldırıldı.");
  };

  const createSupportTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error("Lütfen konu ve mesaj alanlarını doldurun.");
      return;
    }

    const current = await getCurrentUser();
    if (!current) {
      toast.error("Önce giriş yapmalısınız.");
      return;
    }

    createSupportConversation({
      user: current,
      subject: ticketForm.subject,
      category: ticketForm.type,
      message: ticketForm.message,
    });
    
    setTicketForm({ subject: "", type: "Genel", message: "" });
    toast.success("Destek talebi oluşturuldu.");
  };

  const sidebarItems: Array<{ id: DashboardTab; icon: LucideIcon; label: string; badge?: string | number; status?: "verified" | "pending" }> = [
    { id: "overview", icon: LineChart, label: "GENEL BAKIŞ", badge: 3 },
    { id: "wallet", icon: CreditCard, label: "BAKİYE YÖNETİMİ" },
    { id: "kyc", icon: Shield, label: "KİMLİK DOĞRULAMA", status: userProfile.isVerified ? "verified" : "pending" },
    { id: "messages", icon: MessageSquare, label: "MESAJLARIM", badge: "Yeni" },
    { id: "cart", icon: ShoppingCart, label: "SEPETİM" },
    { id: "purchases", icon: Package, label: "SİPARİŞLERİM" },
    { id: "listings", icon: LineChart, label: "İLAN YÖNETİMİ" },
    { id: "sales", icon: History, label: "SATIŞLARIM" },
    { id: "favorites", icon: Heart, label: "FAVORİLERİM" },
    { id: "support", icon: LifeBuoy, label: "DESTEK SİSTEMİ" },
    { id: "security", icon: Shield, label: "HESAP GÜVENLİĞİ" },
    { id: "profile", icon: Settings, label: "HESAP İŞLEMLERİ" },
  ] as const;

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalListingViews = activeListings.reduce((sum, listing) => sum + listing.views, 0);
  const totalStock = activeListings.reduce((sum, listing) => sum + listing.stock, 0);
  const responseRate = supportTickets.length === 0 ? 100 : Math.round((supportTickets.filter((ticket) => ticket.status === "Cevaplandı").length / supportTickets.length) * 100);
  const completionRate = realOrders.length === 0 ? 100 : Math.round((realOrders.filter((order) => order.status === "Teslim Edildi").length / realOrders.length) * 100);
  const storeScore = Math.min(99, Math.round((userProfile.rating / 5) * 70 + responseRate * 0.15 + completionRate * 0.15));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="flex-1 container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-2 custom-scrollbar">
            <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl overflow-hidden p-6 text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <Avatar className="h-24 w-24 border-4 border-white/5 outline outline-4 outline-primary/10 outline-offset-4">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {userProfile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-500 border-4 border-card text-white shadow-xl shadow-blue-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{userProfile.name}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">@{userProfile.username}</p>
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <Badge className="bg-blue-500/15 text-blue-300 border-none rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">Seviye {levelInfo.level} • {levelInfo.title}</Badge>
                  {userProfile.isVerified && <Badge className="bg-success/15 text-success border-none rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">Onaylı</Badge>}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="text-center">
                  <p className="text-lg font-black text-white italic">₺{userProfile.balance.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Bakiye</p>
                </div>
                <div className="w-[1px] h-6 bg-white/5" />
                <div className="text-center">
                  <p className="text-lg font-black text-primary italic">{userProfile.rating}</p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Puan</p>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Seviye ilerlemesi</span>
                  <span className="text-white">%{levelInfo.progress}</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2 bg-white/5 rounded-full" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-60">{levelInfo.nextLevelXp ? `${levelInfo.remainingXp} TP ile bir üst seviye` : "Maksimum seviyedesin"}</p>
              </div>
              <Button variant="outline" onClick={() => setTab("profile")} className="w-full h-11 rounded-xl bg-white/5 border-white/5 text-white font-black uppercase text-[10px] tracking-widest italic hover:bg-white/10 transition-all">
                PROFİLİ GÖR
              </Button>
            </Card>

            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as DashboardTab)}
                  className={cn(
                    "flex items-center justify-between px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic group",
                    activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-white" : "text-primary opacity-60 group-hover:opacity-100")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-lg bg-red-500 font-black text-[9px] text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.status === "verified" && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Toplam Kazanç", value: `₺${totalEarnings.toLocaleString()}`, color: "text-success", icon: LineChart },
                    { label: "Bekleyen Sipariş", value: String(pendingOrders).padStart(2, "0"), color: "text-primary", icon: Package },
                    { label: "Yeni Mesaj", value: String(messagePreview.length).padStart(2, "0"), color: "text-blue-400", icon: MessageSquare },
                    { label: "Aktif İlan", value: String(activeListings.length), color: "text-orange-500", icon: Eye },
                  ].map((stat) => (
                    <Card key={stat.label} className="rounded-[2rem] bg-card border-white/5 p-6 hover:border-primary/30 transition-all shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <Badge className="bg-white/5 text-[9px] uppercase tracking-widest">Canlı</Badge>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
                      <h4 className="text-2xl font-black text-white italic tracking-tighter mt-1">{stat.value}</h4>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Mağaza Performansı</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">İtemTR.com mağaza sağlık göstergeleri</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      {[
                        { label: "Mağaza Skoru", value: storeScore, accent: "text-primary" },
                        { label: "Mesaj Yanıtlama", value: responseRate, accent: "text-blue-400" },
                        { label: "Sipariş Tamamlama", value: completionRate, accent: "text-success" },
                      ].map((row) => (
                        <div key={row.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{row.label}</span>
                            <span className={cn("text-sm font-black italic", row.accent)}>%{row.value}</span>
                          </div>
                          <Progress value={row.value} className="h-3 bg-white/5 rounded-full" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Hızlı İşlemler</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Vitrin, bakiye ve destek aksiyonları</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Yeni İlan Ekle", icon: Plus, action: () => navigate("/add-listing") },
                        { label: "Vitrin Yükselt", icon: Crown, action: () => navigate("/vitrin-al") },
                        { label: "Bakiye Yönet", icon: Wallet, action: () => setTab("wallet") },
                        { label: "Destek Talebi", icon: LifeBuoy, action: () => setTab("support") },
                      ].map((actionItem) => (
                        <Button key={actionItem.label} variant="outline" onClick={actionItem.action} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white justify-between font-black uppercase tracking-widest text-[10px]">
                          {actionItem.label}
                          <actionItem.icon className="h-4 w-4 text-primary" />
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                    <Wallet className="h-40 w-40 text-primary" />
                  </div>
                  <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Mevcut Bakiye</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-10 space-y-6">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter">₺{userProfile.balance.toLocaleString()}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button onClick={() => navigate("/deposit")} className="h-12 bg-primary text-white font-black italic tracking-widest uppercase text-xs rounded-xl shadow-xl shadow-primary/20 px-6">
                        BAKİYE YÜKLE
                      </Button>
                      <Button onClick={() => addBalance(250)} variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase text-xs italic">
                        PANELDEN +250
                      </Button>
                      <Button onClick={withdrawBalance} variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase text-xs italic">
                        PARA ÇEK
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">İşlem Geçmişi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5">
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground px-8">İŞLEM NO</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">TÜR</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">TARİH</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right px-8">TUTAR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {walletTxns.map((txn) => (
                          <TableRow key={txn.id} className="border-white/5">
                            <TableCell className="px-8 font-black text-xs text-white italic">{txn.id}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-white/5 text-[8px] font-black uppercase italic">{txn.type}</Badge>
                            </TableCell>
                            <TableCell className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{txn.date}</TableCell>
                            <TableCell className={cn("px-8 text-right font-black italic text-md", txn.color)}>{txn.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "messages" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Mesajlarım</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Son konuşmalarınız.</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/messages")} className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest">Tümünü Aç</Button>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {messagePreview.length > 0 ? messagePreview.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-white italic">{item.user}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.time}</span>
                    </div>
                  )) : (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-sm text-muted-foreground font-black uppercase tracking-widest opacity-40">Henüz aktif mesajınız yok.</div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "kyc" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                  <Shield className="h-40 w-40 text-blue-400" />
                </div>
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Kimlik Doğrulama</CardTitle>
                </CardHeader>
                <CardContent className="p-10 text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border-4 border-blue-500/20">
                    <Shield className={cn("h-10 w-10", userProfile.isVerified ? "text-success" : "text-blue-400")} />
                  </div>
                  <div className="max-w-sm mx-auto space-y-2">
                    <h4 className="text-lg font-black text-white uppercase italic">{userProfile.isVerified ? "Hesabınız Onaylı" : "Hesabınızı Doğrulayın"}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase opacity-60">
                      {userProfile.isVerified 
                        ? "Kimliğiniz başarıyla doğrulandı. Tüm marketplace özelliklerine tam erişiminiz var." 
                        : "Mağaza açabilmek ve limitleri artırmak için kimlik doğrulamanız gerekmektedir."}
                    </p>
                  </div>
                  {!userProfile.isVerified && (
                    <Button onClick={verifyKyc} className="bg-blue-500 text-white font-black italic tracking-widest uppercase text-xs rounded-xl h-12 px-10 shadow-xl shadow-blue-500/20">
                      DOĞRULAMAYI BAŞLAT
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "cart" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Sepetim</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">{cartItems.length} ÜRÜN BEKLİYOR</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">TOPLAM</p>
                    <p className="text-xl font-black text-primary italic">₺{cartTotal.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">ÜRÜN</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">SATICIA</TableHead>
                        <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">FİYAT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id} className="border-white/5">
                          <TableCell className="px-8 text-xs font-black text-white italic">{item.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.seller}</TableCell>
                          <TableCell className="px-8 text-right font-black italic text-md text-white">₺{item.price.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-8 border-t border-white/5">
                    <Button className="w-full h-14 bg-primary text-white font-black italic tracking-widest uppercase rounded-2xl shadow-2xl shadow-primary/20">ALIŞVERİŞİ TAMAMLA</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "support" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl xl:col-span-2">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Destek Taleplerim</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5">
                          <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">Talep No</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Konu</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Durum</TableHead>
                          <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supportTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="border-white/5">
                            <TableCell className="px-8 text-xs font-black text-white italic">{ticket.id}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{ticket.subject}</TableCell>
                            <TableCell>
                              <Badge className={cn("text-[8px] uppercase", ticket.status === "Cevaplandı" ? "bg-success/10 text-success" : "bg-orange-500/10 text-orange-500")}>
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                              <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 text-white text-[9px] font-black uppercase" onClick={() => navigate(`/messages?chat=${encodeURIComponent(ticket.id)}`)}>Çatı Gör</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Yeni Talep</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Konu</Label>
                      <Input value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className="bg-secondary h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Açıklama</Label>
                      <Textarea value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className="bg-secondary min-h-32" />
                    </div>
                    <Button onClick={createSupportTicket} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">Gönder</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "purchases" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Siparişlerim</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Satın aldığınız tüm ürünler.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">SİPARİŞ NO</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">ÜRÜN</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">DURUM</TableHead>
                        <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">TUTAR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realOrders.length > 0 ? realOrders.map((order) => (
                        <TableRow key={order.id} className="border-white/5">
                          <TableCell className="px-8 text-xs font-black text-white italic">{order.id}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{order.item}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[8px] uppercase", order.status === "Teslim Edildi" ? "bg-success/10 text-success" : "bg-orange-500/10 text-orange-500")}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-8 text-right font-black italic text-white">{order.amount}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Henüz siparişiniz bulunmuyor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "listings" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">İlan Yönetimi</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Aktif ve pasif ilanlarınız.</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/add-listing")} className="rounded-xl h-11 bg-primary text-white font-black italic tracking-widest uppercase text-[10px] px-6">YENİ İLAN EKLE</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">İLAN</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">DURUM</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">İSTATİSTİK</TableHead>
                        <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">FİYAT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeListings.map((listing) => (
                        <TableRow key={listing.id} className="border-white/5 group">
                          <TableCell className="px-8">
                            <div className="text-xs font-black text-white italic">{listing.title}</div>
                            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => navigate(`/product/${listing.id}`)} className="text-[9px] font-black text-primary hover:underline">GÖRÜNTÜLE</button>
                              <button onClick={() => navigate(`/edit-listing/${listing.id}`)} className="text-[9px] font-black text-blue-400 hover:underline">DÜZENLE</button>
                              <button onClick={() => deleteListing(listing.id)} className="text-[9px] font-black text-red-500 hover:underline">KALDIR</button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-success/10 text-success text-[8px] uppercase">{listing.status}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold text-[10px] text-muted-foreground">
                            <div className="flex items-center justify-center gap-4">
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.views}</span>
                              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {listing.stock}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 text-right font-black italic text-md text-white">₺{listing.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "sales" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Satışlarım</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Mağazanız üzerinden yapılan tüm satışlar.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">SATIŞ NO</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">ÜRÜN / ALICI</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">DURUM</TableHead>
                        <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">TUTAR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRows.map((sale) => (
                        <TableRow key={sale.id} className="border-white/5">
                          <TableCell className="px-8 text-xs font-black text-white italic">{sale.id}</TableCell>
                          <TableCell className="text-xs">
                            <div className="text-white font-bold">{sale.item}</div>
                            <div className="text-muted-foreground text-[10px] font-black uppercase opacity-60">{sale.buyer}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-success text-white text-[8px] uppercase">{sale.status}</Badge>
                          </TableCell>
                          <TableCell className="px-8 text-right font-black italic text-md text-white">{sale.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "favorites" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Favorilerim</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Kaydedilen ürünler.</CardDescription>
                  </div>
                  <Heart className="h-6 w-6 text-red-500" />
                </CardHeader>
                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group">
                      <div>
                        <h4 className="text-sm font-black text-white italic">{fav.title}</h4>
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60 mt-1">{fav.seller}</p>
                        <p className="text-sm font-black text-primary italic mt-2">{fav.price}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Hesap Güvenliği</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Giriş hareketleri ve güvenlik ayarları.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Şifre Değiştir</h4>
                      <div className="space-y-4">
                        <Input type="password" placeholder="Mevcut Şifre" className="bg-secondary h-12" />
                        <Input type="password" placeholder="Yeni Şifre" className="bg-secondary h-12" />
                        <Input type="password" placeholder="Yeni Şifre (Tekrar)" className="bg-secondary h-12" />
                        <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest">ŞİFREYİ GÜNCELLE</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Son Girişler</h4>
                      <div className="space-y-3">
                        {loginHistory.map((log) => (
                          <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-white italic">{log.ip}</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{log.device} • {log.date}</p>
                            </div>
                            <Badge className="bg-success/10 text-success text-[7px] uppercase">{log.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Profil Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-4 border-white/5">
                      <AvatarImage src={userProfile.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black">{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="h-10 rounded-xl bg-white/5 border-white/10 text-[10px] font-black uppercase">FOTORAF DEĞİŞTİR</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Ad Soyad</Label>
                      <Input value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} className="bg-secondary h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">E-posta</Label>
                      <Input value={userProfile.email} onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} className="bg-secondary h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Telefon</Label>
                      <Input value={userProfile.phone} onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })} className="bg-secondary h-12" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button onClick={saveProfile} className="flex-1 h-12 bg-primary text-white font-black italic tracking-widest rounded-xl shadow-xl shadow-primary/20 uppercase">KAYDET</Button>
                    <Button onClick={resetProfile} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase text-xs italic tracking-widest">SIFIRLA</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
