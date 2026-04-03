import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const reviews = [
  { name: "Ahmet K.", rating: 5, text: "Çok hızlı teslimat, güvenilir satıcı. Teşekkürler!", date: "29 Mar 2026" },
  { name: "Elif S.", rating: 5, text: "Steam cüzdan kodu anında geldi. Harika platform!", date: "28 Mar 2026" },
  { name: "Mehmet Y.", rating: 4, text: "İlk alışverişim, çok memnun kaldım. Tekrar geleceğim.", date: "27 Mar 2026" },
  { name: "Zeynep A.", rating: 5, text: "Müşteri desteği çok ilgili. Sorunum hemen çözüldü.", date: "26 Mar 2026" },
  { name: "Can D.", rating: 5, text: "Valorant VP hemen yüklendi. Fiyatlar da uygun.", date: "25 Mar 2026" },
  { name: "Sude T.", rating: 4, text: "Güvenli alışveriş için tercih ediyorum. Tavsiye ederim.", date: "24 Mar 2026" },
];

const CustomerReviews = () => {
  const [offset, setOffset] = useState(0);
  const visible = 3;
  const max = Math.max(0, reviews.length - visible);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">Müşteri Yorumları</h2>
          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent/10">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-bold text-accent">4.7</span>
            <span className="text-xs text-muted-foreground ml-1">601 yorum</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(Math.max(0, offset - 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(Math.min(max, offset + 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300" style={{ transform: `translateX(-${offset * (100 / visible)}%)` }}>
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[calc(33.333%-11px)] bg-card rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? "text-accent fill-accent" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
