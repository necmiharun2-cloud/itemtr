/**
 * Bot ilan havuzu: kategori bazlı mock ilanlar + normalize edilmiş filtreleme.
 * (Tarayıcıdan doğrudan ItemSatis scrape CORS nedeniyle kullanılmıyor.)
 */

import { normalizeBotCategoryFilter } from "./category-normalize";

export interface ItemSatisListing {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  seller: string;
  url?: string;
}

// Unsplash kategori bazlı gerçek görseller
const CATEGORY_IMAGES: Record<string, string[]> = {
  "CS2": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80"
  ],
  "Valorant": [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    "https://images.unsplash.com/photo-1560253023-3ee7d644864e?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1614285457768-646f65ca8548?w=800&q=80",
    "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2?w=800&q=80"
  ],
  "League of Legends": [
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80"
  ],
  "Roblox": [
    "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=800&q=80",
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80"
  ],
  "PUBG Mobile": [
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1560253023-3ee7d644864e?w=800&q=80"
  ],
  "PVP Serverlar": [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1599713191704-9b7e7262c7fa?w=800&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80"
  ],
  "Steam": [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
  ],
  "Metin2": [
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4?w=800&q=80",
    "https://images.unsplash.com/photo-1599713191704-9b7e7262c7fa?w=800&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
  ],
  "Knight Online": [
    "https://images.unsplash.com/photo-1542759564-82f6f1f0e4f3?w=800&q=80",
    "https://images.unsplash.com/photo-1542751371-29b95d39f6d4?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
  ],
  "Minecraft": [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=800&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
  ],
  "Discord": [
    "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80"
  ],
  "default": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80"
  ]
};

// Get category-specific image
const getCategoryImage = (category: string, index: number): string => {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["default"];
  return images[index % images.length];
};

// Cache for itemsatis data
let itemsatisCache: ItemSatisListing[] = [];

// Track used listing IDs to prevent duplicates
const USED_IDS_KEY = "itemsatis_used_ids";

