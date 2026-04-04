import { type ListingSection } from "./marketplace";
import { getCombinedPvpPool, type KocuceItem } from "./rss-service";
import { ListingVisualDirector } from "./visual-director";
import { getRandomItemSatisListingForBot, type ItemSatisListing } from "./itemsatis-scraper";
import { gameLabelForCanonicalCategory, normalizeBotCategoryFilter } from "./category-normalize";

let kocucePvpCache: KocuceItem[] = (() => {
  const cached = localStorage.getItem("itemtr_kocuce_cache");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Kocuce/Pvpkent cache parse error:", e);
      return [];
    }
  }
  return getCombinedPvpPool();
})();

const BOT_IMAGE_CACHE_KEY = "itemtr_bot_image_cache_v13_hd_ai"; // kategori normalize + güvenli filigran
const BOT_STATS_KEY = "itemtr_bot_stats";
const BOT_HISTORY_KEY = "itemtr_bot_listings";
const BOT_USED_NAMES_KEY = "itemtr_bot_used_names";
const BOT_BACKUP_KEY = "itemtr_bot_listings_backup";
const BOT_BULK_OVERRIDE_KEY = "itemtr_bot_bulk_override_url";
const BOT_IMAGE_VERSION_KEY = "itemtr_bot_image_version";
const CURRENT_IMAGE_VERSION = "pro-visual-v13-hd-ai";
export const BOT_LOGO_IMAGE = "/itemtr-bot-logo.svg";

type BotImageCache = Record<string, string>;

const CURATED_GAME_IMAGES: Record<string, string[]> = {
  "CS2": [
    "https://images.unsplash.com/photo-1542751110-97427bbecf20", // CS Scene
    "https://images.unsplash.com/photo-1511512578047-dfb367046420", // Gaming Keyboard/PC
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f"  // Cyberpunk Gaming
  ],
  "Valorant": [
    "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2", // Valorant style
    "https://images.unsplash.com/photo-1560253023-3ee7d644864e", // Abstract High Tech
    "https://images.unsplash.com/photo-1614285457768-646f65ca8548"  // Red/Black Gaming
  ],
  "League of Legends": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e", // Fantasy Landscape
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23", // Magic Purple
    "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd"  // Gaming Setup
  ],
  "Roblox": [
    "https://images.unsplash.com/photo-1614294148960-9aa740632a87", // Roblox Colors
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3", // Minecraft/Voxel
    "https://images.unsplash.com/photo-1611605698335-8b1569810432"  // Social/App style
  ],
  "Metin2": [
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4", // Medieval Armor
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23", // Dark Knight style
    "https://images.unsplash.com/photo-1599713191704-9b7e7262c7fa"  // Ancient Asian Temple
  ],
  "PVP Serverlar": [
    "https://images.unsplash.com/photo-1542751371-6533d2d7a1f9", // Fantasy Battle
    "https://images.unsplash.com/photo-1511512578047-dfb367046420", // Pro Gaming
    "https://images.unsplash.com/photo-1614294148960-9aa740632a87"  // colorful world
  ],
  "PUBG Mobile": [
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f"
  ],
  "Steam": [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420"
  ],
  "Knight Online": [
    "https://images.unsplash.com/photo-1542759564-82f6f1f0e4f3",
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f"
  ],
  "Minecraft": [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
    "https://images.unsplash.com/photo-1614294148960-9aa740632a87",
    "https://images.unsplash.com/photo-1563089145-599997674d42"
  ],
  "Discord": [
    "https://images.unsplash.com/photo-1611605698335-8b1569810432",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420"
  ],
  "default": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420"
  ]
};

const getBotImageCache = (): BotImageCache => {
  const raw = localStorage.getItem(BOT_IMAGE_CACHE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as BotImageCache;
    return {};
  } catch {
    return {};
  }
};

const setBotImageCache = (cache: BotImageCache) => {
  localStorage.setItem(BOT_IMAGE_CACHE_KEY, JSON.stringify(cache));
};

const watermarkImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const fontSize = Math.max(10, Math.floor(canvas.height * 0.025));
        ctx.font = `500 ${fontSize}px sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText("ITEMTR.COM", canvas.width - 20, canvas.height - 15);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        // CORS / tainted canvas: orijinal URL kullan
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      console.warn("Resim yüklenemedi, orjinal URL kullanılıyor:", imageUrl);
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
};

const MAX_POLLINATIONS_PROMPT_LEN = 1200;

const getHdImageForListing = async (category: string, title: string, listingId: string, description: string = ""): Promise<string> => {
  const cache = getBotImageCache();
  const resolvedCat = ListingVisualDirector.resolveCategoryKey(category, title);
  const cacheKey = `pro_${listingId}_v13_${resolvedCat}`;

  if (cache[cacheKey]) return cache[cacheKey];

  let professionalPrompt = ListingVisualDirector.generatePrompt({
    category,
    title,
    description,
    style: "premium",
  });
  if (professionalPrompt.length > MAX_POLLINATIONS_PROMPT_LEN) {
    professionalPrompt = professionalPrompt.slice(0, MAX_POLLINATIONS_PROMPT_LEN);
  }

  const seed = Math.floor(Math.random() * 1_000_000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(professionalPrompt)}?width=1920&height=1080&nologo=true&seed=${seed}`;
  
  try {
    const watermarkedUrl = await watermarkImage(imageUrl);
    cache[cacheKey] = watermarkedUrl;
    setBotImageCache(cache);
    return watermarkedUrl;
  } catch (error) {
    console.error("Filigranlama hatası:", error);
    return imageUrl;
  }
};

const isPlaceholderBotImage = (image?: string | null) => {
  const value = String(image || "").trim();
  if (!value) return true;
  if (value.includes("placehold.co") || value.includes("picsum.photos") || value === BOT_LOGO_IMAGE || value.startsWith("/itemtr")) return true;
  return false;
};

export const updateKocucePvpCache = (items: KocuceItem[]) => {
  kocucePvpCache = items;
  localStorage.setItem("itemtr_kocuce_cache", JSON.stringify(items));
};

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BotListing {
  id: string;
  title: string;
  category: string;
  seller: string;
  sellerAvatar: string;
  price: string;
  image: string;
  description: string;
  seoKeywords: string[];
  isAutoDelivery?: boolean;
  isBot?: boolean;
  isPurchasable?: boolean;
  availabilityMessage?: string;
  stock?: number;
  tags?: string[];
  game?: string;
  reviews?: Review[];
  discount?: string;
  bgColor?: string;
  isVitrin?: boolean;
  sellerExperience?: number;
  section?: ListingSection;
  createdTimestamp: number;
}

export interface BotStats {
  totalListings: number;
  todayListings: number;
  lastUpdate: string;
}

export interface BotNamePoolStats {
  totalNames: number;
  usedNames: number;
  remainingNames: number;
}

const NAME_PREFIXES = ["Anka","Altin","Arena","Asil","Atlas","Ayyildiz","Baron","Beta","Boreas","Cosmos","Delta","Doru","Efsane","Eksen","Firtina","Galaksi","Gece","Gokturk","Kutup","Lodos","Lotus","Nova","Onix","Poyraz","Rota"];
const NAME_SUFFIXES = ["Pazar","Trade","Hub","Center","Market","Point","Store","X","Prime","Zone","Plus","Jet","Max","Link","Gate","Nest","Arena","Port","Base","One"];
const BOT_NAME_POOL = NAME_PREFIXES.flatMap((prefix) => NAME_SUFFIXES.map((suffix, suffixIndex) => `${prefix}${suffix}${suffixIndex % 3 === 0 ? "_TR" : suffixIndex % 4 === 0 ? "Store" : ""}`)).slice(0, 500);
const REVIEWER_POOL = ["Kaan07","MertGame","AsliShopper","VipOyuncu","GizemliMarket","SariLale","NoobBreaker","ProTeslim","KuzeyTrade","ZirveHesap","QuickBuyer","EsportsTR","ApexMurat","LootCan","SteamAyaz","GameLale","GoldBaris","MetinPazar","PixelAda","RiotMina"];

