/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        border: '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#3b82f6",
          secondary: "#2563eb",
          accent: "#3b82f6",
          neutral: "#121212",
          "base-100": "#0a0a0a",
          "base-200": "#121212",
          "base-300": "#1a1a1a",
          "base-content": "#ffffff",
        },
      },
    ],
    darkTheme: "dark",
  },
}