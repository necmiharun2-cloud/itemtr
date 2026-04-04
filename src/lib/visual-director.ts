/**
 * Kıdemli E-Ticaret Görsel Direktör ve AI Prompt Uzmanı Modülü
 * 
 * Marketplace ilanları için kategori, başlık ve açıklamaya uygun
 * profesyonel, HD, güven veren AI görsel promptları üretir.
 */

export interface ListingVisualData {
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  keywords?: string[];
  brand?: string;
  platform?: string;
  aspectRatio?: "1:1" | "4:5" | "16:9";
  style?: string;
}

export interface PromptAnalysis {
  productType: string;
  targetAudience: string;
  keyElements: string[];
  visualStyle: string;
  mood: string;
  background: string;
  lighting: string;
  composition: string;
}

export class ListingVisualDirector {
  // Kategori bazlı görsel şablonları - STRICT GAME-SPECIFIC, NO FURNITURE
  private static readonly CATEGORY_TEMPLATES: Record<string, {
    scene: string;
    style: string;
    lighting: string;
    colors: string;
    composition: string;
    negativePrompt: string;
  }> = {
    "CS2": {
      scene: "Counter-Strike 2 tactical environment, de_dust2 or de_inferno map atmosphere, weapon case opening moment, rare skin showcase with CS2 logo elements, competitive gaming arena background, terrorist vs counter-terrorist thematic visuals, bomb defusal scenario atmosphere",
      style: "hyper-realistic digital art, premium gaming commercial, cinematic FPS atmosphere, ultra-sharp details, photorealistic textures, 8K render quality",
      lighting: "dramatic cinematic lighting with orange and teal color grading, volumetric fog effects, sunset desert map lighting, competitive arena spotlights",
      colors: "desert sand tones, tactical military greens, CT blue accents, T-side brown/orange, gunmetal grays, rare skin vibrant colors against muted background",
      composition: "centered weapon or character focal point, rule of thirds, dynamic angle, depth of field background blur, professional game cover art composition",
      negativePrompt: "gaming chair, desk, keyboard, mouse, room interior, office, furniture, RGB peripherals, computer monitor, generic stock photo, cartoon, anime, watermark text, huge text overlay, title text, slogan, fake banner, fake product card, UI elements, buttons, labels, cluttered layout, blurry, low quality, distorted, ugly"
    },
    "Valorant": {
      scene: "Valorant agent ability effects, Spike planting/defusing scenario, tactical shooter arena, agent silhouette with ability visuals, futuristic tactical environment, radianite energy effects, high-tech combat zone",
      style: "stylized realistic digital art, Riot Games cinematic quality, sharp clean visuals, premium FPS cover art, high contrast vibrant aesthetic",
      lighting: "dramatic rim lighting, ability glow effects, neon accents on dark background, cinematic volumetric lighting, tactical night operation atmosphere",
      colors: "Valorant red and black, electric cyan ability highlights, dark navy backgrounds, vibrant agent colors against dark environment, high contrast",
      composition: "heroic agent pose or ability focal point, dramatic perspective, environmental storytelling, clean uncluttered focus, professional game key art style",
      negativePrompt: "gaming chair, desk setup, room interior, office, furniture, keyboard, mouse, monitor, generic background, cartoon, anime style, watermark overload, text overlay, huge text, slogan, fake banner, UI mockup, product card frame, cluttered, messy, low quality, blurry"
    },
    "League of Legends": {
      scene: "Summoner's Rift environment, magical runeterra landscape, champion ability showcase, mystical nexus energy, fantasy battlefield atmosphere, ancient magical ruins, epic MOBA arena",
      style: "fantasy realism, League of Legends splash art quality, magical cinematic atmosphere, highly detailed fantasy illustration, premium game art",
      lighting: "magical ethereal lighting, spell effect glows, mystical ambient light, dramatic fantasy shadows, enchanted atmosphere",
      colors: "rich magical purples and blues, gold magical energy, mystical teals, fantasy earth tones, vibrant spell effects on dark mystical background",
      composition: "epic champion or environment focal point, fantasy landscape depth, magical particle effects, splash art composition, cinematic framing",
      negativePrompt: "gaming chair, desk, computer setup, room interior, office, furniture, modern tech, RGB lights, keyboard, mouse, cartoon, anime, realistic human photo, watermark text, huge text overlay, fake banner, fake UI, cluttered layout, low quality, blurry, generic stock"
    },
    "Roblox": {
      scene: "Roblox metaverse environment, blocky voxel world, colorful game portal, avatar showcase scene, creative building blocks atmosphere, popular Roblox game world, playful virtual space",
      style: "clean 3D render, stylized game art, vibrant polished visuals, family-friendly premium aesthetic, modern game icon style, sharp colorful presentation",
      lighting: "bright cheerful lighting, soft ambient glow, playful highlights, clean studio-like lighting for characters, welcoming atmosphere",
      colors: "vibrant Roblox red accents, cheerful rainbow colors, bright blues and greens, playful warm tones, clean white highlights, inviting palette",
      composition: "character or world focal point, clean centered composition, playful dynamic pose, uncluttered background, app icon quality presentation",
      negativePrompt: "gaming chair, desk, computer, room interior, office, furniture, realistic human, photo background, messy room, cartoon drawing, anime, watermark overload, text overlay, huge text, fake banner, UI elements, cluttered, dark scary, horror, low quality, blurry"
    },
    "PVP Serverlar": {
      scene: "Metin2 or Knight Online epic battlefield, medieval fantasy realm, warrior armor and ancient weapons, dragon or mythical creature silhouette, ancient temple ruins, mystical oriental landscape, legendary combat scenario",
      style: "epic fantasy illustration, MMORPG loading screen quality, cinematic fantasy art, highly detailed armor and weapons, premium game cinematic",
      lighting: "dramatic golden hour lighting, mystical fog effects, volumetric god rays, epic sunset atmosphere, magical ambient glow, cinematic shadows",
      colors: "epic golden yellows and oranges, mystical blues and purples, ancient bronze and steel, rich earth tones, fantasy magical accents, dramatic contrast",
      composition: "legendary warrior or equipment focal point, epic scale environment, dramatic heroic angle, environmental depth, MMORPG key art composition",
      negativePrompt: "gaming chair, modern desk, computer, RGB lights, room interior, office, furniture, modern technology, sci-fi, futuristic, cartoon, anime, realistic human portrait, watermark overload, text overlay, huge text, fake banner, UI mockup, cluttered, low quality, blurry"
    },
    "PUBG Mobile": {
      scene: "Erangel or Miramar battlefield, airdrop crate falling, chicken dinner victory atmosphere, tactical combat zone, military gear and weapons, battle royale closing circle tension, survival last-stand scenario",
      style: "realistic military digital art, PUBG cinematic trailer quality, gritty combat atmosphere, photorealistic equipment, premium battle royale cover art",
      lighting: "dramatic combat lighting, golden hour military atmosphere, explosion or muzzle flash illumination, cinematic war zone lighting, dust and atmosphere",
      colors: "military olive drab and brown, tactical grays, desert tan, blood orange accents, smoke grays, dramatic desaturated palette with color pops",
      composition: "tactical equipment or character focal point, battlefield depth, dynamic action angle, professional shooter game cover composition, uncluttered focus",
      negativePrompt: "gaming chair, desk setup, room interior, office, furniture, keyboard, mouse, monitor, RGB lights, cartoon, anime, futuristic sci-fi, watermark overload, text overlay, huge text, slogan, fake banner, UI elements, fake product card, cluttered, messy, low quality, blurry"
    },
    "Metin2": {
      scene: "Metin2 oriental fantasy world, ancient village or valley, warrior in glowing armor, stone monuments, mythological creatures, eastern aesthetic fantasy, ancient dragon silhouette",
      style: "MMORPG cinematic art, epic fantasy realism, highly detailed armor/weapon, traditional oriental fantasy atmosphere",
      lighting: "golden hour sunlight, mystical particle glows, volumetric atmospheric fog, epic horizon lighting",
      colors: "deep reds, golden ambers, ancient bronze, mystical purple spells, natural earth tones",
      composition: "heroic warrior focal point, wide landscape depth, epic cinematic framing",
      negativePrompt: "modern items, guns, cars, technology, cyberpunk, sci-fi, gaming chair, computer, furniture, UI, text, watermark, blurry, low res"
    },
    "Knight Online": {
      scene: "Knight Online Moradon or El Morad castle, epic medieval battlefield, iron-clad knights, massive swords, war banners, glowing magical enhancements, party of heroes",
      style: "classic dark fantasy realism, epic RPG art, cinematic battle scene, detailed plate armor",
      lighting: "dramatic overcast battlefield, bright magical weapon glows, volumetric smoke",
      colors: "steel blue, deep crimson, iron gray, brilliant gold weapon glows, dark sky",
      composition: "battle-ready hero or epic castle gate, dynamic low angle, intense action atmosphere",
      negativePrompt: "casual clothes, phones, computers, modern room, furniture, cartoon, anime, text, labels, low quality, blurry"
    },
    "Minecraft": {
      scene: "Minecraft voxel world, epic blocky landscape, custom architectural build, diamond sword, enderman or creeper environment, creative building masterpiece",
      style: "stylized 3D blocky render, vibrant voxel art, polished game cinematic, clean sharp edges",
      lighting: "bright sunny voxel lighting, soft blocky shadows, glowing redstone or torches",
      colors: "vibrant grass green, sky blue, diamond teal, earth browns, rich block colors",
      composition: "iconic build or character focal point, clean perspective, welcoming game world",
      negativePrompt: "realistic human, photo, furniture, room interior, messy, text, watermark, blurry, low res"
    },
    "Discord": {
      scene: "Discord digital community hub, stylized social interface aesthetic, gamer networking space, nitro premium elements, abstract digital connection, futuristic communication",
      style: "clean vector-style 3D render, modern app aesthetic, sleek high-tech social art",
      lighting: "soft neon purple glow, sleek backlight, modern tech ambiance",
      colors: "Discord blurple, dark theme charcoal, neon highlights, clean white accents",
      composition: "abstract tech focal point, balanced minimalist layout, professional app key art",
      negativePrompt: "messy room, real furniture, office, paperwork, handwritten, blurry, low quality, text overload"
    },
    "Steam": {
      scene: "Steam gaming library portal, huge collection of digital games, professional gaming platform aesthetic, PC master race concept, futuristic digital distribution",
      style: "high-end digital commercial, sleek tech render, professional gaming store aesthetic",
      lighting: "cyan and blue digital glow, premium spotlighting, sleek ambient light",
      colors: "Steam blue, deep slate, digital cyan, clean white technology accents",
      composition: "hero product or digital portal focal point, perspective depth, clean professional layout",
      negativePrompt: "gaming chair, desk, room interior, messy, keyboard, mouse, monitor, physical objects, paper, text, blurry"
    },
    "default": {
      scene: "premium gaming atmosphere, abstract high-tech gaming environment, digital marketplace energy, professional gaming world portal, sleek virtual space, modern digital commerce aesthetic",
      style: "premium digital art, sleek modern commercial aesthetic, ultra-clean composition, professional marketplace visual, sharp high-end digital render",
      lighting: "professional studio lighting, clean dramatic highlights, premium product photography lighting, sleek modern ambiance, polished glow effects",
      colors: "sleek blacks and dark grays, premium accent colors, clean metallic tones, modern minimalist palette, professional dark theme with highlights",
      composition: "clean centered focal point, professional product showcase, minimalist premium composition, uncluttered elegant layout, marketplace hero shot",
      negativePrompt: "gaming chair, desk, computer setup, room interior, office, furniture, cluttered background, messy room, cartoon, anime, watermark overload, text overlay, huge text, fake banner, fake UI, buttons, labels, busy layout, low quality, blurry, amateur, generic stock photo"
    }
  };

