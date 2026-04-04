import { getMarketplaceListings, type MarketplaceListing, type ListingSection } from "./marketplace";
import { sanitizeContent, getCombinedPvpPool, type KocuceItem } from "./rss-service";

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

const BOT_IMAGE_CACHE_KEY = "itemtr_bot_image_cache_v1";
const BOT_STATS_KEY = "itemtr_bot_stats";
const BOT_HISTORY_KEY = "itemtr_bot_listings";
const BOT_USED_NAMES_KEY = "itemtr_bot_used_names";
const BOT_BACKUP_KEY = "itemtr_bot_listings_backup";
const BOT_BULK_OVERRIDE_KEY = "itemtr_bot_bulk_override_url";
const BOT_IMAGE_VERSION_KEY = "itemtr_bot_image_version";
const CURRENT_IMAGE_VERSION = "hd-v4";
export const BOT_LOGO_IMAGE = "/itemtr-bot-logo.svg";

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

const getSearchQueryForListing = (category: string, title: string) => {
  const lowerCategory = String(category || "").toLowerCase();
  const lowerTitle = String(title || "").toLowerCase();

  if (lowerCategory.includes("valorant")) return "valorant game character";
  if (lowerCategory.includes("cs2") || lowerCategory.includes("counter")) return "csgo counter strike skins";
  if (lowerCategory.includes("league") || lowerCategory.includes("lol")) return "league of legends wallpaper";
  if (lowerCategory.includes("pubg")) return "pubg mobile battle royale";
  if (lowerCategory.includes("roblox")) return "roblox gaming world";
  if (lowerCategory.includes("metin2") || lowerTitle.includes("metin2")) return "medieval warrior armor sword";
  if (lowerCategory.includes("knight") || lowerTitle.includes("knight")) return "knight armor sword";
  if (lowerCategory.includes("pvp")) return "fantasy mmorpg world";
  
  return `${category} gaming hd`.slice(0, 50);
};

const getHdImageForListing = (category: string, title: string) => {
  const query = getSearchQueryForListing(category, title);
  const cache = getBotImageCache();
  const cacheKey = query.toLowerCase();
  
  if (cache[cacheKey]) return cache[cacheKey];

  const url = `https://source.unsplash.com/featured/1600x900?${encodeURIComponent(query)}&sig=${Math.random().toString(36).slice(2, 7)}`;
  cache[cacheKey] = url;
  setBotImageCache(cache);
  return url;
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
  }
};

const safeJSONParse = <T,>(value: string | null, fallback: T): T => { if (!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } };
const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const getUsedBotNames = () => safeJSONParse<string[]>(localStorage.getItem(BOT_USED_NAMES_KEY), []);
const setUsedBotNames = (names: string[]) => localStorage.setItem(BOT_USED_NAMES_KEY, JSON.stringify(names));
const reserveUniqueBotName = () => { const used = getUsedBotNames(); const remaining = BOT_NAME_POOL.filter((name) => !used.includes(name)); if (remaining.length === 0) { const freshPick = pickRandom(BOT_NAME_POOL); setUsedBotNames([freshPick]); return freshPick; } const nextName = pickRandom(remaining); setUsedBotNames([...used, nextName]); return nextName; };

export const getBotNamePoolStats = (): BotNamePoolStats => { const usedNames = getUsedBotNames().length; return { totalNames: BOT_NAME_POOL.length, usedNames, remainingNames: Math.max(BOT_NAME_POOL.length - usedNames, 0) }; };
export const getBotStats = (): BotStats => { const today = new Date().toLocaleDateString(); const stats = safeJSONParse<BotStats | null>(localStorage.getItem(BOT_STATS_KEY), null); if (!stats) return { totalListings: 148, todayListings: 24, lastUpdate: today }; if (stats.lastUpdate !== today) { const refreshed = { ...stats, todayListings: 0, lastUpdate: today }; localStorage.setItem(BOT_STATS_KEY, JSON.stringify(refreshed)); return refreshed; } return stats; };

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

export const generateBotListing = (): BotListing => { 
  const minPrice = Number(localStorage.getItem("itemtr_bot_min_price") || 10); 
  const maxPrice = Number(localStorage.getItem("itemtr_bot_max_price") || 2000); 
  const selectedCategory = localStorage.getItem("itemtr_bot_category") || "all"; 

  let categoryPool = selectedCategory !== "all" ? selectedCategory : pickRandom(Object.keys(CATEGORY_CONTENT));
  if (categoryPool.toLowerCase().includes("pvp")) categoryPool = "PVP Serverlar";

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
  const price = categoryPool === "PVP Serverlar" ? "Tanıtım" : `${Math.floor(Math.random() * (maxPrice - minPrice) + minPrice)} ₺`;
  const seller = reserveUniqueBotName(); 

  const newListing: BotListing = { 
    id: `BOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, 
    title, category: categoryPool, seller, sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller)}&background=111827&color=FACC15`, price, 
    image: getHdImageForListing(categoryPool, title),
    description, seoKeywords: [categoryPool.toLowerCase(), "bot"], 
    isAutoDelivery: categoryPool !== "PVP Serverlar" && Math.random() > 0.3, isBot: true, isPurchasable: false, availabilityMessage: "Ürün Mevcut Değil", stock: 0, 
    tags: ["Güvenilir", "Hızlı"], reviews: [],
    bgColor: "bg-[#16a34a]", isVitrin: Math.random() < 0.25, sellerExperience: 5, createdTimestamp: Date.now()
  }; 
  
  const history = getBotHistory();
  history.unshift(newListing); 
  localStorage.setItem(BOT_HISTORY_KEY, JSON.stringify(history.slice(0, 500))); 
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

const initializeBotAutomation = () => {
  if (typeof window === "undefined") return;
  const runAutomation = () => {
    if (localStorage.getItem("itemtr_bot_enabled") === "false") return;
    const intervalSec = Number(localStorage.getItem("itemtr_bot_interval") || "45");
    const lastRun = Number(localStorage.getItem("itemtr_bot_last_run") || "0");
    if (Date.now() - lastRun >= intervalSec * 1000) {
      generateBotListing();
      localStorage.setItem("itemtr_bot_last_run", String(Date.now()));
    }
  };
  setInterval(runAutomation, 10000);
};

if (typeof window !== "undefined" && !import.meta.env.VITEST) initializeBotAutomation();
