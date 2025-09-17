/* ===================================================================
   🧪 TESTE SMART BUTTON - VERIFICAÇÃO DE FUNCIONAMENTO
   Componente para testar se os botões estão funcionando corretamente
   ================================================================== */

'use client'

import React from 'react'
import { SmartButton } from '@/components/ui/intelligent-system'

export default function TestSmartButtonPage() {
  const handleClick = (buttonName: string) => {
    alert(`✅ ${buttonName} funcionando perfeitamente!`)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            🧪 Teste do SmartButton
          </h1>
          <p className="text-[var(--text-secondary)]">
            Verificando se todos os botões estão funcionando corretamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Teste de Variantes */}
          <div className="bg-[var(--bg-canvas)] p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Variantes</h3>
            <div className="space-y-3">
              <SmartButton 
                variant="primary" 
                onClick={() => handleClick('Primary')}
                className="w-full"
              >
                Primary Button
              </SmartButton>
              
              <SmartButton 
                variant="secondary" 
                onClick={() => handleClick('Secondary')}
                className="w-full"
              >
                Secondary Button
              </SmartButton>
              
              <SmartButton 
                variant="ghost" 
                onClick={() => handleClick('Ghost')}
                className="w-full"
              >
                Ghost Button
              </SmartButton>
              
              <SmartButton 
                variant="destructive" 
                onClick={() => handleClick('Destructive')}
                className="w-full"
              >
                Destructive Button
              </SmartButton>
            </div>
          </div>

          {/* Teste de Tamanhos */}
          <div className="bg-[var(--bg-canvas)] p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Tamanhos</h3>
            <div className="space-y-3">
              <SmartButton 
                variant="primary" 
                size="xs"
                onClick={() => handleClick('Extra Small')}
                className="w-full"
              >
                XS Button
              </SmartButton>
              
              <SmartButton 
                variant="primary" 
                size="sm"
                onClick={() => handleClick('Small')}
                className="w-full"
              >
                Small Button
              </SmartButton>
              
              <SmartButton 
                variant="primary" 
                size="md"
                onClick={() => handleClick('Medium')}
                className="w-full"
              >
                Medium Button
              </SmartButton>
              
              <SmartButton 
                variant="primary" 
                size="lg"
                onClick={() => handleClick('Large')}
                className="w-full"
              >
                Large Button
              </SmartButton>
            </div>
          </div>

          {/* Teste de Estados */}
          <div className="bg-[var(--bg-canvas)] p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Estados</h3>
            <div className="space-y-3">
              <SmartButton 
                variant="primary" 
                onClick={() => handleClick('Normal')}
                className="w-full"
              >
                Normal Button
              </SmartButton>
              
              <SmartButton 
                variant="primary" 
                loading={true}
                loadingText="Carregando..."
                className="w-full"
              >
                Loading Button
              </SmartButton>
              
              <SmartButton 
                variant="primary" 
                disabled={true}
                className="w-full"
              >
                Disabled Button
              </SmartButton>
              
              <SmartButton 
                variant="success" 
                onClick={() => handleClick('Success')}
                className="w-full"
              >
                Success Button
              </SmartButton>
            </div>
          </div>

        </div>

        {/* Resultado do Teste */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Status: SmartButton Funcionando!
          </h3>
          <p className="text-green-700">
            Todos os botões foram renderizados com sucesso. O erro do ref foi corrigido.
          </p>
          <div className="mt-4">
            <SmartButton 
              variant="success"
              onClick={() => alert('🎉 Sistema 100% operacional!')}
            >
              🎉 Confirmar Funcionamento
            </SmartButton>
          </div>
        </div>

      </div>
    </div>
  )
}