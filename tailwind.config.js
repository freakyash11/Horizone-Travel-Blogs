/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#1a1a1a",
          charcoal: "#2c2c2c",
          slate: "#4a5568"
        },
        secondary: {
          white: "#ffffff",
          lightGray: "#f7fafc",
          mediumGray: "#e2e8f0",
          darkGray: "#718096"
        },
        accent: {
          blue: "#3182ce",
          teal: "#319795"
        },
        overlay: {
          dark: "rgba(0, 0, 0, 0.4)",
          light: "rgba(255, 255, 255, 0.4)"
        }
      },
      fontFamily: {
        primary: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        secondary: ["SF Pro Display", "Helvetica Neue", "sans-serif"]
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.6
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem'
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px'
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px'
      },
    },
  },
  plugins: [],
}

