import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, Gamepad2, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Gamepad2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-6xl font-black text-foreground mb-2">404</h1>
        <p className="text-xl font-bold text-foreground mb-2">Sayfa Bulunamadı</p>
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </button>
          <a 
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </a>
        </div>
        <div className="mt-8 p-4 bg-card rounded-xl border border-border">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Search className="h-3 w-3" />
            Aranan: {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
