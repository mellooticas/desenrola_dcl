# 🚀 Guia de Desenvolvimento

Documentação completa para configurar e desenvolver no sistema Desenrola DCL.

## ⚡ Início Rápido

### Pré-requisitos
- **Node.js** 18.0.0 ou superior
- **npm** ou **yarn**
- **Git**
- **Editor de código** (VS Code recomendado)

### 1. Clone do Repositório
```bash
git clone https://github.com/mellooticas/desenrola_dcl.git
cd desenrola_dcl
```

### 2. Instalação de Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configuração do Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure as variáveis necessárias
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:3000`

---

## 🏗️ Estrutura do Projeto

```
desenrola_dcl/
├── app/                        # Next.js 14 App Router
│   ├── api/                    # API Routes
│   ├── dashboard/              # Dashboard BI
│   ├── kanban/                 # Board Visual
│   ├── pedidos/                # CRUD Pedidos
│   ├── configuracoes/          # Settings
│   ├── layout.tsx              # Layout Root
│   └── page.tsx                # Home Page
├── components/                 # Componentes React
│   ├── ui/                     # shadcn/ui components
│   ├── forms/                  # Formulários
│   ├── layout/                 # Header, Sidebar
│   ├── dashboard/              # Gráficos, Métricas
│   ├── kanban/                 # Board, Cards
│   ├── common/                 # Loading, Error
│   └── providers/              # Context Providers
├── lib/                        # Utilitários e Hooks
│   ├── supabase/               # Cliente Supabase
│   ├── types/                  # TypeScript Types
│   ├── hooks/                  # Custom Hooks
│   ├── stores/                 # Zustand Stores
│   └── utils/                  # Funções Utilitárias
├── config/                     # Arquivos de Configuração
│   ├── eslint.config.mjs       # ESLint
│   ├── tailwind.config.ts      # Tailwind CSS
│   ├── postcss.config.js       # PostCSS
│   └── next.config.js          # Next.js
├── scripts/                    # Scripts Utilitários
├── docs/                       # Documentação
├── public/                     # Arquivos Estáticos
└── supabase/                   # Configuração Supabase
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de UI
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component Library

### Backend
- **Next.js API Routes** - Backend API
- **Supabase** - Database & Auth
- **PostgreSQL** - Database

### Estado e Cache
- **Zustand** - State Management
- **React Query** - Server State & Cache

### Desenvolvimento
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Husky** - Git Hooks

---

## 🎯 Fluxo de Desenvolvimento

### 1. Criar Nova Feature

#### Branch Strategy
```bash
# Criar branch para feature
git checkout -b feature/nome-da-feature

# Desenvolver a feature
# Commit das mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade"

# Push da branch
git push origin feature/nome-da-feature

# Criar Pull Request
```

#### Convenção de Commits
```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### 2. Estrutura de Componente

#### Template Básico
```typescript
// components/exemplo/MinhaComponent.tsx
import { cn } from '@/lib/utils'

interface MinhaComponentProps {
  title: string
  variant?: 'default' | 'secondary'
  className?: string
  children?: React.ReactNode
}

export function MinhaComponent({
  title,
  variant = 'default',
  className,
  children
}: MinhaComponentProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      variant === 'default' && 'bg-white',
      variant === 'secondary' && 'bg-gray-50',
      className
    )}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  )
}
```

#### Hook Customizado
```typescript
// lib/hooks/useExample.ts
import { useState, useEffect } from 'react'

