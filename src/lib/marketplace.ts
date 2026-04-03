import { safeJSONParse } from "@/lib/utils";
import { getBotHistory, BOT_LOGO_IMAGE } from "./bot-engine";
import { supabase } from "./supabase";

export type ListingSection = "vitrin" | "new" | "pvp";

export type MarketplaceListing = {
  id: string;
  title: string;
  category: string;
  seller: string;
  seller_id?: string; // Supabase seller ID
  price: string;
  oldPrice?: string;
  imageColor?: string;
  emoji?: string;
  image?: string;
  views?: number;
  favorites?: number;
  createdAt?: string;
  description?: string;
  game?: string;
  features?: string[];
  isAutoDelivery?: boolean;
  isPurchasable?: boolean;
  tags?: string[];
  section: ListingSection;
  isVitrin?: boolean;
  reviews?: any[];
  sellerAvatar?: string;
  sellerExperience?: number; // 0-6 for 7 tier levels
  sellerRating?: number; // 0-5 rating
  createdTimestamp: number;
  status?: string;
  stock?: number;
};

export type StoryCategory = {
  label: string;
  slug: string;
  image: string;
  color: string;
  isNew: boolean;
  href: string;
};

const USER_LISTINGS_KEY = "itemtr_user_marketplace_listings";

const now = Date.now();
const hoursAgo = (hours: number) => now - hours * 60 * 60 * 1000;

