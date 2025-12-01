/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-deep': '#030014',
                'bg-surface': '#0f0c29',
                'primary-neon': '#00f3ff',
                'secondary-neon': '#bc13fe',
            },
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                body: ['Outfit', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s infinite',
                'fade-in': 'fade-in 0.5s ease-out',
            },
            keyframes: {
                float: {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(0px)' },
                },
                'pulse-glow': {
                    '0%': { boxShadow: '0 0 0 0 rgba(0, 243, 255, 0.4)' },
                    '70%': { boxShadow: '0 0 0 20px rgba(0, 243, 255, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(0, 243, 255, 0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
    safelist: [
        {
            pattern: /bg-(green|purple|yellow|blue)-(400|500)/,
            variants: ['hover'],
        },
        {
            pattern: /text-(green|purple|yellow|blue)-(400|500)/,
        },
        {
            pattern: /border-(green|purple|yellow|blue)-(400|500)/,
        },
    ],
}
