import { useEffect } from "react";

// Tawk.to Live Chat Widget
// Property ID: 65xxxxxxxxxxxxx (kullanıcı kendi ID'sini eklemeli)
export const TawkChat = () => {
  useEffect(() => {
    // Tawk.to entegrasyonu
    // Kullanıcı Tawk.to hesabı oluşturup kendi ID'sini buraya eklemeli
    const tawkScript = document.createElement("script");
    tawkScript.async = true;
    tawkScript.src = "https://embed.tawk.to/YOUR_PROPERTY_ID/default";
    tawkScript.charset = "UTF-8";
    tawkScript.setAttribute("crossorigin", "*");
    
    // Script'i ekle
    const existingScript = document.getElementById("tawk-script");
    if (!existingScript) {
      tawkScript.id = "tawk-script";
      document.body.appendChild(tawkScript);
    }

    return () => {
      // Cleanup
      const script = document.getElementById("tawk-script");
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null; // Bu component görsel bir şey render etmiyor
};

// Alternatif: Crisp Chat (daha modern arayüz)
export const CrispChat = () => {
  useEffect(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "YOUR_CRISP_ID";
    
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    script.id = "crisp-script";
    
    const existing = document.getElementById("crisp-script");
    if (!existing) {
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    return () => {
      const s = document.getElementById("crisp-script");
      if (s) s.remove();
    };
  }, []);

  return null;
};

// Basit bir yüzen destek butonu (chat widget hazır olana kadar)
export const FloatingSupport = () => {
  const openSupport = () => {
    // Dashboard'daki destek sayfasına yönlendir
    window.location.href = "/dashboard?tab=destek";
  };

  return (
    <button
      onClick={openSupport}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:scale-110 transition-transform flex items-center gap-2"
      title="Destek Al"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span className="hidden sm:inline font-semibold text-sm">Destek</span>
    </button>
  );
};

// Global type declarations for Tawk and Crisp
declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
    $crisp?: any;
    CRISP_WEBSITE_ID?: string;
  }
}

export default FloatingSupport;
