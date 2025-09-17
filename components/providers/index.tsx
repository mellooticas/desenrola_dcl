'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './ToastProvider'
import { AuthProvider } from './AuthProvider'
import { IntelligentThemeProvider } from '@/lib/contexts/IntelligentThemeContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each app session
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Stale time: 5 minutes
          staleTime: 5 * 60 * 1000,
          // Cache time: 10 minutes  
          gcTime: 10 * 60 * 1000,
          // Retry failed requests 
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.status >= 400 && error?.status < 500) {
              return false
            }
            // Retry up to 3 times for other errors
            return failureCount < 3
          },
          // Refetch on window focus in production
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        },
        mutations: {
          // Retry mutations once
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <IntelligentThemeProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </IntelligentThemeProvider>
    </QueryClientProvider>
  )
}