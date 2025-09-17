# 🎨 Sistema de Temas DCL - Guia Completo de Implementação

## 📋 Visão Geral

O sistema de temas DCL foi projetado para:
- **Centralizar** toda a personalização visual
- **Automatizar** a aplicação de cores e contraste
- **Garantir** acessibilidade e legibilidade
- **Facilitar** manutenção e consistência

## 🚀 Como Usar o Sistema

### 1. Hook useTheme
```tsx
import { useTheme } from '@/lib/contexts/ThemeContext'

function MeuComponente() {
  const { theme, applyTheme, resetTheme } = useTheme()
  
  return (
    <div className="theme-card">
      <h1 className="theme-text">Título</h1>
      <p className="theme-text-muted">Descrição</p>
    </div>
  )
}
```

### 2. Classes CSS de Tema

#### Cores Principais
- `theme-primary` - Fundo primário
- `theme-secondary` - Fundo secundário  
- `theme-background` - Fundo padrão
- `theme-text` - Texto principal
- `theme-text-muted` - Texto secundário
- `theme-border` - Bordas

#### Componentes
- `theme-card` - Card básico
- `theme-card-hover` - Card com hover
- `theme-input` - Input com tema
- `btn-primary` - Botão primário
- `btn-secondary` - Botão secundário
- `btn-outline` - Botão outline

#### Estados
- `status-success` - Verde de sucesso
- `status-warning` - Amarelo de aviso
- `status-error` - Vermelho de erro

### 3. Variáveis CSS Disponíveis

```css
/* Cores principais */
var(--color-primary)
var(--color-primary-foreground)
var(--color-secondary)
var(--color-secondary-foreground)
var(--color-background)
var(--color-text)
var(--color-muted)
var(--color-border)
var(--color-card)
var(--color-success)
var(--color-warning)
var(--color-error)

/* Tipografia */
var(--font-header)
var(--font-body)

/* Espaçamentos */
var(--border-radius)
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
```

## 🔧 Implementação por Componente

### Cards e Containers
```tsx
// ❌ Antes
<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <h3 className="text-gray-900">Título</h3>
  <p className="text-gray-600">Descrição</p>
</div>

// ✅ Depois
<div className="theme-card-hover">
  <h3 className="theme-text">Título</h3>
  <p className="theme-text-muted">Descrição</p>
</div>
```

### Botões
```tsx
// ❌ Antes
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Salvar
</button>

// ✅ Depois
<button className="btn-primary">
  Salvar
</button>
```

### Inputs
```tsx
// ❌ Antes
<input 
  className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
  placeholder="Digite aqui..."
/>

// ✅ Depois  
<input 
  className="theme-input"
  placeholder="Digite aqui..."
/>
```

### Status e Badges
```tsx
// ❌ Antes
<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
  Ativo
</span>

// ✅ Depois
<span className="status-badge status-success">
  Ativo
</span>
```

## 🎨 Personalização Avançada

### Hook useThemeColors
```tsx
import { useThemeColors } from '@/components/theme/ExampleComponent'

function ComponenteCustomizado() {
  const colors = useThemeColors()
  
  return (
    <div style={{ backgroundColor: colors.primary }}>
      <span style={{ color: colors.getContrastText(colors.primary) }}>
        Texto com contraste automático
      </span>
    </div>
  )
}
```

### Estilos Inline Quando Necessário
```tsx
function GraficoCustomizado() {
  const { theme } = useTheme()
  
  return (
    <Chart
      data={data}
      colors={[
        theme.corPrimaria,
        theme.corSecundaria, 
        theme.corSuccess,
        theme.corWarning
      ]}
    />
  )
}
```

## 📱 Responsividade com Tema

```css
/* Classes responsivas mantendo tema */
.responsive-card {
  @apply theme-card;
  
  @media (min-width: 768px) {
    @apply theme-shadow-lg;
  }
  
  @media (min-width: 1024px) {
    @apply theme-card-hover;
  }
}
```

## 🌗 Modo Escuro Automático

O sistema detecta automaticamente:
- Preferência do usuário (sistema operacional)
- Configuração manual
- Modo automático baseado no horário

```tsx
// Configuração de tema
const temaConfig = {
  nome: 'Meu Tema',
  modo: 'auto', // 'light', 'dark', 'auto'
  corPrimaria: '#1C3B5A',
  // ... outras configurações
}
```

## 🔍 Debug e Monitoramento

### Verificar Tema Atual
```tsx
function DebugTheme() {
  const { theme } = useTheme()
  
  console.log('Tema atual:', theme)
  
  return (
    <div className="theme-card">
      <pre>{JSON.stringify(theme, null, 2)}</pre>
    </div>
  )
}
```

### Testar Contraste
```css
/* Adicionar temporariamente para debug */
.debug-contrast {
  outline: 2px solid red !important;
}
```

## 📋 Checklist de Migração

### Para Cada Componente:

- [ ] Substituir cores hardcoded por classes de tema
- [ ] Trocar `bg-*` por `theme-*`
- [ ] Trocar `text-*` por `theme-text*`
- [ ] Trocar `border-*` por `theme-border`
- [ ] Adicionar `transition-theme` para animações suaves
- [ ] Testar no modo claro e escuro
- [ ] Verificar contraste e legibilidade
- [ ] Validar responsividade

### Para Páginas:

- [ ] Wrapper principal com `theme-background`
- [ ] Títulos com `theme-text`
- [ ] Descrições com `theme-text-muted`
- [ ] Cards com `theme-card` ou `theme-card-hover`
- [ ] Botões com `btn-*`
- [ ] Inputs com `theme-input`
- [ ] Estados com `status-*`

## 🎯 Próximos Passos

1. **Migrar componentes existentes** seguindo este guia
2. **Criar novos temas** predefinidos conforme necessário
3. **Implementar persistência** no backend se necessário
4. **Adicionar mais variáveis** CSS conforme surgem necessidades
5. **Documentar temas customizados** para diferentes clientes

## 💡 Dicas de Performance

- Classes CSS são compiladas em build time
- Variáveis CSS têm performance nativa
- ThemeProvider usa React Context otimizado
- localStorage evita re-fetch desnecessário

## 🚨 Importante

⚠️ **SEMPRE TESTE** mudanças de tema em:
- Modo claro e escuro
- Diferentes tamanhos de tela
- Diferentes navegadores
- Com diferentes níveis de contraste (acessibilidade)

✅ **Use este sistema** para garantir consistência visual em toda a aplicação!