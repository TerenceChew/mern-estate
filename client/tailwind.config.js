/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      ...defaultTheme.screens,
      xs: "480px",
    },
    fontFamily: {
      ...defaultTheme.fontFamily,
      poppins: ["Poppins", "Roboto", "ui-sans-serif", "system-ui"],
    },
  },
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
