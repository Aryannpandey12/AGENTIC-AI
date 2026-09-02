/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        "desi-head": ["'Yatra One'", "cursive", "serif"],
        "desi-serif": ["'Rozha One'", "serif"]
      },
      colors: {
        maroon: {
          DEFAULT: "#7B2D26",
          dark: "#5C1F1A",
          light: "#9A3830"
        },
        haldi: {
          DEFAULT: "#E4A11B",
          dark: "#B88012",
          light: "#F5BA42"
        },
        leaf: {
          DEFAULT: "#3D7A3A",
          dark: "#2A5728",
          light: "#529E4E"
        },
        cream: "#FFF8EE",
        beige: "#F8F1E7",
        brown: {
          DEFAULT: "#3E2723",
          dark: "#271714",
          light: "#5D4037"
        },
        wood: "#5C3317"
      }
    }
  },
  plugins: []
};
