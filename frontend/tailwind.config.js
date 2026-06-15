/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // We will map these colors to our dynamic CSS variables directly
        bg: {
          dark: "var(--bg-dark)",
          DEFAULT: "var(--bg)",
          light: "var(--bg-light)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        border: {
          highlight: "var(--border-highlight)",
          DEFAULT: "var(--border)",
          muted: "var(--border-muted)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          muted: "var(--primary-muted)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
        },
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
        info: "var(--info)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        app: "var(--radius-md)",
        "app-sm": "var(--radius-sm)",
        "app-lg": "var(--radius-lg)",
        "app-xl": "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        button: "var(--shadow-button)",
        modal: "var(--shadow-modal)",
        dropdown: "var(--shadow-dropdown)",
      }
    },
  },
  plugins: [],
}
