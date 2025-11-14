'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KanbanColumnHeaderProps {
  title: string
  count: number
  icon: React.ComponentType<any>
  gradient: string
  color: string
}

export function KanbanColumnHeader({ 
  title, 
  count, 
  icon: Icon,
  gradient,
  color 
}: KanbanColumnHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-10 blur-xl rounded-xl",
        gradient
      )} />

      {/* Header content */}
      <div className={cn(
        "relative bg-gradient-to-r p-4 rounded-xl shadow-lg border",
        gradient,
        "border-opacity-20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg 
                          flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-xs text-white/80">Etapa do processo</p>
            </div>
          </div>
          
          {/* Animated counter */}
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="min-w-[2.5rem] h-10 bg-white/20 backdrop-blur-sm rounded-lg 
                     flex items-center justify-center px-3"
          >
            <span className="text-xl font-bold text-white">{count}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
