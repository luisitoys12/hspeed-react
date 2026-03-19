import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Theme } from "@shared/schema";

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  card: string;
  border: string;
  muted: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  secondary?: string;
}

interface ThemeDecorations {
  emoji: string;
  pattern: string;
  particleType: string;
  accentEmojis?: string[];
}

interface ThemeContextType {
  theme: Theme | null;
  themes: Theme[];
  colors: ThemeColors | null;
  decorations: ThemeDecorations | null;
  isLoading: boolean;
  setActiveTheme: (slug: string) => void;
  isSettingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyThemeCSS(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--popover", colors.background);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", "213 31% 91%");
  root.style.setProperty("--popover-foreground", "213 31% 91%");
  root.style.setProperty("--foreground", "213 31% 91%");
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--input", colors.border);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--ring", colors.primary);
  root.style.setProperty("--sidebar-background", colors.background);
  root.style.setProperty("--sidebar-primary", colors.primary);
  root.style.setProperty("--sidebar-accent", colors.card);
  root.style.setProperty("--sidebar-border", colors.border);
  root.style.setProperty("--chart-1", colors.primary);
  // Custom CSS vars for glow/gradients
  root.style.setProperty("--theme-glow", colors.glowColor);
  root.style.setProperty("--theme-gradient-from", colors.gradientFrom);
  root.style.setProperty("--theme-gradient-to", colors.gradientTo);
  if (colors.secondary) {
    root.style.setProperty("--secondary", colors.secondary);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: activeTheme, isLoading: loadingActive } = useQuery<Theme>({
    queryKey: ["/api/themes/active"],
    retry: false,
    staleTime: 30000,
  });

  const { data: allThemes } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
    retry: false,
    staleTime: 60000,
  });

  const setThemeMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await apiRequest("PUT", "/api/themes/active", { slug });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themes/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
    },
  });

  // Apply CSS variables whenever the active theme changes
  useEffect(() => {
    if (activeTheme?.colors) {
      applyThemeCSS(activeTheme.colors as ThemeColors);
    }
  }, [activeTheme]);

  const setActiveTheme = useCallback((slug: string) => {
    setThemeMutation.mutate(slug);
  }, [setThemeMutation]);

  const colors = activeTheme?.colors ? (activeTheme.colors as ThemeColors) : null;
  const decorations = activeTheme?.decorations ? (activeTheme.decorations as ThemeDecorations) : null;

  return (
    <ThemeContext.Provider value={{
      theme: activeTheme || null,
      themes: allThemes || [],
      colors,
      decorations,
      isLoading: loadingActive,
      setActiveTheme,
      isSettingTheme: setThemeMutation.isPending,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
