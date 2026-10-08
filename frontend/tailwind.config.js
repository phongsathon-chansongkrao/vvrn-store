/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme colors are CSS variables (index.css) so Day/Night mode can swap them.
        ink: "rgb(var(--ink) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        bone: "rgb(var(--bone) / <alpha-value>)",
        ash: "rgb(var(--ash) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        // "white" is only used for subtle borders/tints; it flips to black in Day mode.
        white: "rgb(var(--fg) / <alpha-value>)",
        // Fixed near-black for text on amber (same in both modes).
        noir: "#0a0a0a",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "Arial Narrow", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
