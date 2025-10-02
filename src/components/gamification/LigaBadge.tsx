// src/components/gamification/LigaBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import { LigaTipo, LIGAS_CONFIG } from '@/lib/types/database'

interface LigaBadgeProps {
  liga: LigaTipo
  pontos: number
  className?: string
  showProgresso?: boolean
}

export function LigaBadge({ liga, pontos, className = '', showProgresso = true }: LigaBadgeProps) {
  const ligaConfig = LIGAS_CONFIG[liga]
  const proximaLiga = getProximaLiga(liga)
  const progressoPercent = proximaLiga ? getProgressoParaProximaLiga(liga, pontos) : 100

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className="flex items-center gap-1 font-semibold"
        style={{ 
          borderColor: ligaConfig.cor,
          color: ligaConfig.cor,
          backgroundColor: `${ligaConfig.cor}15`
        }}
      >
        <span className="text-sm">{ligaConfig.icone}</span>
        <span>{ligaConfig.nome}</span>
      </Badge>
      
      {showProgresso && proximaLiga && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>{Math.round(progressoPercent)}% para {LIGAS_CONFIG[proximaLiga].nome}</span>
        </div>
      )}
    </div>
  )
}

function getProximaLiga(ligaAtual: LigaTipo): LigaTipo | null {
  const ordem: LigaTipo[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE']
  const indiceAtual = ordem.indexOf(ligaAtual)
  return indiceAtual < ordem.length - 1 ? ordem[indiceAtual + 1] : null
}

function getProgressoParaProximaLiga(ligaAtual: LigaTipo, pontosAtuais: number): number {
  const proximaLiga = getProximaLiga(ligaAtual)
  if (!proximaLiga) return 100

  // Usando valores fixos para pontos mínimos
  const pontosMinimos: Record<LigaTipo, number> = {
    BRONZE: 0,
    PRATA: 500,
    OURO: 1200,
    DIAMANTE: 2500
  }
  
  const pontosPromocao: Record<LigaTipo, number> = {
    BRONZE: 500,
    PRATA: 1200,
    OURO: 2500,
    DIAMANTE: Infinity
  }
  
  const pontosMinimosAtual = pontosMinimos[ligaAtual]
  const pontosPromocaoAtual = pontosPromocao[ligaAtual]
  
  if (pontosPromocaoAtual === Infinity) return 100
  
  const progresso = ((pontosAtuais - pontosMinimosAtual) / (pontosPromocaoAtual - pontosMinimosAtual)) * 100
  return Math.min(100, Math.max(0, progresso))
}