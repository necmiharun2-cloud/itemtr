/**
 * Canlı domain için .env içinde VITE_SITE_URL=https://sizin-domain.com tanımlayın.
 */
const rawUrl = (import.meta.env.VITE_SITE_URL || "https://www.itemsatis.com").trim().replace(/\/$/, "");

export const SITE_URL = rawUrl;
export const SITE_DOMAIN = rawUrl.replace(/^https?:\/\//, "");
/** E-posta için www öneki olmadan alan adı */
export const SITE_EMAIL_DOMAIN = SITE_DOMAIN.replace(/^www\./, "");
export const SITE_NAME = "İtemSatış";
/** Logo: ilk kelime + vurgulu ikinci kelime */
export const SITE_LOGO_PRIMARY = "İtem";
export const SITE_LOGO_ACCENT = "Satış";
export const SITE_TAGLINE = "Türkiye'nin oyuncu alışveriş platformu";
export const SITE_SUBTAG = "GÜVENLİ DİJİTAL PAZARYERİ";
/** İlan satış komisyonu (yayın bilgisi) */
export const LISTING_COMMISSION_PERCENT = 7;
export const SUPPORT_PHONE_DISPLAY = "+90 850 000 00 00";
/** Yasal / destek metinlerinde kullanım: "İtemSatış (www.itemsatis.com)" */
export const SITE_LEGAL_LABEL = `${SITE_NAME} (${SITE_DOMAIN})`;
export const SUPPORT_EMAIL = `destek@${SITE_EMAIL_DOMAIN}`;
