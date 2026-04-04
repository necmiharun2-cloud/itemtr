/**
 * Admin paneli / URL slug'ları ile bot ve mock ilan kategori isimlerini eşler.
 */

export const BOT_CANONICAL_CATEGORIES = [
  "CS2",
  "Valorant",
  "League of Legends",
  "Roblox",
  "PUBG Mobile",
  "Steam",
  "PVP Serverlar",
  "Metin2",
  "Knight Online",
  "Minecraft",
  "Discord",
] as const;

export type BotCanonicalCategory = (typeof BOT_CANONICAL_CATEGORIES)[number];

/** Marketplace vitrin / story etiketi (CATEGORY_STORIES.game ile uyumlu) */
export function gameLabelForCanonicalCategory(canonical: string): string {
  const c = canonical.trim();
  if (c === "PVP Serverlar") return "PVP Serverlar";
  return c;
}

/**
 * itemtr_bot_category veya benzeri ham değeri mock ilan filtresi için normalize eder.
 * "all" → tüm ilanlar; bilinmeyen değer → içerikten tahmin veya "all" (boş liste önleme).
 */
export function normalizeBotCategoryFilter(raw: string): string {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  if (!s || s === "all" || s === "tumu" || s === "tümü") return "all";

  const direct: Record<string, string> = {
    cs2: "CS2",
    "counter-strike": "CS2",
    "counter-strike-2": "CS2",
    "counter strike": "CS2",
    valorant: "Valorant",
    valo: "Valorant",
    lol: "League of Legends",
    "league-of-legends": "League of Legends",
    "league of legends": "League of Legends",
    roblox: "Roblox",
    "pubg-mobile": "PUBG Mobile",
    pubg: "PUBG Mobile",
    steam: "Steam",
    "pvp-serverlar": "PVP Serverlar",
    "pvp serverlar": "PVP Serverlar",
    pvp: "PVP Serverlar",
    metin2: "Metin2",
    "metin-2": "Metin2",
    "knight-online": "Knight Online",
    "knight online": "Knight Online",
    minecraft: "Minecraft",
    discord: "Discord",
  };

  if (direct[s]) return direct[s];

  const compact = s.replace(/\s+/g, "");
  if (direct[compact]) return direct[compact];

  // Kısmi eşleşme (kullanıcı "cs2 hesap" yazarsa)
  if (s.includes("cs2") || s.includes("counter-strike") || s.includes("counter strike")) return "CS2";
  if (s.includes("valorant") || s.includes("valo")) return "Valorant";
  if (/\blol\b/.test(s) || s.includes("league") || s.includes("legends")) return "League of Legends";
  if (s.includes("roblox")) return "Roblox";
  if (s.includes("pubg")) return "PUBG Mobile";
  if (s.includes("steam")) return "Steam";
  if (s.includes("pvp") || s.includes("sunucu") || s.includes("server")) return "PVP Serverlar";
  if (s.includes("metin")) return "Metin2";
  if (s.includes("knight")) return "Knight Online";
  if (s.includes("minecraft")) return "Minecraft";
  if (s.includes("discord")) return "Discord";

  const exact = BOT_CANONICAL_CATEGORIES.find((c) => c.toLowerCase() === s);
  if (exact) return exact;

  return "all";
}
