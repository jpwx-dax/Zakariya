import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        ink: "#0D0D0D", // near black
        paper: "#F4F1EC", // warm off-white
        bone: "#E9E4DA", // soft secondary surface
        cloud: "#F9F7F3",
        accent: "#CB4B24", // burnt orange — used sparingly
        "accent-soft": "#D8623A",
        muted: "#8A857C",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter2: "-0.03em",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        power: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      screens: {
        xs: "480px",
      },
      maxWidth: {
        container: "1600px",
      },
    },
  },
  plugins: [],
};

export default config;
