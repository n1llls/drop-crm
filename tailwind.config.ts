import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#3b82f6',
          600: '#2563eb'
        }
      }
    },
  },
  plugins: [],
} satisfies Config
