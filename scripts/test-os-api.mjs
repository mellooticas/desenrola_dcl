// 🧪 TESTE DE API - OS CONTROL
// ============================
// Testa se os dados chegam do Supabase
// ============================

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar .env.local
config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

console.log('🔍 Testando conexão com Supabase...\n')
console.log('✅ Supabase URL:', SUPABASE_URL, '\n')

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

// 1️⃣ Testar view_os_gaps
async function testViewOSGaps() {
  console.log('📊 Testando view_os_gaps...')
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_os_gaps?select=count`,
      { headers }
    )
    const data = await response.json()
    console.log('Resposta:', data)
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// 2️⃣ Testar view_os_gaps com filtro Suzano
async function testViewOSGapsSuzano() {
  console.log('📊 Testando view_os_gaps (Suzano)...')
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&limit=5`,
      { headers }
    )
    const data = await response.json()
    console.log('Total retornado:', data.length)
    console.log('Primeiros registros:', data.slice(0, 2))
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// 3️⃣ Testar view_os_estatisticas
async function testViewEstatisticas() {
  console.log('📊 Testando view_os_estatisticas...')
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_os_estatisticas?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55`,
      { headers }
    )
    const data = await response.json()
    console.log('Estatísticas:', data)
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// 4️⃣ Testar OSs pendentes
async function testOSPendentes() {
  console.log('📊 Testando OSs pendentes...')
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&precisa_atencao=eq.true&order=numero_os.asc&limit=5&select=numero_os,status`,
      { headers }
    )
    const data = await response.json()
    console.log('Primeiras 5 OSs pendentes:', data)
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// 5️⃣ Testar contagem com Prefer: count=exact
async function testCount() {
  console.log('📊 Testando contagem de pendentes...')
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&precisa_atencao=eq.true`,
      { 
        headers: {
          ...headers,
          'Prefer': 'count=exact'
        }
      }
    )
    const contentRange = response.headers.get('content-range')
    console.log('Content-Range:', contentRange)
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// Executar todos os testes
async function runAllTests() {
  await testViewOSGaps()
  await testViewOSGapsSuzano()
  await testViewEstatisticas()
  await testOSPendentes()
  await testCount()
  
  console.log('✅ Testes concluídos!\n')
  console.log('📝 Análise:')
  console.log('  - Se retornou dados: problema está nos hooks React')
  console.log('  - Se retornou erro: problema de autenticação/RLS')
  console.log('  - Se retornou vazio: RLS ainda bloqueando')
}

runAllTests()
