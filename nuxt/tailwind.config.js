/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Brand palette. Blue, green and teal come from
        // openspec/changes/druxtjs-site-visual-refresh; the ink scale is the
        // dark ground shared with the discord.druxtjs.org redirect page.
        brand: {
          blue: '#0678be',
          green: '#41b883',
          'green-hi': '#5ac897',
          teal: '#37cdbe',
          link: '#53b0eb',
          'link-hi': '#8ccbf3',
        },
        ink: {
          bg: '#1c2733',
          edge: '#16202a',
          surface: '#1a2531',
          shot: '#0f1720',
          rule: '#33465a',
          text: '#e5ecf1',
          muted: '#9db2c2',
          deep: '#0c1720',
        },
      },
    },
  },
  plugins: [],
}
