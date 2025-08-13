/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
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
          DEFAULT: '#A7D0CD', // verde acqua chiaro
          foreground: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#F6E7D8', // beige rosa tenue
          foreground: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#F9D7DC', // rosa tenue
          foreground: '#1A1A1A',
        },
        muted: {
          DEFAULT: '#F3F3F2', // grigio pastello
          foreground: '#666666',
        },
        border: '#E1E1E1',
        input: '#EDEDED',
        ring: '#A7D0CD', // match primary
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
