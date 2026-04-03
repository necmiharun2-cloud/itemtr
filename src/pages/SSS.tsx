import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle, Mail, MessageSquare, Search, ShieldCheck, Scale, Landmark } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqCategories = [
  { id: "general", label: "Genel Sorular", icon: HelpCircle },
  { id: "orders", label: "Siparişler & Ödeme", icon: ShieldCheck },
  { id: "accounts", label: "Hesap & Mağaza", icon: MessageSquare },
  { id: "legal", label: "Hukuki & Güvenlik", icon: Scale },
  { id: "technical", label: "Teknik Destek", icon: Mail },
];

const faqData = [
  { category: "general", question: "İtemTR.com nedir?", answer: "İtemTR.com; oyun hesapları, dijital ürünler ve PVP server tanıtımlarının güvenli havuz sistemiyle yayınlandığı dijital pazaryeridir." },
  { category: "general", question: "Sistem nasıl çalışır?", answer: "Alıcı ödeme yaptığında tutar güvenli havuzda bekler. Teslimat onaylanınca ödeme satıcıya aktarılır. Böylece iki taraf da korunur." },
  { category: "orders", question: "Nasıl bakiye yükleyebilirim?", answer: "Bakiye yükleme sayfasından kart veya diğer desteklenen yöntemlerle anında bakiye ekleyebilirsiniz." },
  { category: "orders", question: "Dijital ürünlerde iade var mı?", answer: "Teslim edilmiş dijital ürünlerde iade koşulları ilan açıklaması ve hukuki metinlere göre değerlendirilir. Detaylı bilgi için İade ve İptal Politikası sayfasına bakabilirsiniz." },
  { category: "accounts", question: "Nasıl ilan eklerim?", answer: "İlan Ekle sayfasına gidip standart ilan veya PVP Serverlar alanını seçerek birkaç adımda ilanınızı oluşturabilirsiniz." },
  { category: "accounts", question: "PVP server tanıtım ilanı nereye düşer?", answer: "PVP server ilanları standart yeni ilanlara karışmaz; ana sayfadaki PVP bölümünde ve PVP Serverlar sayfasında görünür." },
  { category: "legal", question: "Mesafeli satış sözleşmesi nerede?", answer: "Hukuki metinler bölümünde Mesafeli Satış Sözleşmesi, KVKK ve Kullanım Koşulları ayrı sayfalar halinde yer alır." },
  { category: "legal", question: "Uyuşmazlık durumunda ne yapmalıyım?", answer: "Önce destek talebi açın. Gerekirse sipariş, ilan ve mesaj kayıtları incelemeye alınır. Yasal süreçlerde platform kayıtları referans kabul edilir." },
  { category: "technical", question: "Bildirimlerim neden görünmüyor?", answer: "Kullanıcı panelindeki bildirim alanı ve üst menü zil ikonu aynı veri kaynağından beslenir. Okundu işaretleme sonrası sayaç otomatik güncellenir." },
  { category: "technical", question: "Mesajlaşma sistemi çalışıyor mu?", answer: "Evet. Mesajlar sayfası ve panel mesaj sekmesi aktif yönlendirmeye bağlıdır; satıcı profili ve ilan detayından erişebilirsiniz." },
];

const legalCards = [
  { title: "Kullanım Koşulları", description: "Platformun genel kullanım şartları ve yasaklı işlemler.", href: "/legal/terms", icon: Scale },
  { title: "KVKK Aydınlatma Metni", description: "Kişisel verilerin işlenmesi ve saklanmasına ilişkin bilgiler.", href: "/legal/kvkk", icon: Landmark },
  { title: "Mesafeli Satış Sözleşmesi", description: "Sipariş ve teslimat süreçlerinin hukuki zemini.", href: "/legal/distance-selling", icon: ShieldCheck },
  { title: "İade ve İptal Politikası", description: "Dijital ürün iadesi ve itiraz süreçleri.", href: "/legal/refund", icon: HelpCircle },
];

const SSS = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");

  const filteredQuestions = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const haystack = `${item.question} ${item.answer}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container space-y-8 py-10">
        <section className="rounded-[2.5rem] border border-white/5 bg-card/50 p-8 shadow-2xl">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">YARDIMCI OLABİLİRİZ</p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">S.S.S & Hukuki Rehber</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Destek, ödeme, kullanıcı paneli, mesajlaşma, bildirimler ve hukuki metinlerle ilgili en sık sorulan soruları tek sayfada düzenledik.
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sorunu veya anahtar kelimeyi yaz..." className="h-12 rounded-2xl border-white/10 bg-white/5 pl-11" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <Button onClick={() => setActiveCategory("all")} variant={activeCategory === "all" ? "default" : "secondary"} className="w-full justify-start rounded-2xl">Tüm Kategoriler</Button>
            {faqCategories.map((item) => (
              <Button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                variant={activeCategory === item.id ? "default" : "secondary"}
                className="w-full justify-start rounded-2xl"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-[2rem] border border-white/5 bg-card/50 p-6 shadow-xl">
              <Accordion type="single" collapsible className="space-y-3">
                {filteredQuestions.map((item, index) => (
                  <AccordionItem key={`${item.question}-${index}`} value={`faq-${index}`} className="rounded-2xl border border-white/5 px-4">
                    <AccordionTrigger className="text-left font-semibold text-white hover:no-underline">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredQuestions.length === 0 && <p className="text-sm text-muted-foreground">Aradığınız konuya uygun soru bulunamadı.</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {legalCards.map((card) => (
                <Link key={card.title} to={card.href} className="group rounded-[2rem] border border-white/5 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-black uppercase italic tracking-tight text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    Sayfaya Git <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SSS;
