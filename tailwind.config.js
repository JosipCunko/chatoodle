module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        danger: {
          DEFAULT: "#f43f5e",
        },
        chatbg: {
          default: "var(--chatbg-default)",
          stone: "var(--chatbg-stone)",
          neutral: "var(--chatbg-neutral)",
          zinc: "var(--chatbg-zinc)",
          gray: "var(--chatbg-gray)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-bg)",
          secondary: "var(--sidebar-secondary)",
          hover: "var(--sidebar-hover)",
          active: "var(--sidebar-active)",
          muted: "var(--sidebar-muted)",
          divider: "var(--sidebar-divider)",
        },
      },
    },
  },
};
