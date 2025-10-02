// Teste para validar especificamente o Service Role Key
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env.local' })

function verificarJWT() {
  console.log('🔍 === ANÁLISE DO SERVICE ROLE KEY ===\n')
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!serviceKey || !anonKey) {
    console.log('❌ Chaves não encontradas!')
    return
  }
  
  console.log('🔧 1. Analisando Anon Key:')
  try {
    const anonDecoded = jwt.decode(anonKey)
    console.log('   Projeto:', anonDecoded?.ref)
    console.log('   Role:', anonDecoded?.role)
    console.log('   Emitido em:', new Date(anonDecoded?.iat * 1000).toLocaleString())
    console.log('   Expira em:', new Date(anonDecoded?.exp * 1000).toLocaleString())
    console.log('   Status:', new Date(anonDecoded?.exp * 1000) > new Date() ? '✅ Válido' : '❌ Expirado')
  } catch (error) {
    console.log('   ❌ Erro ao decodificar:', error.message)
  }
  
  console.log('\n🔐 2. Analisando Service Role Key:')
  try {
    const serviceDecoded = jwt.decode(serviceKey)
    console.log('   Projeto:', serviceDecoded?.ref)
    console.log('   Role:', serviceDecoded?.role)
    console.log('   Emitido em:', new Date(serviceDecoded?.iat * 1000).toLocaleString())
    console.log('   Expira em:', new Date(serviceDecoded?.exp * 1000).toLocaleString())
    console.log('   Status:', new Date(serviceDecoded?.exp * 1000) > new Date() ? '✅ Válido' : '❌ Expirado')
    
    // Verificar se ambas as chaves são do mesmo projeto
    if (anonDecoded?.ref === serviceDecoded?.ref) {
      console.log('   ✅ Mesmo projeto que Anon Key')
    } else {
      console.log('   ❌ Projeto DIFERENTE do Anon Key!')
    }
  } catch (error) {
    console.log('   ❌ Erro ao decodificar:', error.message)
  }
  
  console.log('\n📊 3. Comparação:')
  console.log('   Anon Key:    ', anonKey.substring(0, 50) + '...')
  console.log('   Service Key: ', serviceKey.substring(0, 50) + '...')
  
  console.log('\n🏁 === ANÁLISE CONCLUÍDA ===')
}

// Verificar se jsonwebtoken está disponível
try {
  verificarJWT()
} catch (error) {
  console.log('❌ Erro: jsonwebtoken não encontrado')
  console.log('💡 Execute: npm install jsonwebtoken')
}