import { Link, useParams } from "react-router-dom";
import { ChevronRight, FileText, Landmark, RefreshCcw, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";

type LegalContent = {
  title: string;
  icon: LucideIcon;
  text: string;
};

const legalContent: Record<string, LegalContent> = {
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    icon: ShieldCheck,
    text: "İtemTR.com olarak kişisel verilerinizin güvenliğine önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, verileriniz sadece platformun işleyişi ve yasal zorunluluklar çerçevesinde işlenmektedir. Verileriniz üçüncü şahıslarla asla paylaşılmaz...",
  },
  terms: {
    title: "Kullanım Koşulları",
    icon: Scale,
    text: "İtemTR.com platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. Platform, alıcı ve satıcıyı buluşturan bir aracı hizmet sağlayıcıdır. Dolandırıcılık, hesap hırsızlığı ve yasadışı faaliyetler kesinlikle yasaktır ve yasal işlem başlatma hakkımız saklıdır...",
  },
  refund: {
    title: "İade ve İptal Politikası",
    icon: RefreshCcw,
    text: "Dijital ürünlerde (E-pin, CD-Key vb.) teslimat yapıldıktan sonra iade mümkün değildir. Hesap satışlarında, eğer hesap açıklamalarda belirtilenlerin dışındaysa 24 saat içinde itiraz hakkınız mevcuttur. Escrow sistemimiz paranızı ürün onaylanana kadar korur...",
  },
  sales: {
    title: "Mesafeli Satış Sözleşmesi",
    icon: FileText,
    text: "İşbu sözleşme, İtemTR.com üzerinden yapılan tüm dijital alışverişlerin hukuki zeminini oluşturur. Alıcı, ödeme yaptığı andan itibaren teslimat sürecinin başladığını ve dijital içeriklerin iadesinin yönetmeliğe göre kısıtlı olduğunu kabul eder...",
  },
  "distance-selling": {
    title: "Mesafeli Satış Sözleşmesi",
    icon: FileText,
    text: "İşbu sözleşme, İtemTR.com üzerinden yapılan tüm dijital alışverişlerin hukuki zeminini oluşturur. Alıcı, ödeme yaptığı andan itibaren teslimat sürecinin başladığını ve dijital içeriklerin iadesinin yönetmeliğe göre kısıtlı olduğunu kabul eder...",
  },
};

const Legal = () => {
  const { type } = useParams();
  const activeContent = legalContent[type ?? "terms"] ?? legalContent.terms;
  const ActiveIcon = activeContent.icon;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-16 pb-32">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="group relative flex flex-col gap-8 overflow-hidden rounded-[3rem] border border-white/5 bg-card/40 p-10 shadow-2xl transition-all hover:border-primary/20 md:flex-row md:items-center">
            <div className="absolute right-0 top-0 p-8 opacity-5">
              <ActiveIcon className="h-40 w-40" />
            </div>
            <div className="rounded-[2.5rem] border border-primary/20 bg-primary/10 p-6 shadow-2xl transition-transform group-hover:scale-110">
              <ActiveIcon className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase italic tracking-[0.4em] text-primary">
                <Landmark className="h-4 w-4" /> Yasal Bildirimler
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{activeContent.title}</h1>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Son Güncelleme: 31 MART 2026</p>
            </div>
          </div>

          <div className="relative rounded-[3.5rem] border border-white/5 bg-card/60 p-12 shadow-2xl backdrop-blur-xl">
            <div className="prose prose-invert max-w-none space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="h-8 w-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(244,114,182,1)]" />
                <p className="text-xl font-black uppercase italic tracking-tighter text-white">PLATFORM YÖNETMELİĞİ</p>
              </div>

              <div className="space-y-8 text-lg font-medium italic leading-relaxed text-muted-foreground">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-white opacity-80 underline decoration-primary/50 decoration-2 underline-offset-8">
                  Sayın Kullanıcı,
                </p>
                <p className="opacity-80">{activeContent.text}</p>
                <p className="opacity-80">
                  Platformumuz üzerinden gerçekleştirilen tüm işlemler Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir uyuşmazlık durumunda İstanbul Mahkemeleri yetkilidir.
                </p>

                <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2">
                  <div className="space-y-4 rounded-[2.5rem] border border-white/5 bg-secondary/20 p-8 transition-colors hover:bg-secondary/40">
                    <h3 className="flex items-center gap-2 text-lg font-black uppercase italic tracking-tighter text-primary">
                      <ChevronRight className="h-5 w-5" /> TEMEL MADDELER
                    </h3>
                    <ul className="space-y-4">
                      {[
                        "Hizmet bedeli ve komisyon oranları sabittir (%7).",
                        "Ödemeler 256-bit SSL ve 3D Secure güvencesiyle alınır.",
                        "Platform içi kimlik doğrulaması tüm işlemler için zorunludur.",
                      ].map((item) => (
                        <li key={item} className="flex gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8">
                    <h3 className="flex items-center gap-2 text-lg font-black uppercase italic tracking-tighter text-white">
                      <Scale className="h-5 w-5 text-primary" /> YASAL UYUMLULUK
                    </h3>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      İtemTR.com, 5651 sayılı kanun kapsamında "Yer Sağlayıcı" olarak faaliyet göstermektedir.
                    </p>
                    <Link to="/support">
                      <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary transition-opacity hover:opacity-80">
                        DESTEĞE GİT <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
