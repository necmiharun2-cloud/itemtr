import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus, 
  HelpCircle, 
  ShieldCheck, 
  Wallet, 
  ShoppingCart, 
  MessageCircle, 
  History,
  Zap,
} from "lucide-react";

const faqs = [
  {
    question: "İtemTR.com Üzerinden Nasıl Alışveriş Yapılır?",
    answer: "İstediğiniz ilanı seçip 'Satın Al' butonuna tıklayarak bakiyenizle veya kredi kartınızla ödeme yapabilirsiniz. Ödeme sonrası satıcı ile otomatik olarak sohbet penceresi açılır ve teslimat süreci başlar.",
    icon: ShoppingCart,
    color: "text-primary"
  },
  {
    question: "Güvenli Ticaret Sistemi (Escrow) Nedir?",
    answer: "Ödediğiniz tutar siz teslimatı onaylayana kadar İtemTR.com güvenli havuz hesabında bloke edilir. Ürünü sorunsuz teslim aldığınızda onay verirsiniz ve tutar satıcıya aktarılır.",
    icon: ShieldCheck,
    color: "text-success"
  },
  {
    question: "Bakiye Yükleme İşlemleri Nasıl Gerçekleşir?",
    answer: "Kredi kartı, Banka Kartı, Havale/EFT ve G-Pay-PayTR gibi güvenli ödeme yöntemleriyle saniyeler içinde bakiye yükleyebilirsiniz. Komisyon oranları seçilen yönteme göre değişiklik gösterebilir.",
    icon: Wallet,
    color: "text-blue-400"
  },
  {
    question: "Satın Aldığım Ürün Teslim Edilmezse Ne Olur?",
    answer: "Satıcı belirtilen süre içinde teslimat yapmazsa veya yanlış ürün gönderirse, destek talebi oluşturarak işlemin iptal edilmesini ve paranızın iadesini talep edebilirsiniz.",
    icon: HelpCircle,
    color: "text-orange-400"
  },
  {
    question: "İlan Botu Nedir ve Nasıl Çalışır?",
    answer: "İtemTR.com İlan Botu, sistemimizin SEO ve canlılık değerlerini artırmak için otomatik olarak gerçek zamanlı verilerle ilan üretir. Bu ilanlar sistem tarafından kontrol edilir ve güvenlidir.",
    icon: Zap,
    color: "text-indigo-400"
  },
  {
    question: "Mağaza Açmak Ücretli mi?",
    answer: "İtemTR.com'da mağaza açmak tamamen ücretsizdir. Sadece yaptığınız başarılı satışlardan kategoriye özel düşük komisyon oranları alınır.",
    icon: History,
    color: "text-rose-400"
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="space-y-12">
      <div className="flex flex-col items-center text-center space-y-4">
         <div className="w-16 h-16 rounded-[2rem] bg-card/60 border border-white/5 flex items-center justify-center text-primary shadow-2xl animate-float">
            <HelpCircle className="h-8 w-8" />
         </div>
         <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
               Sıkça Sorulan <span className="text-primary not-italic">Sorular</span>
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Platform Kullanım Rehberi ve Yardım</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {faqs.map((faq, i) => (
          <div 
            key={i} 
            className={`group bg-card/40 backdrop-blur-md rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
              openIndex === i ? "border-primary/40 shadow-2xl shadow-primary/10" : "border-white/5 hover:border-white/20"
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-8 text-left transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl bg-white/5 transition-all group-hover:scale-110 ${faq.color}`}>
                   <faq.icon className="h-6 w-6" />
                </div>
                <span className="text-md font-black text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                   {faq.question}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${openIndex === i ? 'bg-primary text-white scale-90 rotate-90' : 'bg-white/5 text-muted-foreground'}`}>
                 {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out border-t border-white/5 bg-white/5 ${
                openIndex === i ? "max-h-80 opacity-100 p-8" : "max-h-0 opacity-0 p-0 overflow-hidden"
              }`}
            >
              <div className="flex gap-4">
                 <div className="w-1 h-auto bg-primary/20 rounded-full shrink-0" />
                 <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                   {faq.answer}
                 </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Need Help Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:rotate-12 transition-transform">
               <MessageCircle className="h-8 w-8" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white italic truncate uppercase tracking-tighter">DAHA FAZLA YARDIMA MI İHTİYACINIZ VAR?</h3>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">7/24 CANLI DESTEK EKİBİMİZ YANINIZDA</p>
            </div>
         </div>
         <Button className="rounded-2xl h-16 px-12 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
            CANLI DESTEĞE BAĞLAN
         </Button>
      </div>
    </section>
  );
};

export default FAQSection;
