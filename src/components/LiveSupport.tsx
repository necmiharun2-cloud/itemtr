import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const LiveSupport = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-72 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">Canlı Destek</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-sm text-foreground">Merhaba! 👋 Size nasıl yardımcı olabiliriz?</p>
              <p className="text-xs text-muted-foreground mt-1">Destek Ekibi • Şimdi çevrimiçi</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                className="flex-1 bg-secondary border border-border rounded-xl py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default LiveSupport;
