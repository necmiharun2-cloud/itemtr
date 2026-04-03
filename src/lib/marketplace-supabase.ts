import { safeJSONParse } from "@/lib/utils";
import { getBotHistory, BOT_LOGO_IMAGE } from "./bot-engine";
import { supabase } from "./supabase";

export type ListingSection = "vitrin" | "new" | "pvp";

export type MarketplaceListing = {
  id: string;
  title: string;
  category: string;
  seller: string;
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
  createdTimestamp: number;
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
  { label: "Metin2", slug: "metin2", color: "from-rose-500 to-red-600", image: "https://images.unsplash.com/photo-1542759564-82f6f1f0e4f3?q=80&w=800&auto=format&fit=crop" },
  { label: "Knight Online", slug: "knight-online", color: "from-purple-500 to-violet-500", image: "https://images.unsplash.com/photo-1542751371-6533d2d7a1f9?q=80&w=800&auto=format&fit=crop" },
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
];

// ============================================
// SUPABASE LISTINGS FUNCTIONS
// ============================================

// Get all listings from Supabase
export const getListings = async (section?: ListingSection): Promise<MarketplaceListing[]> => {
  try {
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_seller_id_fkey (
          username,
          avatar
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (section && section !== 'new') {
      query = query.eq('section', section);
    } else if (section === 'new') {
      query = query.eq('section', 'new');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Marketplace] Error fetching listings:', error);
      return [];
    }

    // Convert Supabase data to MarketplaceListing format
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      seller: item.profiles?.username || 'Unknown',
      price: `${item.price.toFixed(2)} ₺`,
      oldPrice: item.old_price ? `${item.old_price.toFixed(2)} ₺` : undefined,
      image: item.image || BOT_LOGO_IMAGE,
      views: item.views || 0,
      favorites: item.favorites || 0,
      createdAt: formatTimeAgo(item.created_at),
      description: item.description,
      game: item.game,
      features: item.features || [],
      isAutoDelivery: item.is_auto_delivery,
      isPurchasable: item.is_purchasable,
      tags: item.tags || [],
      section: item.section,
      isVitrin: item.is_vitrin,
      sellerAvatar: item.profiles?.avatar,
      sellerExperience: item.seller_experience || 0,
      createdTimestamp: new Date(item.created_at).getTime(),
    }));
  } catch (error) {
    console.error('[Marketplace] Error in getListings:', error);
    return [];
  }
};

// Create new listing
export const createListing = async (listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'createdTimestamp'>): Promise<MarketplaceListing | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const supabaseListing = {
      title: listing.title,
      category: listing.category,
      seller_id: user.id,
      price: parseFloat(listing.price.replace(/[^\d.,]/g, '').replace(',', '.')),
      old_price: listing.oldPrice ? parseFloat(listing.oldPrice.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
      image: listing.image,
      description: listing.description,
      game: listing.game,
      features: listing.features || [],
      is_auto_delivery: listing.isAutoDelivery || false,
      is_purchasable: listing.isPurchasable !== false,
      stock: 1,
      tags: listing.tags || [],
      section: listing.section,
      is_vitrin: listing.isVitrin || false,
      seller_experience: listing.sellerExperience || 0,
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(supabaseListing)
      .select()
      .single();

    if (error) {
      console.error('[Marketplace] Error creating listing:', error);
      throw error;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar')
      .eq('id', user.id)
      .single();

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      seller: profile?.username || 'Unknown',
      price: `${data.price.toFixed(2)} ₺`,
      oldPrice: data.old_price ? `${data.old_price.toFixed(2)} ₺` : undefined,
      image: data.image || BOT_LOGO_IMAGE,
      views: data.views || 0,
      favorites: data.favorites || 0,
      createdAt: formatTimeAgo(data.created_at),
      description: data.description,
      game: data.game,
      features: data.features || [],
      isAutoDelivery: data.is_auto_delivery,
      isPurchasable: data.is_purchasable,
      tags: data.tags || [],
      section: data.section,
      isVitrin: data.is_vitrin,
      sellerAvatar: profile?.avatar,
      sellerExperience: data.seller_experience || 0,
      createdTimestamp: new Date(data.created_at).getTime(),
    };
  } catch (error) {
    console.error('[Marketplace] Error in createListing:', error);
    return null;
  }
};

