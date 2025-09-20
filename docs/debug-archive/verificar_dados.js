// ================================================================
// SCRIPT PARA VERIFICAR DADOS REAIS DO BANCO - DESENROLA DCL
// ================================================================

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verificarBanco() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO BANCO DE DADOS')
  console.log('=' .repeat(60))
  
  try {
    // 1. VERIFICAR PEDIDOS
    console.log('\n📦 TABELA PEDIDOS:')
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, status, valor_pedido, created_at')
    
    if (pedidosError) {
      console.log('❌ Erro ao buscar pedidos:', pedidosError.message)
    } else {
      console.log(`   Total de registros: ${pedidos?.length || 0}`)
      
      if (pedidos && pedidos.length > 0) {
        const statusCount = {}
        let valorTotal = 0
        
        pedidos.forEach(pedido => {
          statusCount[pedido.status] = (statusCount[pedido.status] || 0) + 1
          valorTotal += pedido.valor_pedido || 0
        })
        
        console.log('   Status breakdown:')
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`)
        })
        
        console.log(`   Valor total: R$ ${valorTotal.toFixed(2)}`)
        console.log(`   Ticket médio: R$ ${(valorTotal / pedidos.length).toFixed(2)}`)
        
        console.log('\n   Últimos 3 pedidos:')
        pedidos.slice(0, 3).forEach(pedido => {
          console.log(`     ID: ${pedido.id} | Status: ${pedido.status} | Valor: R$ ${pedido.valor_pedido || 0} | Data: ${pedido.created_at?.split('T')[0]}`)
        })
      }
    }

    // 2. VERIFICAR LABORATÓRIOS
    console.log('\n🏭 TABELA LABORATÓRIOS:')
    const { data: labs, error: labsError } = await supabase
      .from('laboratorios')
      .select('id, nome, ativo')
    
    if (labsError) {
      console.log('❌ Erro ao buscar laboratórios:', labsError.message)
    } else {
      const ativos = labs?.filter(lab => lab.ativo).length || 0
      console.log(`   Total de registros: ${labs?.length || 0}`)
      console.log(`   Ativos: ${ativos}`)
      console.log(`   Inativos: ${(labs?.length || 0) - ativos}`)
      
      if (labs && labs.length > 0) {
        console.log('   Laboratórios ativos:')
        labs.filter(lab => lab.ativo).forEach(lab => {
          console.log(`     - ${lab.nome}`)
        })
      }
    }

    // 3. VERIFICAR LOJAS
    console.log('\n🏪 TABELA LOJAS:')
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
    
    if (lojasError) {
      console.log('❌ Erro ao buscar lojas:', lojasError.message)
    } else {
      const ativas = lojas?.filter(loja => loja.ativo).length || 0
      console.log(`   Total de registros: ${lojas?.length || 0}`)
      console.log(`   Ativas: ${ativas}`)
      console.log(`   Inativas: ${(lojas?.length || 0) - ativas}`)
    }

    // 4. VERIFICAR USUÁRIOS
    console.log('\n👥 TABELA USUÁRIOS:')
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, email, role')
    
    if (usuariosError) {
      console.log('❌ Erro ao buscar usuários:', usuariosError.message)
    } else {
      console.log(`   Total de registros: ${usuarios?.length || 0}`)
      
      if (usuarios && usuarios.length > 0) {
        const roleCount = {}
        usuarios.forEach(usuario => {
          roleCount[usuario.role] = (roleCount[usuario.role] || 0) + 1
        })
        
        console.log('   Roles breakdown:')
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`     ${role}: ${count}`)
        })
      }
    }

    // 5. VERIFICAR VIEW DE KPIS (se existir)
    console.log('\n📊 VIEW v_kpis_dashboard:')
    const { data: kpis, error: kpisError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .limit(1)
      .single()
    
    if (kpisError) {
      console.log('❌ View não existe ou erro:', kpisError.message)
    } else if (kpis) {
      console.log('   ✅ View encontrada com dados:')
      console.log(`     Total pedidos: ${kpis.total_pedidos || 0}`)
      console.log(`     Entregues: ${kpis.entregues || 0}`)
      console.log(`     Lead time médio: ${(kpis.lead_time_medio || 0).toFixed(1)} dias`)
      console.log(`     SLA Compliance: ${(kpis.sla_compliance || 0).toFixed(1)}%`)
      console.log(`     Labs ativos: ${kpis.labs_ativos || 0}`)
      console.log(`     Valor total vendas: R$ ${(kpis.valor_total_vendas || 0).toFixed(2)}`)
      console.log(`     Ticket médio: R$ ${(kpis.ticket_medio || 0).toFixed(2)}`)
    }

    // 6. RESUMO FINAL
    console.log('\n' + '=' .repeat(60))
    console.log('📋 RESUMO EXECUTIVO:')
    
    const totalPedidos = pedidos?.length || 0
    const totalLabs = labs?.filter(lab => lab.ativo).length || 0
    const totalLojas = lojas?.filter(loja => loja.ativo).length || 0
    const totalUsuarios = usuarios?.length || 0
    
    if (totalPedidos === 0 && totalLabs === 0 && totalLojas === 0 && totalUsuarios === 0) {
      console.log('🔴 BANCO COMPLETAMENTE VAZIO - Todos os dados foram limpos')
    } else if (totalPedidos === 0) {
      console.log('🟡 PEDIDOS VAZIOS - Mas existem dados mestres (labs, lojas, usuários)')
      console.log(`   Laboratórios ativos: ${totalLabs}`)
      console.log(`   Lojas ativas: ${totalLojas}`)
      console.log(`   Usuários: ${totalUsuarios}`)
    } else {
      console.log('🟢 BANCO COM DADOS')
      console.log(`   Pedidos: ${totalPedidos}`)
      console.log(`   Laboratórios ativos: ${totalLabs}`)
      console.log(`   Lojas ativas: ${totalLojas}`)
      console.log(`   Usuários: ${totalUsuarios}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarBanco()