/**
 * 🔍 INVESTIGAÇÃO AVANÇADA: Análise Cross-Database de Lojas
 * 
 * OBJETIVO: Identificar padrão e fonte da verdade ANTES de sincronizar
 * ESTRATÉGIA: Comparar por NOME (não ID) para mapear correspondências
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// ============================================================
// CLIENTES SUPABASE
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
// NORMALIZAÇÃO DE NOMES
// ============================================================

function normalizarNome(nome) {
  if (!nome) return ''
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/mello oticas/gi, 'mello')
    .replace(/lancaster/gi, 'lancaster')
    .replace(/\s*-\s*/g, ' ') // Remove hífens
    .trim()
}

// ============================================================
// BUSCA EM CADA BANCO
// ============================================================

async function buscarTodasLojas() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║       🔍 INVESTIGAÇÃO COMPLETA - TODOS OS BANCOS          ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // BANCO 1: desenrola_dcl
  console.log('1️⃣ DESENROLA_DCL (banco principal - pedidos/kanban)')
  let lojasDesenrola = []
  try {
    const { data, error } = await desenrolaDclClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (error) throw error
    
    lojasDesenrola = data.map(l => ({
      banco: 'desenrola_dcl',
      id: l.id,
      nome: l.nome,
      nome_normalizado: normalizarNome(l.nome),
      ativo: l.ativo,
      campos_extras: {
        codigo: l.codigo,
        endereco: l.endereco,
        telefone: l.telefone,
        gerente: l.gerente
      }
    }))
    
    console.log(`   ✅ ${lojasDesenrola.length} lojas encontradas`)
    lojasDesenrola.forEach(l => console.log(`      - ${l.nome} (${l.id})`))
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`)
  }

  // BANCO 2: crm_erp
  console.log('\n2️⃣ CRM_ERP (produtos e estoque)')
  let lojasCrmErp = []
  try {
    const { data, error } = await crmErpClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (error) throw error
    
    lojasCrmErp = data.map(l => ({
      banco: 'crm_erp',
      id: l.id || l.loja_id,
      nome: l.nome || l.loja_nome,
      nome_normalizado: normalizarNome(l.nome || l.loja_nome),
      ativo: l.ativo !== false,
      campos_extras: {
        cnpj: l.cnpj,
        endereco: l.endereco,
        cidade: l.cidade,
        estado: l.estado
      }
    }))
    
    console.log(`   ✅ ${lojasCrmErp.length} lojas encontradas`)
    lojasCrmErp.forEach(l => console.log(`      - ${l.nome} (${l.id})`))
    
    // Contar produtos por loja
    const { data: produtosData } = await crmErpClient
      .from('vw_estoque_completo')
      .select('loja_id, produto_id')
    
    const produtosPorLoja = {}
    produtosData?.forEach(p => {
      if (p.loja_id) {
        produtosPorLoja[p.loja_id] = (produtosPorLoja[p.loja_id] || 0) + 1
      }
    })
    
    console.log('\n   📦 Produtos por loja:')
    lojasCrmErp.forEach(l => {
      const qtd = produtosPorLoja[l.id] || 0
      console.log(`      - ${l.nome}: ${qtd} produtos`)
    })
    
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`)
  }

  // BANCO 3: sis_lens
  console.log('\n3️⃣ SIS_LENS (catálogo de lentes)')
  let lojasSisLens = []
  try {
    // Tentar buscar tabela lojas
    const { data: lojasData, error: lojasError } = await sisLensClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (!lojasError && lojasData) {
      lojasSisLens = lojasData.map(l => ({
        banco: 'sis_lens',
        id: l.id || l.loja_id,
        nome: l.nome || l.loja_nome,
        nome_normalizado: normalizarNome(l.nome || l.loja_nome),
        ativo: l.ativo !== false
      }))
      
      console.log(`   ✅ ${lojasSisLens.length} lojas encontradas`)
      lojasSisLens.forEach(l => console.log(`      - ${l.nome} (${l.id})`))
    } else {
      console.log('   ℹ️ Sem tabela lojas (catálogo global compartilhado)')
    }
  } catch (err) {
    console.log(`   ℹ️ ${err.message}`)
  }

  // BANCO 4: sis_vendas
  console.log('\n4️⃣ SIS_VENDAS (PDV e vendas)')
  let lojasSisVendas = []
  try {
    const { data: lojasData, error: lojasError } = await sisVendasClient
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (!lojasError && lojasData) {
      lojasSisVendas = lojasData.map(l => ({
        banco: 'sis_vendas',
        id: l.id || l.loja_id,
        nome: l.nome || l.loja_nome,
        nome_normalizado: normalizarNome(l.nome || l.loja_nome),
        ativo: l.ativo !== false,
        campos_extras: {
          cnpj: l.cnpj,
          codigo: l.codigo
        }
      }))
      
      console.log(`   ✅ ${lojasSisVendas.length} lojas encontradas`)
      lojasSisVendas.forEach(l => console.log(`      - ${l.nome} (${l.id})`))
      
      // Contar vendas por loja
      const { data: vendasData } = await sisVendasClient
        .from('vendas')
        .select('loja_id')
        .not('loja_id', 'is', null)
      
      const vendasPorLoja = {}
      vendasData?.forEach(v => {
        vendasPorLoja[v.loja_id] = (vendasPorLoja[v.loja_id] || 0) + 1
      })
      
      console.log('\n   💰 Vendas por loja:')
      lojasSisVendas.forEach(l => {
        const qtd = vendasPorLoja[l.id] || 0
        console.log(`      - ${l.nome}: ${qtd} vendas`)
      })
      
    } else {
      console.log('   ⚠️ Tabela lojas não encontrada, buscando via vendas...')
      
      const { data: vendasData } = await sisVendasClient
        .from('vendas')
        .select('loja_id')
        .not('loja_id', 'is', null)
      
      const lojasUnicas = [...new Set(vendasData?.map(v => v.loja_id) || [])]
      
      lojasSisVendas = lojasUnicas.map(id => ({
        banco: 'sis_vendas',
        id,
        nome: 'Loja ID via vendas',
        nome_normalizado: '',
        ativo: true
      }))
      
      console.log(`   ✅ ${lojasSisVendas.length} lojas encontradas via vendas`)
      lojasSisVendas.forEach(l => console.log(`      - ID: ${l.id}`))
    }
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`)
  }

  return {
    desenrola_dcl: lojasDesenrola,
    crm_erp: lojasCrmErp,
    sis_lens: lojasSisLens,
    sis_vendas: lojasSisVendas
  }
}

// ============================================================
// ANÁLISE DE CORRESPONDÊNCIAS
// ============================================================

function analisarCorrespondencias(lojasPorBanco) {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗')
  console.log('║          📊 ANÁLISE DE CORRESPONDÊNCIAS POR NOME          ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const todasLojas = [
    ...lojasPorBanco.desenrola_dcl,
    ...lojasPorBanco.crm_erp,
    ...lojasPorBanco.sis_lens,
    ...lojasPorBanco.sis_vendas
  ]

  // Agrupar por nome normalizado
  const lojasPorNome = {}
  
  todasLojas.forEach(loja => {
    const nomeNorm = loja.nome_normalizado
    if (!nomeNorm) return
    
    if (!lojasPorNome[nomeNorm]) {
      lojasPorNome[nomeNorm] = {
        nome_original: loja.nome,
        desenrola_dcl: null,
        crm_erp: null,
        sis_lens: null,
        sis_vendas: null
      }
    }
    
    lojasPorNome[nomeNorm][loja.banco] = {
      id: loja.id,
      nome: loja.nome,
      ativo: loja.ativo,
      extras: loja.campos_extras
    }
  })

  // Exibir correspondências
  const nomesOrdenados = Object.keys(lojasPorNome).sort()
  
  nomesOrdenados.forEach(nomeNorm => {
    const info = lojasPorNome[nomeNorm]
    const bancos = Object.keys(info).filter(k => k !== 'nome_original' && info[k] !== null)
    
    console.log(`\n🏪 ${info.nome_original.toUpperCase()}`)
    console.log(`   Aparece em: ${bancos.length} banco(s) → ${bancos.join(', ')}`)
    
    if (info.desenrola_dcl) {
      console.log(`   ├─ desenrola_dcl: ${info.desenrola_dcl.id}`)
    } else {
      console.log(`   ├─ desenrola_dcl: ❌ NÃO EXISTE`)
    }
    
    if (info.crm_erp) {
      console.log(`   ├─ crm_erp:       ${info.crm_erp.id}`)
    } else {
      console.log(`   ├─ crm_erp:       ❌ NÃO EXISTE`)
    }
    
    if (info.sis_lens) {
      console.log(`   ├─ sis_lens:      ${info.sis_lens.id}`)
    } else {
      console.log(`   ├─ sis_lens:      - (não aplicável)`)
    }
    
    if (info.sis_vendas) {
      console.log(`   └─ sis_vendas:    ${info.sis_vendas.id}`)
    } else {
      console.log(`   └─ sis_vendas:    ❌ NÃO EXISTE`)
    }
    
    // Verificar se IDs são iguais
    const ids = [
      info.desenrola_dcl?.id,
      info.crm_erp?.id,
      info.sis_vendas?.id
    ].filter(Boolean)
    
    const idsUnicos = [...new Set(ids)]
    
    if (idsUnicos.length === 1) {
      console.log(`   ✅ IDs IDÊNTICOS em todos os bancos!`)
    } else if (idsUnicos.length > 1) {
      console.log(`   ⚠️ CONFLITO: ${idsUnicos.length} IDs diferentes`)
    }
  })

  return lojasPorNome
}

// ============================================================
// RECOMENDAÇÕES
// ============================================================

function gerarRecomendacoes(lojasPorBanco, lojasPorNome) {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗')
  console.log('║                  💡 RECOMENDAÇÕES                          ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const totalDesenrola = lojasPorBanco.desenrola_dcl.length
  const totalCrmErp = lojasPorBanco.crm_erp.length
  const totalSisVendas = lojasPorBanco.sis_vendas.length

  console.log('📊 RESUMO QUANTITATIVO:')
  console.log(`   - desenrola_dcl: ${totalDesenrola} lojas`)
  console.log(`   - crm_erp:       ${totalCrmErp} lojas`)
  console.log(`   - sis_vendas:    ${totalSisVendas} lojas`)
  console.log(`   - sis_lens:      N/A (catálogo global)`)

  // Determinar fonte da verdade
  console.log('\n🎯 FONTE DA VERDADE RECOMENDADA:')
  
  if (totalDesenrola >= totalCrmErp && totalDesenrola >= totalSisVendas) {
    console.log('   ✅ desenrola_dcl (banco principal)')
    console.log('   Motivo: Maior número de lojas e é o banco principal do sistema')
    console.log('\n   📝 AÇÃO: Copiar lojas do desenrola_dcl para os demais bancos')
  } else if (totalCrmErp > totalDesenrola) {
    console.log('   ⚠️ crm_erp tem mais lojas!')
    console.log('   Motivo: CRM_ERP tem dados de produtos')
    console.log('\n   📝 AÇÃO: Copiar lojas do crm_erp para desenrola_dcl')
  }

  // Listar lojas que faltam em cada banco
  const nomesNormalizados = Object.keys(lojasPorNome)
  
  console.log('\n🔧 LOJAS QUE PRECISAM SER ADICIONADAS:')
  
  // Faltando no desenrola_dcl
  const faltamDesenrola = nomesNormalizados.filter(n => !lojasPorNome[n].desenrola_dcl)
  if (faltamDesenrola.length > 0) {
    console.log(`\n   desenrola_dcl (${faltamDesenrola.length} faltando):`)
    faltamDesenrola.forEach(n => {
      const fonte = lojasPorNome[n].crm_erp || lojasPorNome[n].sis_vendas
      console.log(`      + ${lojasPorNome[n].nome_original} (copiar de: ${fonte ? fonte.id : 'N/A'})`)
    })
  }
  
  // Faltando no crm_erp
  const faltamCrmErp = nomesNormalizados.filter(n => !lojasPorNome[n].crm_erp)
  if (faltamCrmErp.length > 0) {
    console.log(`\n   crm_erp (${faltamCrmErp.length} faltando):`)
    faltamCrmErp.forEach(n => {
      const fonte = lojasPorNome[n].desenrola_dcl
      console.log(`      + ${lojasPorNome[n].nome_original} (copiar de: ${fonte ? fonte.id : 'N/A'})`)
    })
  }
  
  // Faltando no sis_vendas
  const faltamSisVendas = nomesNormalizados.filter(n => !lojasPorNome[n].sis_vendas)
  if (faltamSisVendas.length > 0) {
    console.log(`\n   sis_vendas (${faltamSisVendas.length} faltando):`)
    faltamSisVendas.forEach(n => {
      const fonte = lojasPorNome[n].desenrola_dcl || lojasPorNome[n].crm_erp
      console.log(`      + ${lojasPorNome[n].nome_original} (copiar de: ${fonte ? fonte.id : 'N/A'})`)
    })
  }

  console.log('\n')
}

// ============================================================
// EXECUTAR
// ============================================================

async function main() {
  const lojasPorBanco = await buscarTodasLojas()
  const lojasPorNome = analisarCorrespondencias(lojasPorBanco)
  gerarRecomendacoes(lojasPorBanco, lojasPorNome)
  
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                    ✅ INVESTIGAÇÃO COMPLETA                ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
}

main().catch(console.error)
