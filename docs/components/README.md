# 🧩 Componentes React

Documentação completa dos componentes React do sistema Desenrola DCL.

## 📖 Índice de Componentes

### 🎨 [UI Components](./ui.md)
Componentes base do design system (shadcn/ui)

### 📋 [Forms](./forms.md) 
Formulários e validações

### 🏗️ [Layout](./layout.md)
Header, sidebar, navigation e estruturas

### 📊 [Dashboard](./dashboard.md)
Gráficos, métricas e visualizações

### 📌 [Kanban](./kanban.md)
Board visual, cards e colunas

### ⏱️ [Timeline](./timeline.md)
Componentes de timeline e histórico

### 🔐 [Auth](./auth.md)
Componentes de autenticação

### 🔧 [Common](./common.md)
Componentes utilitários e comuns

## 🎯 Convenções de Componentes

### Estrutura Padrão
```typescript
// components/exemplo/MinhaComponent.tsx
interface MinhaComponentProps {
  titulo: string
  opcional?: boolean
  children?: React.ReactNode
}

export function MinhaComponent({ 
  titulo, 
  opcional = false, 
  children 
}: MinhaComponentProps) {
  return (
    <div className="minha-component">
      <h2>{titulo}</h2>
      {opcional && <span>Conteúdo opcional</span>}
      {children}
    </div>
  )
}
```

### Props Interface
- Sempre definir interface para props
- Usar `?` para props opcionais
- Incluir `children` quando necessário
- Documentar props complexas

### Exports
- Export named por padrão
- Export default apenas para páginas
- Agruphar exports relacionados

### Styling
- Tailwind CSS classes
- Variantes com class-variance-authority
- Dark mode support quando aplicável

## 📁 Estrutura de Pastas

```
components/
├── ui/                     # Componentes base (shadcn/ui)
│   ├── button.tsx         # Botões
│   ├── input.tsx          # Inputs
│   ├── card.tsx           # Cards
│   └── ...
├── forms/                 # Formulários
│   ├── NovaOrdemForm.tsx  # Form de nova ordem
│   ├── ConfiguracaoForm.tsx
│   └── ...
├── layout/                # Layout e navegação
│   ├── Header.tsx         # Cabeçalho
│   ├── Sidebar.tsx        # Menu lateral
│   ├── Navigation.tsx     # Navegação
│   └── ...
├── dashboard/             # Componentes do dashboard
│   ├── MetricasGerais.tsx # KPIs
│   ├── GraficoLeadTime.tsx
│   └── ...
├── kanban/                # Sistema Kanban
│   ├── KanbanBoard.tsx    # Board principal
│   ├── KanbanCard.tsx     # Cards dos pedidos
│   └── ...
├── common/                # Componentes comuns
│   ├── LoadingSpinner.tsx # Loading states
│   ├── ErrorBoundary.tsx  # Error handling
│   └── ...
└── providers/             # Context providers
    ├── AuthProvider.tsx   # Autenticação
    ├── ThemeProvider.tsx  # Temas
    └── ...
```

## 🎨 Design System

### Cores
```typescript
// Usando Tailwind + CSS Variables
const cores = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
}
```

### Tipografia
```typescript
const tipografia = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-semibold', 
  h3: 'text-2xl font-medium',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs'
}
```

### Espaçamentos
```typescript
const espacamentos = {
  xs: 'p-2',   // 8px
  sm: 'p-4',   // 16px  
  md: 'p-6',   // 24px
  lg: 'p-8',   // 32px
  xl: 'p-12'   // 48px
}
```

## 🔧 Utilitários

### Hooks Customizados
```typescript
// lib/hooks/useAuth.ts
export function useAuth() {
  // Lógica de autenticação
}

// lib/hooks/useApi.ts  
export function useApi<T>(endpoint: string) {
  // Lógica de API com React Query
}
```

### Utilities
```typescript
// lib/utils/cn.ts
export function cn(...classes: string[]) {
  return clsx(twMerge(...classes))
}

// lib/utils/format.ts
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
```

## 📊 Componentes por Categoria

### UI Base (17 componentes)
- Button, Input, Card, Dialog
- Select, Checkbox, Switch
- Table, Tabs, Badge, Alert

### Layout (8 componentes)  
- Header, Sidebar, Navigation
- Footer, Breadcrumb

### Dashboard (12 componentes)
- MetricasGerais, GraficoLeadTime
- RankingLaboratorios, AlertasPanel

### Kanban (6 componentes)
- KanbanBoard, KanbanCard
- KanbanColumn, KanbanFilters

### Forms (8 componentes)
- NovaOrdemForm, ConfiguracaoForm
- ObservacaoForm, PagamentoPIXForm

### Common (10 componentes)
- LoadingSpinner, ErrorBoundary
- DataTable, EmptyState

## 🚀 Boas Práticas

### Performance
- Usar React.memo para componentes pesados
- Lazy loading com React.lazy()
- Otimizar re-renders com useMemo/useCallback

### Acessibilidade
- Usar semantic HTML
- ARIA labels quando necessário
- Suporte a keyboard navigation
- Contraste adequado

### Testing
- Props obrigatórias vs opcionais
- Estados de loading/error
- Interações do usuário
- Responsive design

### Code Style
- Nomes descritivos para componentes
- Props interfaces bem definidas
- Comentários JSDoc quando necessário
- Consistent imports order

## 📝 Exemplos Rápidos

### Componente Simples
```typescript
interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}
```

### Componente com Estado
```typescript
interface CounterProps {
  initialValue?: number
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue)
  
  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => setCount(c => c - 1)}>-</Button>
      <span>{count}</span>
      <Button onClick={() => setCount(c => c + 1)}>+</Button>
    </div>
  )
}
```

### Hook Customizado
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = (value: T) => {
    setValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [value, setStoredValue] as const
}
```