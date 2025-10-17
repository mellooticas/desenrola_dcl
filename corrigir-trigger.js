const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

async function corrigirTrigger() {
  console.log('🔧 Corrigindo trigger do laboratorio_sla...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variáveis de ambiente não encontradas')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    console.log('📖 Lendo arquivo fix-trigger.sql...')
    const sql = fs.readFileSync('fix-trigger.sql', 'utf8')
    
    console.log('💾 Executando correção no banco...')
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      process.exit(1)
    }
    
    console.log('✅ Trigger corrigido com sucesso!')
    console.log('🧪 Testando criação de pedido...')
    
    // Testar criação de pedido
    const testPedido = {
      loja_id: 'test',
      laboratorio_id: 'test', 
      classe_lente_id: 'test',
      status: 'REGISTRADO',
      prioridade: 'NORMAL',
      cliente_nome: 'Teste Trigger',
      eh_garantia: false,
      data_prometida: '2025-10-21'
    }
    
    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .insert(testPedido)
      .select()
      .single()
    
    if (errorPedido) {
      console.log('⚠️ Teste falhou (esperado com IDs inválidos):', errorPedido.message)
    } else {
      console.log('✅ Teste passou - trigger funcionando!')
      // Limpar teste
      await supabase.from('pedidos').delete().eq('id', pedido.id)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

corrigirTrigger()