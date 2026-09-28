import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clean Student OS Light Theme Foundation
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        border: '#E2E8F0',
        'border-subtle': '#F1F5F9',
        card: '#FFFFFF',
        'card-border': '#E2E8F0',

        // Typography
        text: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
        },

        // Refined Blue / Indigo Primary
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          border: '#BFDBFE',
          dark: '#1E40AF',
        },

        // Restrained Functional Accents
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
          border: '#BBF7D0',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          border: '#FDE68A',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          border: '#FECACA',
          dark: '#B91C1C',
        },

        // Dark Coding Workspace Sandbox Tokens
        workspace: {
          bg: '#0A0D14',
          surface: '#101522',
          card: '#161D2E',
          border: '#21293D',
          hover: '#1E2638',
          text: '#F3F4F6',
          muted: '#9CA3AF',
        },

        // Preserved legacy tokens for non-breaking compatibility
        muted: '#64748B',
        subtle: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
