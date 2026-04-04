import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2"
      title={mounted && isDark ? "Aydınlık Mod" : "Karanlık Mod"}
      aria-label={mounted && isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
    >
      {mounted && isDark ? (
        <>
          <Sun className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-medium hidden sm:inline">Aydınlık</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          <span className="text-xs font-medium hidden sm:inline">Karanlık</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