export function useExample<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  
  useEffect(() => {
    // Lógica do hook
  }, [])
  
  return { value, setValue }
}
```

### 3. API Route

#### Template de API
```typescript
// app/api/exemplo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    
    const { data, error } = await supabase
      .from('tabela')
      .select('*')
    
    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validação dos dados
    // Processamento
    // Resposta
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar requisição' }, 
      { status: 400 }
    )
  }
}
```

---

## 🎨 Design System

### Cores
```typescript
// Cores principais (CSS Variables)
const cores = {
  primary: 'hsl(222.2 84% 4.9%)',
  secondary: 'hsl(210 40% 96%)',
  accent: 'hsl(210 40% 94%)',
  muted: 'hsl(210 40% 96%)',
  success: 'hsl(142.1 76.2% 36.3%)',
  warning: 'hsl(47.9 95.8% 53.1%)',
  error: 'hsl(0 84.2% 60.2%)'
}
```

### Tipografia
```typescript
const tipografia = {
  display: 'text-5xl font-bold tracking-tight',
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold tracking-tight',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs text-muted-foreground'
}
```

### Componentes Base
- **Button**: Variantes primary, secondary, outline, ghost
- **Input**: Text, email, password, number
- **Card**: Container com header, content, footer
- **Dialog**: Modal para ações importantes
- **Table**: Tabelas responsivas com sorting

---

## 🔧 Ferramentas de Desenvolvimento

### VS Code Extensions Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Scripts NPM
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "type-check": "tsc --noEmit"
}
```

### Debugging
```typescript
// next.config.js - Source maps para debugging
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    return config
  }
}
```

---

## 📊 Estado e Cache

### Zustand Store
```typescript
// lib/stores/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-store'
    }
  )
)
```

### React Query
```typescript
// lib/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePedidos() {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: () => fetch('/api/pedidos').then(res => res.json()),
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

export function useCriarPedido() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (pedido: CriarPedidoData) =>
      fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    }
  })
}
```

---

## 🧪 Testing

### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testEnvironment: 'jest-environment-jsdom'
}

module.exports = createJestConfig(customJestConfig)
```

### Exemplo de Teste
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🚀 Performance

### Otimizações
```typescript
// Lazy loading de componentes
import { lazy, Suspense } from 'react'
const DashboardChart = lazy(() => import('./DashboardChart'))

function Dashboard() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardChart />
    </Suspense>
  )
}

// Memoização de componentes
import { memo } from 'react'
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Componente pesado
})

// useMemo para cálculos custosos
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

### Next.js Optimizations
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizeCss: true,
    gzipSize: true
  }
}
```

---

## 🐛 Debugging e Logs

### Console Logs Estruturados
```typescript
// lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  }
}
```

### Error Boundary
```typescript
// components/common/ErrorBoundary.tsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado.</h1>
    }

    return this.props.children
  }
}
```

---

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`MinhaComponent`)
- **Funções**: camelCase (`minhaFuncao`)
- **Variáveis**: camelCase (`minhaVariavel`)
- **Constantes**: UPPER_CASE (`MINHA_CONSTANTE`)
- **Arquivos**: kebab-case (`meu-arquivo.tsx`)

### Imports Order
```typescript
// 1. React e bibliotecas externas
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Imports internos absolutos
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

// 3. Imports relativos
import './styles.css'
```

### TypeScript
```typescript
// Sempre tipificar props de componentes
interface ComponentProps {
  title: string
  optional?: boolean
}

// Usar tipos específicos ao invés de any
type Status = 'loading' | 'success' | 'error'

// Tipar retornos de funções quando não óbvio
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

---

## ⚠️ Troubleshooting

### Problemas Comuns

#### Erro de Build
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Problemas de Types
```bash
# Regenerar tipos do TypeScript
npx tsc --noEmit
```

#### Supabase Connection
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Testar conexão
npx supabase status
```

### Debug do Supabase
```typescript
// Habilitar debug mode
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  auth: { debug: true }
})
```

---

## 🎯 Próximos Passos

1. **Estudar a documentação** das APIs
2. **Explorar componentes** existentes
3. **Entender o fluxo** de dados
4. **Contribuir** com melhorias
5. **Reportar bugs** encontrados

## 📞 Suporte

- **Issues**: GitHub Issues
- **Documentação**: `/docs`
- **Logs**: Console do navegador
- **Database**: Supabase Dashboard