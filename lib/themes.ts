export const DAISY_THEMES = [
  "light",
  "dark",
  "synthwave",
  "forest",
  "cupcake",
] as const;

export type DaisyTheme = (typeof DAISY_THEMES)[number];

export const THEME_STORAGE_KEY = "concert-cost-tracker-theme";

export function applyTheme(theme: string) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
