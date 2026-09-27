/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: "#0B0B0E",       // Deep void dark backdrop
          card: "#15151C",     // Rich charcoal surface for movie cards
          hover: "#1F1F2B",    // Interactive surface elevation
          border: "#272737",   // Crisp border dividing dark panels
          red: "#E50914",      // Vibrant Netflix-style primary crimson
          redGlow: "#FF1E27",  // High-intensity neon hover tint
          gold: "#F59E0B"      // VIP plush row highlight accent
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'red-neon': '0 0 25px -3px rgba(229, 9, 20, 0.7)',
        'red-sm': '0 0 12px -2px rgba(229, 9, 20, 0.6)',
        'screen-glow': '0 25px 50px -10px rgba(229, 9, 20, 0.25), 0 -5px 30px -5px rgba(255, 255, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