  /**
   * İlan kategorisi ve başlığına göre şablon anahtarını seçer (CS2, Valorant, …).
   * ItemSatis / serbest metin kategorileri için başlıkla takviye edilir.
   */
  static resolveCategoryKey(category: string, title: string = ""): string {
    const raw = String(category || "").trim();
    const templates = this.CATEGORY_TEMPLATES as Record<string, (typeof this.CATEGORY_TEMPLATES)["default"]>;
    if (raw && templates[raw]) return raw;

    const lc = raw.toLowerCase();
    const lt = String(title || "").toLowerCase();

    if (lc.includes("cs2") || lc.includes("counter-strike") || lt.includes("cs2")) return "CS2";
    if (lc.includes("valorant") || lt.includes("valorant")) return "Valorant";
    if (lc.includes("league") || /\blol\b/.test(lc) || /\blol\b/.test(lt) || lc.includes("legends")) return "League of Legends";
    if (lc.includes("roblox") || lt.includes("roblox")) return "Roblox";
    if (lc.includes("pubg") || lt.includes("pubg")) return "PUBG Mobile";
    
    // Metin2 vs PVP Serverlar ayrımı
    const isPvpContext = lt.includes("sunucu") || lt.includes("server") || lt.includes("emek") || 
                        lt.includes("official") || lt.includes("açılış") || lt.includes("acilis") || 
                        lt.includes("pvp") || lt.includes("ws");

    if (lc === "metin2" || lc.startsWith("metin2 ") || (lc.includes("metin2") && !isPvpContext)) {
      return "Metin2";
    }
    if (lc.includes("knight") && lc.includes("online") && !isPvpContext) return "Knight Online";
    
    if (lc.includes("minecraft") || lt.includes("minecraft")) return "Minecraft";
    if (lc.includes("discord") || lt.includes("discord")) return "Discord";
    
    if (
      lc.includes("pvp") ||
      (lc.includes("metin") && isPvpContext) ||
      (lc.includes("knight") && (isPvpContext || lc.includes("pvp"))) ||
      lc.includes("sunucu") ||
      lt.includes("emek server") ||
      isPvpContext
    ) {
      return "PVP Serverlar";
    }
    
    if (lc.includes("steam") || lt.includes("steam") || lc.includes("cd-key") || lc.includes("cd key")) return "Steam";
    if (lc.includes("epic") || lt.includes("fortnite")) return "default";

    return "default";
  }

