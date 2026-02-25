/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"SF Mono"', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'mac-red': '#ED6A5E',
        'mac-yellow': '#F5BF4F',
        'mac-green': '#62C554',
        'apple-green': '#61BB46',
        'apple-yellow': '#FDB827',
        'apple-orange': '#F5821F',
        'apple-red': '#E03A3E',
        'apple-purple': '#963D97',
        'apple-blue': '#009DDC',
      },
      boxShadow: {
        'window': '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'window-hover': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'btn-retro': '0 2px 0 rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'window': '10px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        maclight: {
          "primary": "#3B7EA1",
          "secondary": "#8B6F47",
          "accent": "#D4722C",
          "neutral": "#4a4640",
          "base-100": "#faf8f5",
          "base-200": "#f0ede8",
          "base-300": "#e2dfd9",
          "base-content": "#2a2924",
          "primary-content": "#ffffff",
          "secondary-content": "#ffffff",
          "accent-content": "#ffffff",
          "neutral-content": "#faf8f5",
          "info": "#3B7EA1",
          "success": "#62C554",
          "warning": "#F5BF4F",
          "error": "#ED6A5E",
        },
      },
      {
        macdark: {
          "primary": "#5BA3C9",
          "secondary": "#C4A882",
          "accent": "#E89B6C",
          "neutral": "#3a3833",
          "base-100": "#2a2924",
          "base-200": "#33312b",
          "base-300": "#3e3b35",
          "base-content": "#e2dfd9",
          "primary-content": "#1a1918",
          "secondary-content": "#1a1918",
          "accent-content": "#1a1918",
          "neutral-content": "#e2dfd9",
          "info": "#5BA3C9",
          "success": "#62C554",
          "warning": "#F5BF4F",
          "error": "#ED6A5E",
        },
      },
    ],
  },
}
