/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './LANDING_PAGE_&_DESIGN_SYS/**/*.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    './components/**/*.{js,ts,jsx,tsx,html}',
    './pages/**/*.{js,ts,jsx,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#17323A',
          teal: '#176B67',
          tealDark: '#195E5A',
          coral: '#E8856C',
          coralSoft: '#FFF0EC',
          lavender: '#8B7EC8',
          lavenderSoft: '#F0EDFB',
          amber: '#D4943A',
          amberSoft: '#FFF6E8',
          sand: '#F7F4EC',
          cream: '#FAF8F3',
          paper: '#FFFFFF',
          canvas: '#F7F8F7',
          border: '#D8DFDE',
          softPink: '#F9D1DC',
          softYellow: '#F7DC78',
          softGreen: '#A6BE86',
          softBlue: '#B0C9E8',
          softerTeal: '#EDF7F6',
          softSuccess: '#E8F3EE'
        },
        surface: {
          canvas: '#F7F8F7',
          base: '#FFFFFF',
          warm: '#F0F5F4',
          dim: '#D1DCE2',
          bright: '#F4FAFF',
          container: '#E5EFF6',
          containerLow: '#EAF5FC',
          containerHigh: '#DFEAF1',
          containerHighest: '#D9E4EB'
        },
        ink: {
          primary: '#172126',
          secondary: '#5B6570',
          muted: '#7A868F'
        },
        clinical: {
          success: '#2E7D62',
          successSoft: '#E8F3EE',
          info: '#1E4D63',
          infoSoft: '#E3F0F6',
          warning: '#8A5A12',
          warningSoft: '#FEF7EC',
          danger: '#B54747',
          dangerSoft: '#FDF2F2'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        sm: '0.125rem', // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px
        full: '9999px'
      },
      boxShadow: {
        dashboard: '0 25px 60px -15px rgba(23, 50, 58, 0.12), 0 4px 20px rgba(23, 50, 58, 0.04)',
        pill: '0 10px 30px -5px rgba(23, 107, 103, 0.08)',
        'card-lift': '0 12px 36px -4px rgba(23, 50, 58, 0.07), 0 4px 16px -2px rgba(23, 50, 58, 0.04)',
        soft: '0 8px 30px rgba(23, 50, 58, 0.06)'
      }
    }
  },
  plugins: []
};