  // Başlıktan anahtar kelimeler çıkar
  private static extractKeywords(title: string, description: string = ""): string[] {
    const combined = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];
    
    // Gaming hesap göstergeleri
    if (combined.includes("hesap")) keywords.push("premium gaming account");
    if (combined.includes("skin")) keywords.push("rare skins collection");
    if (combined.includes("rank")) keywords.push("high rank elite");
    if (combined.includes("level")) keywords.push("high level progression");
    if (combined.includes("prime")) keywords.push("prime status verified");
    if (combined.includes("vandal")) keywords.push("vandal weapon skin");
    if (combined.includes("phantom")) keywords.push("phantom rifle skin");
    if (combined.includes("bıçak") || combined.includes("knife")) keywords.push("premium knife skin");
    if (combined.includes("rozet")) keywords.push("rare service badges");
    if (combined.includes("madalya")) keywords.push("achievement medals");
    
    // Para/Birim
    if (combined.includes("robux")) keywords.push("robux currency");
    if (combined.includes("vp")) keywords.push("valorant points VP");
    if (combined.includes("rp")) keywords.push("riot points RP");
    if (combined.includes("uc")) keywords.push("unknown cash UC");
    if (combined.includes("gb")) keywords.push("gold bar currency");
    
    // Server türleri
    if (combined.includes("emek")) keywords.push("hardcore server");
    if (combined.includes("pvp")) keywords.push("pvp battle server");
    if (combined.includes("wslik")) keywords.push("wslik server");
    
