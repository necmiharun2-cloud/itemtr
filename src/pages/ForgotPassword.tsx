import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setLoading(false);

      if (error) {
        toast.error("Şifre sıfırlama bağlantısı gönderilemedi: " + error.message);
        return;
      }

      setSent(true);
      toast.success("Şifre sıfırlama bağlantısı gönderildi.");
    } catch (error) {
      setLoading(false);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
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
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Şifremi Unuttum</h1>
              <p className="text-sm text-muted-foreground">
                {sent
                  ? "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
                  : "E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."}
              </p>
            </div>

            {!sent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">E-posta Adresi</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendReset}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{email}</span> adresine sıfırlama bağlantısı gönderildi.
                  Spam klasörünüzü de kontrol etmeyi unutmayın.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Tekrar Gönder
                </button>
              </div>
            )}

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

export default ForgotPassword;
