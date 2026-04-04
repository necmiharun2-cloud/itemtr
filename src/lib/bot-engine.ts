import { getMarketplaceListings, type MarketplaceListing, type ListingSection } from "./marketplace";
import { sanitizeContent, getCombinedPvpPool, type KocuceItem } from "./rss-service";

/**
 * In-memory cache for imported PVP items (Kocuce + Pvpkent), persisted to localStorage
 */
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
  return getCombinedPvpPool(); // Initial seed from both sources
})();

const BOT_IMAGE_CACHE_KEY = "itemtr_bot_image_cache_v1";
const BOT_IMAGE_REFRESH_FLAG = "itemtr_bot_images_refreshed_v1";

type BotImageCache = Record<string, string>;

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

const normalizeImageQuery = (value: string) => {
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getSearchQueryForListing = (category: string, title: string) => {
  const lowerCategory = String(category || "").toLowerCase();
  const normalizedTitle = normalizeImageQuery(title || "");

  if (lowerCategory.includes("valorant")) return "valorant";
  if (lowerCategory.includes("cs2") || lowerCategory.includes("counter")) return "counter strike";
  if (lowerCategory.includes("league") || lowerCategory.includes("lol")) return "league of legends";
  if (lowerCategory.includes("pubg")) return "pubg mobile";
  if (lowerCategory.includes("roblox")) return "roblox";
  if (lowerCategory.includes("steam")) return "steam";

  if (lowerCategory.includes("pvp")) {
    // PVP server listings often contain game name in the title
    const titleLower = normalizedTitle.toLowerCase();
    if (titleLower.includes("metin2")) return "metin2 mmorpg";
    if (titleLower.includes("knight")) return "knight online";
    return "mmorpg fantasy";
  }

  // Fallback to cleaned category/title keywords
  const normalizedCategory = normalizeImageQuery(category || "");
  const fallback = normalizedCategory || normalizedTitle;
  return fallback || "gaming";
};

const getHdImageForListing = (category: string, title: string) => {
  const query = getSearchQueryForListing(category, title);
  const cacheKey = query.toLowerCase();
  const cache = getBotImageCache();
  if (cache[cacheKey]) return cache[cacheKey];

  // Unsplash Source provides a random high-res image for a query (no API key).
  // We add a cache-buster based on the query so each query is stable once cached.
  const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
  cache[cacheKey] = url;
  setBotImageCache(cache);
  return url;
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

const BOT_STATS_KEY = "itemtr_bot_stats";
const BOT_HISTORY_KEY = "itemtr_bot_listings";
const BOT_USED_NAMES_KEY = "itemtr_bot_used_names";
const BOT_BACKUP_KEY = "itemtr_bot_listings_backup";
const BOT_BULK_OVERRIDE_KEY = "itemtr_bot_bulk_override_url";
const BOT_IMAGE_VERSION_KEY = "itemtr_bot_image_version";
const CURRENT_IMAGE_VERSION = "v2"; // Increment to force refresh all images
export const BOT_LOGO_IMAGE = "/itemtr-bot-logo.svg";

const NAME_PREFIXES = ["Anka","Altin","Arena","Asil","Atlas","Ayyildiz","Baron","Beta","Boreas","Cosmos","Delta","Doru","Efsane","Eksen","Firtina","Galaksi","Gece","Gokturk","Kutup","Lodos","Lotus","Nova","Onix","Poyraz","Rota"];
const NAME_SUFFIXES = ["Pazar","Trade","Hub","Center","Market","Point","Store","X","Prime","Zone","Plus","Jet","Max","Link","Gate","Nest","Arena","Port","Base","One"];
const BOT_NAME_POOL = NAME_PREFIXES.flatMap((prefix) => NAME_SUFFIXES.map((suffix, suffixIndex) => `${prefix}${suffix}${suffixIndex % 3 === 0 ? "_TR" : suffixIndex % 4 === 0 ? "Store" : ""}`)).slice(0, 500);
const REVIEWER_POOL = ["Kaan07","MertGame","AsliShopper","VipOyuncu","GizemliMarket","SariLale","NoobBreaker","ProTeslim","KuzeyTrade","ZirveHesap","QuickBuyer","EsportsTR","ApexMurat","LootCan","SteamAyaz","GameLale","GoldBaris","MetinPazar","PixelAda","RiotMina"];

const CATEGORY_CONTENT: Record<string, { titles: string[], descriptions: string[] }> = {
  "CS2": {
    titles: [
      "3000 Saat Prime CS2 Hesap %100 Guvenli",
      "CS2 Seçkin Hesap | 10 Yıllık Tecrübe Rozetli",
      "Kelebek Bıçaklı + 200 Skinli Arşivlik CS2",
      "Yeşil Trust Factor Prime Hesap (6 Madalyalı)",
      "CS2 Silver 1 Hesap | Smurf İçin Uygun",
      "Full Madalyalı CS2 Prime | İlk Mail Mevcut",
      "CS2 Envanterli Hesap Uygun Fiyat",
      "Global Elite Rozetli CS2 Hesabı Acil"
    ],
    descriptions: [
      "✅ Hesap Özellikleri:\n• Prime Aktif\n• Yeşil Güven Faktörü\n• Rekabetçi Modu Açık\n• İlk Mail Erişimi Mevcut\n• Anında Teslim Edilir\n• İtemTR Güvencesiyle",
      "Envanter Dolu CS2 Hesabı!\nToplam 450 TL değerinde skin mevcuttur. Prime statüsüdür. Hiçbir yasaklaması yoktur.\nTeslimat 7/24 otomatik sistem üzerinden yapılır.",
      "CS2 PRIME HESAP\n- 5-10 Yıl Rozetleri Mevcut\n- Rank: Altın Nova 2\n- Win: 150+\n- Övgü Puanı: 300\nHesap güvenliği tarafımızca sağlanmaktadır.",
      "beyler hesap tertemizdir hic bir sıkıntısı yok ilk mailiyle vericem alana hayırlı olsun simdiden"
    ]
  },
  "Valorant": {
    titles: [
      "Valorant Radiant Elmas Rank Hesap - İlk Mail",
      "Yağmacı + Asil Setli Full Skin Valorant",
      "Valorant 200 Level Full Karakter Açık",
      "Sadece Ejder Vandal Mevcut Altın Rank",
      "Valorant Random Hesap %100 Çalışır",
      "Valorant Immortal 3 Rank | Rank Yükseltmek İçin",
      "Vandal Skinli Valo Hesabı Ucuz",
      "Asil Phantomlu Radiant Hesabı"
    ],
    descriptions: [
      "✨ Valorant Premium Hesap\n- Skinler: Yağmacı Vandal, Asil Phantom, Ejder Ateşi Hançer\n- Rank: Elmas 2\n- Kademe: 180 LP\n- Mail: Değişebilir\n- Bölge: TR",
      "VALORANT KOSTÜMLÜ HESAP\n- Toplam 12 premium kostüm\n- Rank: Platin 3\n- Tüm ajanlar açık\n- VP Bakiyesi: 150 VP\nKesinlikle ban riski yoktur.",
      "VALORANT RANK HESAP\n- Rank: Radiant\n- Win Rate: %65\n- MMR Yüksek\n- Sadece ciddi alıcılar için uygundur.",
      "fiyatı aciliyetten dusurdum arkadaslar skinler dolu hic bir sorunu yok"
    ]
  },
  "League of Legends": {
    titles: [
      "LoL 100+ Kostüm Diamond Hesap",
      "Level 30 Unranked Taze Hesap | Fresh",
      "Challenger Çerçeveli Full Skin LoL Hesabı",
      "LoL Ebedi Kostümlü (Lüks) Hesap",
      "LoL Silver Rank | Hero Stoğu Tamam"
    ],
    descriptions: [
      "🔥 League of Legends Profesyonel Hesap\n- Mavi Öz: 50.000+\n- Kostüm: 150 (3 Efsanevi)\n- Rank: Elmas 4\n- Takdir Seviyesi: 4\nHesap tertemizdir, ilk sahibi benim.",
      "LOL UNRANKED HESAP\n- 30 Level\n- Mail Onaysız (Kendi mailinizi yapabilirsiniz)\n- MMR Tertemiz\n- Smurf için 1'e 1.",
      "arkadaslar hesapta cok fazla kostüm var main hesabımdı acil paraya ihtiyacım oldugundan satıyorum"
    ]
  },
  "Roblox": {
    titles: [
      "Roblox 5000 Robux Paketi En Uygun",
      "Roblox 10000 Robux - Anında Teslimat",
      "Aged Roblox Hesap (2012 Kayıtlı)",
      "Roblox Adopt Me Fly/Ride Shadow Dragon",
      "Blox Fruits Max Level Verimli Hesap"
    ],
    descriptions: [
      "💎 Roblox Robux Paketi\n- Miktar: 5000 Robux\n- Teslimat: Gamepass üzerinden 5 gün sonra (pending)\n- Fiyat: Piyasanın en iyisi!",
      "ROBLOX HESAP SATIŞI\n- 2015 kayıtlı\n- Değerli itemler mevcut\n- Robux harcanmış hesap\nTekliflere açığız.",
      "Adopt Me Shadow Dragon (Fly/Ride)\n- Oyundaki en nadir petlerden biri\n- Hemen teslimat\n- Güvenli işlem."
    ]
  },
  "PVP Serverlar": {
    titles: [
      "Metin2 Efsanesi Geri Dönüyor! %100 Editsiz Emek Server",
      "Knight Online PVP - Yeni Sunucu Açılışı 5 Nisan!",
      "1-99 Emek Metin2 Server Duyurusu - Büyük Açılış",
      "Artemis2 Metin2 PVP | Global Açılış | 100.000 TL Ödüllü",
      "KnightTR New World | v24xx | Offical 10 Nisan",
      "Metin2 Wslik Server - 104-105 Bit Başlangıç"
    ],
    descriptions: [
      "AnkaMetin2 1-99 Emek Yapısıyla Geri Dönüyor!\n5 Nisan Cuma 21:00 Büyük Açılış!\n• Editsiz, Hilesiz Oyun Keyfi\n• Özel Etkinlik Takvimi\n• 50.000 TL Lonca Turnuvası Ödülü\nKaydol ve İndir şimdiden!",
      "Knight Online En Kaliteli PVP Deneyimi İçin Hazır Olun.\nEski usul farm ve savaş dengesi.\nOfficial Açılış: 10 Nisan.",
      "beklenen server acılıyor arkadaslar yerinizi simdiden alın lonca alımları baslamıstır"
    ]
  },
  "PUBG Mobile": {
    titles: [
      "PUBG Mobile 60 Level Buz Diyari Hesap",
      "PUBG Mobile Firavun 4. Seviye Hesap",
      "PUBG Mobile Random Hesap (Kostümlü)",
      "PUBG Mobile As Rank Hesap"
    ],
    descriptions: [
      "🔫 PUBG Mobile Premium Hesap\n- Buz Diyarı M416 (Max)\n- Yüzyılın Savaşçısı Seti\n- Seviye: 65\n- Bağlantılar: Sadece Mail (Hemen Değiştirilir)",
      "PUBG MOBILE SEVİYE 70\n- Full skin paketleri\n- Eski sezon RP itemleri\n- Rank: Fatih (Eski Sezon)"
    ]
  }
};

const DEFAULT_CONTENT = {
  titles: ["3000 Saat Prime CS2 Hesap %100 Güvenli", "Valorant Radiant Elmas Rank Hesap - İlk Mail"],
  descriptions: ["Hesap tamamen güvenlidir, hesabın bilgileri düzenli tutulmuştur ve teslimat süreci sistem üzerinden yönetilir."]
};

const ITEM_TEMPLATES = [
  { title: "3000 Saat Prime CS2 Hesap %100 Güvenli", category: "CS2" },
  { title: "Valorant Radiant Elmas Rank Hesap - İlk Mail", category: "Valorant" },
  { title: "LoL 100+ Kostüm Diamond Hesap", category: "League of Legends" },
  { title: "Roblox 5000 Robux Paketi En Uygun", category: "Roblox" },
  { title: "Steam 250 TL Cüzdan Kodu", category: "Steam" },
  { title: "Knight Online 10GB Gold Bar (Sirius)", category: "Oyun Parası" },
  { title: "PUBG Mobile 60 Level Buz Diyari Hesap", category: "PUBG Mobile" },
];

const REVIEW_TEMPLATES = [
  "Harika hizmet, anında teslim edildi!",
  "Güvenilir satıcı, teşekkürler.",
  "Her şey anlatıldığı gibi, sorunsuz alışveriş.",
  "Çok yardımcı oldular, tavsiye ederim.",
  "En uygun fiyat buradaydı, pişman değilim.",
  "valla cok hızlı geldi saolun",
  "bi an korktum ama hemen teslim ettiler tsk",
  "guvenilir arkadaslar tavsiye ederim",
  "hızlı ve guvenlı tskler",
  "sorunsuz teslımat cok tesekkurler"
];

const safeJSONParse = <T,>(value: string | null, fallback: T): T => { if (!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } };
const getNumericSetting = (key: string, fallback: number) => { const value = Number(localStorage.getItem(key) || fallback); return Number.isFinite(value) ? value : fallback; };
const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const getUsedBotNames = () => safeJSONParse<string[]>(localStorage.getItem(BOT_USED_NAMES_KEY), []);
const setUsedBotNames = (names: string[]) => localStorage.setItem(BOT_USED_NAMES_KEY, JSON.stringify(names));
const reserveUniqueBotName = () => { const used = getUsedBotNames(); const remaining = BOT_NAME_POOL.filter((name) => !used.includes(name)); if (remaining.length === 0) { const freshPick = pickRandom(BOT_NAME_POOL); setUsedBotNames([freshPick]); return freshPick; } const nextName = pickRandom(remaining); setUsedBotNames([...used, nextName]); return nextName; };
const DEFAULT_BOT_TAGS = ["Güvenilir", "Hızlı Teslimat"];

const getUserTags = () => {
  const rawTags = localStorage.getItem("itemtr_bot_tags");
  if (!rawTags) return DEFAULT_BOT_TAGS;

  if (rawTags.startsWith("[")) {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalizedTags = parsed.map((tag) => String(tag).trim()).filter(Boolean);
        if (normalizedTags.length > 0) return normalizedTags;
      }
    } catch {
      return DEFAULT_BOT_TAGS;
    }
  }

  const parsedTags = rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return parsedTags.length > 0 ? parsedTags : DEFAULT_BOT_TAGS;
};

