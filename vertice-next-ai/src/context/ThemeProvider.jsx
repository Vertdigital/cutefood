import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "vertice-next-ai:theme";

/** Lê a preferência salva no localStorage, se houver. */
function getPreferenciaSalva() {
  if (typeof window === "undefined") return null;
  try {
    const salvo = window.localStorage.getItem(STORAGE_KEY);
    return salvo === "dark" || salvo === "light" ? salvo : null;
  } catch {
    // localStorage indisponível (modo privado, restrições do navegador, etc.)
    return null;
  }
}

/** Detecta o tema do sistema operacional via media query. */
function getPreferenciaSistema() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function aplicarClasseNoHtml(theme) {
  const root = window.document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Provedor de tema (claro/escuro) para toda a aplicação.
 *
 * Ordem de resolução do tema inicial:
 * 1. Preferência já salva pelo usuário no localStorage (alternância manual).
 * 2. Se nunca alternou manualmente, o tema do sistema operacional na primeira visita.
 * 3. Caso nada esteja disponível, "light" como padrão seguro.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getPreferenciaSalva() || getPreferenciaSistema());

  // Aplica a classe `dark` no <html> sempre que o tema mudar.
  useEffect(() => {
    aplicarClasseNoHtml(theme);
  }, [theme]);

  // Se o usuário nunca escolheu manualmente um tema, acompanha mudanças do
  // sistema operacional em tempo real (ex.: agendamento de modo escuro do SO).
  useEffect(() => {
    if (getPreferenciaSalva()) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((atual) => {
      const proximo = atual === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, proximo);
      } catch {
        // Se não for possível persistir, a alternância ainda funciona na sessão atual.
      }
      return proximo;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, isDark: theme === "dark" }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme precisa ser usado dentro de um ThemeProvider");
  return context;
}
