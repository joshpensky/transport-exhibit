const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    content: ["./src/**/*.ts", "./src/**/*.tsx"],
  },
  darkMode: false,
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      red: {
        400: "#EE5905",
        500: "#C35213",
      },
      yellow: {
        400: "#EFAC00",
      },
      lime: {
        400: "#C9FF55",
      },
      green: {
        800: "#006B45",
        900: "#005B3A",
      },
    },
    extend: {
      borderWidth: {
        3: "3px",
      },
      fontFamily: {
        sans: ["Roobert TRIAL", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
