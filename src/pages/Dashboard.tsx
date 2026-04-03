import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, User2, ShieldCheck, MessageSquare, LifeBuoy, Star, ExternalLink, LogOut, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AUTH_CHANGED_EVENT, getCurrentLevelInfo, getCurrentUser, logoutUser, updateCurrentUser } from "@/lib/auth";
import { createSupportConversation, getSupportTicketsForCurrentUser, type SupportTicketView } from "@/lib/messaging";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicketView[]>([]);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", about: "" });
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "Genel", message: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);

  const syncDashboard = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    const [currentTickets, currentLevel] = await Promise.all([
      getSupportTicketsForCurrentUser(),
      getCurrentLevelInfo(),
    ]);

    setUser(currentUser);
    setTickets(currentTickets);
    setLevelInfo(currentLevel);
    setProfileForm({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      about: currentUser.about || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    syncDashboard();
    window.addEventListener(AUTH_CHANGED_EVENT, syncDashboard);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncDashboard);
  }, []);

  const completionRate = useMemo(() => {
    if (!user) return 0;
    const checks = [
      Boolean(user.email),
      Boolean(user.phone),
      Boolean(user.about),
      Boolean(user.avatar),
      Boolean(user.smsSecurityEnabled),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const updated = await updateCurrentUser((current) => ({
      ...current,
      name: profileForm.name.trim() || current.name,
      phone: profileForm.phone.trim(),
      about: profileForm.about.trim(),
    }));
    setSavingProfile(false);

    if (!updated) {
      toast.error("Profil güncellenemedi.");
      return;
    }

    setUser(updated);
    toast.success("Profil bilgileri kaydedildi.");
  };

  const handleSupportCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error("Konu ve mesaj alanı zorunludur.");
      return;
    }

    setCreatingTicket(true);
    createSupportConversation({
      user,
      subject: ticketForm.subject,
      category: ticketForm.category,
      message: ticketForm.message,
    });
    setTicketForm({ subject: "", category: "Genel", message: "" });
    await syncDashboard();
    setCreatingTicket(false);
    toast.success("Destek talebin oluşturuldu.");
  };

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Çıkış yapıldı.");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <NavMenu />
        <main className="container py-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Panel yükleniyor...
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hoş geldin, {user.name}</h1>
              <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{user.role === "admin" ? "Yönetici" : "Üye"}</Badge>
                <Badge variant={user.isVerified ? "default" : "outline"}>{user.isVerified ? "Doğrulanmış" : "Doğrulanmamış"}</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/deposit"><Wallet className="h-4 w-4 mr-2" />Bakiye Yükle</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/messages"><MessageSquare className="h-4 w-4 mr-2" />Mesajlar</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="rounded-xl">
              <LogOut className="h-4 w-4 mr-2" />Çıkış Yap
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>Mevcut bakiye</CardDescription>
              <CardTitle className="text-2xl">₺{Number(user.balance || 0).toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Ödemelerde ve vitrin paketlerinde kullanabilirsin.</CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>Profil tamamlama</CardDescription>
              <CardTitle className="text-2xl">%{completionRate}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="mb-2" />
              <p className="text-sm text-muted-foreground">Telefon, hakkımda ve güvenlik adımlarını tamamla.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>Seviye durumu</CardDescription>
              <CardTitle className="text-2xl">{levelInfo?.name || "Bronz"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" /> {user.levelState?.xp || 0} TP topladın.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>Açık destek kayıtları</CardDescription>
              <CardTitle className="text-2xl">{tickets.filter((ticket) => ticket.status !== "Cevaplandı").length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Talep açtıysan durumunu aşağıdan takip edebilirsin.</CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User2 className="h-5 w-5" />Profil Bilgileri</CardTitle>
              <CardDescription>Giriş ve teslimat süreçlerinde kullanılan temel hesap bilgileri.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileSave}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ad Soyad</label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Telefon</label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} className="rounded-xl" placeholder="05xx xxx xx xx" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Hakkımda</label>
                  <Textarea value={profileForm.about} onChange={(e) => setProfileForm((prev) => ({ ...prev, about: e.target.value }))} className="min-h-28 rounded-xl" placeholder="Satış tarzını ve teslimat hızını kısaca anlat." />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Güvenlik durumu: {user.smsSecurityEnabled ? "SMS aktif" : "SMS pasif"}</span>
                  <span className="inline-flex items-center gap-1"><LifeBuoy className="h-4 w-4" /> Destek: 7/24 kayıt açabilirsin</span>
                </div>
                <Button type="submit" disabled={savingProfile} className="rounded-xl">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Profili Kaydet"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5" />Yeni Destek Talebi</CardTitle>
                <CardDescription>Ödeme, teslimat, ilan veya hesap sorunların için kayıt aç.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSupportCreate}>
                  <Input value={ticketForm.subject} onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))} className="rounded-xl" placeholder="Örn: Sipariş teslim edilmedi" />
                  <Input value={ticketForm.category} onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-xl" placeholder="Kategori" />
                  <Textarea value={ticketForm.message} onChange={(e) => setTicketForm((prev) => ({ ...prev, message: e.target.value }))} className="min-h-24 rounded-xl" placeholder="Sorunu kısaca ama net biçimde anlat." />
                  <Button type="submit" disabled={creatingTicket} className="rounded-xl w-full">
                    {creatingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : "Destek Kaydı Oluştur"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Son Destek Kayıtları</CardTitle>
                <CardDescription>Durumunu takip etmek için mesajlar sayfasına geçebilirsin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Henüz destek kaydın yok.
                  </div>
                ) : (
                  tickets.slice(0, 4).map((ticket) => (
                    <div key={ticket.id} className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">{ticket.category} · {ticket.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={ticket.status === "Cevaplandı" ? "secondary" : "outline"}>{ticket.status}</Badge>
                        <Button asChild variant="ghost" size="icon" className="rounded-xl">
                          <Link to={`/messages?chat=${encodeURIComponent(ticket.conversationId)}`}><ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
