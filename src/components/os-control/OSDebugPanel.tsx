'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useOSControl, useOSPendentes } from '@/hooks/useOSControl'

export function OSDebugPanel() {
  const { userProfile } = useAuth()
  const { osGaps, isLoading, estatisticas } = useOSControl()
  const { totalPendentes } = useOSPendentes()

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-red-500 p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🔍 OS Control Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>👤 Usuário (userProfile):</strong>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1">
            {JSON.stringify({
              id: userProfile?.id,
              nome: userProfile?.nome,
              loja_id: userProfile?.loja_id,
              role: userProfile?.role
            }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>📊 useOSPendentes:</strong>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1">
            {JSON.stringify({ totalPendentes }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>📈 Estatísticas:</strong>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1">
            {JSON.stringify(estatisticas, null, 2)}
          </pre>
        </div>

        <div>
          <strong>📋 OS Gaps:</strong>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 max-h-40 overflow-auto">
            Loading: {String(isLoading)}
            {'\n'}
            Total: {osGaps?.length || 0}
            {'\n'}
            Primeiras: {JSON.stringify(osGaps?.slice(0, 3).map(g => g.numero_os), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
