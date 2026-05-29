/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        webpoint: {
          bg: "#0a0d14",
          panel: "#15181f",
          accent: "#4A9EFF",
          "accent-soft": "#7fb8f2",
          muted: "#cdd6e3",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "orb-breathe": "orbBreathe 2.8s ease-in-out infinite",
        "shimmer-load": "shimmerLoad 1.2s ease-out forwards",
      },
      keyframes: {
        orbBreathe: {
          "0%, 100%": { opacity: "0.56" },
          "50%": { opacity: "0.95" },
        },
        shimmerLoad: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
