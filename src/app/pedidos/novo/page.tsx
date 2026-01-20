'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { NovaOrdemWizard } from '@/components/forms'

export default function NovaOrdemPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const os = searchParams.get('os') || ''
  const [open, setOpen] = useState(true)

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <NovaOrdemWizard
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) router.push('/pedidos')
        }}
        showTrigger={false}
        initialNumeroOsFisica={os || undefined}
        onSuccess={() => {
          router.push('/pedidos')
        }}
      />
    </div>
  )
}