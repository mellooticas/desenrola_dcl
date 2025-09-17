{
  "dependencies": {
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^10.16.0",
    "react-hook-form": "^7.45.0",
    "react-hot-toast": "^2.4.0",
    "react-intersection-observer": "^9.5.0",
    "tailwindcss": "^3.3.0",
    "tailwind-merge": "^1.14.0",
    "clsx": "^2.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^4.32.0"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0",
    "tailwindcss-animate": "^1.0.0"
  }
}



// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sistema de cores do Desenrola DCL
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Status colors
        status: {
          registrado: '#94a3b8',
          'ag-pagamento': '#f59e0b',
          pago: '#10b981',
          producao: '#3b82f6',
          pronto: '#8b5cf6',
          enviado: '#ef4444',
          chegou: '#06b6d4',
          entregue: '#10b981',
          cancelado: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'Fira Code', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-up': 'slideInUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
      },
      keyframes: {
        slideInRight: {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}



src/styles/
├── globals.css              # Estilos globais + CSS custom
├── components.css           # Estilos específicos de componentes
├── animations.css           # Animações customizadas
├── themes.css              # Variáveis de tema
└── utilities.css           # Classes utilitárias custom



// components/providers/ThemeProvider.tsx

interface ThemeContextType {
  theme: string;
  isDark: boolean;
  primaryColor: string;
  fontSize: string;
  borderRadius: string;
  animation: string;
  density: string;
  setTheme: (theme: string) => void;
  toggleDark: () => void;
  updateThemeConfig: (config: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    theme: 'default',
    isDark: false,
    primaryColor: '#3b82f6',
    fontSize: 'medium',
    borderRadius: 'medium',
    animation: 'normal',
    density: 'comfortable'
  });

  // Aplicar tema no DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar dark mode
    if (themeConfig.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Aplicar CSS custom properties
    root.style.setProperty('--primary-color', themeConfig.primaryColor);
    root.style.setProperty('--font-size-scale', getFontSizeScale(themeConfig.fontSize));
    root.style.setProperty('--border-radius', getBorderRadiusValue(themeConfig.borderRadius));
    root.style.setProperty('--animation-duration', getAnimationDuration(themeConfig.animation));
    
    // Salvar no localStorage
    localStorage.setItem('desenrola-theme', JSON.stringify(themeConfig));
  }, [themeConfig]);

  // Carregar tema do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('desenrola-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Erro ao carregar tema salvo:', error);
      }
    }
  }, []);

  const contextValue = {
    ...themeConfig,
    setTheme: (theme: string) => setThemeConfig(prev => ({ ...prev, theme })),
    toggleDark: () => setThemeConfig(prev => ({ ...prev, isDark: !prev.isDark })),
    updateThemeConfig: (config: Partial<ThemeConfig>) => 
      setThemeConfig(prev => ({ ...prev, ...config }))
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="theme-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};


