/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media",
  prefix: "",
  plugins: [
    require('tailwindcss-react-aria-components'),
    require("daisyui")
  ],
  daisyui: {
    themes: [ "business"],
  },
}
