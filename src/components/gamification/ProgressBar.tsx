// src/components/gamification/ProgressBar.tsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LigaTipo, LIGAS_CONFIG } from '@/lib/types/database'
import { calcularProgressoProximaLiga, getProximaLiga } from '@/lib/utils/gamificacao'
import { Star, Zap, Trophy, Target } from 'lucide-react'

interface ProgressBarProps {
  ligaAtual: LigaTipo
  pontosAtuais: number
  pontosPossiveisMes: number // Novo prop obrigatório
  className?: string
  showLevelUp?: boolean
  onLevelUp?: (novaLiga: LigaTipo) => void
}

export function ProgressBar({ 
  ligaAtual, 
  pontosAtuais, 
  pontosPossiveisMes,
  className = '',
  showLevelUp = false,
  onLevelUp 
}: ProgressBarProps) {
  const [animatedPoints, setAnimatedPoints] = useState(pontosAtuais)
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)
  
  const ligaConfig = LIGAS_CONFIG[ligaAtual]
  const proximaLiga = getProximaLiga(ligaAtual)
  
  // Calcular percentuais e progresso
  const percentualAtual = pontosPossiveisMes > 0 ? (pontosAtuais / pontosPossiveisMes) * 100 : 0
  const percentualMinimo = ligaConfig.percentual_minimo
  const percentualProximaLiga = proximaLiga ? LIGAS_CONFIG[proximaLiga].percentual_minimo : 100
  
  // Progresso dentro da liga atual até a próxima
  const progressoDentroLiga = proximaLiga ? 
    calcularProgressoProximaLiga(ligaAtual, pontosAtuais, pontosPossiveisMes) : 100
  
  // Pontos necessários para próxima liga
  const pontosParaProxima = proximaLiga ? 
    Math.ceil((percentualProximaLiga / 100) * pontosPossiveisMes) - pontosAtuais : 0

  // Animação dos pontos
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPoints(pontosAtuais)
    }, 100)
    return () => clearTimeout(timer)
  }, [pontosAtuais])

  // Detectar level up
  useEffect(() => {
    if (showLevelUp) {
      setShowLevelUpAnimation(true)
      const timer = setTimeout(() => {
        setShowLevelUpAnimation(false)
        if (onLevelUp && proximaLiga) {
          onLevelUp(proximaLiga)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showLevelUp, proximaLiga, onLevelUp])

  return (
    <div className={`relative ${className}`}>
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUpAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg border-2 border-yellow-300">
              <div className="flex items-center gap-2 font-bold">
                <Trophy className="h-5 w-5" />
                <span>LEVEL UP!</span>
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liga Atual e Estatísticas */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{ligaConfig.icone}</span>
          <div>
            <div className="font-bold text-lg" style={{ color: ligaConfig.cor }}>
              {ligaConfig.nome}
            </div>
            <div className="text-sm text-gray-600">
              {animatedPoints.toLocaleString()} / {pontosPossiveisMes.toLocaleString()} XP
            </div>
            <div className="text-xs text-gray-500">
              {percentualAtual.toFixed(1)}% de eficiência mensal
            </div>
          </div>
        </div>
        
        {proximaLiga && pontosParaProxima > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400">Próximo nível:</div>
            <div className="flex items-center gap-1">
              <span className="text-lg">{LIGAS_CONFIG[proximaLiga].icone}</span>
              <span className="text-sm font-medium" style={{ color: LIGAS_CONFIG[proximaLiga].cor }}>
                {LIGAS_CONFIG[proximaLiga].nome}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Target className="h-3 w-3" />
              <span>{pontosParaProxima.toLocaleString()} XP faltam</span>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Progresso */}
      <div className="relative">
        {/* Background da barra */}
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner border">
          {/* Progresso animado */}
          <motion.div
            className="h-full rounded-full relative flex items-center justify-end pr-2"
            style={{
              background: proximaLiga ? 
                `linear-gradient(90deg, ${ligaConfig.cor}, ${LIGAS_CONFIG[proximaLiga].cor})` :
                `linear-gradient(90deg, ${ligaConfig.cor}, #FFD700)`
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progressoDentroLiga}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {/* Porcentagem dentro da barra */}
            <span className="text-xs font-bold text-white drop-shadow">
              {progressoDentroLiga.toFixed(0)}%
            </span>
            
            {/* Efeito de brilho */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'linear',
                repeatDelay: 4
              }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                width: '30%'
              }}
            />
          </motion.div>
        </div>

        {/* Marcos de percentual */}
        <div className="flex justify-between mt-2 text-xs">
          <div className="text-gray-500">
            <span className="font-medium">{percentualMinimo}%</span>
            <div className="text-gray-400">{ligaConfig.nome}</div>
          </div>
          
          {proximaLiga && (
            <div className="text-gray-700 text-center">
              <span className="font-medium">{percentualProximaLiga}%</span>
              <div className="text-gray-500">{LIGAS_CONFIG[proximaLiga].nome}</div>
            </div>
          )}
        </div>
      </div>

      {/* Estrelas de conquista baseadas no percentual */}
      <div className="flex justify-center mt-3 gap-1">
        {[...Array(5)].map((_, i) => {
          const threshold = (i + 1) * 20 // 20%, 40%, 60%, 80%, 100%
          const isActive = percentualAtual >= threshold
          
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 + 0.8 }}
            >
              <Star 
                className={`h-4 w-4 ${
                  isActive ? 
                  'text-yellow-400 fill-current' : 
                  'text-gray-300'
                }`}
              />
            </motion.div>
          )
        })}
      </div>
      
      {/* Dica de progresso */}
      <div className="text-center mt-2 text-xs text-gray-500">
        {proximaLiga ? (
          <>Mantenha {percentualProximaLiga}% de eficiência para subir para {LIGAS_CONFIG[proximaLiga].nome}</>
        ) : (
          <>Você está na liga máxima! Mantenha a excelência! 🏆</>
        )}
      </div>
    </div>
  )
}