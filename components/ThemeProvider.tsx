"use client";

import { useEffect } from "react";
import { applyTheme, THEME_STORAGE_KEY } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) applyTheme(saved);
  }, []);

  return <>{children}</>;
}
