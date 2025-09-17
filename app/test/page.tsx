'use client'

// Teste rápido para verificar dados no banco
import { supabase } from '@/lib/supabase/client'

export default function TestePage() {
  
  const testarDados = async () => {
    console.log('🔍 Testando dados do banco...')
    
    try {
      // Teste 1: Pedidos
      const { data: pedidos, error: erroPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .limit(5)
      
      console.log('📊 Pedidos:', pedidos?.length || 0, 'registros')
      console.log('📊 Dados pedidos:', pedidos)
      if (erroPedidos) console.error('❌ Erro pedidos:', erroPedidos)
      
      // Teste 2: Laboratórios  
      const { data: labs, error: erroLabs } = await supabase
        .from('laboratorios')
        .select('*')
        .limit(5)
      
      console.log('🏥 Laboratórios:', labs?.length || 0, 'registros')
      console.log('🏥 Dados labs:', labs)
      if (erroLabs) console.error('❌ Erro labs:', erroLabs)
      
      // Teste 3: Lojas
      const { data: lojas, error: erroLojas } = await supabase
        .from('lojas')
        .select('*')
        .limit(5)
      
      console.log('🏪 Lojas:', lojas?.length || 0, 'registros')
      console.log('🏪 Dados lojas:', lojas)
      if (erroLojas) console.error('❌ Erro lojas:', erroLojas)
      
      return { pedidos, labs, lojas }
      
    } catch (error) {
      console.error('❌ Erro geral:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Dados</h1>
      <button 
        onClick={testarDados}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Testar Conexão com Banco
      </button>
    </div>
  )
}