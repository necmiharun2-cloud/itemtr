import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Search,
  ShieldCheck,
  CreditCard,
  Settings,
  Megaphone,
  Plus,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  MoreVertical,
  LifeBuoy,
  UserX,
  MessageSquare,
  Filter,
  Download,
  Wallet,
  Receipt,
  BellRing,
  Globe,
  RefreshCw,
  FileText,
  Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn, safeJSONParse } from "@/lib/utils";
import { generateBotListing, getBotStats, clearBotHistory, getBotNamePoolStats, bulkUpdateBotImages, undoBotImageUpdate, updateKocucePvpCache } from "@/lib/bot-engine";
import { processKocuceHTML, sanitizeContent, getKocucePvpPool } from "@/lib/rss-service";
import { getCurrentUser } from "@/lib/auth";
import { getAllSupportTickets, getConversations, MESSAGING_EVENT, sendConversationMessage, type Conversation } from "@/lib/messaging";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Pending" | "Bot" | "Banned";
  role: string;
  balance: string;
  joined: string;
};

type AdminTicket = {
  id: string;
  conversationId?: string;
  user: string;
  subject: string;
  status: "Beklemede" | "Cevaplandı";
  date: string;
  category?: string;
};

type Announcement = {
  id: number;
  title: string;
  date: string;
  status: "Yayında" | "Pasif";
};

const initialUsers: AdminUser[] = [
  { id: 1, name: "Mert Gezer", email: "mert@itemtr.com", status: "Active", role: "Admin", balance: "1250", joined: "25 Mar 2024" },
  { id: 2, name: "IlkanShop", email: "ilkan@shop.com", status: "Active", role: "Mağaza", balance: "4500", joined: "10 Feb 2024" },
  { id: 3, name: "MarcusStore", email: "marcus@mail.com", status: "Pending", role: "Mağaza", balance: "850", joined: "15 Mar 2024" },
  { id: 4, name: "Bot_Gamer_01", email: "bot1@itemtr.com", status: "Bot", role: "User", balance: "0", joined: "01 Jan 2024" },
];

const initialTickets: AdminTicket[] = [
  { id: "T-1021", user: "Gamer34", subject: "Bakiye yükleme sorunu", status: "Beklemede", date: "Bugün 14:20", category: "Finans" },
  { id: "T-1019", user: "ProSatici", subject: "İlan onaylanmadı", status: "Cevaplandı", date: "Dün 10:45", category: "İlan" },
];

const initialAnnouncements: Announcement[] = [
  { id: 1, title: "Yeni Ödeme Yöntemi Eklendi!", date: "30 Mar 2026", status: "Yayında" },
  { id: 2, title: "Ramazan Bayramı Kampanyası", date: "15 Mar 2026", status: "Pasif" },
];

