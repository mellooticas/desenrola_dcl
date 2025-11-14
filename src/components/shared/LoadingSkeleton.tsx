'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'list' | 'dashboard'
  count?: number
}

export function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-32 w-full rounded-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>

        {/* Full width chart */}
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Skeleton className="h-16 w-full rounded-lg" />
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Default: card type
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
