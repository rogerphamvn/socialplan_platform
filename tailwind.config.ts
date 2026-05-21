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
        brand: {
          50: "#fdf5f4",
          100: "#fbe9e7",
          200: "#f6cdc8",
          300: "#eea69d",
          400: "#e07a6c",
          500: "#cf5546",
          600: "#b73d31",
          700: "#992f27",
          800: "#7d2922",
          900: "#682621",
          950: "#3a1110",
        },
        ink: {
          50: "#f7f6f4",
          100: "#eeece7",
          200: "#d9d4ca",
          300: "#bcb4a4",
          400: "#9c917d",
          500: "#827763",
          600: "#695f4f",
          700: "#544c40",
          800: "#3f3a31",
          900: "#2a2722",
        },
        canvas: "#f7f4ef",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        jp: ["var(--font-jp)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 16, 12, 0.04), 0 1px 1px rgba(20, 16, 12, 0.03)",
        soft: "0 8px 24px -8px rgba(20, 16, 12, 0.08)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
