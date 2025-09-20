'use client'

import { useState } from 'react'

export default function TesteCriarPedido() {
  const [resultado, setResultado] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testarCriacao = async () => {
    setLoading(true)
    setResultado('🔍 Buscando IDs necessários...')
    
    try {
      // Buscar IDs reais
      const [lojasRes, labsRes, classesRes] = await Promise.all([
        fetch('/api/lojas'),
        fetch('/api/laboratorios'),
        fetch('/api/classes')
      ])
      
      const lojas = await lojasRes.json()
      const labs = await labsRes.json()
      const classes = await classesRes.json()
      
      if (!lojas[0] || !labs[0] || !classes[0]) {
        setResultado('❌ Não foi possível encontrar lojas, laboratórios ou classes')
        setLoading(false)
        return
      }
      
      setResultado('📋 Criando pedido de teste...')
      
      const dadosTeste = {
        loja_id: lojas[0].id,
        laboratorio_id: labs[0].id,
        classe_lente_id: classes[0].id,
        prioridade: 'NORMAL',
        cliente_nome: 'TESTE CAMPOS',
        cliente_telefone: '11999999999', // CAMPO PROBLEMÁTICO
        numero_os_fisica: 'OS123456', // CAMPO PROBLEMÁTICO  
        numero_pedido_laboratorio: 'LAB789',
        valor_pedido: 150.50, // CAMPO PROBLEMÁTICO
        custo_lentes: 75.25, // CAMPO PROBLEMÁTICO
        eh_garantia: false,
        tratamentos_ids: [],
        observacoes: 'Teste dos campos problemáticos', // CAMPO PROBLEMÁTICO
        observacoes_garantia: null
      }
      
      console.log('📋 Enviando dados de teste:', dadosTeste)
      
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosTeste)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResultado(`✅ Pedido criado com sucesso!\n\nID: ${data.id}\nNúmero: ${data.numero_sequencial}\n\nCampos salvos:\n- Telefone: ${data.cliente_telefone || '❌ VAZIO'}\n- OS Física: ${data.numero_os_fisica || '❌ VAZIO'}\n- Valor Pedido: ${data.valor_pedido || '❌ VAZIO'}\n- Custo Lentes: ${data.custo_lentes || '❌ VAZIO'}\n- Observações: ${data.observacoes || '❌ VAZIO'}`)
      } else {
        setResultado(`❌ Erro: ${data.error}\nDetalhes: ${data.details || 'N/A'}`)
      }
    } catch (error) {
      setResultado(`❌ Erro de rede: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste - Criar Pedido com Campos Problemáticos</h1>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Este teste criará um pedido com todos os campos problemáticos preenchidos para verificar se são salvos corretamente:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li>📞 Telefone: 11999999999</li>
          <li>📋 OS Física: OS123456</li>
          <li>💰 Valor Pedido: R$ 150,50</li>
          <li>💎 Custo Lentes: R$ 75,25</li>
          <li>📝 Observações: Teste dos campos problemáticos</li>
        </ul>
      </div>
      
      <button 
        onClick={testarCriacao}
        disabled={loading}
        className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? 'Testando...' : '🧪 Criar Pedido de Teste'}
      </button>
      
      {resultado && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap text-sm">{resultado}</pre>
        </div>
      )}
    </div>
  )
}