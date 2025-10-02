// Script para criar usuário de teste no Supabase
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Configurações:')
console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
console.log('Service Key:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida')

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Variáveis de ambiente não configuradas!')
  console.log('Verifique se o arquivo .env.local existe e tem as variáveis corretas.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarECriarUsuario() {
  console.log('🔍 Verificando usuários existentes...')
  
  try {
    // Verificar usuários existentes
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, email, nome, role, ativo, senha_hash')
      .eq('ativo', true)
    
    if (error) {
      console.log('❌ Erro ao buscar usuários:', error.message)
      return
    }

    console.log(`📊 Usuários encontrados: ${usuarios?.length || 0}`)
    
    if (usuarios && usuarios.length > 0) {
      console.log('👤 Usuários existentes:')
      usuarios.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.senha_hash ? 'COM SENHA' : 'SEM SENHA'}`)
      })
    }

    // Verificar se existe um usuário admin com senha
    const adminComSenha = usuarios?.find(u => u.role === 'dcl' && u.senha_hash)
    
    if (adminComSenha) {
      console.log('✅ Usuário admin com senha encontrado!')
      console.log('🔑 Você pode fazer login com:')
      console.log(`   Email: ${adminComSenha.email}`)
      console.log('   Senha: (a senha que foi definida anteriormente)')
      return
    }

    // Criar usuário de teste se não existir
    console.log('📝 Criando usuário de teste...')
    
    const senhaPlainText = '123456'
    const senhaHash = await bcrypt.hash(senhaPlainText, 12)
    
    const { data: novoUsuario, error: erroInsercao } = await supabase
      .from('usuarios')
      .insert({
        email: 'admin@dcl.com.br',
        nome: 'Administrador DCL',
        role: 'dcl',
        permissoes: ['admin'],
        ativo: true,
        senha_hash: senhaHash
      })
      .select()
      .single()

    if (erroInsercao) {
      console.log('❌ Erro ao criar usuário:', erroInsercao.message)
      return
    }

    console.log('✅ Usuário de teste criado com sucesso!')
    console.log('🔑 Dados para login:')
    console.log('   Email: admin@dcl.com.br')
    console.log('   Senha: 123456')
    console.log('')
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

verificarECriarUsuario()