const CATEGORY_CONTENT: Record<string, { titles: string[], descriptions: string[] }> = {
  "CS2": {
    titles: ["3000 Saat Prime CS2 Hesap %100 Guvenli", "CS2 Seçkin Hesap | 10 Yıllık Tecrübe Rozetli", "Kelebek Bıçaklı + 200 Skinli Arşivlik CS2", "Yeşil Trust Factor Prime Hesap (6 Madalyalı)"],
    descriptions: ["✅ Prime Aktif\n• İlk Mail Erişimi Mevcut\n• Anında Teslim Edilir\n• İtemTR Güvencesiyle"]
  },
  "Valorant": {
    titles: ["Valorant Radiant Elmas Rank Hesap - İlk Mail", "Yağmacı + Asil Setli Full Skin Valorant", "Valorant 200 Level Full Karakter Açık"],
    descriptions: ["✨ Valorant Premium Hesap\n- Rank: Elmas 2\n- Mail: Değişebilir\n- Bölge: TR"]
  },
  "League of Legends": {
    titles: ["LoL 100+ Kostüm Diamond Hesap", "Level 30 Unranked Taze Hesap | Fresh"],
    descriptions: ["🔥 Mavi Öz: 50.000+\n- Kostüm: 150 (3 Efsanevi)\n- Rank: Elmas 4"]
  },
  "Roblox": {
    titles: ["Roblox 5000 Robux Paketi En Uygun", "Roblox 10000 Robux - Anında Teslimat"],
    descriptions: ["💎 5000 Robux\n- Teslimat: Gamepass üzerinden\n- Fiyat: En iyi!"]
  },
  "PVP Serverlar": {
    titles: ["Metin2 Efsanesi Geri Dönüyor! %100 Editsiz Emek Server", "Knight Online PVP - Yeni Sunucu Açılışı 5 Nisan!"],
    descriptions: ["AnkaMetin2 1-99 Emek!\n5 Nisan Cuma 21:00 Büyük Açılış!\n• Editsiz, Hilesiz Oyun Keyfi"]
  },
  "PUBG Mobile": {
    titles: ["PUBG Mobile 60 Level Buz Diyari Hesap", "PUBG Mobile Firavun 4. Seviye Hesap"],
    descriptions: ["🔫 Buz Diyarı M416 (Max)\n- Seviye: 65\n- Bağlantılar: Sadece Mail"]
  },
  "Steam": {
    titles: ["Steam 500 TL Cüzdan Kodu - Anında Teslimat", "Steam Oyun Keyi — Bölge TR", "Hesap Devretme - 50+ Oyunlu Steam Hesabı"],
    descriptions: ["🎮 STEAM\n- Anında teslim\n- TRY bölge\n- %100 Güvenli"]
  },
  "Metin2": {
    titles: ["Metin2 25 GB Won Paketi", "Metin2 Item Seti — Hızlı Teslim", "90 Level Bedensel Karakter — Metin2"],
    descriptions: ["Metin2 güvenli teslimat\n- 7/24 aktif\n- İtemTR Garantisiyle"]
  },
  "Knight Online": {
    titles: ["Knight Online Gold Paketi", "USKO KC — Anında Transfer", "Knight Online 80 Level Ringli Char"],
    descriptions: ["KO güvenli trade\n- Hızlı teslim\n- Anında teslimat"]
  },
  "Minecraft": {
    titles: ["Minecraft Java Premium Hesap", "Minecraft + Bedrock Bundle", "Hypixel Uyumlu Minecraft Hesabı"],
    descriptions: ["Java erişimi\n- İlk mail\n- Hemen Teslim"]
  },
  "Discord": {
    titles: ["Discord Nitro 1 Ay", "Discord Server Boost Paketi", "Discord Nitro 1 Yıllık — Hediye"],
    descriptions: ["Nitro hediye linki\n- Anında teslim\n- 7/24 Destek"]
  }
};

