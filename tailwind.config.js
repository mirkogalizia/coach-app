/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- aggiunto
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: '#FF6B00',
        foreground: '#FFFFFF'
      },
      secondary: {
        DEFAULT: '#FFD580',
        foreground: '#1A1A1A'
      },
      accent: {
        DEFAULT: '#FF9E3D',
        foreground: '#1A1A1A'
      },
      muted: {
        DEFAULT: '#FDF8F3',
        foreground: '#6B6B6B'
      },
      border: '#FF9E3D',
      input: '#FF9E3D',
      ring: '#FF6B00'
    },
  },
},
  plugins: [require("tailwindcss-animate")],
};
