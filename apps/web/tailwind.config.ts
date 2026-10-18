import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: token("primary"), hover: token("primary-hover"), soft: token("primary-soft"), border: token("primary-border") },
        ink: token("ink"), canvas: token("canvas"), surface: token("surface"), sidebar: token("sidebar"),
        // Temporary aliases keep pre-redesign screens stable until their scheduled phase.
        clinical: token("primary"), mint: token("primary-soft"), paper: token("canvas"),
        border: { DEFAULT: token("border"), strong: token("border-strong") },
        text: { primary: token("text-primary"), secondary: token("text-secondary"), muted: token("text-muted"), "on-brand": token("text-on-brand") },
        success: { DEFAULT: token("success"), soft: token("success-soft") },
        warning: { DEFAULT: token("warning"), soft: token("warning-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft") },
        info: { DEFAULT: token("info"), soft: token("info-soft") }
      },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
      fontSize: {
        caption: ["var(--text-caption)", { lineHeight: "1.5" }], small: ["var(--text-small)", { lineHeight: "1.5" }],
        body: ["var(--text-body)", { lineHeight: "1.5" }], "body-large": ["var(--text-body-large)", { lineHeight: "1.5" }],
        section: ["var(--text-section)", { lineHeight: "1.3" }], page: ["var(--text-page)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        auth: ["var(--text-auth)", { lineHeight: "1.3", letterSpacing: "-0.01em" }]
      },
      borderRadius: { control: "var(--radius-control)", card: "var(--radius-card)", modal: "var(--radius-modal)" },
      boxShadow: { overlay: "var(--shadow-overlay)" },
      height: { "control-sm": "var(--height-control-sm)", control: "var(--height-control)", "control-lg": "var(--height-control-lg)" },
      minHeight: { "control-sm": "var(--height-control-sm)", control: "var(--height-control)", "control-lg": "var(--height-control-lg)" },
      spacing: { page: "1.5rem", card: "1.25rem", field: "1rem" }
    }
  },
  plugins: []
};

export default config;
