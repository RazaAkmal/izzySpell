import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';
import tailwindScrollbar from 'tailwind-scrollbar';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pally)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lightBlue: "#ECF4FF",
        darkGray: "#413F3F",
        blue: "#4793FE",
        darkBlue: "#426096",
        blueStroke: '#98C3FF',
        purple: "#956CFC",
        green: "#57AE0C",
        inputText: '#7898D2',
        hoverGreen: "#479306",
        white: "#F1F7FF",
        skyBlue:"#D5EDFF",
        textColor: "#739DE9",
        orange:"#ED9A37",
        darkGreen:'#058D6E',
        lightGreen:'#00DCA9',
       lightOrange:'#FDAC40',
       darkOrange:'#C57306',
       pink:'#F181B9',
       greenLite:'#E2FFF8'
       
      },
      backgroundImage: {
        'login-background': "url('/images/login_background.svg')",
        'dashboard-background': "url('/images/BackgroundBlue.png')",
        'profile-background': "url('/images/ProfileBackground.png')",
      },
      animation: {
        'wiggle': 'wiggle 0.6s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        }
      }
      
    },
  },
  plugins: [
    tailwindScrollbar,
    plugin(function({ addUtilities }) {
      addUtilities({
        '.hover-scale': {
          '@apply transition-all duration-200': {},
          '&:hover': {
            '@apply shadow-lg scale-[1.02]': {},
          },
          '&:active': {
            '@apply scale-[0.98]': {},
          }
        }
      })
    })
  ],
};

export default config;
