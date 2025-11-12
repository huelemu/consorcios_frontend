/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      // Breakpoints personalizados (mantiene los por defecto de Tailwind)
      screens: {
        'xs': '475px',  // Extra small devices
        // sm: '640px',  // Small devices (por defecto)
        // md: '768px',  // Medium devices (por defecto)
        // lg: '1024px', // Large devices (por defecto)
        // xl: '1280px', // Extra large devices (por defecto)
        // 2xl: '1536px' // 2X Extra large devices (por defecto)
      },
      // Espaciado táctil optimizado para móviles
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'touch': '44px', // Tamaño mínimo táctil recomendado
      },
      // Tamaños mínimos para elementos táctiles
      minHeight: {
        'touch': '44px',
        'touch-sm': '36px',
      },
      minWidth: {
        'touch': '44px',
        'touch-sm': '36px',
      },
      // Alturas útiles para móviles
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
      },
      // Transiciones suaves para interacciones móviles
      transitionDuration: {
        '250': '250ms',
      },
      // Sombras optimizadas para móviles
      boxShadow: {
        'touch': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [
    // Plugin para agregar utilidades de áreas seguras en dispositivos móviles
    function({ addUtilities }) {
      const newUtilities = {
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        // Clase para desactivar el tap highlight en móviles
        '.tap-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        // Mejora del rendimiento de scroll en móviles
        '.scroll-touch': {
          '-webkit-overflow-scrolling': 'touch',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
