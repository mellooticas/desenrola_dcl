/**
 * 🔍 PRÉ-MIGRAÇÃO: Validação antes de executar mudanças
 * 
 * Executa verificações no desenrola_dcl para garantir que
 * a migração pode ser feita com segurança.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

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

async function validarPreMigracao() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║         🔍 VALIDAÇÃO PRÉ-MIGRAÇÃO                         ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  let avisos = []
  let erros = []

  // 1. Verificar lojas atuais no desenrola_dcl
  console.log('1️⃣ Lojas atuais no desenrola_dcl:')
  const { data: lojasAtuais } = await desenrolaDclClient
    .from('lojas')
    .select('id, nome, ativo')
    .order('nome')
  
  lojasAtuais?.forEach(l => console.log(`   - ${l.nome} (${l.id})`))

  // 2. Verificar lojas do padrão CRM_ERP
  console.log('\n2️⃣ Lojas do padrão CRM_ERP (será copiado):')
  const { data: lojasCrm } = await crmErpClient
    .from('lojas')
    .select('id, nome, ativo')
    .order('nome')
  
  lojasCrm?.forEach(l => console.log(`   - ${l.nome} (${l.id})`))

  // 3. Contar pedidos por loja atual
  console.log('\n3️⃣ Pedidos existentes por loja:')
  const { data: pedidosPorLoja } = await desenrolaDclClient
    .from('pedidos')
    .select('loja_id')
  
  const contagem = {}
  pedidosPorLoja?.forEach(p => {
    contagem[p.loja_id] = (contagem[p.loja_id] || 0) + 1
  })
  
  const totalPedidos = pedidosPorLoja?.length || 0
  console.log(`   Total de pedidos: ${totalPedidos}`)
  
  for (const [lojaId, qtd] of Object.entries(contagem)) {
    const loja = lojasAtuais?.find(l => l.id === lojaId)
    console.log(`   - ${loja?.nome || lojaId}: ${qtd} pedidos`)
  }

  // 4. Verificar se há pedidos órfãos
  console.log('\n4️⃣ Verificando integridade referencial:')
  const pedidosOrfaos = pedidosPorLoja?.filter(p => {
    return !lojasAtuais?.some(l => l.id === p.loja_id)
  }).length || 0
  
  if (pedidosOrfaos > 0) {
    erros.push(`${pedidosOrfaos} pedidos com loja_id inválido!`)
    console.log(`   ❌ ${pedidosOrfaos} pedidos órfãos encontrados!`)
  } else {
    console.log(`   ✅ Todos os pedidos têm loja_id válido`)
  }

  // 5. Verificar outras tabelas com loja_id
  console.log('\n5️⃣ Outras tabelas que usam loja_id:')
  const tabelasComLojaId = [
    'usuarios',
    'laboratorios',
    'fornecedores'
  ]
  
  for (const tabela of tabelasComLojaId) {
    try {
      const { count } = await desenrolaDclClient
        .from(tabela)
        .select('*', { count: 'exact', head: true })
      
      console.log(`   - ${tabela}: ${count || 0} registros`)
      
      if (count && count > 0) {
        avisos.push(`Verificar se ${tabela} precisa atualizar loja_id`)
      }
    } catch (err) {
      console.log(`   - ${tabela}: tabela não existe`)
    }
  }

  // 6. Mapeamento proposto
  console.log('\n6️⃣ Mapeamento de lojas (antigo → novo):')
  const mapeamento = [
    { antigo: 'Suzano', antigoId: 'e5915ba4...', novo: 'Lancaster - Suzano', novoId: 'bab835bc...' },
    { antigo: 'Mauá', antigoId: 'c1aa5124...', novo: 'Lancaster - Mauá', novoId: 'f8302fdd...' },
    { antigo: 'Perus', antigoId: 'f1dd8fe9...', novo: 'Mello Óticas - Perus', novoId: 'f03f5cc3...' },
    { antigo: 'Rio Pequeno', antigoId: 'c2bb8806...', novo: 'Mello Óticas - Rio Pequeno', novoId: '069c77db...' },
    { antigo: 'São Mateus', antigoId: '626c4397...', novo: 'Mello Óticas - São Mateus', novoId: 'f2a684b9...' },
    { antigo: 'Escritório Central', antigoId: 'e974fc5d...', novo: 'Mello Óticas - Escritório', novoId: '534cba2b...' },
    { antigo: 'Suzano Centro', antigoId: 'cb8ebda2...', novo: 'Mello Óticas - Suzano II', novoId: 'f333a360...' }
  ]
  
  mapeamento.forEach(m => {
    console.log(`   ${m.antigo} → ${m.novo}`)
  })

  // 7. Resumo
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                    📊 RESUMO                               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  console.log(`Lojas atuais:     ${lojasAtuais?.length || 0}`)
  console.log(`Lojas CRM (novo): ${lojasCrm?.length || 0}`)
  console.log(`Total pedidos:    ${totalPedidos}`)
  console.log(`Avisos:           ${avisos.length}`)
  console.log(`Erros críticos:   ${erros.length}`)

  if (erros.length > 0) {
    console.log('\n❌ ERROS CRÍTICOS:')
    erros.forEach(e => console.log(`   - ${e}`))
    console.log('\n⚠️ CORRIJA OS ERROS ANTES DE MIGRAR!')
    return false
  }

  if (avisos.length > 0) {
    console.log('\n⚠️ AVISOS:')
    avisos.forEach(a => console.log(`   - ${a}`))
  }

  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║              ✅ PRONTO PARA MIGRAÇÃO                       ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  console.log('Próximos passos:')
  console.log('1. Fazer backup manual do banco desenrola_dcl (via Supabase Dashboard)')
  console.log('2. Executar: database/MIGRAR-LOJAS-PARA-PADRAO-CRM.sql')
  console.log('3. Testar wizard de nova ordem')
  console.log('4. Verificar filtros de armações\n')
  
  return true
}

validarPreMigracao().catch(console.error)
