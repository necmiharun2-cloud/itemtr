/**
 * ItemSatış.com Scraper Service
 * 
 * itemsatis.com'dan ilanları, başlıkları, açıklamaları ve görselleri çeker
 */

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

// Cache for itemsatis data
let itemsatisCache: ItemSatisListing[] = [];

/**
 * Fetches and parses itemsatis.com listings
 * CORS proxy kullanarak itemsatis.com'dan veri çeker
 */
export const fetchItemSatisListings = async (category?: string): Promise<ItemSatisListing[]> => {
  try {
    // Örnek itemsatis kategorileri ve ilanları
    // Gerçek implementasyonda bir CORS proxy veya backend API kullanılmalı
    const mockListings: ItemSatisListing[] = [
      {
        id: "IS-001",
        title: "3000 Saat Prime CS2 Hesap %100 Güvenli",
        description: "✅ Hesap Özellikleri:\n• Prime Aktif\n• Yeşil Güven Faktörü\n• Rekabetçi Modu Açık\n• İlk Mail Erişimi Mevcut\n• Anında Teslim Edilir\n• İtemTR Güvencesiyle",
        price: "450 ₺",
        image: "https://cdn.itemsatis.com/images/counter-strike-2-account.jpg",
        category: "CS2",
        seller: "PremiumStore"
      },
      {
        id: "IS-002",
        title: "Valorant Radiant Elmas Rank Hesap - İlk Mail",
        description: "✨ Valorant Premium Hesap\n- Skinler: Yağmacı Vandal, Asil Phantom\n- Rank: Elmas 2\n- Kademe: 180 LP\n- Mail: Değişebilir\n- Bölge: TR",
        price: "1.250 ₺",
        image: "https://cdn.itemsatis.com/images/valorant-radiant-account.jpg",
        category: "Valorant",
        seller: "ValorantTR"
      },
      {
        id: "IS-003",
        title: "LoL 100+ Kostüm Diamond Hesap",
        description: "🔥 League of Legends Profesyonel Hesap\n- Mavi Öz: 50.000+\n- Kostüm: 150 (3 Efsanevi)\n- Rank: Elmas 4\n- Takdir Seviyesi: 4\nHesap tertemizdir, ilk sahibi benim.",
        price: "890 ₺",
        image: "https://cdn.itemsatis.com/images/lol-diamond-account.jpg",
        category: "League of Legends",
        seller: "LoLMarket"
      },
      {
        id: "IS-004",
        title: "Roblox 5000 Robux Paketi En Uygun",
        description: "💎 Roblox Robux Paketi\n- Miktar: 5000 Robux\n- Teslimat: Gamepass üzerinden\n- Fiyat: Piyasanın en iyisi!\n- 7/24 Aktif\n- Anında Teslimat",
        price: "320 ₺",
        image: "https://cdn.itemsatis.com/images/roblox-robux-package.jpg",
        category: "Roblox",
        seller: "RobuxKing"
      },
      {
        id: "IS-005",
        title: "Metin2 Efsanesi Geri Dönüyor! %100 Editsiz Emek Server",
        description: "AnkaMetin2 1-99 Emek Yapısıyla Geri Dönüyor!\n5 Nisan Cuma 21:00 Büyük Açılış!\n• Editsiz, Hilesiz Oyun Keyfi\n• Özel Etkinlik Takvimi\n• 50.000 TL Lonca Turnuvası Ödülü\nKaydol ve İndir şimdiden!",
        price: "Tanıtım",
        image: "https://cdn.itemsatis.com/images/metin2-server-banner.jpg",
        category: "PVP Serverlar",
        seller: "AnkaMetin2"
      },
      {
        id: "IS-006",
        title: "PUBG Mobile 60 Level Buz Diyari Hesap",
        description: "🔫 PUBG Mobile Premium Hesap\n- Buz Diyarı M416 (Max)\n- Yüzyılın Savaşçısı Seti\n- Seviye: 65\n- Bağlantılar: Sadece Mail (Hemen Değiştirilir)\n- Anında Teslimat",
        price: "680 ₺",
        image: "https://cdn.itemsatis.com/images/pubg-mobile-account.jpg",
        category: "PUBG Mobile",
        seller: "PUBGStore"
      },
      {
        id: "IS-007",
        title: "Kelebek Bıçaklı + 200 Skinli Arşivlik CS2",
        description: "Envanter Dolu CS2 Hesabı!\nToplam 450 TL değerinde skin mevcuttur. Prime statüsüdür. Hiçbir yasaklaması yoktur.\nTeslimat 7/24 otomatik sistem üzerinden yapılır.",
        price: "1.850 ₺",
        image: "https://cdn.itemsatis.com/images/cs2-knife-skins.jpg",
        category: "CS2",
        seller: "CS2Elite"
      },
      {
        id: "IS-008",
        title: "Yağmacı + Asil Setli Full Skin Valorant",
        description: "VALORANT KOSTÜMLÜ HESAP\n- Toplam 12 premium kostüm\n- Rank: Platin 3\n- Tüm ajanlar açık\n- VP Bakiyesi: 150 VP\nKesinlikle ban riski yoktur.",
        price: "2.100 ₺",
        image: "https://cdn.itemsatis.com/images/valorant-full-skins.jpg",
        category: "Valorant",
        seller: "VPSeller"
      },
      {
        id: "IS-009",
        title: "Roblox 10000 Robux - Anında Teslimat",
        description: "ROBLOX ROBUX PAKETİ\n- Miktar: 10000 Robux\n- Teslimat: 5 gün pending süreci\n- En uygun fiyat garantisi\n- Güvenilir satıcı\n- 500+ olumlu yorum",
        price: "580 ₺",
        image: "https://cdn.itemsatis.com/images/roblox-10k-robux.jpg",
        category: "Roblox",
        seller: "RobloxDealer"
      },
      {
        id: "IS-010",
        title: "Knight Online PVP - Yeni Sunucu Açılışı 5 Nisan!",
        description: "Knight Online En Kaliteli PVP Deneyimi İçin Hazır Olun.\nEski usul farm ve savaş dengesi.\nOfficial Açılış: 10 Nisan.\nKayıtlar başladı!",
        price: "Tanıtım",
        image: "https://cdn.itemsatis.com/images/knight-online-pvp.jpg",
        category: "PVP Serverlar",
        seller: "KnightTR"
      },
      {
        id: "IS-011",
        title: "CS2 Seçkin Hesap | 10 Yıllık Tecrübe Rozetli",
        description: "CS2 PRIME HESAP\n- 5-10 Yıl Rozetleri Mevcut\n- Rank: Altın Nova 2\n- Win: 150+\n- Övgü Puanı: 300\nHesap güvenliği tarafımızca sağlanmaktadır.",
        price: "750 ₺",
        image: "https://cdn.itemsatis.com/images/cs2-veteran-account.jpg",
        category: "CS2",
        seller: "VeteranStore"
      },
      {
        id: "IS-012",
        title: "Valorant 200 Level Full Karakter Açık",
        description: "VALORANT RANK HESAP\n- Rank: Radiant\n- Win Rate: %65\n- MMR Yüksek\n- Sadece ciddi alıcılar için uygundur.\n- İlk mail dahil",
        price: "3.500 ₺",
        image: "https://cdn.itemsatis.com/images/valorant-200level.jpg",
        category: "Valorant",
        seller: "RadiantAccounts"
      },
      {
        id: "IS-013",
        title: "LoL Level 30 Unranked Taze Hesap | Fresh",
        description: "LOL UNRANKED HESAP\n- 30 Level\n- Mail Onaysız (Kendi mailinizi yapabilirsiniz)\n- MMR Tertemiz\n- Smurf için 1'e 1.\n- Anında teslimat",
        price: "120 ₺",
        image: "https://cdn.itemsatis.com/images/lol-fresh-account.jpg",
        category: "League of Legends",
        seller: "FreshLoL"
      },
      {
        id: "IS-014",
        title: "PUBG Mobile Firavun 4. Seviye Hesap",
        description: "PUBG MOBILE SEVİYE 70\n- Full skin paketleri\n- Eski sezon RP itemleri\n- Rank: Fatih (Eski Sezon)\n- Mythic eşyalar\n- Anında teslimat",
        price: "1.450 ₺",
        image: "https://cdn.itemsatis.com/images/pubg-pharaoh-account.jpg",
        category: "PUBG Mobile",
        seller: "PUBGElite"
      },
      {
        id: "IS-015",
        title: "1-99 Emek Metin2 Server Duyurusu - Büyük Açılış",
        description: "Artemis2 Metin2 PVP | Global Açılış | 100.000 TL Ödüllü\nWSLIK, EDITSIZ, HILESIZ\n• 7/24 Aktif Destek\n• Özel Etkinlikler\n• Lonca Savaşları",
        price: "Tanıtım",
        image: "https://cdn.itemsatis.com/images/metin2-global-server.jpg",
        category: "PVP Serverlar",
        seller: "Artemis2"
      }
    ];

    // Filter by category if specified
    if (category && category !== "all") {
      return mockListings.filter(item => 
        item.category.toLowerCase() === category.toLowerCase() ||
        (category === "PVP Serverlar" && (item.category.includes("PVP") || item.title.toLowerCase().includes("metin") || item.title.toLowerCase().includes("knight")))
      );
    }

    return mockListings;
  } catch (error) {
    console.error("ItemSatis veri çekme hatası:", error);
    return [];
  }
};

/**
 * Gets random listing from itemsatis pool
 */
export const getRandomItemSatisListing = async (category?: string): Promise<ItemSatisListing | null> => {
  const listings = await fetchItemSatisListings(category);
  if (listings.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * listings.length);
  return listings[randomIndex];
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
export const scrapeItemSatis = async (url: string = "https://www.itemsatis.com"): Promise<ItemSatisListing[]> => {
  // This would need a backend proxy or CORS-enabled endpoint
  // For now, return mock data
  console.log("[ItemSatis] Gerçek scraping için backend proxy gerekli. Mock veri kullanılıyor.");
  return fetchItemSatisListings();
};
