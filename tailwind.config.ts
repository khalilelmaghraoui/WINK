import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        wink: {
          background: "#F8F3EA",
          surface: "#FFFCF7",
          "surface-muted": "#EFE7DA",
          text: "#181512",
          "text-secondary": "#6F665D",
          border: "#DCD1C2",
          primary: "#8F2438",
          "primary-hover": "#741A2C",
          accent: "#C9A24E",
          "counter-accent": "#0F5E5D",
          success: "#2F6B4F",
          warning: "#A96F1E",
          danger: "#8A1F2D",
          focus: "#0F5E5D"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Arial", "Helvetica", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
