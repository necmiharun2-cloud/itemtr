import { SITE_NAME } from "@/lib/site-brand";

export interface KocuceItem {
  title: string;
  url?: string;
  date: string;
  description: string;
  source?: string;
}

const KOCUCE_URL = "https://www.kocuce.com/forumlar/pvpservers/";
const PVPKENT_URL = "https://pvpkent.com/forum/pvp-server-tanitim/";

/**
 * Harici forum içeriğindeki üçüncü taraf markaları platform adıyla değiştirir.
 */
export const sanitizeContent = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/kocuce/gi, SITE_NAME)
    .replace(/ko-cuce/gi, SITE_NAME)
    .replace(/ko cuce/gi, SITE_NAME)
    .replace(/pvpkent/gi, SITE_NAME)
    .replace(/pvp kent/gi, SITE_NAME);
};

/**
 * Checks if a date string is within the last 1 year.
 */
export const isWithinLastYear = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const lower = dateStr.toLowerCase();
  if (lower.includes("ago") || lower.includes("today") || lower.includes("yesterday") || 
      lower.includes("dün") || lower.includes("bugün") || lower.includes("dakika") || lower.includes("saat")) {
    return true;
  }

  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date >= oneYearAgo;
};

export const processKocuceHTML = (html: string): KocuceItem[] => {
  const items: KocuceItem[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Thread list selectors
  const threads = doc.querySelectorAll('.structItem--thread, .structItem');
  
  if (threads.length === 0 && (html.includes('http') || html.length > 50)) {
     // If not standard HTML, maybe it's just raw text with links
     const lines = html.split('\n');
     lines.forEach(line => {
       if (line.length > 10) {
         const sanitizedLine = sanitizeContent(line.trim());
         items.push({
           title: sanitizedLine.substring(0, 100),
           description: sanitizedLine,
           date: new Date().toISOString().split('T')[0]
         });
       }
     });
     return items;
  }

  threads.forEach((thread) => {
    const titleEl = thread.querySelector('.structItem-title a');
    const dateEl = thread.querySelector('.structItem-latestDate, .structItem-startDate, time');
    
    if (titleEl) {
      const title = sanitizeContent(titleEl.textContent || "");
      const dateStr = dateEl?.getAttribute('datetime') || dateEl?.textContent || "";
      const url = titleEl.getAttribute('href') || "";
      
      // Filter last 1 year or relative dates
      const isRecent = dateStr.includes('2024') || dateStr.includes('2025') || dateStr.includes('2026') || 
                       isWithinLastYear(dateStr);

      if (isRecent) {
        items.push({
          title,
          url: url.startsWith('http') ? url : `https://www.kocuce.com${url}`,
          description: `${title} - Bu sunucu ${sanitizeContent(dateStr)} tarihinde ${SITE_NAME} havuzuna dahil edilmiştir. Gerçek oyuncu kitlesi ve stabil altyapı.`,
          date: dateStr
        });
      }
    }
  });

  return items;
};

/**
 * Mock function to return realistic Kocuce data patterns for the bot engine
 * if the user hasn't imported fresh data yet.
 */
export const getKocucePvpPool = (): KocuceItem[] => {
  return [
    {
      title: `⚔️ ${SITE_NAME} Özel: MYKOV2 | GENESIS Başlıyor | 2.000.000 TL Ödül Havuzu`,
      description: `Gerçek MYKO deneyimi ${SITE_NAME} güvencesiyle çok yakında sizlerle. Dev ödül havuzu ve 7/24 destek hizmeti.`,
      date: "Bugün",
    },
    {
      title: "OldStyleMyko.Com v.1098 – Nostaljik Cleaver Görevi Official: 27 Mart Cuma",
      description: `${SITE_NAME} üzerinden kayıt olun, starter paket kazanın. Nostaljik cleaver görevi ve yeni sistemler aktif.`,
      date: "Dün",
    },
    {
      title: "HeavenKO.com NEW WORLD: INFERNO! Akademi-1 6 Mart 21.00",
      description: `Ücretsiz Genie ve Auto Loot desteği ${SITE_NAME} özel indirimiyle. Yeni world 'INFERNO' açıldı.`,
      date: "2026-03-01",
    },
    {
      title: "ROKKOGAME.FUN CZ FARM ODAKLI SUNUCU! 13.02.2026 OFFICIAL",
      description: `Pazarın kalbi ${SITE_NAME} platformunda atacak, hemen yerinizi alın. CZ farm odaklı dengeli sunucu.`,
      date: "2026-02-13",
    },
    {
      title: "APEXMYKO New Sunucu 'V A L H A L L A' 3 Nisan Cuma 22:00",
      description: `1.500.000 TL Ödül havuzu ve ${SITE_NAME} entegrasyonu aktif. New yönetimi ile 'VALHALLA' sunucusu.`,
      date: "2026-03-20",
    },
  ];
};

/**
 * Mock function to return realistic Pvpkent data patterns for the bot engine.
 */
export const getPvpkentPvpPool = (): KocuceItem[] => {
  return [
    {
      title: "🔥 PVP Kent Özel: RiseOfKings | 1.000.000 TL Ödül | Anti-Cheat Sistem",
      description: `Yeni nesil anti-cheat ile korunan RiseOfKings sunucusu. ${SITE_NAME} üzerinden kayıt olun 500M starter hediye!`,
      date: "Bugün",
      source: "pvpkent",
    },
    {
      title: "KentPVP.com v.1299 - Farm & PK Dengesi | Official 5 Nisan",
      description: `Farm odaklı ama PK'ya açık dengeli sunucu. ${SITE_NAME} sponsorluğunda büyük ödüllü etkinlikler.`,
      date: "Dün",
      source: "pvpkent",
    },
    {
      title: "EliteKO New World: OLYMPUS | 15 Mart 21.00 Açılış",
      description: `Mitology temalı yeni world. ${SITE_NAME} entegrasyonu ile güvenli item takası. 1M başlangıç parası.`,
      date: "2026-03-10",
      source: "pvpkent",
    },
    {
      title: "VenomKO.FUN - Beta Test | 20.03.2026",
      description: `Beta test aşamasında katılımcılara özel hediyeler. ${SITE_NAME} üzerinden geri bildirim bırakın.`,
      date: "2026-03-15",
      source: "pvpkent",
    },
    {
      title: "DragonKO V2 | 500K TL Turnuva Ödülü | Anti-Hile",
      description: `Profesyonel anti-hile koruması. ${SITE_NAME} güvencesiyle 7/24 destek. Kayıt açıldı!`,
      date: "2026-03-18",
      source: "pvpkent",
    },
  ];
};

/**
 * Combined pool from all PVP sources (Kocuce + Pvpkent)
 */
export const getCombinedPvpPool = (): KocuceItem[] => {
  const kocuceItems = getKocucePvpPool().map(item => ({ ...item, source: "kocuce" as const }));
  const pvpkentItems = getPvpkentPvpPool().map(item => ({ ...item, source: "pvpkent" as const }));
  return [...kocuceItems, ...pvpkentItems];
};