const safeJSONParse = <T,>(value: string | null, fallback: T): T => { if (!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } };
const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const curatedFallbackForCategory = (category: string, title: string) => {
  const key = ListingVisualDirector.resolveCategoryKey(category, title);
  const pool = CURATED_GAME_IMAGES[key] || CURATED_GAME_IMAGES[category] || CURATED_GAME_IMAGES["default"];
  return pickRandom(pool);
};
const getUsedBotNames = () => safeJSONParse<string[]>(localStorage.getItem(BOT_USED_NAMES_KEY), []);
const setUsedBotNames = (names: string[]) => localStorage.setItem(BOT_USED_NAMES_KEY, JSON.stringify(names));
const reserveUniqueBotName = () => { const used = getUsedBotNames(); const remaining = BOT_NAME_POOL.filter((name) => !used.includes(name)); if (remaining.length === 0) { const freshPick = pickRandom(BOT_NAME_POOL); setUsedBotNames([freshPick]); return freshPick; } const nextName = pickRandom(remaining); setUsedBotNames([...used, nextName]); return nextName; };

export const getBotNamePoolStats = (): BotNamePoolStats => { const usedNames = getUsedBotNames().length; return { totalNames: BOT_NAME_POOL.length, usedNames, remainingNames: Math.max(BOT_NAME_POOL.length - usedNames, 0) }; };
export const getBotStats = (): BotStats => {
  const today = new Date().toLocaleDateString("tr-TR");
  let stats = safeJSONParse<BotStats | null>(localStorage.getItem(BOT_STATS_KEY), null);
  if (!stats) {
    const history = getBotHistory();
    const todayCount = history.filter((l) => new Date(l.createdTimestamp).toLocaleDateString("tr-TR") === today).length;
    stats = { totalListings: history.length, todayListings: todayCount, lastUpdate: today };
    localStorage.setItem(BOT_STATS_KEY, JSON.stringify(stats));
    return stats;
  }
  if (stats.lastUpdate !== today) {
    const refreshed = { ...stats, todayListings: 0, lastUpdate: today };
    localStorage.setItem(BOT_STATS_KEY, JSON.stringify(refreshed));
    return refreshed;
  }
  return stats;
};

const recordBotListingCreated = () => {
  const today = new Date().toLocaleDateString("tr-TR");
  const prev = safeJSONParse<BotStats | null>(localStorage.getItem(BOT_STATS_KEY), null);
  const totalListings = (prev?.totalListings ?? 0) + 1;
  const todayListings = prev?.lastUpdate === today ? (prev.todayListings ?? 0) + 1 : 1;
  const next: BotStats = { totalListings, todayListings, lastUpdate: today };
  localStorage.setItem(BOT_STATS_KEY, JSON.stringify(next));
};

