import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_NAME } from "@/lib/site-brand";

const InstagramWidget = () => {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10 p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">@itemsatiscom</p>
            <p className="text-xs text-muted-foreground">25K+ Takipçi</p>
          </div>
        </div>
        <p className="flex-1 text-center text-sm text-muted-foreground sm:text-left">
          {`Çekiliş, kampanya ve güncel haberler için ${SITE_NAME} duyurularını takip edin.`}
        </p>
        <Link to="/giveaways" className="shrink-0 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
          Takip Et
        </Link>
      </div>
    </div>
  );
};

export default InstagramWidget;
