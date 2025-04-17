export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [
        import('@tailwindcss/forms'),
        import('@tailwindcss/typography'),
        import('tailwindcss-dark-mode'),
        import('tailwindcss-line-clamp'),
        import('@tailwindcss/aspect-ratio'),
        import('@tailwindcss/custom-forms'),
        import('tailwindcss-debug-screens'),
        import('tailwindcss-scrollbar-hide'),
        import('tailwindcss-inset-shadows'),
        import('tailwindcss-text-shadow'),
        import('tailwindcss-gradient-to-colors'),
        import('tailwindcss-scale-transition'),
        import('tailwindcss-aspect-ratio'),
        import('tailwindcss-responsive-images'),
        import('tailwindcss-touch-action'),
        
    ],
  };
  