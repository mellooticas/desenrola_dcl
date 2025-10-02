// Teste específico para verificar se conseguimos buscar os usuários reais
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function testeCompleto() {
  console.log('🔍 === TESTE COMPLETO DE CONECTIVIDADE ===')
  
  // 1. Verificar variáveis de ambiente
  console.log('\n📋 1. Variáveis de Ambiente:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Variáveis de ambiente não configuradas!')
    return
  }

  // 2. Teste com Service Role Key (admin)
  console.log('\n🔧 2. Teste com Service Role Key (admin):')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nome, role, ativo, senha_hash')
      .eq('ativo', true)
      .order('email')

    if (error) {
      console.log('❌ Erro Service Role:', error.message)
    } else {
      console.log('✅ Service Role funcionando!')
      console.log(`📊 Usuários encontrados: ${usuarios?.length || 0}`)
      
      if (usuarios && usuarios.length > 0) {
        console.log('\n👥 Usuários no banco:')
        usuarios.forEach((user, index) => {
          const temSenha = user.senha_hash && user.senha_hash.length > 0
          console.log(`  ${index + 1}. ${user.email} (${user.role}) - ${temSenha ? '🔐 Com senha' : '❌ Sem senha'}`)
        })
        
        // 3. Teste específico do usuário Junior
        console.log('\n🎯 3. Teste específico do usuário Junior:')
        const userJunior = usuarios.find(u => u.email === 'junior@oticastatymello.com.br')
        if (userJunior) {
          console.log('✅ Usuário Junior encontrado!')
          console.log('📧 Email:', userJunior.email)
          console.log('👤 Nome:', userJunior.nome)
          console.log('🎭 Role:', userJunior.role)
          console.log('🔐 Tem senha:', userJunior.senha_hash ? 'Sim' : 'Não')
          
          // 4. Teste de verificação da senha
          if (userJunior.senha_hash) {
            console.log('\n🔍 4. Teste de verificação da senha:')
            try {
              const senhaTestada = 'DCL@2025#c09ef0'
              const senhaCorreta = await bcrypt.compare(senhaTestada, userJunior.senha_hash)
              console.log(`🔑 Senha "${senhaTestada}":`, senhaCorreta ? '✅ CORRETA' : '❌ INCORRETA')
            } catch (error) {
              console.log('❌ Erro ao verificar senha:', error.message)
            }
          } else {
            console.log('❌ Usuário sem senha definida!')
          }
        } else {
          console.log('❌ Usuário Junior NÃO encontrado!')
        }
      }
    }
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message)
  }

  // 5. Teste com Anon Key (cliente)
  console.log('\n🌐 5. Teste com Anon Key (cliente):')
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('email')
      .limit(1)

    if (error) {
      console.log('⚠️  Anon Key limitada (normal):', error.message)
    } else {
      console.log('✅ Anon Key funcionando!')
    }
  } catch (error) {
    console.log('❌ Erro Anon Key:', error.message)
  }

  console.log('\n🏁 === TESTE CONCLUÍDO ===')
}

testeCompleto().catch(console.error)