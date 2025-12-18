// 📊 Página de Controle de OSs

import { OSControlPanel } from '@/components/os-control'

export const metadata = {
  title: 'Controle de OSs | Desenrola DCL',
  description: 'Painel de controle e auditoria de Ordens de Serviço',
}

export default function ControleOSPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Controle de Ordens de Serviço</h1>
        <p className="text-muted-foreground">
          Sistema de auditoria e controle de integridade da sequência de OSs
        </p>
      </div>

      <OSControlPanel />
    </div>
  )
}
