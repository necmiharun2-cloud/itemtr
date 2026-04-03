import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/auth";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", passwordRepeat: "", agree: true });


  const fullName = useMemo(() => form.username.trim() || "Yeni Kullanıcı", [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (form.password !== form.passwordRepeat) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    if (!form.agree) {
      toast.error("Devam etmek için şartları kabul etmelisiniz.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        name: fullName,
      });

      setLoading(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (result.requiresEmailVerification) {
        toast.success("Hesabın oluşturuldu.", {
          description: "Devam etmek için e-posta adresine gelen doğrulama bağlantısını aç ve sonra giriş yap.",
        });
        navigate(`/login?email=${encodeURIComponent(form.email)}`, { replace: true });
        return;
      }

      toast.success("Hesabın oluşturuldu. Paneline yönlendiriliyorsun.", {
        description: "+75 TP başlangıç seviyesi hesabına işlendi.",
      });
      navigate(searchParams.get("redirect") || "/dashboard", { replace: true });
    } catch (error) {
      setLoading(false);
      toast.error("Kayıt olurken bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="container py-12 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Kayıt Ol</h1>
              <p className="text-sm text-muted-foreground mt-1">Yeni bir hesap oluşturun</p>
            </div>

            {/* Beta Uyarısı */}
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-orange-500">Beta Aşamasında</p>
                <p className="text-xs text-muted-foreground">
                  Yeni hesap oluşturarak satıcı paneline, bakiye alanına ve destek merkezine erişebilirsin.
                  E-posta doğrulaması açıksa önce kutunu kontrol etmen gerekir.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="kullaniciadi"
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10 rounded-xl bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10 rounded-xl bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 rounded-xl bg-secondary border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPasswordRepeat ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.passwordRepeat}
                    onChange={(e) => setForm((prev) => ({ ...prev, passwordRepeat: e.target.value }))}
                    className="pl-10 pr-10 rounded-xl bg-secondary border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswordRepeat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm((prev) => ({ ...prev, agree: e.target.checked }))}
                  className="mt-1 rounded border-border"
                />
                <span className="text-xs text-muted-foreground">
                  <Link to="/terms" className="text-primary hover:underline">Kullanım Şartları</Link>'nı ve{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı kabul ediyorum.
                </span>
              </label>

              <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 text-base font-semibold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kayıt Ol"}
              </Button>
            </form>

            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-xs text-muted-foreground">
              Kayıt olduktan sonra otomatik giriş yapılır ve seviye sisteminde başlangıç TP hesabına eklenir.
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link to={searchParams.get("redirect") ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect") as string)}` : "/login"} className="text-primary font-medium hover:underline">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