const applyAdminBotDecorations = (listing: BotListing) => {
  const autoTagsOn = localStorage.getItem("itemtr_bot_auto_tags") !== "false";
  const rawTags = (localStorage.getItem("itemtr_bot_tags") || "")
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (autoTagsOn && rawTags.length) {
    listing.tags = [...new Set([...rawTags, ...(listing.tags || [])])].slice(0, 12);
  }
  const autoReviewsOn = localStorage.getItem("itemtr_bot_auto_reviews") !== "false";
  if (autoReviewsOn) {
    const reviewer = pickRandom(REVIEWER_POOL);
    listing.reviews = [
      {
        id: `rev-${listing.id}-${Date.now()}`,
        user: reviewer,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewer)}&background=1e293b&color=fff`,
        rating: 4 + Math.floor(Math.random() * 2),
        comment: "Hızlı iletişim ve güvenilir teslimat.",
        date: new Date().toLocaleDateString("tr-TR"),
      },
    ];
  }
};

export const getBotHistory = (): BotListing[] => {
  const storedVersion = localStorage.getItem(BOT_IMAGE_VERSION_KEY);
  const history = safeJSONParse<BotListing[]>(localStorage.getItem(BOT_HISTORY_KEY), []);
  if (storedVersion !== CURRENT_IMAGE_VERSION || history.some(l => isPlaceholderBotImage(l.image))) {
    localStorage.removeItem(BOT_HISTORY_KEY);
    localStorage.setItem(BOT_IMAGE_VERSION_KEY, CURRENT_IMAGE_VERSION);
    return [];
  }
  return history;
};

export const getBotListingById = (listingId?: string | null) => listingId ? getBotHistory().find((listing) => listing.id === listingId) || null : null;
export const isBotListingLocked = (listingId?: string | number | null) => { if (!listingId) return false; const normalizedId = String(listingId); if (normalizedId.startsWith("BOT-")) return true; const listing = getBotListingById(normalizedId); return Boolean(listing?.isBot); };

export const generateBotListing = async (): Promise<BotListing> => { 
  const selectedCategory = normalizeBotCategoryFilter(localStorage.getItem("itemtr_bot_category") || "all");
  const customImg = (localStorage.getItem("itemtr_bot_custom_image") || "").trim();
  const minP = Number(localStorage.getItem("itemtr_bot_min_price") || "10");
  const maxP = Number(localStorage.getItem("itemtr_bot_max_price") || "2000");
  const safeMin = Number.isFinite(minP) ? minP : 10;
  const safeMax = Number.isFinite(maxP) ? maxP : 2000;

  const itemsatisListing = await getRandomItemSatisListingForBot(
    selectedCategory === "all" ? undefined : selectedCategory,
    Math.min(safeMin, safeMax),
    Math.max(safeMin, safeMax),
  );

  if (!itemsatisListing) {
    return await generateFallbackBotListing(selectedCategory);
  }

  const seller = reserveUniqueBotName(); 
  const id = `BOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const newListing: BotListing = {
    id,
    title: itemsatisListing.title,
    category: itemsatisListing.category,
    game: gameLabelForCanonicalCategory(itemsatisListing.category),
    seller,
    sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller)}&background=111827&color=FACC15`,
    price: itemsatisListing.price,
    image: itemsatisListing.image,
    description: itemsatisListing.description,
    seoKeywords: [itemsatisListing.category.toLowerCase(), "bot", "itemtr"],
    isAutoDelivery: itemsatisListing.category !== "PVP Serverlar" && Math.random() > 0.3,
    isBot: true,
    isPurchasable: false,
    availabilityMessage: "Ürün Mevcut Değil",
    stock: 0,
    tags: ["Güvenilir", "Hızlı", "ItemTR"],
    reviews: [],
    bgColor: "bg-[#16a34a]",
    isVitrin: Math.random() < 0.25,
    sellerExperience: 5,
    createdTimestamp: Date.now(),
  };

  if (customImg) {
    newListing.image = customImg;
  } else {
    try {
      const hd = await getHdImageForListing(
        newListing.category,
        newListing.title,
        newListing.id,
        newListing.description,
      );
      if (hd && !isPlaceholderBotImage(hd)) newListing.image = hd;
      else newListing.image = curatedFallbackForCategory(newListing.category, newListing.title);
    } catch (e) {
      console.warn("[Bot] HD AI görsel üretilemedi, yedek görsel kullanılıyor:", e);
      newListing.image = curatedFallbackForCategory(newListing.category, newListing.title);
    }
  }

  if (!newListing.image?.trim()) {
    newListing.image = curatedFallbackForCategory(newListing.category, newListing.title);
  }

  applyAdminBotDecorations(newListing);

  const history = getBotHistory();
  history.unshift(newListing); 
  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(history.slice(0, 500))); 
  recordBotListingCreated();
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated")); 
  return newListing; 
};

// Fallback listing generator when itemsatis is unavailable
const generateFallbackBotListing = async (selectedCategory: string): Promise<BotListing> => {
  const normalized = normalizeBotCategoryFilter(selectedCategory);
  let categoryPool = normalized !== "all" ? normalized : pickRandom(Object.keys(CATEGORY_CONTENT));
  if (categoryPool.toLowerCase().includes("pvp")) categoryPool = "PVP Serverlar";
  if (!CATEGORY_CONTENT[categoryPool]) categoryPool = pickRandom(Object.keys(CATEGORY_CONTENT));

  let customTitle = "";
  let customDesc = "";
  if (categoryPool === "PVP Serverlar") {
    const kPool = kocucePvpCache.length > 0 ? kocucePvpCache : getCombinedPvpPool();
    const kItem = pickRandom(kPool);
    if (kItem) {
      customTitle = (kItem as any).title;
      customDesc = (kItem as any).description;
    }
  }

  const content = CATEGORY_CONTENT[categoryPool] || CATEGORY_CONTENT["CS2"];
  const rawTitle = customTitle || pickRandom(content.titles);
  const description = customDesc || pickRandom(content.descriptions);
  const title = rawTitle + (Math.random() > 0.4 ? pickRandom([" ⭐", " [OTO]", " %100", " ✅", " 🔥"]) : "");
  const price = categoryPool === "PVP Serverlar" ? "Tanıtım" : `${Math.floor(Math.random() * 1000 + 100)} ₺`;
  const seller = reserveUniqueBotName(); 
  const id = `BOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const customImgFb = (localStorage.getItem("itemtr_bot_custom_image") || "").trim();
  const fallbackStockImage = curatedFallbackForCategory(categoryPool, title);

  const newListing: BotListing = {
    id,
    title,
    category: categoryPool,
    game: gameLabelForCanonicalCategory(categoryPool),
    seller,
    sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller)}&background=111827&color=FACC15`,
    price,
    image: fallbackStockImage,
    description,
    seoKeywords: [categoryPool.toLowerCase(), "bot"],
    isAutoDelivery: categoryPool !== "PVP Serverlar" && Math.random() > 0.3,
    isBot: true,
    isPurchasable: false,
    availabilityMessage: "Ürün Mevcut Değil",
    stock: 0,
    tags: ["Güvenilir", "Hızlı"],
    reviews: [],
    bgColor: "bg-[#16a34a]",
    isVitrin: Math.random() < 0.25,
    sellerExperience: 5,
    createdTimestamp: Date.now(),
  };

  if (customImgFb) {
    newListing.image = customImgFb;
  } else {
    try {
      const hd = await getHdImageForListing(newListing.category, newListing.title, newListing.id, newListing.description);
      if (hd && !isPlaceholderBotImage(hd)) newListing.image = hd;
      else newListing.image = fallbackStockImage;
    } catch (e) {
      console.warn("[Bot] HD AI görsel üretilemedi, kürasyonlu görsel kullanılıyor:", e);
      newListing.image = fallbackStockImage;
    }
  }

  if (!newListing.image?.trim()) newListing.image = fallbackStockImage;

  applyAdminBotDecorations(newListing);

  const history = getBotHistory();
  history.unshift(newListing); 
  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(history.slice(0, 500))); 
  recordBotListingCreated();
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated")); 
  return newListing; 
};

export const clearBotHistory = () => {
  localStorage.removeItem(BOT_HISTORY_KEY);
  localStorage.removeItem(BOT_STATS_KEY);
  localStorage.removeItem(BOT_USED_NAMES_KEY);
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
};

export const bulkUpdateBotImages = (newUrl: string) => {
  const currentHistory = getBotHistory();
  if (currentHistory.length === 0) return false;
  localStorage.setItem(BOT_BACKUP_KEY, JSON.stringify(currentHistory));
  const updatedHistory = currentHistory.map(listing => ({ ...listing, image: newUrl }));
  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(updatedHistory));
  localStorage.setItem(BOT_BULK_OVERRIDE_KEY, newUrl);
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
  return true;
};

export const undoBotImageUpdate = () => {
  const backup = localStorage.getItem(BOT_BACKUP_KEY);
  if (!backup) return false;
  localStorage.setItem(BOT_HISTORY_KEY, backup);
  localStorage.removeItem(BOT_BACKUP_KEY);
  localStorage.removeItem(BOT_BULK_OVERRIDE_KEY);
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
  return true;
};

