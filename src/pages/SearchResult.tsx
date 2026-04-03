import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Search, SlidersHorizontal, SearchX } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchMarketplaceListings } from "@/lib/marketplace";

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    const items = searchMarketplaceListings(query);
    if (sortBy === "popular") return [...items].sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === "price-asc") return [...items].sort((a, b) => Number(String(a.price).replace(/[^\d,]/g, "").replace(",", ".")) - Number(String(b.price).replace(/[^\d,]/g, "").replace(",", ".")));
    if (sortBy === "price-desc") return [...items].sort((a, b) => Number(String(b.price).replace(/[^\d,]/g, "").replace(",", ".")) - Number(String(a.price).replace(/[^\d,]/g, "").replace(",", ".")));
    return [...items].sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  }, [query, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container space-y-8 py-8">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Search className="h-4 w-4" /> Arama Sonuçları
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white">
              "{query}" <span className="ml-2 not-italic font-normal text-muted-foreground">için sonuçlar</span>
            </h1>
            <p className="text-sm text-muted-foreground">{results.length} ilan bulundu.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select defaultValue="newest" onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-[180px] rounded-xl border-border bg-card font-bold">
                <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="newest">En Yeniler</SelectItem>
                <SelectItem value="price-asc">En Düşük Fiyat</SelectItem>
                <SelectItem value="price-desc">En Yüksek Fiyat</SelectItem>
                <SelectItem value="popular">En Popüler</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11 gap-2 rounded-xl border-border font-bold">
              <SlidersHorizontal className="h-4 w-4" /> Filtrele
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="hidden space-y-6 lg:block">
            <div className="space-y-6 rounded-3xl border border-border/50 bg-secondary/10 p-6">
              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-primary">Kategoriler</h4>
                <div className="space-y-2">
                  {["Hesap", "E-pin", "Oyun Parası", "Skin", "PVP Serverlar"].map((category) => (
                    <label key={category} className="group flex cursor-pointer items-center gap-3">
                      <div className="h-4 w-4 rounded border border-border transition-colors group-hover:border-primary" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-primary">Fiyat Aralığı</h4>
                <div className="flex items-center gap-2">
                  <Input placeholder="Min" className="h-10 border-border bg-background text-center text-xs" />
                  <span className="text-muted-foreground">-</span>
                  <Input placeholder="Max" className="h-10 border-border bg-background text-center text-xs" />
                </div>
              </div>

              <Button className="mt-4 h-11 w-full rounded-xl bg-primary font-bold">Uygula</Button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(285px,1fr))]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-3xl bg-secondary/10 animate-pulse border border-border/50" />
                ))
              ) : results.length > 0 ? (
                results.map((listing) => (
                  <ListingCard key={listing.id} {...listing} section={listing.section} />
                ))
              ) : (
                <div className="lg:col-span-3 space-y-6 py-20 text-center bg-card border border-border rounded-[3rem]">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-secondary/30">
                    <SearchX className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">SONUÇ BULUNAMADI</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto uppercase font-bold opacity-60">
                      "{query}" araması ile eşleşen bir ilan bulamadık. Lütfen farklı anahtar kelimeler deneyin.
                    </p>
                  </div>
                  <Link to="/">
                    <Button className="h-12 rounded-xl bg-primary px-10 font-black italic tracking-widest uppercase">
                      KEŞFETMEYE DEVAM ET
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResult;
