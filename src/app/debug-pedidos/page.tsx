'use client'

import { useState, useEffect } from 'react'

export default function DebugPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/debug/ultimos-pedidos')
      .then(res => res.json())
      .then(data => {
        setPedidos(data.pedidos || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao buscar pedidos:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Últimos Pedidos</h1>
      
      <div className="space-y-4">
        {pedidos.map((pedido, index) => (
          <div key={pedido.id} className="border p-4 rounded">
            <h3 className="font-bold">Pedido #{index + 1} - {pedido.numero_sequencial}</h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <strong>Cliente:</strong> {pedido.cliente_nome}
              </div>
              <div>
                <strong>Telefone:</strong> {pedido.cliente_telefone || '❌ Vazio'}
              </div>
              
              <div>
                <strong>OS Física:</strong> {pedido.numero_os_fisica || '❌ Vazio'}
              </div>
              <div>
                <strong>Valor Pedido:</strong> {pedido.valor_pedido || '❌ Vazio'}
              </div>
              
              <div>
                <strong>Custo Lentes:</strong> {pedido.custo_lentes || '❌ Vazio'}
              </div>
              <div>
                <strong>É Garantia:</strong> {pedido.eh_garantia ? 'Sim' : 'Não'}
              </div>
              
              <div className="col-span-2">
                <strong>Observações:</strong> {pedido.observacoes || '❌ Vazio'}
              </div>
              
              <div className="col-span-2 text-sm text-gray-500">
                <strong>Criado em:</strong> {new Date(pedido.created_at).toLocaleString('pt-BR')}
                <br />
                <strong>Criado por:</strong> {pedido.created_by}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {pedidos.length === 0 && (
        <div className="text-center text-gray-500">
          Nenhum pedido encontrado
        </div>
      )}
    </div>
  )
}