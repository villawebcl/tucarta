import type { Config } from 'tailwindcss'

const tailwindConfig: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4f0',
          100: '#ffe8df',
          200: '#ffd1bf',
          300: '#ffb299',
          400: '#ff8a66',
          500: '#FF6B35',
          600: '#e85520',
          700: '#c44015',
          800: '#a03010',
          900: '#7d2209',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default tailwindConfig
