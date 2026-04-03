import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { getStoryCategories, type StoryCategory } from "@/lib/marketplace";

const StoryCategories = () => {
  const [stories, setStories] = useState<StoryCategory[]>(getStoryCategories());

  useEffect(() => {
    const syncStories = () => setStories(getStoryCategories());
    window.addEventListener("itemtr-marketplace-updated", syncStories);
    window.addEventListener("storage", syncStories);
    return () => {
      window.removeEventListener("itemtr-marketplace-updated", syncStories);
      window.removeEventListener("storage", syncStories);
    };
  }, []);

  const marqueeStories = [...stories, ...stories];

  return (
    <div className="overflow-hidden bg-gradient-to-b from-background to-background/50 py-6">
      <div className="container space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Kategoriler</p>
            <h2 className="text-lg font-bold text-foreground">Yeni ilan gelen kategoriler üstünde yeşil nokta görünür.</h2>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div className="story-marquee flex w-max items-center gap-6 md:gap-10">
            {marqueeStories.map((story, index) => (
              <Link key={`${story.slug}-${index}`} to={story.href} className="group relative flex shrink-0 flex-col items-center gap-3">
                {story.isNew && (
                  <div className="absolute -right-1 -top-1 z-20">
                    <span className="flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full border border-white/40 bg-green-500" />
                    </span>
                  </div>
                )}
                <div className={cn("rounded-full border border-white/5 bg-gradient-to-tr p-[3px] shadow-xl shadow-black/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", story.color)}>
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-background bg-card ring-4 ring-black/20 md:h-20 md:w-20">
                    <img
                      src={story.image}
                      alt={story.label}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.label)}&background=random`;
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
                    {story.label}
                  </span>
                  <span className="text-[8px] font-bold uppercase text-muted-foreground/40 transition-all group-hover:text-muted-foreground">Kategori</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCategories;