    return keywords;
  }

  // İlan analizi yap
  private static analyzeListing(data: ListingVisualData): PromptAnalysis {
    const category = this.resolveCategoryKey(data.category, data.title);
    const title = data.title || "";
    const description = data.description || "";
    
    // Ürün tipi belirle
    let productType = "dijital gaming ürünü";
    if (title.toLowerCase().includes("hesap")) productType = "premium gaming hesabı";
    if (title.toLowerCase().includes("skin")) productType = "nadir oyun içi skin koleksiyonu";
    if (title.toLowerCase().includes("server")) productType = "oyun server tanıtımı";
    if (title.toLowerCase().includes("robux")) productType = "oyun içi para birimi paketi";
    
    // Hedef kitle
    let targetAudience = "gaming tutkunları";
    if (category === "Roblox") targetAudience = "genç oyuncular ve aileler";
    if (category === "CS2") targetAudience = "rekabetçi FPS oyuncuları";
    if (category === "Valorant") targetAudience = "taktik shooter hayranları";
    if (category === "PVP Serverlar") targetAudience = "MMORPG veteranları";
    
    // Ana unsurları çıkar
    const keyElements = this.extractKeywords(title, description);
    
    // Görsel stili
    let visualStyle: string = data.style || "premium";
    if (category === "PVP Serverlar") visualStyle = "epic fantasy";
    if (category === "Roblox") visualStyle = "colorful playful";
    
    // Mood belirle
    let mood = "profesyonel ve güvenilir";
    if (category === "CS2") mood = "yoğun rekabetçi gaming";
    if (category === "Valorant") mood = "şık taktik hassasiyet";
    if (category === "League of Legends") mood = "büyülü ve efsanevi";
    if (category === "PVP Serverlar") mood = "epik ve maceracı";
    
    // Şablon al
    const template = this.CATEGORY_TEMPLATES[category] || this.CATEGORY_TEMPLATES["default"];
    
    return {
      productType,
      targetAudience,
      keyElements,
      visualStyle,
      mood,
      background: template.scene,
      lighting: template.lighting,
      composition: template.composition
    };
  }

  /**
   * Ana fonksiyon: İlan verilerine göre profesyonel AI promptu üretir
   */
  static generatePrompt(data: ListingVisualData): string {
    const resolvedCategory = this.resolveCategoryKey(data.category, data.title);
    const dataResolved: ListingVisualData = { ...data, category: resolvedCategory };
    const analysis = this.analyzeListing(dataResolved);
    const template = this.CATEGORY_TEMPLATES[resolvedCategory] || this.CATEGORY_TEMPLATES["default"];

    const titleClean = String(data.title || "")
      .replace(/["'«»]/g, "")
      .trim()
      .slice(0, 100);

    // Prompt bileşenlerini birleştir
    const promptParts: string[] = [
      // Konu tanımı
      `Professional e-commerce product photography of ${analysis.productType}`,
      
      // İlan başlığına özel bağlam (kategori + ilan metni)
      titleClean ? `Listing-specific visual theme: ${titleClean}. Game or product category: ${resolvedCategory}` : `Game or product category: ${resolvedCategory}`,

      // Sahne açıklaması
      `Scene: ${template.scene}`,
      
      // Ana unsurlar
      analysis.keyElements.length > 0 ? `Featuring: ${analysis.keyElements.join(", ")}` : "",
      
      // Stil belirtimi
      `Style: ${template.style}`,
      
      // Aydınlatma
      `Lighting: ${template.lighting}`,
      
      // Renk paleti
      `Color palette: ${template.colors}`,
      
      // Kompozisyon
      `Composition: ${template.composition}`,
      
      // Mood
      `Mood: ${analysis.mood}`,
      
      // Teknik özellikler
      `Technical: 8K resolution, ultra-sharp details, professional depth of field, premium commercial photography quality, marketplace-ready product image`,
      
      // Hedef bağlam
      `Target audience: ${analysis.targetAudience}`,
      
      // Negatif prompt
      `Avoid: ${template.negativePrompt}`
    ];
    
    // Temizle ve birleştir
    const finalPrompt = promptParts
      .filter(part => part.trim().length > 0)
      .join(". ")
      .replace(/\.\s*\./g, ".")
      .trim();
    
    return finalPrompt;
  }

  /**
   * Hata ayıklama için analiz özeti üretir
   */
  static generateAnalysisSummary(data: ListingVisualData): string {
    const analysis = this.analyzeListing(data);
    
    return `
=== İLAN ANALİZİ ===
Kategori: ${data.category}
Başlık: ${data.title}
Ürün Tipi: ${analysis.productType}
Hedef Kitle: ${analysis.targetAudience}
Ana Unsurlar: ${analysis.keyElements.join(", ") || "Tespit edilmedi"}
Görsel Stil: ${analysis.visualStyle}
Mood: ${analysis.mood}
Arka Plan: ${analysis.background.substring(0, 100)}...
=== ANALİZ SONU ===
    `.trim();
  }

  /**
   * İlan içeriğini analiz ederek temel objeyi belirler (legacy)
   */
  private static analyzeLegacy(data: ListingVisualData) {
    const text = (data.title + " " + (data.description || "")).toLowerCase();
    let mainObject = data.category;

    if (text.includes("hesap") || text.includes("account")) mainObject = "Premium Game Account";
    if (text.includes("skin") || text.includes("item")) mainObject = "Legendary In-game Item";
    if (text.includes("gold") || text.includes("won") || text.includes("para")) mainObject = "Valuable In-game Currency";
    if (text.includes("boost") || text.includes("rank")) mainObject = "Professional Gaming Service";

    return { mainObject };
  }

  /**
   * Kategoriye uygun sahne tasarımını belirler (legacy)
   */
  private static getCategoryScene(category: string, object: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("valorant")) return "tactical gaming environment, futuristic agent theme";
    if (cat.includes("cs2") || cat.includes("counter")) return "competitive map background, tactical combat feel";
    if (cat.includes("league") || cat.includes("lol")) return "fantasy champion theme, magical arena atmosphere";
    if (cat.includes("roblox")) return "bright playful voxel world, creative building blocks environment";
    if (cat.includes("metin2") || cat.includes("knight")) return "epic medieval fantasy landscape, ancient armor and weapons";
    if (cat.includes("steam") || cat.includes("discord")) return "sleek digital platform interface aesthetic, premium social tech";
    
    return "modern professional marketplace showcase";
  }

  /**
   * Kategoriye göre en uygun stili tahmin eder (legacy)
   */
  private static inferStyle(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("oyun") || cat.includes("game") || cat.includes("cs2") || cat.includes("valorant")) return "gaming";
    if (cat.includes("yazılım") || cat.includes("software") || cat.includes("kod")) return "technology";
    if (cat.includes("hizmet") || cat.includes("kurumsal")) return "corporate";
    return "premium";
  }
}

// Hızlı kullanım için yardımcı fonksiyon
export function generateListingPrompt(
  category: string,
  title: string,
  description?: string,
  style?: ListingVisualData["style"]
): string {
  return ListingVisualDirector.generatePrompt({
    category,
    title,
    description,
    style
  });
}

