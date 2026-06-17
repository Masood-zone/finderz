/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
    "./src/providers/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#07324F",
          DEFAULT: "#075E8F",
        },
        accent: {
          gold: "#F4C542",
          teal: "#0F766E",
        },
        background: "#F6F8FB",
        surface: "#FFFFFF",
        text: {
          primary: "#111827",
          secondary: "#5F6B7A",
        },
        border: "#D8E0EA",
        success: "#159455",
        warning: "#B7791F",
        error: "#B42318",
      },
    },
  },
};
