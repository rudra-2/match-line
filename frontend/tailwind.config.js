/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                // Paper & Surface Colors
                paper: {
                    DEFAULT: '#f8f6f3',
                    dark: '#edeae5',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    raised: '#fcfbfa',
                    sunken: '#f0ede8',
                },
                // Ink Colors
                ink: {
                    primary: '#2c2a26',
                    secondary: '#5c5850',
                    muted: '#8a8478',
                    subtle: '#b5ada3',
                },
                // Accent Colors
                accent: {
                    primary: '#c4703a',
                    'primary-dark': '#a85e30',
                    secondary: '#577b5e',
                    tertiary: '#6b7a9f',
                },
                // Border Colors
                border: {
                    light: '#e5e1db',
                    medium: '#d4cfc7',
                    dark: '#bfb9ae',
                },
                // Status Colors
                success: {
                    DEFAULT: '#4a7c59',
                    light: '#e8f0ea',
                },
                warning: {
                    DEFAULT: '#b8860b',
                    light: '#faf3e3',
                },
                error: {
                    DEFAULT: '#a63d3d',
                    light: '#f8eaea',
                },
                info: {
                    DEFAULT: '#4a6fa5',
                    light: '#e8eef5',
                },
            },
            borderRadius: {
                'sm': '6px',
                'md': '10px',
                'lg': '14px',
                'xl': '20px',
            },
            boxShadow: {
                'skeuo': '0 1px 2px rgba(44, 42, 38, 0.08), 0 4px 8px rgba(44, 42, 38, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                'skeuo-hover': '0 2px 4px rgba(44, 42, 38, 0.08), 0 8px 16px rgba(44, 42, 38, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                'skeuo-inset': 'inset 0 2px 4px rgba(44, 42, 38, 0.08), inset 0 1px 2px rgba(44, 42, 38, 0.15)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease forwards',
                'slide-in': 'slideIn 0.3s ease forwards',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    from: { opacity: '0', transform: 'translateX(-10px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
