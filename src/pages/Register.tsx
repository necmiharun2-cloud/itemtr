import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/auth";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation - alphanumeric only
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
  return usernameRegex.test(username);
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", passwordRepeat: "", agree: true });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateFieldWithForm = (name: string, value: string, f: typeof form): string => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Kullanıcı adı zorunlu";
        if (value.length < 3) return "En az 3 karakter olmalı";
        if (!isValidUsername(value)) return "Sadece harf ve rakam kullanabilirsiniz, özel karakterler yasaktır";
        return "";
      case "email":
        if (!value.trim()) return "E-posta zorunlu";
        if (!isValidEmail(value)) return "Geçerli bir e-posta adresi girin";
        return "";
      case "password":
        if (!value) return "Şifre zorunlu";
        if (value.length < 8) return "Şifre en az 8 karakter olmalı";
        return "";
      case "passwordRepeat":
        if (!value) return "Şifre tekrarı zorunlu";
        if (value !== f.password) return "Şifreler eşleşmiyor";
        return "";
      default:
        return "";
    }
  };

  const validateField = (name: string, value: string) => validateFieldWithForm(name, value, form);

  const handleChange = (field: string, value: string) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors((prev) => {
      const out = { ...prev };
      if (touched[field]) {
        out[field] = validateFieldWithForm(field, value, nextForm);
      }
      if (field === "password" && touched.passwordRepeat) {
        out.passwordRepeat = validateFieldWithForm("passwordRepeat", nextForm.passwordRepeat, nextForm);
      }
      return out;
    });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => {
      const key = field as keyof typeof form;
      const val = form[key] as string;
      const out = {
        ...prev,
        [field]: validateFieldWithForm(field, val, form),
      };
      if (field === "password" && touched.passwordRepeat) {
        out.passwordRepeat = validateFieldWithForm("passwordRepeat", form.passwordRepeat, form);
      }
      return out;
    });
  };

  const fullName = useMemo(() => form.username.trim() || "Yeni Kullanıcı", [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    newErrors.username = validateFieldWithForm("username", form.username, form);
    newErrors.email = validateFieldWithForm("email", form.email, form);
    newErrors.password = validateFieldWithForm("password", form.password, form);
    newErrors.passwordRepeat = validateFieldWithForm("passwordRepeat", form.passwordRepeat, form);
    
    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true, passwordRepeat: true });
    
    if (Object.values(newErrors).some(err => err)) {
      toast.error("Lütfen form hatalarını düzeltin");
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

            {/* Avantajlar */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">Ücretsiz Hesap Oluştur</p>
                <p className="text-xs text-muted-foreground">
                  Yeni hesap oluşturarak satıcı paneline, bakiye alanına ve destek merkezine erişebilirsin.
                  Satın alma işlemlerinde alıcı korumasından yararlan.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} role="form">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.username && touched.username ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    placeholder="kullaniciadi"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    onBlur={() => handleBlur("username")}
                    className={`pl-10 rounded-xl bg-secondary border-2 ${errors.username && touched.username ? 'border-red-500 focus:border-red-500' : 'border-border'} transition-colors`}
                  />
                  {touched.username && !errors.username && form.username && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.username && touched.username && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-posta</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email && touched.email ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`pl-10 rounded-xl bg-secondary border-2 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-border'} transition-colors`}
                  />
                  {touched.email && !errors.email && form.email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password && touched.password ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`pl-10 pr-10 rounded-xl bg-secondary border-2 ${errors.password && touched.password ? 'border-red-500 focus:border-red-500' : 'border-border'} transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>
                )}
                {form.password && !errors.password && (
                  <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Güçlü şifre</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.passwordRepeat && touched.passwordRepeat ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    type={showPasswordRepeat ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.passwordRepeat}
                    onChange={(e) => handleChange("passwordRepeat", e.target.value)}
                    onBlur={() => handleBlur("passwordRepeat")}
                    className={`pl-10 pr-10 rounded-xl bg-secondary border-2 ${errors.passwordRepeat && touched.passwordRepeat ? 'border-red-500 focus:border-red-500' : 'border-border'} transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswordRepeat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.passwordRepeat && touched.passwordRepeat && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.passwordRepeat}</p>
                )}
                {form.passwordRepeat && form.password === form.passwordRepeat && (
                  <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Şifreler eşleşiyor</p>
                )}
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
