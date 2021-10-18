module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      margin: {
        '-120': '-500px',
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled']
    },
  },
  plugins: [],
}
