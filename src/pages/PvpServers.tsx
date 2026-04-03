import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import FeaturedListings from "@/components/FeaturedListings";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Server, RadioTower, ShieldCheck } from "lucide-react";
import { getPvpServerListings, type MarketplaceListing } from "@/lib/marketplace";

const PvpServers = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>(getPvpServerListings());

  useEffect(() => {
    const sync = () => setListings(getPvpServerListings());
    window.addEventListener("itemtr-marketplace-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("itemtr-marketplace-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container space-y-8 py-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-background p-8 shadow-2xl">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <Server className="h-40 w-40 text-primary" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              <RadioTower className="h-4 w-4" /> PVP Serverlar
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">PVP Server Tanıtım Alanı</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Metin2, Knight Online, Minecraft network ve diğer PVP server açılışlarını özel vitrin düzeninde yayınla. Bu alana eklenen ilanlar standart yeni ilan akışına karışmaz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/add-listing">
                <Button className="rounded-xl bg-primary px-6">PVP İlanı Ekle</Button>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" /> Doğru yönlendirme ve ayrı yayın alanı aktif
              </div>
            </div>
          </div>
        </section>

        <FeaturedListings section="pvp" listings={listings.slice(0, 10)} />
      </main>

      <Footer />
    </div>
  );
};

export default PvpServers;