// Update listing
export const updateListing = async (id: string, updates: Partial<MarketplaceListing>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const supabaseUpdates: any = {};
    
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.price) supabaseUpdates.price = parseFloat(updates.price.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (updates.oldPrice) supabaseUpdates.old_price = parseFloat(updates.oldPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.game) supabaseUpdates.game = updates.game;
    if (updates.features) supabaseUpdates.features = updates.features;
    if (updates.isAutoDelivery !== undefined) supabaseUpdates.is_auto_delivery = updates.isAutoDelivery;
    if (updates.isPurchasable !== undefined) supabaseUpdates.is_purchasable = updates.isPurchasable;
    if (updates.tags) supabaseUpdates.tags = updates.tags;
    if (updates.section) supabaseUpdates.section = updates.section;
    if (updates.isVitrin !== undefined) supabaseUpdates.is_vitrin = updates.isVitrin;
    if (updates.sellerExperience !== undefined) supabaseUpdates.seller_experience = updates.sellerExperience;

    const { error } = await supabase
      .from('listings')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) {
      console.error('[Marketplace] Error updating listing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Marketplace] Error in updateListing:', error);
    return false;
  }
};

// Delete listing
export const deleteListing = async (id: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('listings')
      .update({ status: 'deleted' })
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) {
      console.error('[Marketplace] Error deleting listing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Marketplace] Error in deleteListing:', error);
    return false;
  }
};

// ============================================
// LEGACY FUNCTIONS (Fallback)
// ============================================

const getUserListings = (): MarketplaceListing[] => {
  if (typeof window === "undefined") return [];
  return safeJSONParse<MarketplaceListing[]>(localStorage.getItem(USER_LISTINGS_KEY), []);
};

const saveUserListings = (listings: MarketplaceListing[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_LISTINGS_KEY, JSON.stringify(listings));
};

export const seedMarketplace = () => {
  if (typeof window === "undefined") return;
  const existing = getUserListings();
  if (existing.length === 0) {
    saveUserListings(SEED_LISTINGS);
  }
};

export const getListingsLegacy = (section?: ListingSection): MarketplaceListing[] => {
  seedMarketplace();
  const listings = getUserListings();
  if (!section || section === "new") {
    return listings.filter((item) => item.section === "new");
  }
  return listings.filter((item) => item.section === section);
};

export const addListing = (listing: MarketplaceListing) => {
  const listings = getUserListings();
  saveUserListings([listing, ...listings]);
};

export const removeListing = (id: string) => {
  const listings = getUserListings();
  saveUserListings(listings.filter((item) => item.id !== id));
};

export const updateListingLegacy = (id: string, updates: Partial<MarketplaceListing>) => {
  const listings = getUserListings();
  const updated = listings.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveUserListings(updated);
};

// ============================================
// COMBINED FUNCTION (Supabase + Bot + Legacy)
// ============================================

export const getAllListings = async (section?: ListingSection): Promise<MarketplaceListing[]> => {
  try {
    // Try Supabase first
    const supabaseListings = await getListings(section);
    
    // Add bot listings
    const botListings = getBotHistory().map(bot => ({
      ...bot,
      section: bot.section as ListingSection,
    }));
    
    // Combine and sort by createdTimestamp
    const allListings = [...supabaseListings, ...botListings]
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    
    return allListings;
  } catch (error) {
    console.error('[Marketplace] Error in getAllListings, using fallback:', error);
    // Fallback to legacy + bot
    const legacyListings = getListingsLegacy(section);
    const botListings = getBotHistory().map(bot => ({
      ...bot,
      section: bot.section as ListingSection,
    }));
    
    return [...legacyListings, ...botListings]
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

export const searchListings = async (query: string): Promise<MarketplaceListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_seller_id_fkey (
          username,
          avatar
        )
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Marketplace] Search error:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      seller: item.profiles?.username || 'Unknown',
      price: `${item.price.toFixed(2)} ₺`,
      oldPrice: item.old_price ? `${item.old_price.toFixed(2)} ₺` : undefined,
      image: item.image || BOT_LOGO_IMAGE,
      views: item.views || 0,
      favorites: item.favorites || 0,
      createdAt: formatTimeAgo(item.created_at),
      description: item.description,
      game: item.game,
      features: item.features || [],
      isAutoDelivery: item.is_auto_delivery,
      isPurchasable: item.is_purchasable,
      tags: item.tags || [],
      section: item.section,
      isVitrin: item.is_vitrin,
      sellerAvatar: item.profiles?.avatar,
      sellerExperience: item.seller_experience || 0,
      createdTimestamp: new Date(item.created_at).getTime(),
    }));
  } catch (error) {
    console.error('[Marketplace] Search error:', error);
    return [];
  }
};