// Category + Game specific image collections - Using reliable placehold.co
const CATEGORY_IMAGES: Record<string, string[]> = {
  "CS2": [
    "https://placehold.co/800x600/1e293b/f59e0b?text=CS2",
    "https://placehold.co/800x600/0f172a/3b82f6?text=Counter+Strike",
    "https://placehold.co/800x600/1e293b/22c55e?text=Steam",
    "https://placehold.co/800x600/0f172a/ef4444?text=Gaming",
    "https://placehold.co/800x600/1e293b/a855f7?text=CS2+Hesap",
  ],
  "Valorant": [
    "https://placehold.co/800x600/1e293b/f43f5e?text=Valorant",
    "https://placehold.co/800x600/0f172a/f59e0b?text=Riot+Games",
    "https://placehold.co/800x600/1e293b/10b981?text=VP",
    "https://placehold.co/800x600/0f172a/3b82f6?text=Hesap",
    "https://placehold.co/800x600/1e293b/ec4899?text=Skin",
  ],
  "League of Legends": [
    "https://placehold.co/800x600/1e293b/f59e0b?text=LoL",
    "https://placehold.co/800x600/0f172a/3b82f6?text=League",
    "https://placehold.co/800x600/1e293b/22c55e?text=RP",
    "https://placehold.co/800x600/0f172a/a855f7?text=Kostum",
    "https://placehold.co/800x600/1e293b/f43f5e?text=Hesap",
  ],
  "Roblox": [
    "https://placehold.co/800x600/1e293b/22c55e?text=Roblox",
    "https://placehold.co/800x600/0f172a/f59e0b?text=Robux",
    "https://placehold.co/800x600/1e293b/3b82f6?text=Game",
    "https://placehold.co/800x600/0f172a/ec4899?text=Item",
  ],
  "PVP Serverlar": [
    "https://placehold.co/800x600/1e293b/f59e0b?text=Metin2",
    "https://placehold.co/800x600/0f172a/dc2626?text=Knight+Online",
    "https://placehold.co/800x600/1e293b/22c55e?text=PVP+Server",
    "https://placehold.co/800x600/0f172a/3b82f6?text=Minecraft",
    "https://placehold.co/800x600/1e293b/a855f7?text=Server",
    "https://placehold.co/800x600/0f172a/f43f5e?text=MMORPG",
    "https://placehold.co/800x600/1e293b/10b981?text=Oyun",
    "https://placehold.co/800x600/0f172a/f59e0b?text=Tanitim",
  ],
  "PUBG Mobile": [
    "https://placehold.co/800x600/1e293b/f59e0b?text=PUBG",
    "https://placehold.co/800x600/0f172a/22c55e?text=Mobile",
    "https://placehold.co/800x600/1e293b/3b82f6?text=UC",
    "https://placehold.co/800x600/0f172a/dc2626?text=Hesap",
    "https://placehold.co/800x600/1e293b/a855f7?text=Skin",
  ],
  "default": [
    "https://placehold.co/800x600/1e293b/f59e0b?text=Gaming",
    "https://placehold.co/800x600/0f172a/3b82f6?text=Oyun",
    "https://placehold.co/800x600/1e293b/22c55e?text=ItemTR",
    "https://placehold.co/800x600/0f172a/ec4899?text=Market",
    "https://placehold.co/800x600/1e293b/a855f7?text=Hesap",
  ]
};

