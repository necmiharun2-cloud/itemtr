import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference stored
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
    
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2"
      title={isDark ? "Aydınlık Mod" : "Karanlık Mod"}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-medium hidden sm:inline">Aydınlık</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-600" />
          <span className="text-xs font-medium hidden sm:inline">Karanlık</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