const financeRows = [
  { id: "F-9021", title: "Mağaza bakiyesi yükleme", amount: "+₺12.500", status: "Tamamlandı" },
  { id: "F-9019", title: "Para çekme talebi", amount: "-₺4.250", status: "İnceleniyor" },
  { id: "F-9010", title: "Komisyon geliri", amount: "+₺2.140", status: "Tamamlandı" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [botStats, setBotStats] = useState(getBotStats());
  const [botNamePoolStats, setBotNamePoolStats] = useState(getBotNamePoolStats());
  const [isBotActive, setIsBotActive] = useState(() => {
    const saved = localStorage.getItem("itemtr_bot_enabled");
    if (saved === null) {
      localStorage.setItem("itemtr_bot_enabled", "true");
      return true;
    }
    return saved === "true";
  });
  
  // Supabase real data states
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [kycPending, setKycPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [supportTickets, setSupportTickets] = useState<AdminTicket[]>(initialTickets);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [userSearch, setUserSearch] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [botInterval, setBotInterval] = useState(localStorage.getItem("itemtr_bot_interval") || "45");
  const [botMinPrice, setBotMinPrice] = useState(localStorage.getItem("itemtr_bot_min_price") || "10");
  const [botMaxPrice, setBotMaxPrice] = useState(localStorage.getItem("itemtr_bot_max_price") || "2000");
  const [botCategory, setBotCategory] = useState(localStorage.getItem("itemtr_bot_category") || "all");
  const [botTags, setBotTags] = useState(localStorage.getItem("itemtr_bot_tags") || "Güvenilir, Hızlı Teslimat");
  const [autoReviews, setAutoReviews] = useState(localStorage.getItem("itemtr_bot_auto_reviews") !== "false");
  const [autoTags, setAutoTags] = useState(localStorage.getItem("itemtr_bot_auto_tags") !== "false");
  const [botCustomImage, setBotCustomImage] = useState(localStorage.getItem("itemtr_bot_custom_image") || "");
  const [bulkUpdateUrl, setBulkUpdateUrl] = useState("");
  const [kocuceHtml, setKocuceHtml] = useState("");
  const [importedKocuceCount, setImportedKocuceCount] = useState(() => {
    const cached = localStorage.getItem("itemtr_kocuce_cache");
    if (cached) return JSON.parse(cached).length;
    return getKocucePvpPool().length;
  });
  const [selectedSupportConversationId, setSelectedSupportConversationId] = useState("");
  const [supportReply, setSupportReply] = useState("");
  const [supportConversation, setSupportConversation] = useState<Conversation | null>(null);

  // Fetch real data from Supabase
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersData) setRealUsers(usersData);

      // Fetch listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*, profiles:seller_id(username)')
        .order('created_at', { ascending: false });
      if (listingsData) setListings(listingsData);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData);

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (paymentsData) setPayments(paymentsData);

      // Fetch pending KYC
      const { data: kycData } = await supabase
        .from('kyc_verifications')
        .select('*, profiles:user_id(username, email)')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });
      if (kycData) setKycPending(kycData);

    } catch (error) {
      console.error('[Admin] Error fetching data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Role check
    const checkAdmin = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser?.role !== "admin") {
        toast.error("Bu sayfaya erişim yetkiniz yok.");
        navigate("/");
        return;
      }
      // Fetch real data from Supabase
      await fetchAdminData();
    };
    
    checkAdmin();

    const savedUsers = localStorage.getItem("itemtr_admin_users");
    const savedAnnouncements = localStorage.getItem("itemtr_admin_announcements");

    setUsers(safeJSONParse(savedUsers, initialUsers));
    setAnnouncements(safeJSONParse(savedAnnouncements, initialAnnouncements));

    const syncSupport = () => {
      const tickets = getAllSupportTickets().map((ticket) => ({
        id: ticket.id,
        conversationId: ticket.conversationId,
        user: ticket.user,
        subject: ticket.subject,
        status: ticket.status,
        date: ticket.date,
        category: ticket.category,
      }));
      setSupportTickets(tickets.length > 0 ? tickets : initialTickets);
      setSelectedSupportConversationId((prev) => prev || tickets[0]?.conversationId || "");
    };

    syncSupport();

    const interval = setInterval(() => {
      setBotStats(getBotStats());
    }, 5000);

    const handleUpdate = () => {
      setBotStats(getBotStats());
      setBotNamePoolStats(getBotNamePoolStats());
    };
    window.addEventListener("itemtr-marketplace-updated", handleUpdate);
    window.addEventListener(MESSAGING_EVENT, syncSupport);

    return () => {
      clearInterval(interval);
      window.removeEventListener("itemtr-marketplace-updated", handleUpdate);
      window.removeEventListener(MESSAGING_EVENT, syncSupport);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("itemtr_admin_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("itemtr_admin_announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (!selectedSupportConversationId) {
      setSupportConversation(null);
      return;
    }

    const match = getConversations().find((conversation) => conversation.id === selectedSupportConversationId) || null;
    setSupportConversation(match);
  }, [selectedSupportConversationId, supportTickets]);
  const toggleBot = () => {
    const newState = !isBotActive;
    setIsBotActive(newState);
    localStorage.setItem("itemtr_bot_enabled", newState.toString());
    toast.success(newState ? "İlan botu aktif edildi." : "İlan botu durduruldu.");
  };

  const handleClearBots = () => {
    clearBotHistory();
    setBotStats(getBotStats());
    setBotNamePoolStats(getBotNamePoolStats());
    toast.success("Bot geçmişi temizlendi.");
  };

  const handleSaveBotSettings = () => {
    localStorage.setItem("itemtr_bot_min_price", botMinPrice);
    localStorage.setItem("itemtr_bot_max_price", botMaxPrice);
    localStorage.setItem("itemtr_bot_category", botCategory);
    localStorage.setItem("itemtr_bot_tags", botTags);
    localStorage.setItem("itemtr_bot_auto_reviews", autoReviews.toString());
    localStorage.setItem("itemtr_bot_auto_tags", autoTags.toString());
    localStorage.setItem("itemtr_bot_interval", botInterval);
    localStorage.setItem("itemtr_bot_custom_image", botCustomImage);
    toast.success("Bot ayarları kaydedildi.");
  };

  const createBotListingNow = () => {
    generateBotListing();
    setBotStats(getBotStats());
    setBotNamePoolStats(getBotNamePoolStats());
    toast.success("Bot ilanı üretildi.");
  };

  const filteredUsers = useMemo(() => {
    const needle = userSearch.toLowerCase();
    return users.filter(
      (user) => user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle) || String(user.id).includes(needle)
    );
  }, [users, userSearch]);

  const toggleUserStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Banned" ? "Active" : "Banned" }
          : user
      )
    );
    toast.success("Kullanıcı durumu güncellendi.");
  };

  const replyTicket = (conversationId?: string) => {
    if (!conversationId) return;
    setSelectedSupportConversationId(conversationId);
    setActiveTab("support");
  };

  const handleSendSupportReply = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || !supportConversation || !supportReply.trim()) {
      toast.error("Lütfen yanıt mesajı girin.");
      return;
    }

    sendConversationMessage(supportConversation.id, {
      id: currentUser.username,
      name: currentUser.name,
      role: "admin",
      avatar: currentUser.avatar,
    }, supportReply);
    setSupportReply("");
    const updatedConversation = getConversations().find((conversation) => conversation.id === supportConversation.id) || null;
    setSupportConversation(updatedConversation);
    toast.success("Destek mesajı gönderildi.");
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) {
      toast.error("Lütfen duyuru başlığı girin.");
      return;
    }
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        title: newAnnouncement.trim(),
        date: "31 Mar 2026",
        status: "Yayında",
      },
      ...prev,
    ]);
    setNewAnnouncement("");
    toast.success("Duyuru eklendi.");
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    toast.success("Duyuru kaldırıldı.");
  };

  const exportAdminReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      activeTab,
      users,
      supportTickets,
      announcements,
      botStats,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "itemtr-admin-raporu.json";
    anchor.click();
    URL.revokeObjectURL(url);
    URL.revokeObjectURL(url);
    toast.success("Rapor indirildi.");
  };
  
  const handleProcessKocuce = () => {
    if (!kocuceHtml.trim()) {
      toast.error("Lütfen Kocuce sayfa içeriğini (HTML) yapıştırın.");
      return;
    }
    
    try {
      const items = processKocuceHTML(kocuceHtml);
      if (items.length === 0) {
        toast.warning("Son 1 yıla ait uygun PVP sunucusu bulunamadı.");
        return;
      }
      
      updateKocucePvpCache(items);
      setImportedKocuceCount(items.length);
      setKocuceHtml("");
      toast.success(`${items.length} adet PVP sunucusu (Son 1 yıl) başarıyla içe aktarıldı ve İtemTR.com olarak güncellendi.`);
    } catch (error) {
      console.error(error);
      toast.error("İçerik işlenirken bir hata oluştu. Lütfen forum listesini kopyaladığınızdan emin olun.");
    }
  };

  const handleLoadSampleKocuce = () => {
    const sampleItems = getKocucePvpPool();
    updateKocucePvpCache(sampleItems);
    setImportedKocuceCount(sampleItems.length);
    toast.success("Örnek PVP sunucu listesi başarıyla yüklendi!");
  };

  // Admin yönetim fonksiyonları
  const approveListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', listingId);
      
      if (error) throw error;
      toast.success("İlan onaylandı ve yayına alındı.");
      fetchAdminData(); // Listeyi yenile
    } catch (error) {
      toast.error("İlan onaylanırken hata oluştu.");
    }
  };

  const rejectListing = async (listingId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() })
        .eq('id', listingId);
      
      if (error) throw error;
      toast.success("İlan reddedildi.");
      fetchAdminData();
    } catch (error) {
      toast.error("İlan reddedilirken hata oluştu.");
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned', ban_reason: reason, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success("Kullanıcı yasaklandı.");
      fetchAdminData();
    } catch (error) {
      toast.error("Kullanıcı yasaklanırken hata oluştu.");
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', ban_reason: null, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success("Kullanıcı yasağı kaldırıldı.");
      fetchAdminData();
    } catch (error) {
      toast.error("Yasak kaldırılırken hata oluştu.");
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', listingId);
      
      if (error) throw error;
      toast.success("İlan silindi.");
      fetchAdminData();
    } catch (error) {
      toast.error("İlan silinirken hata oluştu.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150">
              <ShieldCheck className="h-40 w-40 text-primary" />
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20 scale-110">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Admin <span className="text-primary not-italic">Paneli</span>
                </h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> SİSTEM ÇALIŞIYOR • 31 MART 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setActiveTab("overview")} className="rounded-xl border-white/10 bg-white/5 text-white font-black italic tracking-widest uppercase text-[10px] h-11 px-6">
                LOGLARI GÖR
              </Button>
              <Button onClick={exportAdminReport} className="rounded-xl bg-primary text-white font-black italic tracking-widest uppercase text-[10px] h-11 px-8 shadow-xl shadow-primary/20 gap-2">
                <Download className="h-4 w-4" /> RAPOR AL
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-card w-full h-auto p-2 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-6 gap-2">
              {[
                { id: "overview", icon: TrendingUp, label: "ÖZET" },
                { id: "users", icon: Users, label: "KULLANICILAR" },
                { id: "bot", icon: Zap, label: "İLAN BOTU" },
                { id: "rssbot", icon: Globe, label: "RSS BOT" },
                { id: "support", icon: LifeBuoy, label: "DESTEK" },
                { id: "content", icon: LayoutGrid, label: "İÇERİK" },
                { id: "finance", icon: CreditCard, label: "FİNANS" },
              ].map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex flex-col py-4 rounded-xl gap-2 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white transition-all italic"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Toplam Satış (30D)", value: "₺248.420", trend: "+12.4%", up: true, color: "text-success", icon: TrendingUp },
                  { label: "Aktif Kullanıcı", value: String(users.filter((u) => u.status === "Active").length), trend: "+5.1%", up: true, color: "text-blue-400", icon: Users },
                  { label: "Bekleyen Talepler", value: String(supportTickets.filter((t) => t.status === "Beklemede").length), trend: "-2", up: false, color: "text-orange-500", icon: LifeBuoy },
                  { label: "Bot Kapasitesi", value: `${botStats.todayListings}`, trend: "Normal", up: true, color: "text-primary", icon: Zap },
                ].map((stat) => (
                  <Card key={stat.label} className="rounded-[2rem] bg-card border-white/5 p-6 hover:border-primary/30 transition-all shadow-2xl group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest italic px-2 py-1 rounded-lg bg-white/5", stat.up ? "text-success" : "text-red-500")}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter mt-1">{stat.value}</h4>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Son Etkinlikler</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {[
                      { text: "MertG_ kullanıcısı ₺500 bakiye yükledi.", time: "Bugün 14:20", icon: ArrowUpRight, color: "text-success" },
                      { text: "Yeni bir Valorant hesabı ilanı onay bekliyor.", time: "Bugün 13:45", icon: AlertCircle, color: "text-orange-500" },
                      { text: "Sistem yedeklemesi başarıyla tamamlandı.", time: "Dün 23:15", icon: CheckCircle2, color: "text-blue-400" },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", log.color)}>
                          <log.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white leading-relaxed">{log.text}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Bot Performansı</CardTitle>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Günlük Üretim</span>
                        <span className="text-sm font-black text-white italic">{botStats.todayListings} ilan</span>
                      </div>
                      <Progress value={Math.min(botStats.todayListings * 10, 100)} className="h-3 bg-white/5 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Toplam Bot İlanı</p>
                        <p className="text-2xl font-black text-white italic mt-2">{botStats.totalListings}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Son Çalışma</p>
                        <p className="text-sm font-black text-white italic mt-2">{botStats.lastUpdate || "Henüz yok"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Aktif Kullanıcı", value: String(users.filter((u) => u.status === "Active").length), color: "text-success", icon: Users },
                  { label: "Bot Hesap", value: String(users.filter((u) => u.status === "Bot").length), color: "text-primary", icon: Zap },
                  { label: "Askıda KYC", value: String(users.filter((u) => u.status === "Pending").length), color: "text-orange-500", icon: AlertCircle },
                  { label: "Riskli Hesap", value: String(users.filter((u) => u.status === "Banned").length), color: "text-red-500", icon: UserX },
                ].map((card) => (
                  <Card key={card.label} className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardContent className="p-6 space-y-4">
                      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", card.color)}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{card.label}</p>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter">{card.value}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between gap-4">
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Kullanıcı adı, e-posta veya ID..." className="pl-12 bg-white/5 border-white/5 rounded-xl text-xs h-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl bg-white/5 border-white/5 text-[10px] font-black uppercase h-11 px-6">
                      <Filter className="h-4 w-4 mr-2" /> FİLTRELE
                    </Button>
                    <Button className="rounded-xl bg-primary text-white font-black text-[10px] tracking-widest uppercase h-11 px-8">
                      <Plus className="h-4 w-4 mr-2" /> EKLE
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground px-8">KULLANICI</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">ROL / YETKİ</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">BAKİYE</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">DURUM</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">TARİH</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right px-8">İŞLEMLER</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.01]">
                          <TableCell className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-black text-white italic uppercase tracking-tighter">{u.name}</p>
                                <p className="text-[10px] font-bold text-muted-foreground truncate w-32 lowercase">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[9px] font-black italic uppercase", u.role === "Admin" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-black text-xs text-white italic">₺{u.balance}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", u.status === "Active" ? "bg-success" : u.status === "Bot" ? "bg-primary" : u.status === "Banned" ? "bg-red-500" : "bg-orange-500")} />
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", u.status === "Active" ? "text-success" : u.status === "Bot" ? "text-primary" : u.status === "Banned" ? "text-red-500" : "text-orange-500")}>
                                {u.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{u.joined}</TableCell>
                          <TableCell className="px-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => toast.success(`${u.name} profili görüntülendi.`)} className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => toggleUserStatus(u.id)} className="h-9 w-9 rounded-xl hover:bg-red-500/20 hover:text-red-500">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rssbot" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                  <Card className="rounded-[2.5rem] bg-card border-white/5 overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 border-b border-white/5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">PVP Data Import (Kocuce)</CardTitle>
                          <CardDescription className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">
                            Kocuce.com forum verilerini sisteme aktarın ve temizleyin.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Nasıl Kullanılır?</h4>
                        </div>
                        <ul className="space-y-2 text-[11px] text-muted-foreground font-bold uppercase tracking-tight opacity-80">
                          <li>1. Kocuce.com PVP Server Tanıtımları sayfasını açın.</li>
                          <li>2. Sayfa kaynağını (HTML) kopyalayın veya liste alanını seçin.</li>
                          <li>3. Aşağıdaki kutuya yapıştırın ve "İşle" butonuna basın.</li>
                          <li className="text-primary">• SİSTEM OTOMATİK OLARAK "KOCUCE" KELİMELERİNİ "İTEMTR.COM" YAPAR.</li>
                          <li className="text-primary">• SON 1 YIL (2025-2026) DIŞINDAKİ İLANLAR ELENİR.</li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HTML İÇERİĞİ VEYA LİSTE METNİ</Label>
                        <Textarea 
                          value={kocuceHtml} 
                          onChange={(e) => setKocuceHtml(e.target.value)}
                          placeholder="HTML kodlarını buraya yapıştırın..." 
                          className="bg-secondary/50 border-white/5 rounded-3xl min-h-[300px] text-[11px] font-mono p-6 focus:border-primary/50 transition-all" 
                        />
                      </div>

                      <Button 
                        onClick={handleProcessKocuce}
                        className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black italic tracking-widest uppercase text-xs shadow-xl shadow-primary/20 gap-3 group"
                      >
                        <RefreshCw className="h-5 w-5 group-active:rotate-180 transition-transform duration-500" />
                        VERİLERİ AYIKLA REPLASE ET VE AKTAR
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                  <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">İçe Aktarma Özeti</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-success/5 border border-success/10 text-center">
                        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                          <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">{importedKocuceCount}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Aktif PVP İlan Havuzu</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase">FİLTRE:</span>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black italic uppercase">SON 1 YIL</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase">SANSÜR:</span>
                          <Badge className="bg-success/20 text-success border-success/30 text-[9px] font-black italic uppercase">AKTİF</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase">MODERNİZASYON:</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] font-black italic uppercase">UYGULANIYOR</Badge>
                        </div>
                        
                        <Button 
                          onClick={handleLoadSampleKocuce}
                          variant="outline"
                          className="w-full h-12 mt-4 rounded-2xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border-dashed"
                        >
                          Örnek Verileri Yükle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bot" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                  <Card className="rounded-[3rem] bg-card border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-12 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="space-y-6 text-center md:text-left">
                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Bota Yetki Modu</span>
                          </div>
                          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            İlan Üretim <br />
                            <span className="text-primary not-italic">Motoru</span>
                          </h2>
                          <p className="text-sm font-medium text-muted-foreground max-w-md leading-relaxed uppercase opacity-60">
                            Sistem çalışıyor. İlanlar otomatik oluşturuluyor ve SEO verileriyle sisteme aktarılıyor.
                          </p>
                        </div>

                        <div className="relative group">
                          <div className={cn("absolute inset-0 rounded-full blur-[40px] opacity-20 transition-all duration-1000", isBotActive ? "bg-success scale-150 animate-pulse" : "bg-red-500")} />
                          <button
                            onClick={toggleBot}
                            className={cn(
                              "w-32 h-32 rounded-full border-8 border-white/5 shadow-2xl relative z-10 flex items-center justify-center transition-all active:scale-90",
                              isBotActive ? "bg-success text-white shadow-success/40" : "bg-red-500 text-white shadow-red-500/40"
                            )}
                          >
                            <Zap className="h-10 w-10" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Bot Ayarları</CardTitle>
                        <CardDescription className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                          Üretim aralığı, fiyat ve kategori limitleri.
                        </CardDescription>
                      </div>
                      <Button onClick={createBotListingNow} variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        <Plus className="h-4 w-4 mr-2" /> Şimdi Üret
                      </Button>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aralık (sn)</Label>
                        <Input value={botInterval} onChange={(e) => setBotInterval(e.target.value)} className="bg-secondary border-none rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori</Label>
                        <Input value={botCategory} onChange={(e) => setBotCategory(e.target.value)} className="bg-secondary border-none rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Fiyat</Label>
                        <Input value={botMinPrice} onChange={(e) => setBotMinPrice(e.target.value)} className="bg-secondary border-none rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Fiyat</Label>
                        <Input value={botMaxPrice} onChange={(e) => setBotMaxPrice(e.target.value)} className="bg-secondary border-none rounded-xl h-12" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etiketler</Label>
                        <Textarea value={botTags} onChange={(e) => setBotTags(e.target.value)} className="bg-secondary border-none rounded-2xl min-h-28" />
                      </div>
                      <div className="space-y-4 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Özel İlan Görseli (Yükle)</Label>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-3">
                            <Input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setBotCustomImage(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="bg-secondary border-none rounded-xl h-12 flex-1 pt-3.5" 
                            />
                            {botCustomImage && (
                              <Button 
                                variant="outline" 
                                onClick={() => setBotCustomImage("")}
                                className="rounded-xl h-12 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                Kaldır
                              </Button>
                            )}
                          </div>
                          {botCustomImage && (
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
                              <img src={botCustomImage} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-1 uppercase font-bold opacity-60">Boş bırakırsanız varsayılan İtemTR.com logosu kullanılır.</p>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-xs font-black text-white italic uppercase">Otomatik Yorum</span>
                        <Button variant="outline" onClick={() => setAutoReviews((prev) => !prev)} className="rounded-xl bg-white/5 border-white/10 text-white text-[10px] font-black uppercase">
                          {autoReviews ? "Açık" : "Kapalı"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-xs font-black text-white italic uppercase">Otomatik Etiket</span>
                        <Button variant="outline" onClick={() => setAutoTags((prev) => !prev)} className="rounded-xl bg-white/5 border-white/10 text-white text-[10px] font-black uppercase">
                          {autoTags ? "Açık" : "Kapalı"}
                        </Button>
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <Button onClick={handleSaveBotSettings} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                          Ayarları Kaydet
                        </Button>
                        <Button onClick={handleClearBots} variant="outline" className="flex-1 h-12 rounded-2xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px]">
                          Bot Geçmişini Temizle
                        </Button>
                      </div>

                      <div className="md:col-span-2 mt-4 pt-6 border-t border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-primary" />
                          <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Toplu İşlemler</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">TÜM MEVCUT İLANLARIN RESMİNİ DEĞİŞTİR</Label>
                             <div className="flex gap-3">
                                <Input 
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setBulkUpdateUrl(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="bg-secondary border-none rounded-xl h-12 flex-1 pt-3.5" 
                                />
                                <Button 
                                  onClick={() => {
                                    if (!bulkUpdateUrl) return toast.error("Lütfen bir resim dosyası seçin.");
                                    const success = bulkUpdateBotImages(bulkUpdateUrl);
                                    if (success) {
                                      setBotCustomImage("");
                                      localStorage.removeItem("itemtr_bot_custom_image");
                                      setBulkUpdateUrl("");
                                      toast.success("Tüm ilan resimleri güncellendi!");
                                    } else {
                                      toast.error("Güncellenecek ilan bulunamadı.");
                                    }
                                  }}
                                  className="rounded-xl h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                >
                                  TÜMÜNÜ GÜNCELLE
                                </Button>
                             </div>
                             {bulkUpdateUrl && (
                                <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                   <img src={bulkUpdateUrl} alt="Bulk preview" className="w-full h-full object-cover" />
                                </div>
                             )}
                          </div>
                          
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Hatalı İşlem Mi Yaptınız?</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60">Son yaptığınız toplu güncellemeyi tek tıkla geri alabilirsiniz.</p>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                const success = undoBotImageUpdate();
                                if (success) toast.success("İşlem geri alındı, eski resimler yüklendi!");
                                else toast.error("Geri alınacak kayıt bulunamadı.");
                              }}
                              className="rounded-xl h-10 px-6 border-red-500/50 text-red-500 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white"
                            >
                              GERİ AL
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Bot İsim Havuzu", value: `${botNamePoolStats.usedNames}/${botNamePoolStats.totalNames}`, desc: `${botNamePoolStats.remainingNames} farklı isim hazır durumda`, color: "text-primary" },
                      { title: "Görsel Kuralı", value: "AKTİF", desc: "Bot ilanları itemTR.com logo görseli ile yayınlanır", color: "text-success" },
                      { title: "Satış Kilidi", value: "PASİF", desc: "Bot ilanları artık satın alınabilir", color: "text-red-400" },
                    ].map((card) => (
                      <Card key={card.title} className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                        <CardContent className="p-6 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{card.title}</p>
                          <div className={cn("text-2xl font-black italic tracking-tighter", card.color)}>{card.value}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Canlı İstatistik</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Günlük Kota</span>
                          <span className="text-sm font-black text-white italic">{botStats.todayListings}/100</span>
                        </div>
                        <Progress value={Math.min(botStats.todayListings, 100)} className="h-3 bg-white/5 rounded-full" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <BellRing className="h-5 w-5 text-primary" />
                            <p className="text-xs font-black text-white italic uppercase">Bugün Eklenen</p>
                          </div>
                          <span className="text-xl font-black text-white italic">{botStats.todayListings}</span>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <p className="text-xs font-black text-white italic uppercase">Toplam Bot İlanı</p>
                          </div>
                          <span className="text-xl font-black text-white italic">{botStats.totalListings}</span>
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Sistem Uyarısı</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-black uppercase opacity-60">
                          Bot ilanları SEO için optimize edilmiştir ancak sunucu yükünü artırabilir. Aralığı 2 saniyenin altında tutmayın.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl xl:col-span-3">
                  <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Destek Yönetimi</CardTitle>
                      <CardDescription className="text-[10px] font-black text-muted-foreground uppercase mt-1">Gelen destek taleplerini yanıtlayın ve yönetin.</CardDescription>
                    </div>
                    <Badge className="bg-red-500 text-white font-black italic uppercase text-[10px] animate-pulse">
                      {supportTickets.filter((ticket) => ticket.status === "Beklemede").length} YENİ TALEP
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5">
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground px-8">TALEP</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">KULLANICI</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">KONU</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">DURUM</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground">TARİH</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right px-8">CEVAPLA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supportTickets.map((t) => (
                          <TableRow key={t.id} className={cn("border-white/5 cursor-pointer", selectedSupportConversationId === t.conversationId && "bg-primary/5")} onClick={() => replyTicket(t.conversationId)}>
                            <TableCell className="px-8 font-black text-xs text-white italic">{t.id}</TableCell>
                            <TableCell className="font-bold text-xs text-white">{t.user}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-medium">
                              <div>{t.subject}</div>
                              {t.category && <div className="text-[9px] uppercase tracking-widest opacity-60 mt-1">{t.category}</div>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", t.status === "Cevaplandı" ? "bg-success" : "bg-orange-500")} />
                                <span className={cn("text-[10px] font-black uppercase italic tracking-widest", t.status === "Cevaplandı" ? "text-success" : "text-orange-500")}>{t.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{t.date}</TableCell>
                            <TableCell className="px-8 text-right">
                              <Button variant="ghost" size="icon" onClick={() => replyTicket(t.conversationId)} className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl xl:col-span-2">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Canlı Yanıt</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">
                      {supportConversation ? `${supportConversation.subject} • ${supportConversation.status}` : "Yanıtlamak için soldan bir talep seçin."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {supportConversation ? (
                      <>
                        <ScrollArea className="h-[360px] rounded-3xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="space-y-4">
                            {supportConversation.messages.map((message) => {
                              const isAdmin = message.senderRole === "admin" || message.senderRole === "support";
                              return (
                                <div key={message.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                                  <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", isAdmin ? "bg-primary text-white" : "bg-white/5 border border-white/5 text-muted-foreground")}>
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{message.senderName}</div>
                                    <p>{message.text}</p>
                                    <div className="mt-2 text-[10px] uppercase tracking-widest opacity-60">{new Date(message.createdAt).toLocaleString("tr-TR")}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yanıt Mesajı</Label>
                          <Textarea value={supportReply} onChange={(e) => setSupportReply(e.target.value)} className="bg-white/5 border-white/5 rounded-3xl min-h-32" placeholder="Kullanıcıya yanıt yazın..." />
                          <Button onClick={handleSendSupportReply} className="w-full rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest">
                            Yanıt Gönder
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-sm text-muted-foreground">Henüz seçili bir destek görüşmesi yok.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Site Duyuruları</CardTitle>
                    <Button variant="ghost" size="icon" onClick={addAnnouncement} className="rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-3">
                      <Input value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="Yeni duyuru başlığı..." className="bg-white/5 border-white/5 rounded-xl h-12" />
                      <Button onClick={addAnnouncement} className="rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest">
                        Ekle
                      </Button>
                    </div>
                    {announcements.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                          <Megaphone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs font-black text-white italic uppercase">{a.title}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 opacity-60">{a.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[8px] font-black uppercase italic", a.status === "Yayında" ? "bg-success/10 text-success" : "bg-white/5 text-muted-foreground")}>{a.status}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(a.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Kategori Yönetimi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-6">Aktif Kategoriler (12)</p>
                    <div className="flex flex-wrap gap-3">
                      {["CS2", "Valorant", "Roblox", "LoL", "Steam", "Knight", "Metin2", "Pubg", "Oyun Parası"].map((cat) => (
                        <div key={cat} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white uppercase italic tracking-widest flex items-center gap-2 hover:bg-primary hover:border-primary transition-all cursor-pointer">
                          {cat} <Settings className="h-3 w-3 opacity-30" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Günlük Hacim", value: "₺84.320", icon: Wallet, color: "text-success" },
                  { title: "Komisyon Geliri", value: "₺12.840", icon: Receipt, color: "text-primary" },
                  { title: "Bekleyen Çekim", value: "₺4.250", icon: CreditCard, color: "text-orange-500" },
                ].map((card) => (
                  <Card key={card.title} className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                    <CardContent className="p-6 space-y-4">
                      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", card.color)}>
                        <card.icon className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{card.title}</p>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter">{card.value}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="rounded-[2rem] bg-card border-white/5 shadow-2xl">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Finans Hareketleri</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase text-muted-foreground">KOD</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Açıklama</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Durum</TableHead>
                        <TableHead className="px-8 text-right text-[10px] font-black uppercase text-muted-foreground">Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financeRows.map((row) => (
                        <TableRow key={row.id} className="border-white/5">
                          <TableCell className="px-8 text-xs font-black text-white italic">{row.id}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.title}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[8px] uppercase", row.status === "Tamamlandı" ? "bg-success/10 text-success" : "bg-orange-500/10 text-orange-500")}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-8 text-right text-xs font-black text-white italic">{row.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
