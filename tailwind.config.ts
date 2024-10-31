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
        blue: "#4793FE"
      },
      backgroundImage: {
        'login-background': "url('/images/login_background.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
