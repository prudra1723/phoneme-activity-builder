"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readThemeCookie(): Theme | null {
  if (typeof document === "undefined") {
    return null;
  }

  const themeCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("phoneme-theme="));

  const savedTheme = themeCookie?.split("=")[1];

  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  document.cookie =
    `phoneme-theme=${theme}; path=/; ` + "max-age=31536000; SameSite=Lax";
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = readThemeCookie();

    const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme ?? systemTheme;

    document.documentElement.dataset.theme = initialTheme;

    const timer = window.setTimeout(() => {
      setThemeState(initialTheme);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const newTheme: Theme = currentTheme === "light" ? "dark" : "light";

      applyTheme(newTheme);

      return newTheme;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useTheme must be used inside the ThemeProvider component.",
    );
  }

  return context;
}
