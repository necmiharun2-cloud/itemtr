import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Search, HelpCircle, ShieldCheck, CreditCard, MessageCircle, ChevronDown, ChevronRight, BookOpen, Headphones } from "lucide-react";
import { useState } from "react";

const faqCategories = [
  { icon: ShieldCheck, label: "Güvenlik", count: 8 },
  { icon: CreditCard, label: "Ödeme", count: 12 },
  { icon: BookOpen, label: "Hesap", count: 10 },
  { icon: MessageCircle, label: "Alım-Satım", count: 15 },
  { icon: Headphones, label: "Teknik Destek", count: 6 },
];

const faqs = [
  { q: "İtemTR.com'da nasıl ilan verebilirim?", a: "Hesabınıza giriş yaptıktan sonra 'İlan Ekle' butonuna tıklayarak kategori seçip ilan bilgilerini doldurabilirsiniz. İlanınız onaylandıktan sonra yayına alınır." },
  { q: "Ödeme yöntemleri nelerdir?", a: "Kredi kartı, banka havalesi, Papara, İninal ve bakiye ile ödeme yapabilirsiniz. Tüm ödemeler 256-bit SSL ile şifrelenir." },
  { q: "Satıcıya nasıl güvenebilirim?", a: "Satıcı puanları, değerlendirmeleri ve satış geçmişini kontrol edebilirsiniz. Ayrıca İtemTR.com güvence sistemi ile korunuyorsunuz." },
  { q: "İade ve iptal politikası nedir?", a: "Ürün teslim edilmeden önce sipariş iptal edilebilir. Teslim sonrası sorun yaşarsanız destek ekibimize başvurabilirsiniz." },
  { q: "Bakiye nasıl yüklenir?", a: "Profil sayfanızdan 'Bakiye Yükle' seçeneğine tıklayarak kredi kartı, Papara veya havale ile bakiye yükleyebilirsiniz." },
  { q: "Hesabım çalındı, ne yapmalıyım?", a: "Hemen destek ekibimize ulaşın. Hesabınızı geçici olarak donduracak ve kimlik doğrulama sonrası geri vereceğiz." },
  { q: "Satıcı olmak için şartlar nelerdir?", a: "Telefon ve e-posta doğrulaması yapmanız yeterlidir. Mağaza açmak için ise en az 10 başarılı satış yapmanız gerekir." },
  { q: "Komisyon oranları nedir?", a: "Standart komisyon oranı %5'tir. Mağaza sahipleri için özel komisyon oranları uygulanmaktadır." },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-6 space-y-6">
        {/* Hero */}
        <div className="bg-card rounded-2xl p-8 text-center space-y-4 border border-border">
          <HelpCircle className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Destek Merkezi</h1>
          <p className="text-sm font-semibold text-primary">Yardım Merkezi</p>
          <p className="text-muted-foreground max-w-lg mx-auto">Size nasıl yardımcı olabiliriz? Aşağıda sıkça sorulan sorulara göz atın veya destek talebi oluşturun.</p>
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Sorunuzu arayın..."
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {faqCategories.map((cat) => (
            <button key={cat.label} className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/40 transition-all space-y-2">
              <cat.icon className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-medium text-foreground">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.count} makale</p>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Sıkça Sorulan Sorular</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-foreground">Canlı Destek</h3>
            <p className="text-sm text-muted-foreground">7/24 canlı destek ekibimizle iletişime geçebilirsiniz.</p>
            <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Sohbet Başlat
            </button>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <Headphones className="h-8 w-8 text-accent" />
            <h3 className="font-semibold text-foreground">Destek Talebi</h3>
            <p className="text-sm text-muted-foreground">Detaylı sorunlarınız için destek talebi oluşturabilirsiniz.</p>
            <button className="px-6 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors">
              Talep Oluştur
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
