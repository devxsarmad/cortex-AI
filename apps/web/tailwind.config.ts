import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201f",
        clinical: "#176b87",
        mint: "#e7f6ef",
        paper: "#f8faf8"
      }
    }
  },
  plugins: []
};

export default config;
