
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        greeting: ['Manrope', 'sans-serif'],
        code: ['Fira Code', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '3xl': '1.5rem', 
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'message-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'animated-gradient-text': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '40%': { transform: 'rotate(8deg)' },
          '60%': { transform: 'rotate(-8deg)' },
          '80%': { transform: 'rotate(8deg)' },
        },
        'pulse-custom': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'float-fade': { // New keyframes for hearts
          '0%': { opacity: '1', transform: 'translateY(0px) scale(0.5)' },
          '50%': { opacity: '0.8', transform: 'translateY(-40px) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-100px) scale(0.5)' },
        },
        'pulse-voice': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'pulse-voice-speaking': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0px rgba(0, 255, 0, 0.4)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(0, 255, 0, 0.7)' },
        },
        wave: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.7' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px -5px currentColor', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 20px 5px currentColor', transform: 'scale(1.02)' },
        },
        'fnaf-monitor-in': {
          'from': { transform: 'translateX(100%) rotateY(-90deg)', opacity: '0' },
          'to': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
        },
        'fnaf-monitor-out': {
          'from': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
          'to': { transform: 'translateX(100%) rotateY(-90deg)', opacity: '0' },
        },
        'static-noise': {
          '0%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-5%,-5%)' },
          '20%': { transform: 'translate(-10%,5%)' },
          '30%': { transform: 'translate(5%,-10%)' },
          '40%': { transform: 'translate(-5%,15%)' },
          '50%': { transform: 'translate(-10%,5%)' },
          '60%': { transform: 'translate(15%,0)' },
          '70%': { transform: 'translate(0,10%)' },
          '80%': { transform: 'translate(-15%,0)' },
          '90%': { transform: 'translate(10%,5%)' },
          '100%': { transform: 'translate(5%,0)' },
        },
        'camera-pan': {
          '0%': { transform: 'scale(1.1) translateX(-5%)' },
          '50%': { transform: 'scale(1.1) translateX(5%)' },
          '100%': { transform: 'scale(1.1) translateX(-5%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
         'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'cmd-cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'code-load': {
          '0%, 100%': { opacity: '1', color: 'hsl(var(--primary))', content: "'='" },
          '10%': { content: "'<'" },
          '20%': { content: "'/'" },
          '30%': { opacity: '0.5', color: 'hsl(var(--accent))', content: "'>'" },
          '40%': { content: "'{'" },
          '50%': { content: "'}'" },
          '60%': { opacity: '0.8', color: 'hsl(var(--secondary))', content: "'['" },
          '70%': { content: "']'" },
          '80%': { content: "'*'" },
          '90%': { opacity: '0.6', color: 'hsl(var(--chart-2))', content: "';'" },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'message-in': 'message-in 0.3s ease-out forwards',
        'gradient-text-flow': 'animated-gradient-text 8s ease infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-custom': 'pulse-custom 0.4s ease-in-out',
        'float-fade': 'float-fade 2s ease-out forwards',
        'animated-border-glow': 'animated-gradient-text 3s linear infinite',
        'pulse-voice': 'pulse-voice 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-voice-speaking': 'pulse-voice-speaking 1.5s ease-in-out infinite',
        'wave': 'wave 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fnaf-in': 'fnaf-monitor-in 0.35s forwards cubic-bezier(0.4, 0, 0.2, 1)',
        'fnaf-out': 'fnaf-monitor-out 0.35s forwards cubic-bezier(0.4, 0, 0.2, 1)',
        'static-noise': 'static-noise 0.2s steps(8, end) infinite',
        'camera-pan': 'camera-pan 10s linear infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-out': 'fade-out 0.5s ease-in-out forwards',
        'cmd-cursor-blink': 'cmd-cursor-blink 1s step-end infinite',
        'code-load': 'code-load 1.5s infinite',
        'slide-in-down': 'slide-in-down 0.5s ease-out forwards',
        'slide-out-up': 'slide-out-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.transform-style-preserve-3d': {
          'transform-style': 'preserve-3d',
        },
      })
    },
  ],
} satisfies Config;

    

    

