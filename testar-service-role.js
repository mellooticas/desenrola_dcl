// Testar novo Service Role Key
const { createClient } = require('@supabase/supabase-js')

// URLs e keys corretas
const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function testarServiceRole() {
  console.log('🔑 Testando novo Service Role Key...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  try {
    // 1. Testar conexão básica
    console.log('\n1. Testando conexão...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Erro na conexão:', healthError.message)
      return false
    }
    console.log('✅ Conexão OK')

    // 2. Testar busca de usuários
    console.log('\n2. Testando busca de usuários...')
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, email, nome, role')
      .limit(5)

    if (usuariosError) {
      console.error('❌ Erro ao buscar usuários:', usuariosError.message)
      return false
    }
    
    console.log('✅ Usuários encontrados:', usuarios?.length || 0)
    if (usuarios && usuarios.length > 0) {
      usuarios.forEach(user => {
        console.log(`  - ${user.email} (${user.nome}) - Role: ${user.role}`)
      })
    }

    // 3. Testar busca do usuário específico
    console.log('\n3. Testando usuário junior@oticastatymello.com.br...')
    const { data: juniorUser, error: juniorError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'junior@oticastatymello.com.br')
      .single()

    if (juniorError) {
      console.error('❌ Erro ao buscar Junior:', juniorError.message)
      return false
    }

    if (juniorUser) {
      console.log('✅ Junior encontrado:')
      console.log(`  - ID: ${juniorUser.id}`)
      console.log(`  - Email: ${juniorUser.email}`)
      console.log(`  - Nome: ${juniorUser.nome}`)
      console.log(`  - Role: ${juniorUser.role}`)
    }

    console.log('\n🎉 Service Role Key está funcionando perfeitamente!')
    return true

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

testarServiceRole()