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
  style?: "gerçekçi" | "premium" | "modern" | "minimalist" | "teknoloji" | "oyun" | "kurumsal";
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
  // Kategori bazlı görsel şablonları
  private static readonly CATEGORY_TEMPLATES: Record<string, {
    scene: string;
    style: string;
    lighting: string;
    colors: string;
    composition: string;
    negativePrompt: string;
  }> = {
    "CS2": {
      scene: "profesyonel gaming setup, RGB aydınlatmalı mekanik klavye, gaming mouse, yüksek çözünürlüklü monitörde Counter-Strike oyun arayüzü, silah skinleri görünür, cyberpunk atmosfer",
      style: "hiper-realistik, ultra-detaylı, sinematik gaming fotoğrafçılığı, 8K kalite",
      lighting: "dramatik RGB aydınlatma teal ve turuncu vurgular, monitörden yumuşak ambient ışık, profesyonel stüdyo aydınlatması",
      colors: "derin siyahlar, canlı RGB spektrum, metalik griler, elektrik mavisi ve turuncu vurgular",
      composition: "ürün-merkezli, sığ alan derinliği, 45 derece açı, premium ürün vitrini",
      negativePrompt: "cartoon, anime, düşük kalite, bulanık, filigran, yazı, insan yüzleri, eller, distorsiyon, çirkin, amatör"
    },
    "Valorant": {
      scene: "şık gaming istasyonu Valorant estetiğiyle, ajan temalı setup, geometrik desenler, riot games tasarım unsurları, yüksek teknolojili gaming çevre birimleri",
      style: "modern gaming reklamcılığı, premium teknoloji fotoğrafçılığı, keskin detaylar, canlı renkler",
      lighting: "temiz beyaz stüdyo aydınlatması kırmızı vurgu ışıklarla, profesyonel ürün fotoğrafçılığı aydınlatması",
      colors: "bembeyaz, canlı kırmızılar, koyu kömür grileri, altın vurgular, yüksek kontrast",
      composition: "simetrik kompozisyon, merkezde ürün, temiz arka plan, profesyonel teknoloji ürün çekimi",
      negativePrompt: "dağınık, kalabalık, düşük çözünürlük, cartoon tarzı, anime, filigran, yazı üstü, bulanık, distorsiyon"
    },
    "League of Legends": {
      scene: "fantastik gaming ortamı büyülü atmosferle, Summoner's Rift ilhamlı arka plan unsurları, mistik parlayan efektler, fantezi estetiğiyle premium gaming aksesuarları",
      style: "fantezi-teknoloji hibrit, büyülü realizm, premium gaming ürün fotoğrafçılığı, mistik atmosfer",
      lighting: "büyülü ambient aydınlatma mavi ve altın tonlarda, yumuşak eterik parlama, sinematik rim aydınlatma",
      colors: "derin morlar, büyülü maviler, altın vurgular, mistik deniz mavisi, zengin koyu arka planlar",
      composition: "kahraman çekimi kompozisyonu, dramatik açı, premium gaming ürün sergileme, mistik ambiyans",
      negativePrompt: "düşük kalite, bulanık, cartoon, anime tarzı, gerçekçi insanlar, filigran, yazı, distorsiyon, çirkin"
    },
    "Roblox": {
      scene: "renkli neşeli gaming setup bloklu estetik unsurlarla, canlı gaming istasyonu, aile dostu gaming ortamı, modern renkli çevre birimleri",
      style: "parlak modern ürün fotoğrafçılığı, neşeli reklam tarzı, temiz ve canlı, profesyonel stüdyo",
      lighting: "parlak eşit stüdyo aydınlatması, neşeli sıcak ışık, profesyonel ürün fotoğrafçılığı aydınlatması",
      colors: "canlı gökkuşağı vurguları, neşeli parlak renkler, temiz beyazlar, oyuncu renkli unsurlar",
      composition: "temiz merkezi kompozisyon, samimi yaklaşılabilir açı, premium tüketici ürünü tarzı",
      negativePrompt: "karanlık, korkutucu, korku, düşük kalite, bulanık, filigran, yazı, insanlar, dağınık, kalabalık"
    },
    "PVP Serverlar": {
      scene: "destansı fantezi savaş alanı atmosferi, ortaçağ zırh ve silahlar, mistik gaming diyarı, MMORPG ilhamlı epik manzara, efsanevi savaşçı ekipmanları",
      style: "epik fantezi reklam fotoğrafçılığı, oyun sinematik tarzı, efsanevi atmosfer, premium kalite",
      lighting: "dramatik epik aydınlatma altın saat tonlarında, mistik sis efektleri, sinematik hacimsel aydınlatma",
      colors: "epik altınlar, mistik maviler, antik bronz, efsanevi gümüş, karanlık fantezi tonları",
      composition: "epik kahraman kompozisyonu, efsanevi eşya vitrini, dramatik perspektif, premium oyun varlığı tarzı",
      negativePrompt: "modern teknoloji, bilim kurgu, fütüristik, düşük kalite, bulanık, cartoon, anime, gerçekçi insanlar, filigran"
    },
    "PUBG Mobile": {
      scene: "battle royale gaming setup askeri taktik estetikle, çöl savaş ortamı, hayatta kalma gaming ekipmanı, profesyonel mobil gaming istasyonu",
      style: "taktik gaming fotoğrafçılığı, askeri-sınıf ürün vitrini, hayatta kalma oyun atmosferi, premium kalite",
      lighting: "dramatik çöl aydınlatması, altın saat askeri atmosferi, sinematik savaş aydınlatması",
      colors: "çöl bejleri, askeri yeşiller, taktik griler, tozlu kahverengiler, hayatta kalma turuncu vurgular",
      composition: "taktik ürün kompozisyonu, hayatta kalma ekipman düzeni, dramatik askeri açı",
      negativePrompt: "cartoon, anime, fütüristik bilim kurgu, düşük kalite, bulanık, filigran, yazı, dağınık, renkli"
    },
    "default": {
      scene: "premium profesyonel gaming setup, yüksek son teknoloji ortam, modern gaming istasyonu profesyonel aydınlatmayla",
      style: "profesyonel reklam fotoğrafçılığı, premium teknoloji ürün vitrini, ultra-detaylı, 8K kalite",
      lighting: "profesyonel stüdyo aydınlatması, yumuşak diffüz ışık, ince rim aydınlatma, premium ürün fotoğrafçılığı",
      colors: "profesyonel griler, premium siyahlar, ince vurgu aydınlatma, temiz modern palet",
      composition: "profesyonel ürün fotoğrafçılığı kompozisyonu, merkezde kahraman çekimi, sığ alan derinliği",
      negativePrompt: "düşük kalite, bulanık, cartoon, anime, filigran, yazı, insanlar, distorsiyon, çirkin, amatör"
    }
  };

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
    const category = data.category || "default";
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
    let visualStyle = data.style || "premium";
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
    const analysis = this.analyzeListing(data);
    const template = this.CATEGORY_TEMPLATES[data.category] || this.CATEGORY_TEMPLATES["default"];
    
    // Prompt bileşenlerini birleştir
    const promptParts: string[] = [
      // Konu tanımı
      `Professional e-commerce product photography of ${analysis.productType}`,
      
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

