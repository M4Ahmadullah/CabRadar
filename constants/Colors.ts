/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: "#007AFF",
    tabIconDefault: "#ccc",
    tabIconSelected: "#007AFF",
    border: "#D1D1D6",
    card: "#F2F2F7",
    textSecondary: "#8E8E93",
    icon: "#007AFF",
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#0A84FF",
    tabIconDefault: "#ccc",
    tabIconSelected: "#0A84FF",
    border: "#38383A",
    card: "#1C1C1E",
    textSecondary: "#8E8E93",
    icon: "#0A84FF",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
