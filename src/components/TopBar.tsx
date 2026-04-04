import { MessageCircle, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const TopBar = () => {
  return (
    <div className="border-b border-border bg-secondary">
      <div className="container flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
          <Link to="/support" className="flex items-center gap-1.5 sm:gap-2 text-primary hover:underline whitespace-nowrap">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Discord Topluluğu</span>
            <span className="sm:hidden">Discord</span>
          </Link>
          <Link to="/blog" className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap">
            <Twitter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">X Haber Akışı</span>
          </Link>
          <Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap hidden xs:inline">YouTube Rehberleri</Link>
          <Link to="/giveaways" className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap hidden sm:inline">Instagram Çekilişleri</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 text-muted-foreground">
            <Link to="/ilan-pazari" className="font-semibold text-accent hover:underline whitespace-nowrap">🔥 Haftanın Fırsatları</Link>
            <Link to="/blog" className="font-semibold hover:text-foreground">Blog</Link>
            <Link to="/pvp-serverlar" className="hover:text-foreground">PVP Serverlar</Link>
            <Link to="/support" className="hover:text-foreground">Destek</Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
