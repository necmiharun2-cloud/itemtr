import { Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Calendar, Eye, Tag } from "lucide-react";
import { SITE_NAME } from "@/lib/site-brand";

const featuredPost = {
  title: "CS2 Yeni Güncelleme: Nuke Haritası Yenilendi!",
  excerpt: "Valve, Counter-Strike 2 için büyük bir güncelleme yayınladı. Nuke haritası tamamen yeniden tasarlandı ve performans iyileştirmeleri yapıldı.",
  date: "30 Mar 2026",
  views: 4521,
  category: "Oyun Haberleri",
  gradient: "from-orange-600 to-red-600",
};

const posts = [
  { id: 1, title: "Valorant Yeni Ajan Sızdırıldı!", excerpt: "Riot Games'in yeni ajanı hakkında ilk bilgiler ortaya çıktı...", date: "29 Mar 2026", views: 3200, category: "Valorant", gradient: "from-red-500 to-pink-600" },
  { id: 2, title: "Roblox'ta Güvenli Alışveriş Rehberi", excerpt: "Roblox hesap ve item alırken dikkat etmeniz gerekenler...", date: "28 Mar 2026", views: 2100, category: "Rehber", gradient: "from-green-500 to-emerald-600" },
  { id: 3, title: "Steam Yaz İndirimleri Ne Zaman?", excerpt: "Steam'in 2026 yaz indirimlerinin başlangıç tarihi belli oldu...", date: "27 Mar 2026", views: 5600, category: "Steam", gradient: "from-blue-500 to-cyan-600" },
  { id: 4, title: "Discord Nitro Kazanmanın Güvenli Yolları", excerpt: "Yasal yollarla Discord Nitro kazanmanın en etkili yöntemleri...", date: "26 Mar 2026", views: 8900, category: "Discord", gradient: "from-indigo-500 to-purple-600" },
  { id: 5, title: "Brawl Stars Sezon 28 Yenilikleri", excerpt: "Yeni brawler, haritalar ve oyun modları hakkında detaylı bilgi...", date: "25 Mar 2026", views: 1800, category: "Brawl Stars", gradient: "from-yellow-500 to-orange-600" },
  { id: 6, title: `${SITE_NAME} güvenlik ipuçları`, excerpt: "Hesabınızı korumak için alınması gereken önlemler ve güvenlik ayarları...", date: "24 Mar 2026", views: 3400, category: "Rehber", gradient: "from-emerald-500 to-teal-600" },
];

const categories = ["Tümü", "Oyun Haberleri", "Rehber", "Valorant", "Steam", "Discord", "Brawl Stars"];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container space-y-6 py-6">
        <h1 className="text-2xl font-bold text-foreground">Blog & Haberler</h1>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={`space-y-3 rounded-2xl bg-gradient-to-r ${featuredPost.gradient} p-8`}>
          <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white">{featuredPost.category}</span>
          <h2 className="text-2xl font-bold text-white">{featuredPost.title}</h2>
          <p className="max-w-2xl text-white/80">{featuredPost.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featuredPost.date}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{featuredPost.views} görüntülenme</span>
          </div>
          <Link to="/support" className="mt-2 inline-flex rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-white/90">
            Devamını Oku
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog#post-${post.id}`} className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40">
              <div className={`h-32 bg-gradient-to-r ${post.gradient}`} id={`post-${post.id}`} />
              <div className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">{post.category}</span>
                </div>
                <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">{post.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
