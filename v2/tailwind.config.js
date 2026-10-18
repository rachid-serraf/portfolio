module.exports = {
  content: ['./index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noir: { 950: '#0a0a0c', 900: '#121114', 850: '#17161c', 800: '#1e1c24', 700: '#2b2732', 600: '#3d3846' },
        sand: { 50: '#FAF7F2', 100: '#F4EEDD', 200: '#EBDDCB', 300: '#DEC9B0', 400: '#C8AE90' },
        cyber: { orange: '#FF7A30', amber: '#F59E0B', ochre: '#E0A15E', coral: '#F15A5A', sage: '#5E8B71', neon: '#22C55E', cyan: '#38BDF8' },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        tech: ['"Chakra Petch"', 'sans-serif'],
      },
      keyframes: {
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(1000%)' } },
        ticker: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        scan: 'scanline 8s linear infinite',
        ticker: 'ticker 32s linear infinite',
        blink: 'blink 1s infinite',
      },
    },
  },
};
