// // /** @type {import('tailwindcss').Config} */
// // export default {
// //   content: [
// //     "./index.html",
// //     "./src/**/*.{js,ts,jsx,tsx}",
// //   ],
// //   theme: {
// //     extend: {},
// //   },
// //   plugins: [],
// // }
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     './src/**/*.{js,jsx,ts,tsx}',
//     './public/index.html',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // M3-inspired color palette using CSS variables for a "dynamic" feel
//         // These can be set in your root CSS file, e.g., styles/globals.css
//         // :root {
//         //   --color-primary: #6750A4;
//         //   --color-primary-container: #EADDFF;
//         //   --color-secondary: #625B71;
//         //   --color-secondary-container: #E8DEF8;
//         //   --color-tertiary: #7D5260;
//         //   --color-tertiary-container: #FFD8E4;
//         //   --color-surface: #FFFBFE;
//         //   --color-on-surface: #1C1B1F;
//         //   --color-error: #B3261E;
//         //   --color-error-container: #F9DEDC;
//         // }
//         primary: 'var(--color-primary)',
//         'primary-container': 'var(--color-primary-container)',
//         secondary: 'var(--color-secondary)',
//         'secondary-container': 'var(--color-secondary-container)',
//         tertiary: 'var(--color-tertiary)',
//         'tertiary-container': 'var(--color-tertiary-container)',
//         surface: 'var(--color-surface)',
//         'on-surface': 'var(--color-on-surface)',
//         error: 'var(--color-error)',
//         'error-container': 'var(--color-error-container)',

//         // A custom palette for an 'earthly' and professional look
//         // This can be used in components or themes separate from the main M3 system
//         'brand-primary': {
//           DEFAULT: '#3f51b5', // Example: deep blue
//           50: '#e8eaf6',
//           100: '#c5cae9',
//           200: '#9fa8da',
//           300: '#7986cb',
//           400: '#5c6bc0',
//           500: '#3f51b5',
//           600: '#3949ab',
//           700: '#303f9f',
//           800: '#283593',
//           900: '#1a237e',
//         },
//         'brand-accent': {
//           DEFAULT: '#ff9800', // Example: warm orange
//           50: '#fff3e0',
//           100: '#ffe0b2',
//           200: '#ffcc80',
//           300: '#ffb74d',
//           400: '#ffa726',
//           500: '#ff9800',
//           600: '#fb8c00',
//           700: '#f57c00',
//           800: '#ef6c00',
//           900: '#e65100',
//         },
//         'neutral-light': '#f5f5f5',
//         'neutral-dark': '#212121',
//       },

//       // Custom breakpoints for a more granular, mobile-first approach
//       screens: {
//         'xs': '480px', // Extra small devices
//         'sm': '640px',
//         'md': '768px',
//         'lg': '1024px',
//         'xl': '1280px',
//         '2xl': '1536px',
//       },

//       // Typography inspired by M3's type scale and modern web trends
//       fontFamily: {
//         sans: ['Roboto', 'sans-serif'],
//         serif: ['Merriweather', 'serif'],
//         display: ['Oswald', 'sans-serif'], // For large headings
//         body: ['Inter', 'sans-serif'], // For readable body text
//       },

//       // Custom sizing for M3-style spacing and components
//       spacing: {
//         '13': '3.25rem',
//         '15': '3.75rem',
//         '18': '4.5rem',
//         '128': '32rem',
//         '144': '36rem',
//       },

//       // Add custom animations
//       animation: {
//         'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
//       },
//       keyframes: {
//         'slide-in-left': {
//           '0%': {
//             transform: 'translateX(-1000px)',
//             opacity: '0',
//           },
//           '100%': {
//             transform: 'translateX(0)',
//             opacity: '1',
//           },
//         },
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  
  theme: {
    extend: {
      colors: {
        // "Earthy & Professional" palette
        primary: 'var(--color-primary, #C96338)', // Burnt orange for accents
        'on-primary': 'var(--color-on-primary, #FFFFFF)',
        background: 'var(--coleor-background, #F5F0EB)', // Warm off-white
        'on-background': 'var(--color-on-background, #211C1C)', // Dark charcoal
        
        // Secondary colors for components
        surface: 'var(--color-surface, #FFFFFF)',
        'on-surface': 'var(--color-on-surface, #211C1C)',
        
        // Semantic colors
        error: 'var(--color-error, #B3261E)',
      },
      fontFamily: {
        // A bold, condensed sans-serif for the modern, brutalist-inspired look
        display: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      // Remove all rounded corners, or make them very subtle
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      // Add custom spacing to create a more geometric, grid-based feel
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
      boxShadow: {
        // Soft shadows are less critical for this style
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}