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
          dark: "#073B66",
          DEFAULT: "#0B5E9A",
        },
        accent: {
          gold: "#E5A900",
          light: "#F5C542",
        },
        background: "#F7F9FC",
        surface: "#FFFFFF",
        text: {
          primary: "#132238",
          secondary: "#667085",
        },
        border: "#E4E7EC",
        success: "#159455",
        warning: "#F79009",
        error: "#D92D20",
      },
    },
  },
};