export const CATEGORY_STORIES = [
  { label: "CS2", slug: "cs2", color: "from-orange-500 to-yellow-500", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800&auto=format&fit=crop" },
  { label: "Valorant", slug: "valorant", color: "from-red-500 to-pink-500", image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2?q=80&w=800&auto=format&fit=crop" },
  { label: "Steam", slug: "steam", color: "from-blue-500 to-cyan-500", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop" },
  { label: "Roblox", slug: "roblox", color: "from-green-500 to-emerald-500", image: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=800&auto=format&fit=crop" },
  { label: "Minecraft", slug: "minecraft", color: "from-amber-500 to-orange-500", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop" },
  { label: "Discord", slug: "discord", color: "from-indigo-500 to-blue-500", image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=800&auto=format&fit=crop" },
  { label: "PUBG Mobile", slug: "pubg-mobile", color: "from-yellow-600 to-amber-600", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" },
  { label: "Metin2", slug: "metin2", color: "from-rose-500 to-red-600", image: "https://images.unsplash.com/photo-1542751371-29b95d39f6d4?q=80&w=800&auto=format&fit=crop" },
  { label: "Knight Online", slug: "knight-online", color: "from-purple-500 to-violet-500", image: "https://images.unsplash.com/photo-1542759564-82f6f1f0e4f3?q=80&w=800&auto=format&fit=crop" },
  { label: "PVP Serverlar", slug: "pvp-serverlar", color: "from-emerald-500 to-teal-500", image: "https://images.unsplash.com/photo-1542751371-6533d2d7a1f9?q=80&w=800&auto=format&fit=crop" },
] as const;

const SEED_LISTINGS: MarketplaceListing[] = [
  {
    id: "V-101",
    title: "Global Elite Rozetli CS2 Prime Hesap",
    category: "CS2 Hesap Satışı",
    seller: "IlkanShop",
    price: "249,90 ₺",
    oldPrice: "349,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 1847,
    favorites: 234,
    createdAt: "20 dk önce",
    description: "Prime açık, yeşil trust factor ve ilk mail erişimiyle teslim edilir.",
    game: "CS2",
    features: ["Vitrin görünümü", "Anında teslimat", "İlk mail"],
    isAutoDelivery: true,
    tags: ["Prime", "Global", "Rozetli", "acil satılık", "trde tek"],
    section: "vitrin",
    isVitrin: true,
    sellerExperience: 5,
    createdTimestamp: hoursAgo(3),
  },
  {
    id: "V-102",
    title: "Valorant Radiant + Full Skin Arşiv Hesap",
    category: "Valorant Hesap",
    seller: "MarcusStore",
    price: "4.999,90 ₺",
    oldPrice: "5.499,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 1320,
    favorites: 174,
    createdAt: "1 saat önce",
    description: "Radiant rütbeli, koleksiyon skinli ve region hazır hesap.",
    game: "Valorant",
    features: ["Vitrin görünümü", "Premium koleksiyon", "Güvenli teslim"],
    tags: ["Radiant", "Skin", "Premium", "full hesap", "anlık teslimat"],
    section: "vitrin",
    isVitrin: true,
    sellerExperience: 6,
    createdTimestamp: hoursAgo(5),
  },
  {
    id: "V-103",
    title: "5000 Robux Komisyonsuz Teslim",
    category: "Roblox Robux",
    seller: "RZShop",
    price: "1.099,90 ₺",
    oldPrice: "1.299,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 1204,
    favorites: 86,
    createdAt: "35 dk önce",
    description: "Komisyonsuz robux teslimatı, güvenli satın alma akışıyla anında işleme alınır.",
    game: "Roblox",
    features: ["Vitrin görünümü", "Hızlı teslimat"],
    isAutoDelivery: true,
    tags: ["Robux", "Anlık", "Uygun", "7/24 aktif", "orijinal mail"],
    section: "vitrin",
    isVitrin: true,
    sellerExperience: 4,
    createdTimestamp: hoursAgo(7),
  },
  {
    id: "V-104",
    title: "Steam 1000 TL Cüzdan Kodu",
    category: "Steam Cüzdan Kodu",
    seller: "TopSeller",
    price: "849,90 ₺",
    oldPrice: "999,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 776,
    favorites: 59,
    createdAt: "2 saat önce",
    description: "Steam bakiyenize güvenli şekilde anında yüklenebilen kod.",
    game: "Steam",
    features: ["Vitrin görünümü", "Kod garantisi"],
    isAutoDelivery: true,
    tags: ["Kod", "Bakiye", "Steam", "ilk sahibinden", "garantili"],
    section: "vitrin",
    isVitrin: true,
    sellerExperience: 5,
    createdTimestamp: hoursAgo(9),
  },
  {
    id: "N-201",
    title: "Minecraft Java + Bedrock Premium Hesap",
    category: "Minecraft Hesap",
    seller: "GameVault",
    price: "24,90 ₺",
    oldPrice: "49,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 439,
    favorites: 28,
    createdAt: "Az önce",
    description: "Java ve Bedrock erişimi açık premium hesap.",
    game: "Minecraft",
    features: ["Yeni ilan", "Garantili"],
    tags: ["Java", "Bedrock", "Premium", "ucuz fiyat", "sınırlı stok"],
    section: "new",
    sellerExperience: 2,
    createdTimestamp: hoursAgo(0.4),
  },
  {
    id: "N-202",
    title: "Discord Nitro 1 Yıllık Hesap",
    category: "Discord",
    seller: "QuickSell",
    price: "299,90 ₺",
    oldPrice: "449,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 522,
    favorites: 44,
    createdAt: "18 dk önce",
    description: "Sunucu ve profil avantajlarına sahip premium nitro erişimi.",
    game: "Discord",
    features: ["Yeni ilan", "Premium"],
    tags: ["Nitro", "1 Yıl", "Öne çıkan", "kampanyalı", "yeni ürün"],
    section: "new",
    sellerExperience: 3,
    createdTimestamp: hoursAgo(1),
  },
  {
    id: "N-203",
    title: "PUBG Mobile 6000 UC Yükleme",
    category: "PUBG Mobile",
    seller: "UCMarket",
    price: "599,90 ₺",
    oldPrice: "799,90 ₺",
    image: BOT_LOGO_IMAGE,
    views: 1104,
    favorites: 97,
    createdAt: "11 dk önce",
    description: "Hızlı UC yükleme hizmeti, premium teslimat akışına uygundur.",
    game: "PUBG Mobile",
    features: ["Yeni ilan", "Hızlı işlem"],
    isAutoDelivery: true,
    tags: ["UC", "Mobil", "Hızlı", "full paket", "premium"],
    section: "new",
    sellerExperience: 4,
    createdTimestamp: hoursAgo(2),
  },
  {
    id: "N-204",
    title: "Metin2 Ezel 10 GB Won",
    category: "Metin2 Won",
    seller: "WonSatici",
    price: "285,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: 660,
    favorites: 39,
    createdAt: "42 dk önce",
    description: "Ezel sunucusu için hızlı teslim won ilanı.",
    game: "Metin2",
    features: ["Yeni ilan", "Hızlı teslim"],
    tags: ["Won", "Ezel", "vip üye", "profesyonel", "hızlı teslimat"],
    section: "new",
    sellerExperience: 3,
    createdTimestamp: hoursAgo(4),
  },
  {
    id: "N-205",
    title: "Knight Online 10 GB Gold Bar",
    category: "Knight Online",
    seller: "KOSatici",
    price: "420,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: 518,
    favorites: 31,
    createdAt: "1 saat önce",
    description: "Hızlı teslim ve güvenli havuz sistemi ile GB satışı.",
    game: "Knight Online",
    features: ["Yeni ilan", "Güvenli işlem"],
    tags: ["GB", "Knight", "güvenilir satıcı", "kaçırma", "acil satılık"],
    section: "new",
    sellerExperience: 5,
    createdTimestamp: hoursAgo(6),
  },
  {
    id: "P-301",
    title: "RiseNetwork #105 Firelands PVP Açılış Duyurusu",
    category: "PVP Server Tanıtımı",
    seller: "RiseNetwork",
    price: "2.500,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: 2900,
    favorites: 182,
    createdAt: "30 dk önce",
    description: "Açılış: 5 Nisan 21:00. Orta emek, farm dengeli ekonomi, 2 haftalık etkinlik planı hazır.",
    game: "PVP Serverlar",
    features: ["Server tanıtımı", "Açılış duyurusu", "Banner desteği"],
    tags: ["Metin2", "Açılış", "Firelands", "trde tek", "full paket"],
    section: "pvp",
    sellerExperience: 6,
    createdTimestamp: hoursAgo(1.5),
  },
  {
    id: "P-302",
    title: "KnightTR Reborn PVP Server Tanıtımı",
    category: "PVP Server Tanıtımı",
    seller: "KnightTR",
    price: "1.950,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: 1840,
    favorites: 122,
    createdAt: "3 saat önce",
    description: "Farm + savaş dengesi, özel etkinlikler ve influencer destek paketi ile yayında.",
    game: "PVP Serverlar",
    features: ["Server tanıtımı", "Yayıncı paketi"],
    tags: ["Knight", "PVP", "Reborn", "premium", "anlık teslimat"],
    section: "pvp",
    sellerExperience: 5,
    createdTimestamp: hoursAgo(8),
  },
  {
    id: "P-303",
    title: "ArenaCraft Skyblock PVP Network",
    category: "PVP Server Tanıtımı",
    seller: "ArenaCraft",
    price: "1.450,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: 980,
    favorites: 67,
    createdAt: "Bugün",
    description: "Minecraft tabanlı skyblock ve boxpvp network tanıtım ilanı.",
    game: "PVP Serverlar",
    features: ["Server tanıtımı", "Skyblock", "BoxPVP"],
    tags: ["Minecraft", "Skyblock", "Network", "7/24 aktif", "garantili"],
    section: "pvp",
    sellerExperience: 4,
    createdTimestamp: hoursAgo(12),
  },
  // Auto-generated Vitrin items
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `V-EXTRA-${i}`,
    title: `Vitrin İlanı #${i + 1} Premium Paket`,
    category: "Oyun Hesabı",
    seller: "MarketBot",
    price: `${(Math.random() * 1000 + 100).toFixed(2).replace(".", ",")} ₺`,
    image: BOT_LOGO_IMAGE,
    views: Math.floor(Math.random() * 1000),
    favorites: Math.floor(Math.random() * 100),
    createdAt: `${i + 1} saat önce`,
    description: "Hızlı teslimat ve güvenli alışveriş garantisi.",
    game: "Çeşitli",
    section: "vitrin" as const,
    isVitrin: true,
    sellerExperience: Math.floor(Math.random() * 7),
    createdTimestamp: hoursAgo(10 + i),
  })),
  // Auto-generated New items
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `N-EXTRA-${i}`,
    title: `Yeni İlan #${i + 1} Hızlı Teslimat`,
    category: "Standart İlan",
    seller: "UserStore",
    price: `${(Math.random() * 500 + 20).toFixed(2).replace(".", ",")} ₺`,
    image: BOT_LOGO_IMAGE,
    views: Math.floor(Math.random() * 500),
    favorites: Math.floor(Math.random() * 50),
    createdAt: `${i + 2} saat önce`,
    description: "Yeni eklenen, güvenilir ilan.",
    game: "Çeşitli",
    section: "new" as const,
    sellerExperience: Math.floor(Math.random() * 7),
    createdTimestamp: hoursAgo(1 + i),
  })),
  // Auto-generated PVP items
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `P-EXTRA-${i}`,
    title: `PVP Server #${i + 1} Açılış Hazırlığı`,
    category: "PVP Tanıtım",
    seller: "ServerSahibi",
    price: "1.000,00 ₺",
    image: BOT_LOGO_IMAGE,
    views: Math.floor(Math.random() * 2000),
    favorites: Math.floor(Math.random() * 150),
    createdAt: `${i + 1} gün önce`,
    description: "En iyi PVP deneyimi için hemen katılın.",
    game: "PVP Serverlar",
    section: "pvp" as const,
    sellerExperience: Math.floor(Math.random() * 7),
    createdTimestamp: hoursAgo(24 + i),
  })),
];

const emitMarketplaceUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("itemtr-marketplace-updated"));
  }
};

export const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeStoryKey = (value?: string | null) => {
  const normalized = slugifyCategory(value || "");
  if (normalized.includes("valorant") || normalized === "vp") return "valorant";
  if (normalized.includes("cs2") || normalized.includes("counter-strike")) return "cs2";
  if (normalized.includes("steam")) return "steam";
  if (normalized.includes("roblox")) return "roblox";
  if (normalized.includes("minecraft")) return "minecraft";
  if (normalized.includes("discord")) return "discord";
  if (normalized.includes("pubg")) return "pubg-mobile";
  if (normalized.includes("metin2")) return "metin2";
  if (normalized.includes("knight")) return "knight-online";
  if (normalized.includes("pvp")) return "pvp-serverlar";
  return normalized;
};

export const getStoredMarketplaceListings = (): MarketplaceListing[] => {
  if (typeof window === "undefined") return [];
  return safeJSONParse<MarketplaceListing[]>(localStorage.getItem(USER_LISTINGS_KEY), []);
};

const saveStoredMarketplaceListings = (items: MarketplaceListing[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_LISTINGS_KEY, JSON.stringify(items));
  emitMarketplaceUpdate();
};

export const addMarketplaceListing = (
  payload: Omit<MarketplaceListing, "id" | "createdTimestamp" | "createdAt"> & { createdAt?: string },
) => {
  const item: MarketplaceListing = {
    ...payload,
    id: `USR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: payload.createdAt || "Az önce",
    createdTimestamp: Date.now(),
  };

  const next = [item, ...getStoredMarketplaceListings()];
  saveStoredMarketplaceListings(next);
  return item;
};

export const getMarketplaceListings = () => {
  const bots = getBotHistory().map(bot => ({
    ...bot,
    section: bot.category === "PVP Serverlar" ? "pvp" : (bot.isVitrin ? "vitrin" : "new"),
    createdTimestamp: bot.createdTimestamp || (Date.now() - 10000), // Default to 10s ago if missing
  })) as MarketplaceListing[];
  
  return [...getStoredMarketplaceListings(), ...bots, ...SEED_LISTINGS].sort((a, b) => b.createdTimestamp - a.createdTimestamp);
};

export const getVitrinListings = () => getMarketplaceListings().filter((item) => item.section === "vitrin");
export const getNewListings = () => getMarketplaceListings().filter((item) => {
  if (item.section !== "new") return false;
  // Exclude PVP bots from New Listings
  if (item.category === "PVP Serverlar" && String(item.id).startsWith("BOT-")) return false;
  return true;
});
export const getPvpServerListings = () => getMarketplaceListings().filter((item) => item.section === "pvp" || item.category === "PVP Serverlar");

export const getMarketplaceListingById = (id?: string | null) =>
  getMarketplaceListings().find((item) => item.id === String(id));

export const getListingsForCategory = (slug?: string | null) => {
  if (!slug) return getMarketplaceListings();
  const normalizedSlug = slugifyCategory(slug);
  if (normalizedSlug === "pvp-serverlar") return getPvpServerListings();

  return getMarketplaceListings().filter((item) => {
    const haystack = [item.category, item.game, item.title, item.section].filter(Boolean).map((part) => slugifyCategory(String(part)));
    return haystack.some((part) => part.includes(normalizedSlug) || normalizedSlug.includes(part));
  });
};

export const searchMarketplaceListings = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return getMarketplaceListings();
  return getMarketplaceListings().filter((item) =>
    [item.title, item.category, item.seller, item.game, ...(item.tags || [])]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedQuery)),
  );
};

export const getStoryCategories = (): StoryCategory[] => {
  const items = getMarketplaceListings();
  const newCategoryKeys = new Set(
    items
      .filter((item) => Date.now() - item.createdTimestamp <= 7 * 24 * 60 * 60 * 1000)
      .map((item) => normalizeStoryKey(item.game || item.category)),
  );

  return CATEGORY_STORIES.map((item) => ({
    ...item,
    isNew: newCategoryKeys.has(item.slug),
    href: item.slug === "pvp-serverlar" ? "/pvp-serverlar" : `/category/${item.slug}`,
  }));
};

export const getSectionMeta = (section: ListingSection) => {
  if (section === "vitrin") {
    return {
      title: "Vitrin İlanları",
      subtitle: "Sadece vitrin paketi aktif ilanlar burada listelenir.",
      ctaLabel: "Vitrin Yükselt",
      ctaHref: "/vitrin-al",
    };
  }

  if (section === "pvp") {
    return {
      title: "PVP Server Tanıtımları",
      subtitle: "PVP server tanıtımı verilen ilanlar bu özel alanda görünür.",
      ctaLabel: "PVP Serverlar",
      ctaHref: "/pvp-serverlar",
    };
  }

  return {
    title: "Yeni İlanlar",
    subtitle: "Son eklenen standart ilanlar burada görünür. PVP ilanları bu alana dahil edilmez.",
    ctaLabel: "İlan Ekle",
    ctaHref: "/add-listing",
  };
};

// ============================================
// SUPABASE LISTING FUNCTIONS
// ============================================

// Convert Supabase listing to MarketplaceListing
const convertListing = (listing: any, profile?: any): MarketplaceListing => {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    seller: profile?.username || listing.seller_id,
    seller_id: listing.seller_id,
    price: listing.price.toString(),
    oldPrice: listing.old_price?.toString(),
    image: listing.image,
    views: listing.views || 0,
    favorites: listing.favorites || 0,
    createdAt: listing.created_at,
    description: listing.description,
    game: listing.game,
    features: listing.features || [],
    isAutoDelivery: listing.is_auto_delivery,
    isPurchasable: listing.is_purchasable !== false,
    tags: listing.tags || [],
    section: listing.section || 'new',
    isVitrin: listing.is_vitrin || listing.section === 'vitrin',
    sellerAvatar: profile?.avatar,
    sellerExperience: profile?.level_xp ? Math.floor(profile.level_xp / 200) : 0,
    createdTimestamp: new Date(listing.created_at).getTime(),
    status: listing.status,
    stock: listing.stock || 1,
  };
};

// Get all listings from Supabase
export const getListingsFromSupabase = async (): Promise<MarketplaceListing[]> => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`*, profiles:seller_id(username, avatar, level_xp)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Marketplace] Error fetching listings:', error);
      return [];
    }

    return listings?.map((l: any) => convertListing(l, l.profiles)) || [];
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return [];
  }
};

