import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        "sans-serif",
      ],
      mono: [
        '"JetBrains Mono"',
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "monospace",
      ],
    },
    extend: {
      colors: {
        brand: {
          50: "#FDFBF7",
          100: "#FAF4E6",
          200: "#F4E7C4",
          300: "#ECD59A",
          400: "#DEC067",
          500: "#C9A227", // Primary Mustard/Gold
          600: "#B8901E",
          700: "#9B7415",
          800: "#7D5C13",
          900: "#644813",
          950: "#3A2706",
        },
        primary: {
          50: "#FDFBF7",
          100: "#FAF4E6",
          200: "#F4E7C4",
          300: "#ECD59A",
          400: "#DEC067",
          500: "#C9A227", // Primary Mustard/Gold
          600: "#B8901E",
          700: "#9B7415",
          800: "#7D5C13",
          900: "#644813",
          950: "#3A2706",
        },
        sidebar: {
          DEFAULT: "#111111",
          hover: "#1C1C1C",
          active: "#242424",
          border: "#282828",
          text: "#9CA3AF",
          textActive: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#F8F9FA",
          card: "#FFFFFF",
          subtle: "#F3F4F6",
          border: "#E5E7EB",
        },
      },
      boxShadow: {
        subtle:
          "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};

export default config;
