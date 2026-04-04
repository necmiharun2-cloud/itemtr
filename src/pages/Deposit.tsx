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
import { AUTH_CHANGED_EVENT, getCurrentUser } from "@/lib/auth";
import { startPaytrDeposit } from "@/lib/payment";
import { SITE_NAME } from "@/lib/site-brand";

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

  // Header ile aynı kaynak: getCurrentUser (getSession + yerel oturum). Yalnızca getUser() kullanmak
  // bazen null döner; kullanıcı giriş yapmış görünürken "giriş yapın" hatasına yol açar.
  const syncBalance = useCallback(async () => {
    try {
      const appUser = await getCurrentUser();
      if (!appUser) {
        setCurrentBalance(0);
        setCurrentUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, id, username, name")
        .eq("id", appUser.id)
        .maybeSingle();

      if (profile) {
        setCurrentBalance(Number(profile.balance ?? appUser.balance ?? 0));
        setCurrentUser({ ...appUser, ...profile });
        return;
      }

      setCurrentBalance(Number(appUser.balance ?? 0));
      setCurrentUser(appUser);
    } catch (error) {
      console.error("[Deposit] Balance sync error:", error);
      setCurrentBalance(0);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    syncBalance();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncBalance();
      }
    };
    const onAuthChanged = () => void syncBalance();
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    };
  }, [syncBalance]);

  const resolvedAmount = useMemo(() => {
    const raw = amount ?? Number(custom || 0);
    return Number.isFinite(raw) ? raw : 0;
  }, [amount, custom]);

  const handleDeposit = async () => {
    const appUser = await getCurrentUser();
    if (!appUser) {
      toast.error("Bakiye yüklemek için giriş yapmalısın.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, id")
      .eq("id", appUser.id)
      .maybeSingle();

    if (!profile) {
      toast.error("Kullanıcı profili bulunamadı. Birkaç saniye sonra tekrar deneyin veya sayfayı yenileyin.");
      return;
    }

    if (resolvedAmount < 10) {
      toast.error("Minimum yükleme tutarı ₺10.");
      return;
    }

    setSubmitting(true);

    try {
      if (method === "card" || method === "papara") {
        const payMethod = method === "papara" ? "papara" : "card";
        const result = await startPaytrDeposit(resolvedAmount, payMethod);
        if (result.ok === false) {
          if (result.configured === false) {
            toast.error("Ödeme altyapısı yapılandırılmamış.", {
              description: "Vercel ortam değişkenlerinde PayTR ve Supabase anahtarlarını tanımlayın.",
            });
          } else {
            toast.error(result.error || "Ödeme başlatılamadı.");
          }
          return;
        }
        toast.message("Güvenli ödeme sayfasına yönlendiriliyorsunuz…");
        window.location.assign(result.payUrl);
        return;
      }

      if (method === "bank") {
        const iban = import.meta.env.VITE_BANK_IBAN?.trim();
        const recipient = import.meta.env.VITE_BANK_ACCOUNT_NAME?.trim() || SITE_NAME;
        if (!iban) {
          toast.error("Havale bilgileri tanımlı değil.", {
            description: "Yönetici: VITE_BANK_IBAN ve isteğe bağlı VITE_BANK_ACCOUNT_NAME ayarlayın.",
          });
          return;
        }

        const { data: pending, error: insErr } = await supabase
          .from("payments")
          .insert({
            user_id: appUser.id,
            amount: resolvedAmount,
            currency: "TRY",
            status: "pending",
            payment_type: "deposit",
            description: "Havale / EFT — bakiye yükleme",
            metadata: {
              method: "bank",
              awaiting_transfer: true,
              recipient,
              iban,
            },
          })
          .select("id")
          .single();

        if (insErr || !pending?.id) {
          toast.error("Havale talebi kaydedilemedi.");
          return;
        }

        toast.success("Havale talimatları", {
          description: `Alıcı: ${recipient} | IBAN: ${iban} | Açıklama: ${pending.id} (mutlaka yazın) | Tutar: ₺${resolvedAmount.toFixed(2)}`,
          duration: 25_000,
        });
        return;
      }

      if (import.meta.env.VITE_ALLOW_SIMULATED_BALANCE === "true") {
        const currentBal = Number(profile.balance || 0);
        const newBalance = currentBal + resolvedAmount;
        const { error } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", appUser.id);
        if (error) {
          toast.error("Bakiye yüklenemedi.");
          return;
        }
        setCurrentBalance(newBalance);
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
        toast.success(`(Test) ₺${resolvedAmount.toFixed(2)} simüle edildi.`);
        return;
      }

      toast.error("Bu ödeme yöntemi henüz etkin değil.");
    } finally {
      setSubmitting(false);
    }
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
