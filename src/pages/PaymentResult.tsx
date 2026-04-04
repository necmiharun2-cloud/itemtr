import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AUTH_CHANGED_EVENT, getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Variant = "success" | "fail";

const PaymentResult = ({ variant }: { variant: Variant }) => {
  const [searchParams] = useSearchParams();
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const u = await getCurrentUser();
        if (u) {
          await supabase.from("profiles").select("balance").eq("id", u.id).maybeSingle();
        }
      } finally {
        setSyncing(false);
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      }
    };
    void run();
  }, []);

  const oid = searchParams.get("merchant_oid") || searchParams.get("oid");

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />
      <main className="container py-12 max-w-lg mx-auto text-center space-y-6">
        {variant === "success" ? (
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" aria-hidden />
        ) : (
          <XCircle className="h-16 w-16 text-destructive mx-auto" aria-hidden />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {variant === "success" ? "Ödeme tamamlandı" : "Ödeme tamamlanamadı"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {variant === "success"
            ? "Kart ödemesi onaylandıysa bakiyeniz birkaç saniye içinde (bildirim gecikmesi olabilir) güncellenir. Tutar görünmüyorsa bir süre sonra sayfayı yenileyin."
            : "İşlem iptal edildi veya banka tarafından reddedildi. Tekrar deneyebilir veya farklı bir kart kullanabilirsiniz."}
        </p>
        {oid ? (
          <p className="text-xs text-muted-foreground font-mono break-all">Referans: {oid}</p>
        ) : null}
        {syncing ? (
          <div className="flex justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Bakiye senkronize ediliyor…
          </div>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link to="/deposit">Bakiye yükle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Panele dön</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentResult;
