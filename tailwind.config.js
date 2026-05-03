/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vibe-red':    '#E84422',
        'vibe-blue':   '#1E40AF',
        'vibe-yellow': '#FBBF24',
        'vibe-navy':   '#0E1C40',
        'vibe-pink':   '#F9A8D4',
        'vibe-green':  '#16A34A',
        'vibe-white':  '#FFFFFF',
      },
      fontFamily: {
        display: ['"Black Han Sans"', 'Impact', 'sans-serif'],
        cursive: ['Caveat', 'cursive'],
        body:    ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '5px 5px 0px #0E1C40',
        'card-hover': '8px 8px 0px #0E1C40',
        'btn':        '3px 3px 0px #0E1C40',
        'btn-hover':  '5px 5px 0px #0E1C40',
        'nav':        '4px 4px 0px rgba(14,28,64,0.25)',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-up':  'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':     'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'tagline':   'taglineSwap 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        taglineSwap:{ from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      borderRadius: {
        'xl2': '20px',
        'xl3': '28px',
      },
    },
  },
  plugins: [],
}
