// ─── LOCKED SPINE FILE ── design tokens. Streams use these classes;
// nobody edits this file. Risk color IS the product's visual language.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ctrl: {
          bg: "#0a0f14",
          panel: "#111823",
          line: "#1f2a36",
          fg: "#e6edf3",
          dim: "#8b98a5",
        },
        risk: {
          low: "#34d399",
          medium: "#fbbf24",
          high: "#f87171",
        },
      },
    },
  },
  plugins: [],
};
export default config;
