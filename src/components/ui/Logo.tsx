// components/ui/Logo.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}

export function Logo({ 
  size = 'md', 
  className,
  priority = true // Header logo deve ter prioridade para LCP
}: LogoProps) {
  
  const sizes = {
  sm: { width: 180, height: 60 },   // Mobile (120*1.5, 40*1.5)
  md: { width: 240, height: 80 },   // Desktop padrão (160*1.5, 53*1.5)
  lg: { width: 300, height: 100 }   // Telas grandes (200*1.5, 67*1.5)
}
  
  const { width, height } = sizes[size]
  
  return (
    <Image
      src="/logo_desenrola.png"  // PNG sem fundo para melhor compatibilidade
      alt="Desenrola DCL"
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "object-contain", // Mantém proporção
        "transition-opacity hover:opacity-80", // Sutil hover effect
        className
      )}
      // Fallback para SVG se PNG não carregar
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = "/logo_desenrola.svg"
      }}
    />
  )
}

// Componente específico para Header
export function LogoHeader() {
  return (
    <Logo 
      size="md" 
      priority={true}
      className="flex-shrink-0" // Impede que encolha no flex
    />
  )
}

// Para mobile (se precisar de versão menor)
export function LogoMobile() {
  return (
    <Logo 
      size="sm" 
      priority={true}
      className="md:hidden" // Só mostra no mobile
    />
  )
}