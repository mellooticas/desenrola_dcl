import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 p-6',
      'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-lg',
      'border border-white/20 rounded-xl shadow-lg',
      className
    )}>
      <div className="relative">
        <svg
          className={cn(
            'animate-spin',
            sizeClasses[size]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="url(#gradient1)"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="url(#gradient2)"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C3B5A" />
              <stop offset="100%" stopColor="#3182f6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C3B5A" />
              <stop offset="100%" stopColor="#3182f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 animate-ping">
          <svg
            className={cn(
              'opacity-20',
              sizeClasses[size]
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#3182f6"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className="text-sm font-medium bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
          {text}
        </p>
      )}
    </div>
  )
}