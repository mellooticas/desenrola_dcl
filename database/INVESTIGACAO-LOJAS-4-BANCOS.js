/**
 * 🔍 INVESTIGAÇÃO: Comparar lojas nos 4 bancos Supabase
 * 
 * PROBLEMA: Cada banco tem suas próprias lojas com IDs diferentes
 * OBJETIVO: Mapear e sincronizar loja_id entre os bancos
 * 
 * BANCOS:
 * 1. desenrola_dcl (zobgyjsocqmzaggrnwqd) - Banco principal, pedidos, kanban
 * 2. crm_erp (mhgbuplnxtfgipbemchb) - Produtos e estoque de armações
 * 3. sis_lens (ahcikwsoxhmqqteertkx) - Catálogo de lentes
 * 4. sis_vendas (jrhevexrzaoeyhmpwvgs) - PDV e vendas
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// ============================================================
// CONFIGURAÇÃO DOS 4 CLIENTES
// ============================================================

const desenrolaDclClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false }, db: { schema: 'public' } }
)

const crmErpClient = createClient(
  process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY,
  { auth: { persistSession: false }, db: { schema: 'public' } }
)

const sisLensClient = createClient(
  process.env.NEXT_PUBLIC_LENTES_SUPABASE_URL,
  process.env.NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY,
  { auth: { persistSession: false }, db: { schema: 'public' } }
)

const sisVendasClient = createClient(
  process.env.NEXT_PUBLIC_SIS_VENDAS_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SIS_VENDAS_SUPABASE_ANON_KEY,
  { auth: { persistSession: false }, db: { schema: 'public' } }
)

// ============================================================
// FUNÇÕES DE INVESTIGAÇÃO
// ============================================================

async function buscarLojasDesenrolaDcl() {
  console.log('\n=== 1️⃣ BANCO PRINCIPAL (desenrola_dcl) ===')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  try {
    const { data, error } = await desenrolaDclClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return []
    }
    
    console.log(`✅ Total: ${data.length} lojas`)
    if (data.length > 0) {
      console.log('   Campos disponíveis:', Object.keys(data[0]).join(', '))
    }
    data.forEach(l => {
      console.log(`   - ${l.nome || l.loja_nome || 'Sem nome'}`)
      console.log(`     ID: ${l.id || l.loja_id}`)
      console.log(`     Status: ${l.ativo ? 'ATIVA' : 'INATIVA'}`)
    })
    
    return data
  } catch (err) {
    console.error('❌ Exceção:', err.message)
    return []
  }
}

async function buscarLojasCrmErp() {
  console.log('\n=== 2️⃣ BANCO CRM_ERP (produtos e estoque) ===')
  console.log('URL:', process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL)
  
  try {
    // Tenta buscar da tabela lojas primeiro
    const { data: lojasData, error: lojasError } = await crmErpClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (!lojasError && lojasData) {
      console.log(`✅ Total: ${lojasData.length} lojas na tabela 'lojas'`)
      lojasData.forEach(l => {
        console.log(`   - ${l.nome || l.loja_nome || 'Sem nome'} (ID: ${l.id || l.loja_id})`)
      })
      return lojasData
    }
    
    // Se não tem tabela lojas, busca loja_id únicos dos produtos
    console.log('⚠️ Tabela lojas não encontrada, buscando lojas via produtos...')
    
    const { data: produtosData, error: produtosError } = await crmErpClient
      .from('vw_estoque_completo')
      .select('loja_id')
      .not('loja_id', 'is', null)
    
    if (produtosError) {
      console.error('❌ Erro:', produtosError.message)
      return []
    }
    
    const lojasUnicas = [...new Set(produtosData.map(p => p.loja_id))]
    console.log(`✅ Total: ${lojasUnicas.length} lojas encontradas via produtos`)
    lojasUnicas.forEach(id => console.log(`   - Loja ID: ${id}`))
    
    return lojasUnicas.map(id => ({ id, nome: 'Desconhecido' }))
    
  } catch (err) {
    console.error('❌ Exceção:', err.message)
    return []
  }
}

async function buscarLojasSisLens() {
  console.log('\n=== 3️⃣ BANCO SIS_LENS (catálogo de lentes) ===')
  console.log('URL:', process.env.NEXT_PUBLIC_LENTES_SUPABASE_URL)
  console.log('⚠️ NOTA: sis_lens NÃO tem conceito de loja_id (catálogo compartilhado)')
  
  try {
    // sis_lens provavelmente não tem lojas, é um catálogo global
    const { data, error } = await sisLensClient
      .from('v_grupos_canonicos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao verificar:', error.message)
      return []
    }
    
    console.log('✅ Banco acessível - Catálogo de lentes é GLOBAL (sem loja_id)')
    return []
    
  } catch (err) {
    console.error('❌ Exceção:', err.message)
    return []
  }
}

async function buscarLojasSisVendas() {
  console.log('\n=== 4️⃣ BANCO SIS_VENDAS (PDV e vendas) ===')
  console.log('URL:', process.env.NEXT_PUBLIC_SIS_VENDAS_SUPABASE_URL)
  
  try {
    const { data, error } = await sisVendasClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('❌ Erro:', error.message)
      
      // Fallback: buscar por vendas
      console.log('⚠️ Tentando buscar lojas via tabela vendas...')
      const { data: vendasData, error: vendasError } = await sisVendasClient
        .from('vendas')
        .select('loja_id')
        .not('loja_id', 'is', null)
        .limit(100)
      
      if (vendasError) {
        console.error('❌ Erro no fallback:', vendasError.message)
        return []
      }
      
      const lojasUnicas = [...new Set(vendasData.map(v => v.loja_id))]
      console.log(`✅ Total: ${lojasUnicas.length} lojas encontradas via vendas`)
      lojasUnicas.forEach(id => console.log(`   - Loja ID: ${id}`))
      return lojasUnicas.map(id => ({ id, nome: 'Desconhecido' }))
    }
    
    console.log(`✅ Total: ${data.length} lojas`)
    data.forEach(l => {
      console.log(`   - ${l.nome || l.loja_nome} (ID: ${l.id || l.loja_id})`)
    })
    
    return data
    
  } catch (err) {
    console.error('❌ Exceção:', err.message)
    return []
  }
}

// ============================================================
// ANÁLISE E COMPARAÇÃO
// ============================================================

async function analisarSincronizacao() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║  🔍 INVESTIGAÇÃO: Sincronização de Lojas nos 4 Bancos    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  const lojasDesenrola = await buscarLojasDesenrolaDcl()
  const lojasCrmErp = await buscarLojasCrmErp()
  const lojasSisLens = await buscarLojasSisLens()
  const lojasSisVendas = await buscarLojasSisVendas()
  
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                   📊 RESUMO COMPARATIVO                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  console.log('\n1️⃣ desenrola_dcl:', lojasDesenrola.length, 'lojas')
  console.log('2️⃣ crm_erp:', lojasCrmErp.length, 'lojas')
  console.log('3️⃣ sis_lens:', lojasSisLens.length, 'lojas (catálogo global)')
  console.log('4️⃣ sis_vendas:', lojasSisVendas.length, 'lojas')
  
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║              🔄 ANÁLISE DE COINCIDÊNCIAS                   ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  const idsDesenrola = lojasDesenrola.map(l => l.id)
  const idsCrmErp = lojasCrmErp.map(l => l.id)
  const idsSisVendas = lojasSisVendas.map(l => l.id || l.loja_id)
  
  // IDs que aparecem em desenrola_dcl mas NÃO no crm_erp
  const soNoDesenrola = idsDesenrola.filter(id => !idsCrmErp.includes(id))
  
  // IDs que aparecem em crm_erp mas NÃO no desenrola_dcl
  const soNoCrmErp = idsCrmErp.filter(id => !idsDesenrola.includes(id))
  
  // IDs que aparecem nos 2 bancos
  const emComum = idsDesenrola.filter(id => idsCrmErp.includes(id))
  
  console.log('\n✅ Lojas em AMBOS (desenrola_dcl ∩ crm_erp):', emComum.length)
  emComum.forEach(id => {
    const lojaDesenrola = lojasDesenrola.find(l => l.id === id)
    console.log(`   - ${id} (${lojaDesenrola?.nome})`)
  })
  
  console.log('\n⚠️ Lojas APENAS no desenrola_dcl:', soNoDesenrola.length)
  soNoDesenrola.forEach(id => {
    const loja = lojasDesenrola.find(l => l.id === id)
    console.log(`   - ${id} (${loja?.nome}) ⚠️ SEM PRODUTOS NO CRM_ERP`)
  })
  
  console.log('\n⚠️ Lojas APENAS no crm_erp:', soNoCrmErp.length)
  soNoCrmErp.forEach(id => {
    console.log(`   - ${id} ⚠️ NÃO EXISTE NO BANCO PRINCIPAL`)
  })
  
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                  💡 RECOMENDAÇÕES                          ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  if (soNoDesenrola.length > 0) {
    console.log('\n🔧 AÇÃO 1: Inserir lojas no CRM_ERP')
    console.log('   As lojas do desenrola_dcl precisam ser replicadas no crm_erp.')
    console.log('   Script SQL necessário para copiar lojas.')
  }
  
  if (soNoCrmErp.length > 0) {
    console.log('\n🔧 AÇÃO 2: Inserir lojas no desenrola_dcl')
    console.log('   As lojas do crm_erp precisam ser adicionadas ao banco principal.')
    console.log('   Script SQL necessário para copiar lojas.')
  }
  
  if (emComum.length > 0) {
    console.log('\n✅ AÇÃO 3: Lojas sincronizadas')
    console.log(`   ${emComum.length} lojas já existem em ambos os bancos.`)
    console.log('   Verificar se dados (nome, CNPJ) estão idênticos.')
  }
  
  console.log('\n🎯 SOLUÇÃO IDEAL:')
  console.log('   1. Criar tabela "lojas" em TODOS os bancos com MESMO UUID')
  console.log('   2. Usar script de sincronização para manter dados atualizados')
  console.log('   3. Permitir busca cross-database com fallback (já implementado)')
  console.log('   4. Documentar qual banco é a "fonte da verdade" para lojas')
  
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                    FIM DA INVESTIGAÇÃO                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
}

// ============================================================
// EXECUTAR
// ============================================================

analisarSincronizacao().catch(console.error)
