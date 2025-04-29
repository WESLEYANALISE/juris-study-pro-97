
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
        // Custom purple variants with enhanced range and more brightness
        purple: {
          50: "#f9f5ff",
          100: "#f4ebff",
          200: "#e9d7fe",
          300: "#d8b9fd",
          400: "#c299fc",
          500: "#aa87f6",
          600: "#8c68e3",
          700: "#7956cc",
          800: "#6141a3",
          900: "#482f7d",
          950: "#301e58",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
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
          "0%": { transform: "translateY(20px)", opacity: "0" },
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
          "0%, 100%": { boxShadow: "0 0 15px rgba(170, 135, 246, 0.5)" },
          "50%": { boxShadow: "0 0 25px rgba(170, 135, 246, 0.8)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "bounce-soft": "bounce-soft 3s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "scale-in": "scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0,0,0,0.08)',
        'elegant': '0 4px 12px -1px rgba(0,0,0,0.15), 0 2px 6px -1px rgba(0,0,0,0.1)',
        'hover': '0 10px 20px -3px rgba(0,0,0,0.15), 0 4px 8px -2px rgba(0,0,0,0.1)',
        'card': '0 1px 5px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.15)',
        'glow': '0 0 20px rgba(170, 135, 246, 0.4)',
        'purple': '0 5px 20px 0 rgba(170, 135, 246, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(to right, #aa87f6, #c299fc)',
        'gradient-dark': 'linear-gradient(to bottom right, hsl(var(--card)), hsl(var(--background)))',
        'gradient-shimmer': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary))',
              },
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            h5: {
              color: 'hsl(var(--foreground))',
            },
            h6: {
              color: 'hsl(var(--foreground))',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--border))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
