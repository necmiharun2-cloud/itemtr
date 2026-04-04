import { X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const PromoBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary to-accent text-white">
      <div className="container flex items-center justify-center gap-2 py-2 pr-12 text-sm font-medium">
        <Sparkles className="h-4 w-4" />
        <span>3D Secure ile güvenli ödeme — vitrin ve e-pin fırsatları seni bekliyor.</span>
        <Link to="/ilan-pazari" className="ml-1 font-bold underline">İlan pazarı →</Link>
        <button onClick={() => setVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
