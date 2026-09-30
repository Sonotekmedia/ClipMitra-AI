import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0b0d12",
        panel: "#12161e",
        panel2: "#0e1218",
        border: "#252b36",
        muted: "#8e98a9",
        accent: "#ff5a3c",
        accent2: "#ffb020",
      },
      borderRadius: {
        xl2: "18px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
