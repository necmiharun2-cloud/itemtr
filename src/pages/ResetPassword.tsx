import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecoverySessionReady, setIsRecoverySessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }

        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setIsRecoverySessionReady(Boolean(data.session));
      } catch {
        if (mounted) setIsRecoverySessionReady(false);
      }
    };

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => password.length >= 6 && password === passwordRepeat, [password, passwordRepeat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRecoverySessionReady) {
      toast.error("Şifre yenileme oturumu bulunamadı. E-postadaki bağlantıyı tekrar açın.");
      return;
    }

    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (password !== passwordRepeat) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Şifre güncellenemedi.");
      return;
    }

    toast.success("Şifren başarıyla güncellendi.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Yeni Şifre Belirle</h1>
              <p className="text-sm text-muted-foreground">
                Hesabına yeniden giriş yapabilmek için güçlü bir şifre oluştur.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Yeni Şifre</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl bg-secondary border-border h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Yeni Şifre Tekrar</label>
                <Input
                  type="password"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl bg-secondary border-border h-11"
                />
              </div>

              {!isRecoverySessionReady && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                  Bu sayfa doğrudan açıldıysa işlem tamamlanmaz. E-postadaki şifre sıfırlama bağlantısından gelmen gerekiyor.
                </div>
              )}

              <Button type="submit" disabled={loading || !canSubmit} className="w-full rounded-xl h-11 text-base font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Şifreyi Güncelle"}
              </Button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