const getUsedIds = (): string[] => {
  const stored = localStorage.getItem(USED_IDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addUsedId = (id: string): void => {
  const used = getUsedIds();
  if (!used.includes(id)) {
    used.push(id);
    localStorage.setItem(USED_IDS_KEY, JSON.stringify(used));
  }
};

const resetUsedIds = (): void => {
  localStorage.removeItem(USED_IDS_KEY);
};

// Get available listings excluding used ones
const getAvailableListings = (listings: ItemSatisListing[]): ItemSatisListing[] => {
  const usedIds = getUsedIds();
  return listings.filter(item => !usedIds.includes(item.id));
};

/**
 * Fetches and parses itemtr.com listings with Unsplash images
 */
export const fetchItemSatisListings = async (category?: string): Promise<ItemSatisListing[]> => {
  try {
    const mockListings: ItemSatisListing[] = [
      {
        id: "IS-001",
        title: "3000 Saat Prime CS2 Hesap %100 Güvenli",
        description: "✅ Hesap Özellikleri:\n• Prime Aktif\n• Yeşil Güven Faktörü\n• Rekabetçi Modu Açık\n• İlk Mail Erişimi Mevcut\n• Anında Teslim Edilir\n• İtemTR Güvencesiyle",
        price: "450 ₺",
        image: getCategoryImage("CS2", 0),
        category: "CS2",
        seller: "PremiumStore"
      },
      {
        id: "IS-002",
        title: "Valorant Radiant Elmas Rank Hesap - İlk Mail",
        description: "✨ Valorant Premium Hesap\n- Skinler: Yağmacı Vandal, Asil Phantom\n- Rank: Elmas 2\n- Kademe: 180 LP\n- Mail: Değişebilir\n- Bölge: TR",
        price: "1.250 ₺",
        image: getCategoryImage("Valorant", 0),
        category: "Valorant",
        seller: "ValorantTR"
      },
      {
        id: "IS-003",
        title: "LoL 100+ Kostüm Diamond Hesap",
        description: "🔥 League of Legends Profesyonel Hesap\n- Mavi Öz: 50.000+\n- Kostüm: 150 (3 Efsanevi)\n- Rank: Elmas 4\n- Takdir Seviyesi: 4\nHesap tertemizdir, ilk sahibi benim.",
        price: "890 ₺",
        image: getCategoryImage("League of Legends", 0),
        category: "League of Legends",
        seller: "LoLMarket"
      },
      {
        id: "IS-004",
        title: "Roblox 5000 Robux Paketi En Uygun",
        description: "💎 Roblox Robux Paketi\n- Miktar: 5000 Robux\n- Teslimat: Gamepass üzerinden\n- Fiyat: Piyasanın en iyisi!\n- 7/24 Aktif\n- Anında Teslimat",
        price: "320 ₺",
        image: getCategoryImage("Roblox", 0),
        category: "Roblox",
        seller: "RobuxKing"
      },
      {
        id: "IS-005",
        title: "Metin2 Efsanesi Geri Dönüyor! %100 Editsiz Emek Server",
        description: "AnkaMetin2 1-99 Emek Yapısıyla Geri Dönüyor!\n5 Nisan Cuma 21:00 Büyük Açılış!\n• Editsiz, Hilesiz Oyun Keyfi\n• Özel Etkinlik Takvimi\n• 50.000 TL Lonca Turnuvası Ödülü\nKaydol ve İndir şimdiden!",
        price: "Tanıtım",
        image: getCategoryImage("PVP Serverlar", 0),
        category: "PVP Serverlar",
        seller: "AnkaMetin2"
      },
      {
        id: "IS-006",
        title: "PUBG Mobile 60 Level Buz Diyari Hesap",
        description: "🔫 PUBG Mobile Premium Hesap\n- Buz Diyarı M416 (Max)\n- Yüzyılın Savaşçısı Seti\n- Seviye: 65\n- Bağlantılar: Sadece Mail (Hemen Değiştirilir)\n- Anında Teslimat",
        price: "680 ₺",
        image: getCategoryImage("PUBG Mobile", 0),
        category: "PUBG Mobile",
        seller: "PUBGStore"
      },
      {
        id: "IS-007",
        title: "Kelebek Bıçaklı + 200 Skinli Arşivlik CS2",
        description: "Envanter Dolu CS2 Hesabı!\nToplam 450 TL değerinde skin mevcuttur. Prime statüsüdür. Hiçbir yasaklaması yoktur.\nTeslimat 7/24 otomatik sistem üzerinden yapılır.",
        price: "1.850 ₺",
        image: getCategoryImage("CS2", 1),
        category: "CS2",
        seller: "CS2Elite"
      },
      {
        id: "IS-008",
        title: "Yağmacı + Asil Setli Full Skin Valorant",
        description: "VALORANT KOSTÜMLÜ HESAP\n- Toplam 12 premium kostüm\n- Rank: Platin 3\n- Tüm ajanlar açık\n- VP Bakiyesi: 150 VP\nKesinlikle ban riski yoktur.",
        price: "2.100 ₺",
        image: getCategoryImage("Valorant", 1),
        category: "Valorant",
        seller: "VPSeller"
      },
      {
        id: "IS-009",
        title: "Roblox 10000 Robux - Anında Teslimat",
        description: "ROBLOX ROBUX PAKETİ\n- Miktar: 10000 Robux\n- Teslimat: 5 gün pending süreci\n- En uygun fiyat garantisi\n- Güvenilir satıcı\n- 500+ olumlu yorum",
        price: "580 ₺",
        image: getCategoryImage("Roblox", 1),
        category: "Roblox",
        seller: "RobloxDealer"
      },
      {
        id: "IS-010",
        title: "Knight Online PVP - Yeni Sunucu Açılışı 5 Nisan!",
        description: "Knight Online En Kaliteli PVP Deneyimi İçin Hazır Olun.\nEski usul farm ve savaş dengesi.\nOfficial Açılış: 10 Nisan.\nKayıtlar başladı!",
        price: "Tanıtım",
        image: getCategoryImage("PVP Serverlar", 1),
        category: "PVP Serverlar",
        seller: "KnightTR"
      },
      {
        id: "IS-011",
        title: "CS2 Seçkin Hesap | 10 Yıllık Tecrübe Rozetli",
        description: "CS2 PRIME HESAP\n- 5-10 Yıl Rozetleri Mevcut\n- Rank: Altın Nova 2\n- Win: 150+\n- Övgü Puanı: 300\nHesap güvenliği tarafımızca sağlanmaktadır.",
        price: "750 ₺",
        image: getCategoryImage("CS2", 2),
        category: "CS2",
        seller: "VeteranStore"
      },
      {
        id: "IS-012",
        title: "Valorant 200 Level Full Karakter Açık",
        description: "VALORANT RANK HESAP\n- Rank: Radiant\n- Win Rate: %65\n- MMR Yüksek\n- Sadece ciddi alıcılar için uygundur.\n- İlk mail dahil",
        price: "3.500 ₺",
        image: getCategoryImage("Valorant", 2),
        category: "Valorant",
        seller: "RadiantAccounts"
      },
      {
        id: "IS-013",
        title: "LoL Level 30 Unranked Taze Hesap | Fresh",
        description: "LOL UNRANKED HESAP\n- 30 Level\n- Mail Onaysız (Kendi mailinizi yapabilirsiniz)\n- MMR Tertemiz\n- Smurf için 1'e 1.\n- Anında teslimat",
        price: "120 ₺",
        image: getCategoryImage("League of Legends", 1),
        category: "League of Legends",
        seller: "FreshLoL"
      },
      {
        id: "IS-014",
        title: "PUBG Mobile Firavun 4. Seviye Hesap",
        description: "PUBG MOBILE SEVİYE 70\n- Full skin paketleri\n- Eski sezon RP itemleri\n- Rank: Fatih (Eski Sezon)\n- Mythic eşyalar\n- Anında teslimat",
        price: "1.450 ₺",
        image: getCategoryImage("PUBG Mobile", 1),
        category: "PUBG Mobile",
        seller: "PUBGElite"
      },
      {
        id: "IS-015",
        title: "1-99 Emek Metin2 Server Duyurusu - Büyük Açılış",
        description: "Artemis2 Metin2 PVP | Global Açılış | 100.000 TL Ödüllü\nWSLIK, EDITSIZ, HILESIZ\n• 7/24 Aktif Destek\n• Özel Etkinlikler\n• Lonca Savaşları",
        price: "Tanıtım",
        image: getCategoryImage("PVP Serverlar", 2),
        category: "PVP Serverlar",
        seller: "Artemis2"
      },
      {
        id: "IS-016",
        title: "Steam 500 TL Cüzdan Kodu - Anında Teslimat",
        description: "🎮 STEAM CÜZDAN KODU\n- Miktar: 500 TL\n- Bölge: Türkiye (TRY)\n- Geçerlilik: 1 Yıl\n- Anında Teslimat\n- 7/24 Aktif\n- 1000+ Olumlu Yorum",
        price: "475 ₺",
        image: getCategoryImage("Steam", 0),
        category: "Steam",
        seller: "SteamDealerTR"
      },
      {
        id: "IS-017",
        title: "CS2 Global Elite Rozetli Hesap - Yüksek MMR",
        description: "🏅 Global Elite Rozetli CS2\n- Rank: Global Elite\n- Rozetler: 10 Yıl, 5 Yıl\n- Madalyalar: 8+\n- Wins: 500+\n- Övgü: 800+\nAcil satılık!",
        price: "1.100 ₺",
        image: getCategoryImage("CS2", 3),
        category: "CS2",
        seller: "EliteStore"
      },
      {
        id: "IS-018",
        title: "Valorant Immortal 3 Rank Hesap - Radiant'a Yakın",
        description: "🏆 VALORANT RANK\n- Rank: Immortal 3\n- Win Rate: %72\n- MMR: Çok Yüksek\n- İlk mail dahil\nRadiant'a yükselmek için ideal!",
        price: "3.200 ₺",
        image: getCategoryImage("Valorant", 3),
        category: "Valorant",
        seller: "BoostAccount"
      },
      {
        id: "IS-019",
        title: "Metin2 50 GB Won Paketi — Anında Teslimat",
        description: "Metin2 Won satışı\n- Güvenilir teslimat\n- Anında işlem\n- İtemTR kalitesi",
        price: "420 ₺",
        image: getCategoryImage("Metin2", 0),
        category: "Metin2",
        seller: "WonTR"
      },
      {
        id: "IS-020",
        title: "Knight Online USKO Usko Gold — Hızlı Teslim",
        description: "Knight Online para birimi\n- Güvenli transfer\n- 7/24 aktif",
        price: "350 ₺",
        image: getCategoryImage("Knight Online", 0),
        category: "Knight Online",
        seller: "KOGold"
      },
      {
        id: "IS-021",
        title: "Minecraft Java Edition Premium Hesap",
        description: "Minecraft Java\n- İlk mail\n- Anında teslim\n- Garantili",
        price: "199 ₺",
        image: getCategoryImage("Minecraft", 0),
        category: "Minecraft",
        seller: "BlockStore"
      },
      {
        id: "IS-022",
        title: "Discord Nitro 1 Aylık — Hediye Link",
        description: "Discord Nitro\n- 1 ay süre\n- Hediye linki ile teslim",
        price: "89 ₺",
        image: getCategoryImage("Discord", 0),
        category: "Discord",
        seller: "NitroTR"
      },
      {
        id: "IS-023",
        title: "Steam Cüzdan Kodu 1000 TL",
        description: "Anında teslimat, sınırlı stok.",
        price: "950 ₺",
        image: getCategoryImage("Steam", 1),
        category: "Steam",
        seller: "SteamHero"
      },
      {
        id: "IS-024",
        title: "Metin2 Karakter — 90 Level Bedensel",
        description: "Biyolog bitik, full itemli, global server.",
        price: "1.200 ₺",
        image: getCategoryImage("Metin2", 1),
        category: "Metin2",
        seller: "WarriorStore"
      },
      {
        id: "IS-025",
        title: "Knight Online 80 Level Ringli Kurian",
        description: "Full skill açık, güvenli teslimat.",
        price: "850 ₺",
        image: getCategoryImage("Knight Online", 1),
        category: "Knight Online",
        seller: "RingStore"
      },
      {
        id: "IS-026",
        title: "Minecraft VIP Üyelik — Hypixel Uyumlu",
        description: "Kalıcı VIP üyelik, anında aktifleşir.",
        price: "250 ₺",
        image: getCategoryImage("Minecraft", 1),
        category: "Minecraft",
        seller: "McVip"
      },
      {
        id: "IS-027",
        title: "Discord Boost Takviyesi — 14x Boost",
        description: "Sunucunuzu anında 3. seviye yapın.",
        price: "200 ₺",
        image: getCategoryImage("Discord", 1),
        category: "Discord",
        seller: "BoostCenter"
      }
    ];

    const filterCanon = normalizeBotCategoryFilter(category || "all");

    if (filterCanon !== "all") {
      return mockListings.filter((item) => item.category === filterCanon);
    }

    return mockListings;
  } catch (error) {
    console.error("ItemSatis veri çekme hatası:", error);
    return [];
  }
};

/** Tanıtım / fiyat yok sayılan ilanlar için null döner (her zaman kabul edilir). */
export const numericPriceTry = (price: string): number | null => {
  const s = String(price || "").toLowerCase();
  if (s.includes("tanıtım") || s.includes("tanitim") || s.includes("promo")) return null;
  const digits = String(price).replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
};

const priceInRange = (item: ItemSatisListing, minPrice: number, maxPrice: number): boolean => {
  const n = numericPriceTry(item.price);
  if (n === null) return true;
  return n >= minPrice && n <= maxPrice;
};

/**
 * Bot için: kategori + min/max fiyat (₺) filtresi, mümkünse yalnız uygun havuzdan seçer.
 */
export const getRandomItemSatisListingForBot = async (
  category: string | undefined,
  minPrice: number,
  maxPrice: number,
): Promise<ItemSatisListing | null> => {
  const listings = await fetchItemSatisListings(category);
  if (listings.length === 0) return null;

  const pickFrom = (pool: ItemSatisListing[]) => {
    if (pool.length === 0) return null;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    addUsedId(selected.id);
    return selected;
  };

  let available = getAvailableListings(listings).filter((item) => priceInRange(item, minPrice, maxPrice));
  if (available.length === 0) {
    resetUsedIds();
    available = listings.filter((item) => priceInRange(item, minPrice, maxPrice));
  }
  let chosen = pickFrom(available);
  if (chosen) return chosen;

  available = getAvailableListings(listings);
  if (available.length === 0) {
    resetUsedIds();
    available = listings;
  }
  return pickFrom(available);
};

/**
 * Gets random listing from itemsatis pool - prevents duplicates
 */
export const getRandomItemSatisListing = async (category?: string): Promise<ItemSatisListing | null> => {
  const listings = await fetchItemSatisListings(category);
  if (listings.length === 0) return null;
  
  // Get available listings (excluding used ones)
  let availableListings = getAvailableListings(listings);
  
  // If all listings are used, reset and start over
  if (availableListings.length === 0) {
    resetUsedIds();
    availableListings = listings;
    console.log("[ItemSatis] Tüm ilanlar kullanıldı, liste sıfırlandı");
  }
  
  const randomIndex = Math.floor(Math.random() * availableListings.length);
  const selected = availableListings[randomIndex];
  
  // Mark this ID as used
  addUsedId(selected.id);
  
  return selected;
};

/**
 * Get all itemsatis listings for a specific category
 */
export const getItemSatisListingsByCategory = async (category: string): Promise<ItemSatisListing[]> => {
  return await fetchItemSatisListings(category);
};

/**
 * Initialize itemsatis cache
 */
export const initializeItemSatisCache = async (): Promise<void> => {
  itemsatisCache = await fetchItemSatisListings();
  console.log(`[ItemSatis] ${itemsatisCache.length} ilan cache'e alındı`);
};

/**
 * Get cached itemsatis listings
 */
export const getCachedItemSatisListings = (): ItemSatisListing[] => {
  return itemsatisCache;
};

/**
 * Real itemsatis scraper (requires CORS proxy or backend)
 * Note: Direct scraping from browser is blocked by CORS
 */
export const scrapeItemSatis = async (url: string = "https://www.itemtr.com"): Promise<ItemSatisListing[]> => {
  console.log("[ItemTR] Gerçek scraping için backend proxy gerekli. Unsplash görselleri kullanılıyor.");
  return fetchItemSatisListings();
};