// Get a random image for a listing based on category - each listing gets unique image
const getCategorySpecificImage = (category: string, listingId: string): string => {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["default"];
  // Use listingId to ensure same listing always gets same image, but different listings get different images
  const hash = listingId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % images.length;
  return images[index];
};

const isPlaceholderBotImage = (image?: string | null) => {
  const value = String(image || "").trim();
  if (!value) return true;

  // Local assets / placeholder logos
  if (value === BOT_LOGO_IMAGE) return true;
  if (value.startsWith("/itemtr")) return true;
  if (value.includes("itemtr-bot-logo")) return true;
  if (value.includes("ui-avatars.com")) return true;
  return false;
};

const refreshBotHistoryImagesOnce = () => {
  // Force refresh - clear flag every time to ensure images are updated
  localStorage.removeItem(BOT_IMAGE_REFRESH_FLAG);
  
  const history = safeJSONParse<BotListing[]>(localStorage.getItem(BOT_HISTORY_KEY), []);
  if (!Array.isArray(history) || history.length === 0) {
    localStorage.setItem(BOT_IMAGE_REFRESH_FLAG, "true");
    return;
  }

  // Update ALL bot listings with category-specific images (force update)
  const updated = history.map((listing) => {
    if (!listing) return listing;
    // Always assign new category-specific image
    return {
      ...listing,
      image: getCategorySpecificImage(listing.category, listing.id),
    };
  });

  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(updated));
  localStorage.setItem(BOT_IMAGE_REFRESH_FLAG, "true");
  
  // Dispatch event to refresh UI
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
};
export const getBotNamePoolStats = (): BotNamePoolStats => { const usedNames = getUsedBotNames().length; return { totalNames: BOT_NAME_POOL.length, usedNames, remainingNames: Math.max(BOT_NAME_POOL.length - usedNames, 0) }; };
export const getBotStats = (): BotStats => { const today = new Date().toLocaleDateString(); const stats = safeJSONParse<BotStats | null>(localStorage.getItem(BOT_STATS_KEY), null); if (!stats) return { totalListings: 148, todayListings: 24, lastUpdate: today }; if (stats.lastUpdate !== today) { const refreshed = { ...stats, todayListings: 0, lastUpdate: today }; localStorage.setItem(BOT_STATS_KEY, JSON.stringify(refreshed)); return refreshed; } return stats; };
const incrementBotStats = () => { const stats = getBotStats(); localStorage.setItem(BOT_STATS_KEY, JSON.stringify({ totalListings: stats.totalListings + 1, todayListings: stats.todayListings + 1, lastUpdate: new Date().toLocaleDateString() })); };
export const getBotHistory = (): BotListing[] => {
  // Check version and clear if outdated
  const storedVersion = localStorage.getItem(BOT_IMAGE_VERSION_KEY);
  if (storedVersion !== CURRENT_IMAGE_VERSION) {
    console.log('[Bot Engine] Image version changed, clearing old bot listings...');
    localStorage.removeItem(BOT_HISTORY_KEY);
    localStorage.setItem(BOT_IMAGE_VERSION_KEY, CURRENT_IMAGE_VERSION);
    return [];
  }
  return safeJSONParse<BotListing[]>(localStorage.getItem(BOT_HISTORY_KEY), []);
};
export const getBotListingById = (listingId?: string | null) => listingId ? getBotHistory().find((listing) => listing.id === listingId) || null : null;
export const isBotListingLocked = (listingId?: string | number | null) => { if (!listingId) return false; const normalizedId = String(listingId); if (normalizedId.startsWith("BOT-")) return true; const listing = getBotListingById(normalizedId); return Boolean(listing?.isBot || listing?.isPurchasable === false); };

