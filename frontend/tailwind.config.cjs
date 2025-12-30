/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // --- Ye Animations Add Kiye Hain ---
      animation: {
        'bounce-in-up': 'bounceInUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        bounceInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};