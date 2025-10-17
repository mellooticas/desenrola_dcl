import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarSemTriggers() {
  console.log('🧪 TESTE: PEDIDO SEM TRIGGERS')
  
  // Como não conseguimos desabilitar via API, vamos tentar inserir com dados completos
  const novoPedido = {
    loja_id: 1,
    laboratorio_id: 1,
    classe_lente_id: 1,
    status: 'REGISTRADO',
    prioridade: 'NORMAL',
    cliente_nome: 'Teste Usuario API',
    cliente_telefone: '11999999999',
    observacoes: 'Teste automatizado via script',
    eh_garantia: false,
    // Incluir campos que o trigger normalmente calcularia
    data_pedido: new Date().toISOString().split('T')[0],
    data_prometida: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +5 dias
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  try {
    console.log('📝 Tentando inserir pedido com dados completos...')
    
    const { data, error } = await supabase
      .from('pedidos')
      .insert(novoPedido)
      .select()
      .single()
    
    if (error) {
      console.error('❌ ERRO ao inserir:', error)
      
      // Vamos tentar ver mais detalhes do erro
      if (error.message.includes('laboratorio_sla')) {
        console.log('\n🔍 CONFIRMADO: O problema é acesso à tabela laboratorio_sla')
        console.log('💡 SOLUÇÃO: Vamos criar um trigger que não acesse essa tabela')
      }
    } else {
      console.log('✅ SUCESSO! Pedido criado:', {
        id: data.id,
        numero_sequencial: data.numero_sequencial,
        cliente_nome: data.cliente_nome
      })
    }
    
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

// Também testar via API HTTP
async function testarViaAPI() {
  console.log('\n🌐 TESTE: VIA API HTTP')
  
  const response = await fetch('http://localhost:3000/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      loja_id: 1,
      laboratorio_id: 1,
      classe_lente_id: 1,
      cliente_nome: 'Teste Usuario HTTP',
      cliente_telefone: '11999999999',
      observacoes: 'Teste via HTTP',
      prioridade: 'NORMAL'
    })
  })
  
  const result = await response.text()
  
  if (response.ok) {
    console.log('✅ API HTTP funcionou:', result)
  } else {
    console.log('❌ API HTTP falhou:', result)
  }
}

// Executar ambos os testes
testarSemTriggers().then(() => testarViaAPI())