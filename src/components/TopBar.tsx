import { MessageCircle, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const TopBar = () => {
  return (
    <div className="border-b border-border bg-secondary">
      <div className="container flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-4">
          <Link to="/support" className="flex items-center gap-2 text-primary hover:underline">
            <MessageCircle className="h-4 w-4" />
            <span>Discord Topluluğu</span>
          </Link>
          <Link to="/blog" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
            <Twitter className="h-3.5 w-3.5" />
            <span>X Haber Akışı</span>
          </Link>
          <Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground">YouTube Rehberleri</Link>
          <Link to="/giveaways" className="text-muted-foreground transition-colors hover:text-foreground">Instagram Çekilişleri</Link>
        </div>
        <div className="hidden items-center gap-6 text-muted-foreground md:flex">
          <Link to="/category" className="font-semibold text-accent hover:underline">🔥 Haftanın Fırsatları</Link>
          <Link to="/blog" className="font-semibold hover:text-foreground">Blog</Link>
          <Link to="/pvp-serverlar" className="hover:text-foreground">PVP Serverlar</Link>
          <Link to="/support" className="hover:text-foreground">Destek Merkezi</Link>
          <Link to="/legal/terms" className="hover:text-foreground">Kurumsal</Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
