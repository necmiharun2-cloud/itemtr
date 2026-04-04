import { SITE_NAME } from "@/lib/site-brand";

const SeoBlock = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
      <h2 className="text-lg font-bold text-foreground">{SITE_NAME} nedir?</h2>
      <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
        <p>
          {SITE_NAME}, Türkiye&apos;de oyuncular için dijital ürün alım-satım platformudur: oyun hesapları, e-pin, CD-Key,
          hediye kartları, oyun parası ve sosyal medya hizmetleri tek yerde.
        </p>
        <p>
          CS2, Valorant, Roblox, PUBG Mobile, Brawl Stars gibi oyunlarda item ve hesap; Steam, Netflix, Spotify ve benzeri
          platformlarda kod ve kart ihtiyaçlarınızı karşılayabilirsiniz.
        </p>
        <p>
          SSL, 3D Secure destekli ödeme, alıcı korumalı işlem akışı ve 7/24 destek ile güvenli alışveriş; satıcı
          değerlendirmeleri ve {SITE_NAME} güvencesi ile şeffaf pazar deneyimi sunar.
        </p>
      </div>
    </div>
  );
};

export default SeoBlock;
