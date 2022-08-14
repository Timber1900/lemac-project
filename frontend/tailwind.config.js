module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '18': 'repeat(18, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}
