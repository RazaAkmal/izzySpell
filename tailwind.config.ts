import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pally', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lightBlue: "#ECF4FF",
        blue: "#4793FE",
        darkBlue: "#426096",
        blueStroke: '#98C3FF',
        purple: "#956CFC",
        green: "#57AE0C",
        inputText: '#7898D2',
        hoverGreen: "#479306",
        white: "#F1F7FF",
        skyBlue:"#ECF7FF",
        orange:"#ED9A37"
      },
      backgroundImage: {
        'login-background': "url('/images/login_background.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
