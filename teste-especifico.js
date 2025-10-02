// Teste direto da API do Supabase para verificar o que exatamente está falhando
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testarEspecifico() {
  console.log('🔍 === TESTE ESPECÍFICO DO PROBLEMA ===\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('🌐 URL Supabase:', supabaseUrl)
  console.log('🔐 Service Key (primeiros 20 chars):', serviceKey?.substring(0, 20) + '...')
  
  // Criar cliente com Service Role
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('\n📋 1. Testando acesso básico à tabela usuarios...')
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('count(*)')
      .single()
    
    if (error) {
      console.log('❌ Erro:', error.message)
      console.log('🔍 Código:', error.code)
      console.log('🔍 Detalhes:', error.details)
      console.log('🔍 Hint:', error.hint)
    } else {
      console.log('✅ Acesso básico funcionando!')
      console.log('📊 Resposta:', data)
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message)
  }
  
  console.log('\n📋 2. Testando busca direta de usuários...')
  
  try {
    const { data, error, status, statusText } = await supabase
      .from('usuarios')
      .select('email, nome')
      .limit(1)
    
    console.log('📊 Status HTTP:', status, statusText)
    
    if (error) {
      console.log('❌ Erro:', error.message)
    } else {
      console.log('✅ Busca funcionando!')
      console.log('📊 Dados:', data)
    }
  } catch (error) {
    console.log('❌ Erro na busca:', error.message)
  }
  
  console.log('\n📋 3. Testando com diferentes configurações...')
  
  // Teste com configuração alternativa
  const supabase2 = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'User-Agent': 'desenrola-dcl-local-test'
      }
    }
  })
  
  try {
    const { data, error } = await supabase2
      .rpc('now')  // Função simples que deve sempre funcionar
    
    if (error) {
      console.log('❌ Erro RPC:', error.message)
    } else {
      console.log('✅ RPC funcionando! Hora do servidor:', data)
    }
  } catch (error) {
    console.log('❌ Erro RPC:', error.message)
  }
  
  console.log('\n🏁 === TESTE CONCLUÍDO ===')
}

testarEspecifico().catch(console.error)