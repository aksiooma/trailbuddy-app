import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      variants: {
        extend: {
          // enable responsive variants for background opacity
          backgroundOpacity: ['responsive'],
        },
      },
      maxWidth: {
        'custom-large': '75rem',
      },

      
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#ffffff',
        'purple': '#e879f9',
        'midnight': '#020617',
        'metal': '#565584',
        'tahiti': '#3ab7bf',
        'silver': '#64748b',
        'bubble-gum': '#ff77e9',
        'bermuda': '#78dcca',
      },
    },
  },
  plugins: [],
}
export default config
