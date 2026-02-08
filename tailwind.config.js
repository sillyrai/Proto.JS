/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/Web/views/**/*.{ejs,html}", "./src/Web/public/**/*.{html,js}"],
  theme: {
    extend: {
        colors: {
            'primary': '#5865F2',
            'secondary': '#2C2F33',
            'accent': '#7289DA',
        },
    },
  },
  plugins: [],
}
