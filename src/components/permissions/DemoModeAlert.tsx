/**
 * Componente de Banner/Alert para usuários demo
 * Exibe aviso visual quando usuário está em modo visualização
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye } from 'lucide-react';
import { useIsDemo } from '@/lib/hooks/use-user-permissions';

interface DemoModeAlertProps {
  /** Mensagem personalizada (opcional) */
  message?: string;
  /** Mostrar mesmo se não for demo (para testes) */
  forceShow?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Banner de modo demo - Mostra automaticamente apenas para usuários demo
 * 
 * @example
 * ```tsx
 * <DemoModeAlert />
 * ```
 * 
 * @example Com mensagem customizada
 * ```tsx
 * <DemoModeAlert message="Você não pode editar pedidos em modo visualização" />
 * ```
 */
export function DemoModeAlert({ 
  message, 
  forceShow = false,
  className = '' 
}: DemoModeAlertProps) {
  const isDemo = useIsDemo();
  
  if (!isDemo && !forceShow) {
    return null;
  }
  
  return (
    <Alert className={`border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 ${className}`}>
      <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <span className="font-semibold">👁️ Modo Visualização:</span>{' '}
        {message || 'Você pode visualizar, mas não pode fazer alterações no sistema.'}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Badge compacto para header/navbar
 */
export function DemoModeBadge() {
  const isDemo = useIsDemo();
  
  if (!isDemo) return null;
  
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
      <Eye className="h-3 w-3" />
      <span>Visualização</span>
    </div>
  );
}

/**
 * Tooltip inline para indicar restrição
 */
export function DemoRestrictionTooltip({ 
  action = 'esta ação' 
}: { 
  action?: string 
}) {
  const isDemo = useIsDemo();
  
  if (!isDemo) return null;
  
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3 w-3" />
      Usuários em modo visualização não podem {action}
    </span>
  );
}
