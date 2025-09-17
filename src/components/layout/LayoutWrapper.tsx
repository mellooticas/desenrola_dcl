'use client'

import { usePathname } from 'next/navigation'
import GlobalHeader from './GlobalHeader'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Páginas que não devem mostrar o header
  const pagesWithoutHeader = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]

  const shouldShowHeader = !pagesWithoutHeader.includes(pathname)

  return (
    <>
      {shouldShowHeader && <GlobalHeader />}
      <div className={shouldShowHeader ? 'min-h-[calc(100vh-4rem)]' : 'min-h-screen'}>
        {children}
      </div>
    </>
  )
}