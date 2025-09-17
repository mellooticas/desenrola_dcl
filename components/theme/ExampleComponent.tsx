import { useTheme } from '@/lib/contexts/ThemeContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ExampleComponentProps {
  title: string
  description?: string
  status?: 'success' | 'warning' | 'error' | 'default'
  children?: React.ReactNode
}

export function ExampleComponent({ 
  title, 
  description, 
  status = 'default',
  children 
}: ExampleComponentProps) {
  const { theme } = useTheme()

  const getStatusClass = () => {
    switch (status) {
      case 'success': return 'status-success'
      case 'warning': return 'status-warning'  
      case 'error': return 'status-error'
      default: return ''
    }
  }

  return (
    <Card className="theme-card-hover transition-theme">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="theme-text font-header">
            {title}
          </CardTitle>
          {status !== 'default' && (
            <Badge className={`status-badge ${getStatusClass()}`}>
              {status}
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="theme-text-muted">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        {/* Exemplo de botões com tema */}
        <div className="flex space-x-2">
          <Button className="btn-primary">
            Ação Primária
          </Button>
          <Button className="btn-secondary">
            Ação Secundária
          </Button>
          <Button className="btn-outline">
            Cancelar
          </Button>
        </div>

        {/* Exemplo de input com tema */}
        <div className="space-y-2">
          <label className="theme-text font-medium">
            Campo de Exemplo
          </label>
          <input
            type="text"
            placeholder="Digite algo aqui..."
            className="w-full theme-input transition-theme"
          />
        </div>

        {/* Informações do tema atual */}
        <div className="p-3 theme-card rounded-lg theme-border">
          <h4 className="theme-text font-medium mb-2">Tema Ativo:</h4>
          <div className="space-y-1 text-sm">
            <p className="theme-text-muted">
              <strong>Nome:</strong> {theme.nome}
            </p>
            <p className="theme-text-muted">
              <strong>Modo:</strong> {theme.modo}
            </p>
            <div className="flex items-center space-x-2">
              <strong className="theme-text-muted">Cores:</strong>
              <div 
                className="w-4 h-4 rounded border theme-border"
                style={{ backgroundColor: theme.corPrimaria }}
                title="Cor Primária"
              />
              <div 
                className="w-4 h-4 rounded border theme-border"
                style={{ backgroundColor: theme.corSecundaria }}
                title="Cor Secundária"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook personalizado para facilitar uso de cores do tema
export function useThemeColors() {
  const { theme } = useTheme()
  
  return {
    primary: theme.corPrimaria,
    secondary: theme.corSecundaria,
    background: theme.corFundo,
    text: theme.corTexto,
    muted: theme.corMuted,
    success: theme.corSuccess,
    warning: theme.corWarning,
    error: theme.corError,
    // Funções para aplicar cores inline quando necessário
    primaryStyle: { backgroundColor: theme.corPrimaria, color: theme.corTexto },
    secondaryStyle: { backgroundColor: theme.corSecundaria, color: theme.corTexto },
    getContrastText: (backgroundColor: string) => {
      // Função simples para determinar cor de texto com base no fundo
      const hex = backgroundColor.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 155 ? '#000000' : '#ffffff'
    }
  }
}