import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Enhanced gray palette
        gray: {
          50: "#f8f9fa",
          100: "#ebedf0",
          200: "#d5d9df",
          300: "#b0b7c3",
          400: "#8e95a3",
          500: "#6e7687",
          600: "#555e6f",
          700: "#434a59",
          800: "#2a303c",
          900: "#1a1e27",
          950: "#13151b",
        },
        // Enhanced purple palette (unchanged)
        purple: {
          50: "#f8f5ff",
          100: "#eee6ff",
          200: "#dfd2fe",
          300: "#c9b5fd",
          400: "#b399fc",
          500: "#9b87f5",
          600: "#7c68e3",
          700: "#6d56cc",
          800: "#5641a3",
          900: "#432f7d",
          950: "#2e1e58",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.7)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "slide-up-and-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-down-and-fade": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-up": "slide-up-and-fade 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "scale-up": "scale-up 0.3s ease-out",
        "slide-up": "slide-up-and-fade 0.3s ease-out",
        "slide-down": "slide-down-and-fade 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s infinite"
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0,0,0,0.1)',
        'elegant': '0 4px 12px -1px rgba(0,0,0,0.2), 0 2px 6px -1px rgba(0,0,0,0.15)',
        'hover': '0 15px 30px -5px rgba(0,0,0,0.2), 0 8px 10px -5px rgba(0,0,0,0.15)',
        'card': '0 1px 5px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2)',
        'glow': '0 0 25px rgba(139, 92, 246, 0.5)',
        'purple': '0 8px 20px -4px rgba(139, 92, 246, 0.5)',
        'dark': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'card-dark': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(to right, #8B5CF6, #D946EF)',
        'gradient-dark': 'linear-gradient(to bottom right, hsl(var(--card)), hsl(var(--background)))',
        'gradient-shimmer': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
        'gradient-fade': 'linear-gradient(to bottom, transparent, theme(colors.background.DEFAULT))',
        'gradient-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom, rgba(26, 30, 39, 0.8), rgba(19, 21, 27, 1))',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
