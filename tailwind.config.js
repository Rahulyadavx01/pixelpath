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
        // Questify Dashboard Theme Tokens
        canvas: '#F6F7FB',
        surface: { DEFAULT: '#FFFFFF', 2: '#F1F4FA' },
        line: { DEFAULT: '#E3E7F0', strong: '#CBD2E1' },
        ink: { DEFAULT: '#0F172A', 2: '#475569', 3: '#64748B' },
        brand: { DEFAULT: '#4F46E5', hover: '#4338CA', press: '#3730A3', tint: '#EEF0FF', ink: '#3730A3' },
        streak: { DEFAULT: '#F59E0B', tint: '#FFF4DB', ink: '#92400E' },
        win: { DEFAULT: '#059669', tint: '#E7F8F1', ink: '#047857' },
        live: { tint: '#FFE9ED', ink: '#BE123C' },
        hero: { DEFAULT: '#0F1535', ink2: '#AEB8DE' },

        quest: {
          // Light Liquid Glass Foundation
          bg: '#F7FAFF',
          bgSecondary: '#EAF4FF',
          bgCard: 'rgba(255, 255, 255, 0.65)',
          bgCardElevated: 'rgba(255, 255, 255, 0.82)',
          bgCardHover: 'rgba(255, 255, 255, 0.90)',
          
          border: 'rgba(255, 255, 255, 0.85)',
          borderSubtle: 'rgba(91, 184, 255, 0.18)',
          borderBright: 'rgba(255, 255, 255, 0.95)',
          borderAccent: '#5BB8FF',

          // Primary Sky Blues
          sky: '#5BB8FF',
          skyLight: '#8FD3FF',
          skyDark: '#1E5FA8',
          link: '#1E5FA8',

          // Sunset Warm Accents
          peach: '#FFB88C',
          coral: '#FF8A7A',
          pink: '#FF9EC4',
          gold: '#FFC15A',
          goldLight: '#FFE7A3',
          emerald: '#10B981',

          // WCAG AA Compliant High-Contrast Slate Text
          textPrimary: '#12243B',
          textSecondary: '#5A6E85',
          textMuted: '#7C8BA0',
          navy: '#12243B',

          // Aliases for compatibility
          primary: '#5BB8FF',
          accent: '#FF8A7A',
          success: '#10B981',
          danger: '#FF6B6B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        h1:   ['36px', { lineHeight: '40px', letterSpacing: '-0.03em', fontWeight: '800' }],
        sub:  ['16px', { lineHeight: '24px', fontWeight: '500' }],
        title:['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '700' }],
        stat: ['40px', { lineHeight: '44px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'stat-xl': ['72px', { lineHeight: '72px', letterSpacing: '-0.04em', fontWeight: '800' }],
        label:['13px', { lineHeight: '18px', fontWeight: '600' }],
        meta: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        badge:['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        card: '16px',
        inner: '12px',
        badge: '8px'
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,.04)',
        card: '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)',
        lift: '0 10px 24px -10px rgba(15,23,42,.16)',
        cta: '0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -6px rgba(67,56,202,.6)',
        'cta-hover': '0 1px 0 rgba(255,255,255,.25) inset, 0 10px 20px -8px rgba(67,56,202,.7)',
        xp: '0 0 18px rgba(255,61,119,.45)',
        glassSubtle: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 4px 20px -2px rgba(186, 215, 245, 0.35)',
        glassRegular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 8px 32px -4px rgba(186, 215, 245, 0.45)',
        glassProminent: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 1), 0 16px 44px -6px rgba(147, 197, 253, 0.50)',
        glowSky: '0 0 24px -2px rgba(91, 184, 255, 0.45)',
        glowSunset: '0 0 24px -2px rgba(255, 184, 140, 0.45)',
        glowGold: '0 0 24px -2px rgba(255, 193, 90, 0.45)',
        innerSpecular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
      },
      backgroundImage: {
        'page-mesh': 'radial-gradient(900px 420px at 88% -8%, rgba(79,70,229,.09), transparent 62%), radial-gradient(700px 380px at -4% 0%, rgba(255,138,61,.07), transparent 60%)',
        'xp-bar': 'linear-gradient(90deg, #FF8A3D, #FF3D77)',
        cta: 'linear-gradient(180deg, #5B5FEF 0%, #4338CA 100%)',
        'hero-card': 'radial-gradient(520px 240px at 100% 0%, rgba(255,61,119,.22), transparent 65%), radial-gradient(480px 260px at 0% 100%, rgba(79,70,229,.35), transparent 65%)',
        'gradient-aurora': 'radial-gradient(circle at 15% 15%, rgba(91, 184, 255, 0.30) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255, 184, 140, 0.28) 0%, transparent 50%), radial-gradient(circle at 50% 85%, rgba(255, 158, 196, 0.22) 0%, transparent 50%), radial-gradient(circle at 75% 80%, rgba(255, 193, 90, 0.18) 0%, transparent 50%)',
        'gradient-liquid': 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)',
        'gradient-quest': 'linear-gradient(135deg, #5BB8FF 0%, #FF9EC4 50%, #FFB88C 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FFB88C 0%, #FF8A7A 50%, #FF9EC4 100%)',
        'gradient-sky': 'linear-gradient(135deg, #5BB8FF 0%, #8FD3FF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFE7A3 0%, #FFC15A 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'aurora-drift': 'auroraDrift 24s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        auroraDrift: {
          '0%': { transform: 'scale(1) translate(0%, 0%)' },
          '50%': { transform: 'scale(1.12) translate(-3%, 2%)' },
          '100%': { transform: 'scale(1.04) translate(2%, -2%)' },
        }
      }
    },
  },
  plugins: [],
}