// Get listings by section from Supabase
export const getListingsBySection = async (section: ListingSection): Promise<MarketplaceListing[]> => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`*, profiles:seller_id(username, avatar, level_xp)`)
      .eq('section', section)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Marketplace] Error fetching section:', error);
      return [];
    }

    return listings?.map((l: any) => convertListing(l, l.profiles)) || [];
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return [];
  }
};

// Create new listing in Supabase
export const createListing = async (listing: Omit<MarketplaceListing, 'id' | 'createdTimestamp'>, sellerId: string) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: listing.title,
        category: listing.category,
        seller_id: sellerId,
        price: parseFloat(listing.price),
        old_price: listing.oldPrice ? parseFloat(listing.oldPrice) : null,
        image: listing.image,
        description: listing.description,
        game: listing.game,
        features: listing.features || [],
        is_auto_delivery: listing.isAutoDelivery || false,
        is_purchasable: listing.isPurchasable !== false,
        tags: listing.tags || [],
        section: listing.section || 'new',
        is_vitrin: listing.isVitrin || listing.section === 'vitrin',
        stock: listing.stock || 1,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('[Marketplace] Error creating listing:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, listing: convertListing(data) };
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Update listing in Supabase
export const updateListingInSupabase = async (id: string, updates: Partial<MarketplaceListing>, sellerId: string) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        title: updates.title,
        category: updates.category,
        price: updates.price ? parseFloat(updates.price) : undefined,
        old_price: updates.oldPrice ? parseFloat(updates.oldPrice) : undefined,
        image: updates.image,
        description: updates.description,
        game: updates.game,
        features: updates.features,
        is_auto_delivery: updates.isAutoDelivery,
        is_purchasable: updates.isPurchasable,
        tags: updates.tags,
        section: updates.section,
        is_vitrin: updates.isVitrin,
        stock: updates.stock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('seller_id', sellerId) // Ensure only owner can update
      .select()
      .single();

    if (error) {
      console.error('[Marketplace] Error updating listing:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, listing: convertListing(data) };
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Delete listing in Supabase
export const deleteListingFromSupabase = async (id: string, sellerId: string) => {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'deleted' })
      .eq('id', id)
      .eq('seller_id', sellerId);

    if (error) {
      console.error('[Marketplace] Error deleting listing:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get user's listings from Supabase
export const getUserListingsFromSupabase = async (userId: string): Promise<MarketplaceListing[]> => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`*, profiles:seller_id(username, avatar, level_xp)`)
      .eq('seller_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Marketplace] Error fetching user listings:', error);
      return [];
    }

    return listings?.map((l: any) => convertListing(l, l.profiles)) || [];
  } catch (error) {
    console.error('[Marketplace] Error:', error);
    return [];
  }
};

// Increment view count
export const incrementListingViews = async (id: string) => {
  try {
    await supabase.rpc('increment_listing_views', { listing_id: id });
  } catch (error) {
    console.error('[Marketplace] Error incrementing views:', error);
  }
};

// Combined function: Get all listings (Supabase + local for fallback)
export const getAllListings = async (): Promise<MarketplaceListing[]> => {
  const supabaseListings = await getListingsFromSupabase();
  const localListings = getMarketplaceListings(); // Legacy localStorage listings
  
  // Merge and remove duplicates by ID
  const seen = new Set<string>();
  const all = [...supabaseListings, ...localListings].filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  
  return all.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
};
