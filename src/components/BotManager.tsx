import { useEffect, useRef } from "react";
import { generateBotListing, getBotHistory } from "@/lib/bot-engine";

const BotManager = () => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initBotSystem = () => {
      const hasInitialized = localStorage.getItem("itemtr_bot_initialized");
      if (!hasInitialized) {
        localStorage.setItem("itemtr_bot_enabled", "true");
        localStorage.setItem("itemtr_bot_interval", "45");
        localStorage.setItem("itemtr_bot_initialized", "true");
        
        const initialCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < initialCount; i++) {
          setTimeout(async () => {
            await generateBotListing();
          }, i * 1000);
        }
        console.log(`[BotManager] Initialized with ${initialCount} starter listings`);
      }
    };

    initBotSystem();

    const runAutomationCheck = async () => {
      const isEnabled = localStorage.getItem("itemtr_bot_enabled") === "true";
      if (!isEnabled) return;

      const intervalSec = Number(localStorage.getItem("itemtr_bot_interval") || "45");
      const now = Date.now();
      const lastRun = Number(localStorage.getItem("itemtr_bot_last_run") || "0");
      
      if (now - lastRun >= intervalSec * 1000) {
        localStorage.setItem("itemtr_bot_last_run", String(now));
        
        const historyCount = getBotHistory().length;
        const threshold = historyCount < 20 ? 0.85 : 0.4;
        
        if (Math.random() < threshold) {
          console.log(`[BotManager] Auto-generating listing (${new Date().toLocaleTimeString()})`);
          await generateBotListing();
        }
      }
    };

    intervalRef.current = window.setInterval(runAutomationCheck, 10000);
    const initTimeout = window.setTimeout(runAutomationCheck, 2000);

    const handleBeforeUnload = () => {
      localStorage.setItem("itemtr_bot_last_active", String(Date.now()));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.clearTimeout(initTimeout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
};

export default BotManager;
