import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import { Tooltip } from "./ui";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tooltip text={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}>
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </Tooltip>
  );
}
