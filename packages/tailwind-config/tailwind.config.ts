import type { Config } from "tailwindcss";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  theme: {
    screens: {
      xs: "360px",
      sm: "500px",
      md: "768px",
      lg: "1024px",
      xl: "1440px",
    },

    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-base-text-text-primary, #212121)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          lighter: "rgb(var(--color-primary-lighter) / <alpha-value>)",
          lightest: "rgb(var(--color-primary-lightest) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light) / <alpha-value>)",
          lighter: "rgb(var(--color-secondary-lighter) / <alpha-value>)",
          lightest: "rgb(var(--color-secondary-lightest) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-dark) / <alpha-value>)",
        },
        accent1: "rgb(var(--color-accent-one) / <alpha-value>)",
        accent2: "rgb(var(--color-accent-two) / <alpha-value>)",
        background: {
          DEFAULT: "rgb(237, 237, 237)",
          accent: "rgb(var( --color-bg-accent) / <alpha-value>)",
        },
        gray: {
          50: "rgb(var(--color-50-gray) / <alpha-value>)",
          100: "rgb(var(--color-100-gray) / <alpha-value>)",
          200: "rgb(var(--color-200-gray) / <alpha-value>)",
          300: "rgb(var(--color-300-gray) / <alpha-value>)",
          400: "rgb(var(--color-400-gray) / <alpha-value>)",
          500: "rgb(var(--color-500-gray) / <alpha-value>)",
          600: "var(--color-base-text-text-secondary)",
          700: "rgb(var(--color-700-gray) / <alpha-value>)",
          800: "rgb(var(--color-800-gray) / <alpha-value>)",
          900: "rgb(var(--color-900-gray) / <alpha-value>)",
        },
        fuchsia: {
          400: "rgb(var(--color-400-fuchsia) / <alpha-value>)",
          600: "rgb(var(--color-600-fuchsia) / <alpha-value>)",
        },
        yellow: {
          300: "rgb(var(--color-300-yellow) / <alpha-value>)",
          400: "rgb(var(--color-400-yellow) / <alpha-value>)",
          800: "rgb(var(--color-800-yellow) / <alpha-value>)",
        },
        red: {
          400: "rgb(var(--color-400-red) / <alpha-value>)",
          600: "rgb(var(--color-600-red) / <alpha-value>)",
        },
        aqua: {
          400: "rgb(var(--color-400-aqua) / <alpha-value>)",
          800: "rgb(var(--color-800-aqua) / <alpha-value>)",
        },
        orange: {
          500: "rgb(var(--color-500-orange) / <alpha-value>)",
        },
        cerulean: {
          400: "rgb(var(--color-400-cerulean) / <alpha-value>)",
          600: "rgb(var(--color-600-cerulean) / <alpha-value>)",
        },
        lime: {
          300: "rgb(var(--color-300-lime) / <alpha-value>)",
          400: "rgb(var(--color-400-lime) / <alpha-value>)",
        },
        semantic: {
          info: {
            DEFAULT: "rgb(var(--color-semantic-information) / <alpha-value>)",
            light:
              "rgb(var(--color-semantic-information-light) / <alpha-value>)",
          },
          success: {
            DEFAULT: "rgb(var(--color-semantic-success) / <alpha-value>)",
            light: "rgb(var(--color-semantic-success-light) / <alpha-value>)",
          },
          pending: {
            DEFAULT: "rgb(var(--color-semantic-pending) / <alpha-value>)",
            light: "rgb(var(--color-semantic-pending-light) / <alpha-value>)",
          },
          warning: {
            DEFAULT: "rgb(var(--color-semantic-warning) / <alpha-value>)",
            light: "rgb(var(--color-semantic-warning-light) / <alpha-value>)",
          },
          error: {
            DEFAULT: "rgb(var(--color-semantic-error) / <alpha-value>)",
            light: "rgb(var(--color-semantic-error-light) / <alpha-value>)",
          },
          focus: "rgb(var(--color-semantic-focus) / <alpha-value>)",
          highlight: "rgb(var(--color-semantic-highlight) / <alpha-value>)",
        },
      },
      fontFamily: {
        primary: "var(--font-family-primary)",
        secondary: "var(--font-family-secondary)",
      },
    },
  },
  plugins: [],
};
export default config;
