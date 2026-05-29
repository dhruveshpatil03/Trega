import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#09090b', elevated: '#18181b', overlay: '#27272a' },
        content: { primary: '#fafafa', secondary: '#a1a1aa' },
        trust: { DEFAULT: '#10b981', muted: 'rgba(16,185,129,0.1)' },
      },
      borderColor: { subtle: 'rgba(39,39,42,0.6)' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
