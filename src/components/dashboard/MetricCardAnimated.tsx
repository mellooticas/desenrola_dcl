'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardAnimatedProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<any>
  gradient: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
  index?: number
  loading?: boolean
  prefix?: string
  suffix?: string
}

export function MetricCardAnimated({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  trend,
  index = 0,
  loading = false,
  prefix = '',
  suffix = ''
}: MetricCardAnimatedProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''))
  const isValidNumber = !isNaN(numericValue)

  // Animated counter
  useEffect(() => {
    if (!isValidNumber || loading) return

    const duration = 2000
    const steps = 60
    const increment = numericValue / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue, isValidNumber, loading])

  if (loading) {
    return (
      <div className="relative group">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg 
                      border border-gray-200 dark:border-gray-800 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500",
          gradient
        )}
      />

      {/* Card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg 
                    border border-gray-200 dark:border-gray-800 overflow-hidden
                    transition-all duration-300 group-hover:shadow-xl">
        
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={cn("w-full h-full bg-gradient-to-br rounded-full blur-2xl", gradient)} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              <motion.h3 
                className="text-3xl font-bold text-gray-900 dark:text-white"
                key={displayValue}
              >
                {isValidNumber 
                  ? `${prefix}${displayValue.toLocaleString('pt-BR')}${suffix}`
                  : value
                }
              </motion.h3>
            </div>

            {/* Icon with gradient */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg group-hover:shadow-2xl transition-shadow duration-300",
                gradient
              )}
            >
              <Icon size={24} />
            </motion.div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              {subtitle}
            </p>
          )}

          {/* Trend indicator */}
          {trend && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1 mt-3"
            >
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.direction === 'up'
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}>
                <motion.div
                  animate={{ y: trend.direction === 'up' ? [-2, 0, -2] : [2, 0, 2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </motion.div>
                <span>{Math.abs(trend.value)}</span>
              </div>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </motion.div>
          )}
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        />
      </div>
    </motion.div>
  )
}
