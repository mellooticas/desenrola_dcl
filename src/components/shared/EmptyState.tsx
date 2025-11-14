'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: React.ComponentType<any>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 
                 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-6
                 shadow-lg"
      >
        <Icon size={48} className="text-gray-400 dark:text-gray-600" />
      </motion.div>
      
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={action.onClick}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 
                     hover:to-cyan-600 text-white shadow-lg"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
