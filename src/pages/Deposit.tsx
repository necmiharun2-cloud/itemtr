import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Wallet, CreditCard, Building2, Smartphone, Shield, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, updateCurrentUser, rewardCurrentUser } from "@/lib/auth";

const amounts = [50, 100, 250, 500, 1000, 2500];

const methods = [
  { id: "card", icon: CreditCard, label: "Kredi / Banka Kartı", desc: "3D Secure destekli", fee: "Anında" },
  { id: "papara", icon: Smartphone, label: "Papara", desc: "Hızlı bakiye aktarımı", fee: "Anında" },
  { id: "bank", icon: Building2, label: "Havale / EFT", desc: "Banka çalışma saatlerine bağlı", fee: "0 komisyon" },
];

const Deposit = () => {
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [amount, setAmount] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);

  // Güvenli bakiye senkronizasyonu - her zaman Supabase'den güncel veri çek
  const syncBalance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance, id, username, name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentBalance(Number(profile.balance || 0));
          setCurrentUser({ ...user, ...profile });
          return;
        }
      }
      // Kullanıcı yoksa veya hata varsa 0 göster
      setCurrentBalance(0);
      setCurrentUser(null);
    } catch (error) {
      console.error("[Deposit] Balance sync error:", error);
      setCurrentBalance(0);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    syncBalance();
    // Geri tuşu ile dönüldüğünde tekrar senkronize et
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncBalance();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncBalance]);

  const resolvedAmount = useMemo(() => {
    const raw = amount ?? Number(custom || 0);
    return Number.isFinite(raw) ? raw : 0;
  }, [amount, custom]);

  const handleDeposit = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      toast.error("Bakiye yüklemek için giriş yapmalısın.");
      return;
    }

    if (resolvedAmount < 10) {
      toast.error("Minimum yükleme tutarı ₺10.");
      return;
    }

    setSubmitting(true);
    const firstDeposit = Number(currentUser.balance || 0) <= 0;
    const updatedUser = await updateCurrentUser((user) => ({
      ...user,
      balance: Number(user.balance || 0) + resolvedAmount,
    }));
    const reward = await rewardCurrentUser(firstDeposit ? "first_deposit" : "deposit");
    setSubmitting(false);

    if (!updatedUser) {
      toast.error("Bakiye yüklenemedi.");
      return;
    }

    setCurrentBalance(Number(updatedUser.balance || 0));
    toast.success(`₺${resolvedAmount.toFixed(2)} bakiye hesabına yüklendi.`, {
      description: reward.awardedXp > 0 ? `+${reward.awardedXp} TP kazandın.` : `${methods.find((item) => item.id === method)?.label || "Ödeme"} tamamlandı.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bakiye Yükle</h1>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kullanılabilir bakiye</p>
              <p className="text-3xl font-bold text-foreground">₺{currentBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-10 w-10 text-primary/30" />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Tutar Seç</h2>
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setAmount(preset); setCustom(""); }}
                  className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                    amount === preset ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ₺{preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₺</span>
              <input
                type="number"
                placeholder="Özel tutar"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setAmount(null); }}
                className="w-full bg-secondary border border-border rounded-xl py-3 pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Ödeme Yöntemi</h2>
            <div className="space-y-2">
              {methods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMethod(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    method === item.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${method === item.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-xs text-green-500 font-medium">{item.fee}</span>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleDeposit} disabled={submitting} className="w-full py-3.5 rounded-xl text-sm font-semibold">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `₺${resolvedAmount.toFixed(2)} Yükle`}
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />256-bit SSL</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Anında onay</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Güvenli ödeme akışı</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Deposit;
