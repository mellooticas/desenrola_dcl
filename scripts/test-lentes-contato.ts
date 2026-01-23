/**
 * 🧪 Script de teste: Lentes de Contato
 * Verifica dados disponíveis na view v_lentes_contato
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const lentesClient = createClient(
  process.env.NEXT_PUBLIC_LENTES_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY || ''
)

async function testLentesContato() {
  console.log('🔍 Verificando lentes de contato...\n')

  // 1. Contagem geral
  const { data: stats, error: statsError } = await lentesClient
    .from('v_lentes_contato')
    .select('*', { count: 'exact', head: true })

  if (statsError) {
    console.error('❌ Erro ao buscar stats:', statsError)
    return
  }

  console.log(`📊 Total de lentes de contato: ${stats ?? 0}\n`)

  // 2. Buscar fornecedores
  const { data: fornecedores, error: fornError } = await lentesClient
    .from('v_lentes_contato')
    .select('fornecedor_id, fornecedor_nome')

  if (fornError) {
    console.error('❌ Erro ao buscar fornecedores:', fornError)
    return
  }

  // Agrupar fornecedores
  const fornecedoresMap = new Map()
  fornecedores?.forEach((item) => {
    if (item.fornecedor_id) {
      fornecedoresMap.set(item.fornecedor_id, item.fornecedor_nome)
    }
  })

  console.log(`🏭 Total de fornecedores: ${fornecedoresMap.size}`)
  fornecedoresMap.forEach((nome, id) => {
    console.log(`  - ${nome} (${id})`)
  })
  console.log('')

  // 3. Listar tipos de lentes
  const { data: tipos, error: tiposError } = await lentesClient
    .from('v_lentes_contato')
    .select('tipo_lente_contato, design_lente')

  if (tiposError) {
    console.error('❌ Erro ao buscar tipos:', tiposError)
    return
  }

  const tiposMap = new Map()
  tipos?.forEach((item) => {
    const key = `${item.tipo_lente_contato} - ${item.design_lente}`
    tiposMap.set(key, (tiposMap.get(key) || 0) + 1)
  })

  console.log('🔖 Tipos de lentes disponíveis:')
  tiposMap.forEach((count, tipo) => {
    console.log(`  - ${tipo}: ${count} produtos`)
  })
  console.log('')

  // 4. Exemplo de produto
  const { data: exemplo, error: exemploError } = await lentesClient
    .from('v_lentes_contato')
    .select('*')
    .limit(1)
    .single()

  if (exemploError) {
    console.error('❌ Erro ao buscar exemplo:', exemploError)
    return
  }

  console.log('📦 Exemplo de produto:')
  console.log(JSON.stringify(exemplo, null, 2))
}

testLentesContato()