export const generateBotListing = (): BotListing => { 
  const minPrice = getNumericSetting("itemtr_bot_min_price", 10); 
  const maxPrice = getNumericSetting("itemtr_bot_max_price", 2000); 
  const priceFloor = Math.min(minPrice, maxPrice); 
  const priceCeil = Math.max(minPrice, maxPrice); 
  const selectedCategory = localStorage.getItem("itemtr_bot_category") || "all"; 
  const autoReviews = localStorage.getItem("itemtr_bot_auto_reviews") === "true"; 
  const userTags = getUserTags(); 

  // Realistic generation logic
  let categoryPool = selectedCategory !== "all" ? selectedCategory : pickRandom(Object.keys(CATEGORY_CONTENT));
  
  // Normalize PVP category selection
  if (categoryPool.toLowerCase() === "pvp" || categoryPool.toLowerCase().includes("pvp server")) {
    categoryPool = "PVP Serverlar";
  }

  // Custom logic for PVP Serverlar using Kocuce data
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

  const content = CATEGORY_CONTENT[categoryPool] || DEFAULT_CONTENT;
  const rawTitle = customTitle || pickRandom(content.titles);
  const description = customDesc || pickRandom(content.descriptions);
  
  // Add professional suffixes
  const suffixes = [" ⭐", " [ANINDA]", " [GÜVENLİ]", " [OTO]", " %100", " ✅", " 🔥", " acil"];
  const title = rawTitle + (Math.random() > 0.4 ? pickRandom(suffixes) : "");

  const seller = reserveUniqueBotName(); 
  const priceRaw = categoryPool === "PVP Serverlar" ? "Tanıtım" : Math.floor(Math.random() * (priceCeil - priceFloor) + priceFloor).toString(); 
  const price = categoryPool === "PVP Serverlar" ? "Tanıtım" : `${priceRaw} ₺`;
  
  const titleWords = title.toLowerCase().split(" ").filter((word) => word.length > 3 && !["prime", "hesap", "satisi"].includes(word)); 
  const dynamicTags = titleWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const seoKeywords = [...new Set([...titleWords, "itemtr", categoryPool.toLowerCase(), "bot-ilani"])]; 
  
  incrementBotStats(); 
  const reviews: Review[] = []; 
  if (autoReviews) { 
    const reviewCount = Math.floor(Math.random() * 4) + 1; 
    for (let i = 0; i < reviewCount; i += 1) { 
      const reviewer = pickRandom(REVIEWER_POOL); 
      reviews.push({ 
        id: Math.random().toString(36).slice(2, 11), 
        user: reviewer, 
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewer)}&background=random&color=fff`, 
        rating: Math.floor(Math.random() * 2) + 4, 
        comment: pickRandom(REVIEW_TEMPLATES), 
        date: "2 dk önce" 
      }); 
    } 
  } 

const discounts = ["-25%", "-35%", "-50%", "-75%"];
const bgColors = [
  "bg-[#16a34a]", // Green
  "bg-[#dc2626]", // Red
  "bg-[#9333ea]", // Purple
  "bg-[#2563eb]", // Blue
  "bg-[#0891b2]", // Cyan
  "bg-[#d97706]", // Orange
  "bg-[#4f46e5]", // Indigo
];

// Special listing tags for variety
const SPECIAL_TAGS = [
  "acil satılık",
  "trde tek",
  "full hesap",
  "anlık teslimat",
  "7/24 aktif",
  "orijinal mail",
  "ilk sahibinden",
  "kullanılmamış",
  "garantili",
  "ucuz fiyat",
  "sınırlı stok",
  "kampanyalı",
  "yeni ürün",
  "full paket",
  "premium",
  "vip üye",
  "profesyonel",
  "hızlı teslimat",
  "güvenilir satıcı",
  "kaçırma",
];

const CUSTOM_IMAGES = [
  "/itemtr-bot-logo.svg",
  "/itemtr-logo.png",
  "https://placehold.co/800x600/1e293b/f59e0b?text=Gaming",
  "https://placehold.co/800x600/0f172a/10b981?text=ItemTR",
];

  const customImage = localStorage.getItem("itemtr_bot_custom_image");
  const pvpImage = "https://placehold.co/800x600/0f172a/f59e0b?text=PVP+Server"; // Reliable gaming placeholder

  const history = getBotHistory(); 
  
  // Generate unique listing ID first
  const listingId = `BOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  
  // Scarcity logic: 25% chance to be a showcased (vitrin) listing
  const shouldBeVitrin = categoryPool !== "PVP Serverlar" && Math.random() < 0.25;
  
  // Mix special tags - randomly select 2-4 tags
  const tagCount = Math.floor(Math.random() * 3) + 2;
  const mixedSpecialTags = [...SPECIAL_TAGS]
    .sort(() => Math.random() - 0.5)
    .slice(0, tagCount);
  const finalTags = [...new Set([...userTags, ...dynamicTags, ...mixedSpecialTags])];
  
  // Random seller experience 0-6 (for 7 tier levels)
  const sellerExp = Math.floor(Math.random() * 7);
  
  // Category-specific image based on listing ID (ensures unique image per listing)
  const finalImage = customImage || getCategorySpecificImage(categoryPool, listingId);

  const newListing: BotListing = { 
    id: listingId, 
    title, 
    category: categoryPool, 
    seller, 
    sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller)}&background=111827&color=FACC15`, 
    price, 
    image: finalImage,
    description, 
    seoKeywords, 
    isAutoDelivery: categoryPool !== "PVP Serverlar" && Math.random() > 0.3, 
    isBot: true, 
    isPurchasable: false, 
    availabilityMessage: categoryPool === "PVP Serverlar" ? "Server Tanıtımı" : "Ürün Mevcut Değil", 
    stock: 0, 
    tags: finalTags.slice(0, 8), // Max 8 tags
    reviews,
    discount: categoryPool !== "PVP Serverlar" && Math.random() > 0.3 ? pickRandom(discounts) : undefined,
    bgColor: pickRandom(bgColors),
    isVitrin: shouldBeVitrin,
    sellerExperience: sellerExp,
    createdTimestamp: Date.now()
  }; 
  
  history.unshift(newListing); 
  if (history.length > 500) history.pop(); 
  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(history)); 
  
  // Standard marketplace updated event for UI reactivity
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated")); 
  return newListing; 
};

export const bulkUpdateBotImages = (newUrl: string) => {
  const currentHistory = getBotHistory();
  if (currentHistory.length === 0) return false;

  localStorage.setItem(BOT_BACKUP_KEY, JSON.stringify(currentHistory));

  const updatedHistory = currentHistory.map(listing => ({
    ...listing,
    image: newUrl
  }));

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

export const clearBotHistory = () => {
  localStorage.removeItem(BOT_HISTORY_KEY);
  localStorage.removeItem(BOT_STATS_KEY);
  localStorage.removeItem(BOT_USED_NAMES_KEY);
  localStorage.removeItem(BOT_BACKUP_KEY);
  window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
};

// --- BACKGROUND AUTOMATION ---
const initializeBotAutomation = () => {
  if (typeof window === "undefined") return;

  const runAutomation = () => {
    // Sync with Admin.tsx key
    const setting = localStorage.getItem("itemtr_bot_enabled");
    const isEnabled = setting === null ? true : setting === "true";
    
    // Auto-initialize if first time
    if (setting === null) {
      localStorage.setItem("itemtr_bot_enabled", "true");
    }

    if (!isEnabled) {
      return;
    }

    // Dynamic interval check based on Admin setting
    const intervalSec = Number(localStorage.getItem("itemtr_bot_interval") || "45");
    const now = Date.now();
    const lastRun = Number(localStorage.getItem("itemtr_bot_last_run") || "0");

    if (now - lastRun >= intervalSec * 1000) {
      // 70% chance to generate if history is low, else 40%
      const historyCount = getBotHistory().length;
      const threshold = historyCount < 15 ? 0.8 : 0.4;

      if (Math.random() < threshold) {
        console.log(`[Bot Engine] Generating listing (Interval: ${intervalSec}s)`);
        generateBotListing();
        localStorage.setItem("itemtr_bot_last_run", String(now));
      } else {
        console.log(`[Bot Engine] Skipping generation (Probability roll)`);
        // Still update last run to respect the interval cadence
        localStorage.setItem("itemtr_bot_last_run", String(now));
      }
    }
  };

  // Run a check every 10 seconds to see if it's time to generate
  // This is more responsive than a single long interval
  setInterval(runAutomation, 1000 * 10);
  
  // Initial check after 3 seconds
  setTimeout(runAutomation, 1000 * 3);
};

if (typeof window !== "undefined" && !import.meta.env.VITEST) {
  initializeBotAutomation();
}
