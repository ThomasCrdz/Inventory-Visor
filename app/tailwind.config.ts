import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:  '#08090d',
        s1:  '#0f1118',
        s2:  '#161a24',
        s3:  '#1e2333',
        b1:  '#252d42',
        b2:  '#303a56',
        t1:  '#f0f2ff',
        t2:  '#8b96b8',
        t3:  '#4a5270',
        t4:  '#272f48',
        cyan:   { DEFAULT: '#00d4ff', 2: '#0098cc' },
        fgreen: '#00e676',
        famber: '#ffc107',
        fred:   '#ff4560',
        purple: '#a78bfa',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        ui:   ['"Syne"', 'sans-serif'],
      },
      borderRadius: {
        fleet: '8px',
      },
      backgroundImage: {
        'gradient-cyan':  'linear-gradient(135deg, #00d4ff, #0098cc)',
        'gradient-green': 'linear-gradient(135deg, #00e676, #00c853)',
      },
    },
  },
  plugins: [],
}

export default config
