'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestUrgenciaPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [pedidosDireto, setPedidosDireto] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      // 1. Verificar usuário logado (VERIFICAÇÃO DUPLA)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      setUsuario(user || session?.user || null)
      console.log('👤 Usuário logado (getUser):', user)
      console.log('👤 Sessão (getSession):', session)

      // 2. Tentar buscar da view
      const { data: dataView, error: errorView } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .eq('status', 'AG_PAGAMENTO')
        .limit(10)

      if (errorView) {
        console.error('❌ Erro na view v_pedidos_kanban:', errorView)
        setErro(`View error: ${errorView.message}`)
      } else {
        console.log('✅ Pedidos da VIEW:', dataView)
        setPedidos(dataView || [])
      }

      // 3. Tentar buscar direto da tabela pedidos
      const { data: dataDireto, error: errorDireto } = await supabase
        .from('pedidos')
        .select('id, numero_os, status, data_pedido, data_prometida, data_sla_laboratorio, laboratorio_id, loja_id')
        .eq('status', 'AG_PAGAMENTO')
        .limit(10)

      if (errorDireto) {
        console.error('❌ Erro na tabela pedidos:', errorDireto)
      } else {
        console.log('✅ Pedidos DIRETO da tabela:', dataDireto)
        setPedidosDireto(dataDireto || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">🔍 Diagnóstico Completo - Sistema de Urgência</h1>
      
      {/* Informações do Usuário */}
      <div className={usuario ? "bg-blue-100 border border-blue-400" : "bg-red-100 border border-red-400"}>
        <div className="p-4 rounded">
          <h2 className="font-bold mb-2">👤 Usuário Atual</h2>
          {usuario ? (
            <div className="text-sm space-y-1">
              <div>✅ <strong>Status:</strong> LOGADO</div>
              <div><strong>Email:</strong> {usuario.email}</div>
              <div><strong>ID:</strong> {usuario.id}</div>
              <div className="text-xs text-gray-600 mt-2">
                Abra o Console (F12) para ver logs detalhados da sessão
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-600 font-bold">❌ USUÁRIO NÃO DETECTADO!</div>
              <div className="text-sm">
                <strong>Possíveis causas:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Sessão expirada - tente fazer login novamente</li>
                  <li>Cookie de autenticação não encontrado</li>
                  <li>Problema no Supabase client</li>
                </ul>
              </div>
              <a 
                href="/login" 
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ir para Login
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Erro da View */}
      {erro && (
        <div className="bg-red-100 border border-red-400 p-4 rounded">
          <h2 className="font-bold mb-2">❌ Erro ao acessar v_pedidos_kanban</h2>
          <div className="text-sm font-mono">{erro}</div>
          <div className="mt-2 text-sm">
            <strong>Solução:</strong> Execute o script <code className="bg-red-200 px-1 rounded">fix-urgencia-completo.sql</code> no Supabase SQL Editor
          </div>
        </div>
      )}
      
      {/* Resultado da View */}
      <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
        <h2 className="font-bold mb-2">📊 Resultado da VIEW (v_pedidos_kanban)</h2>
        <p className="font-bold">Total de pedidos: {pedidos.length}</p>
        <p>Com data_prometida: {pedidos.filter(p => p.data_prometida).length}</p>
        <p>Sem data_prometida: {pedidos.filter(p => !p.data_prometida).length}</p>
      </div>

      {/* Resultado Direto da Tabela */}
      <div className="bg-green-100 border border-green-400 p-4 rounded">
        <h2 className="font-bold mb-2">📊 Resultado DIRETO da tabela (pedidos)</h2>
        <p className="font-bold">Total de pedidos: {pedidosDireto.length}</p>
        <p>Com data_prometida: {pedidosDireto.filter(p => p.data_prometida).length}</p>
        <p>Sem data_prometida: {pedidosDireto.filter(p => !p.data_prometida).length}</p>
      </div>

      {/* Instruções */}
      <div className="bg-purple-100 border border-purple-400 p-4 rounded">
        <h2 className="font-bold mb-2">🚀 Próximos Passos</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Abra <strong>Supabase Dashboard</strong> → Seu Projeto</li>
          <li>Vá em <strong>SQL Editor</strong></li>
          <li>Abra o arquivo: <code className="bg-purple-200 px-1 rounded">database/migrations/fix-urgencia-completo.sql</code></li>
          <li>Cole TODO o conteúdo no editor</li>
          <li>Clique em <strong>Run</strong></li>
          <li>Aguarde a execução (vai mostrar estatísticas no final)</li>
          <li>Volte aqui e aperte <strong>F5</strong> para recarregar</li>
        </ol>
      </div>

      {/* Pedidos da View */}
      {pedidos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">📋 Pedidos da VIEW</h2>
          {pedidos.map(pedido => (
            <div key={pedido.id} className="border rounded p-4 space-y-2 bg-white">
              <div className="font-bold">OS: {pedido.numero_os}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Status:</span> {pedido.status}
                </div>
                <div>
                  <span className="font-semibold">Data Pedido:</span> {pedido.data_pedido || '❌ NULL'}
                </div>
                <div className={pedido.data_prometida ? 'text-green-600' : 'text-red-600'}>
                  <span className="font-semibold">Data Prometida:</span> {pedido.data_prometida || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">SLA Lab:</span> {pedido.data_sla_laboratorio || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">Lab ID:</span> {pedido.laboratorio_id || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">Loja ID:</span> {pedido.loja_id || '❌ NULL'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pedidos Direto */}
      {pedidosDireto.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">📋 Pedidos DIRETO da Tabela</h2>
          {pedidosDireto.map(pedido => (
            <div key={pedido.id} className="border rounded p-4 space-y-2 bg-white">
              <div className="font-bold">OS: {pedido.numero_os}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Status:</span> {pedido.status}
                </div>
                <div>
                  <span className="font-semibold">Data Pedido:</span> {pedido.data_pedido || '❌ NULL'}
                </div>
                <div className={pedido.data_prometida ? 'text-green-600' : 'text-red-600'}>
                  <span className="font-semibold">Data Prometida:</span> {pedido.data_prometida || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">SLA Lab:</span> {pedido.data_sla_laboratorio || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">Lab ID:</span> {pedido.laboratorio_id || '❌ NULL'}
                </div>
                <div>
                  <span className="font-semibold">Loja ID:</span> {pedido.loja_id || '❌ NULL'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
