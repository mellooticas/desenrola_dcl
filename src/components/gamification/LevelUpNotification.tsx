'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvaliacaoLevelUp } from '@/lib/utils/levelUp'
import { LIGAS_CONFIG } from '@/lib/types/database'

interface LevelUpNotificationProps {
  avaliacao: AvaliacaoLevelUp | null
  onClose: () => void
}

export default function LevelUpNotification({ avaliacao, onClose }: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (avaliacao && avaliacao.celebrar && avaliacao.tipoMudanca === 'promocao') {
      setIsVisible(true)
      
      // Auto-fechar após 5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Aguardar animação
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [avaliacao, onClose])

  if (!avaliacao || !avaliacao.celebrar) return null

  const ligaConfig = LIGAS_CONFIG[avaliacao.ligaRecomendada as keyof typeof LIGAS_CONFIG]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-6 text-white">
            {/* Header com animação de estrelas */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="text-4xl mr-2">🎉</div>
              <div className="text-6xl">{ligaConfig.icone}</div>
              <div className="text-4xl ml-2">🎉</div>
            </motion.div>

            {/* Título */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-center mb-2"
            >
              PROMOÇÃO!
            </motion.h3>

            {/* Liga nova */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-4"
            >
              <div 
                className="inline-block px-4 py-2 rounded-full text-black font-bold text-lg"
                style={{ backgroundColor: ligaConfig.cor }}
              >
                {ligaConfig.nome}
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mb-4"
            >
              <div className="text-sm opacity-90">
                Performance: {avaliacao.mediaPerformance.toFixed(1)}%
              </div>
              <div className="text-sm opacity-90">
                {avaliacao.diasConsecutivos} dias consecutivos
              </div>
            </motion.div>

            {/* Efeitos visuais */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Estrelas animadas */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-200 text-lg"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 300,
                    y: Math.random() * 200
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{ 
                    delay: 1 + (i * 0.2),
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  ⭐
                </motion.div>
              ))}
            </motion.div>

            {/* Botão fechar */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="absolute top-2 right-2 text-white hover:text-yellow-200 transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}