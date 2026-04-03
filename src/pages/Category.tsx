import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ListingGridSkeleton } from "@/components/ListingSkeleton";
import { Search, ChevronRight, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { getListingsForCategory, type MarketplaceListing, slugifyCategory } from "@/lib/marketplace";

const subCategories = ["Tümü", "Hesap Satışı", "Skin Satışı", "Item Satışı", "Boost", "Epin", "Random Hesap"];
const sortOptions = ["En Yeni", "En Ucuz", "En Pahalı", "En Popüler"];

const sortListings = (items: MarketplaceListing[], sortBy: string) => {
  const copy = [...items];
  if (sortBy === "En Yeni") return copy.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  if (sortBy === "En Popüler") return copy.sort((a, b) => (b.views || 0) - (a.views || 0));
  if (sortBy === "En Ucuz") return copy.sort((a, b) => Number(String(a.price).replace(/[^\d,]/g, "").replace(",", ".")) - Number(String(b.price).replace(/[^\d,]/g, "").replace(",", ".")));
  return copy.sort((a, b) => Number(String(b.price).replace(/[^\d,]/g, "").replace(",", ".")) - Number(String(a.price).replace(/[^\d,]/g, "").replace(",", ".")));
};

const Category = () => {
  const { slug } = useParams();
  const [activeSubCat, setActiveSubCat] = useState("Tümü");
  const [sortBy, setSortBy] = useState("En Yeni");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Price filter state
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sellerRating, setSellerRating] = useState("Tümü");
  const [activeFilters, setActiveFilters] = useState({ min: "", max: "", rating: "Tümü" });

  const categoryName = slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Tüm Kategoriler";

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [slug, activeSubCat]);

  const listings = useMemo(() => {
    const base = getListingsForCategory(slug).filter((listing) => listing.section !== "pvp");
    const bySubCategory = activeSubCat === "Tümü" ? base : base.filter((item) => slugifyCategory(item.category).includes(slugifyCategory(activeSubCat)) || item.title.toLowerCase().includes(activeSubCat.toLowerCase()));
    
    // Apply price filter
    let filtered = bySubCategory;
    if (activeFilters.min || activeFilters.max) {
      filtered = filtered.filter((item) => {
        const price = Number(String(item.price).replace(/[^\d,]/g, "").replace(",", "."));
        const min = activeFilters.min ? Number(activeFilters.min) : 0;
        const max = activeFilters.max ? Number(activeFilters.max) : Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Apply seller rating filter
    if (activeFilters.rating && activeFilters.rating !== "Tümü") {
      const minRating = parseFloat(activeFilters.rating);
      filtered = filtered.filter((item) => (item.sellerRating || 0) >= minRating);
    }
    
    return sortListings(filtered, sortBy);
  }, [slug, activeSubCat, sortBy, activeFilters]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container space-y-5 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{categoryName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{listings.length} ilan bulundu</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubCat(sub)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeSubCat === sub ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele
            </Button>
            <div className="ml-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sortBy === opt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-lg bg-primary/10 p-2 text-primary" type="button"><Grid3X3 className="h-4 w-4" /></button>
            <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground" type="button"><List className="h-4 w-4" /></button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min Fiyat</label>
              <input 
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground" 
                placeholder="0 ₺" 
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Fiyat</label>
              <input 
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground" 
                placeholder="10.000 ₺" 
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Satıcı Puanı</label>
              <select 
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                value={sellerRating}
                onChange={(e) => setSellerRating(e.target.value)}
              >
                <option>Tümü</option>
                <option>4.5+</option>
                <option>4.0+</option>
                <option>3.5+</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                className="flex-1 rounded-lg"
                onClick={() => setActiveFilters({ min: minPrice, max: maxPrice, rating: sellerRating })}
              >
                Filtrele
              </Button>
              {(activeFilters.min || activeFilters.max || activeFilters.rating !== "Tümü") && (
                <Button 
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setSellerRating("Tümü");
                    setActiveFilters({ min: "", max: "", rating: "Tümü" });
                  }}
                >
                  Sıfırla
                </Button>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <ListingGridSkeleton count={10} />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} section={listing.section} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-card border border-border rounded-[2rem]">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">İLAN BULUNAMADI</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto uppercase font-bold opacity-60">
                Bu kategoride henüz aktif ilan bulunmamaktadır. Başka bir kategoriye göz atmaya ne dersiniz?
              </p>
            </div>
            <Link to="/">
              <Button className="rounded-xl px-8 h-12 bg-primary font-black italic tracking-widest uppercase text-xs">
                ANA SAYFAYA GİT
              </Button>
            </Link>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" className="rounded-lg" disabled>Önceki</Button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${p === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {p}
            </button>
          ))}
          <Button variant="outline" size="sm" className="rounded-lg">Sonraki</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
