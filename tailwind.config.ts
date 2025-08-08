import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1fbf8",
          100: "#d6f5ea",
          200: "#adebd6",
          300: "#7dddc0",
          400: "#4bcca8",
          500: "#28b190",
          600: "#1c8d75",
          700: "#166e5d",
          800: "#13594c",
          900: "#0f493f"
        }
      },
      boxShadow: {
        soft: "0 10px 20px rgba(0,0,0,.06)"
      }
    },
  },
  plugins: [],
} satisfies Config;
