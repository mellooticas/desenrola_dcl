// Investigar dados específicos do Mission Control
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function investigarDadosMissoes() {
  console.log('🔍 Investigando dados específicos das missões...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const hoje = new Date().toISOString().split('T')[0]
  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  try {
    // 1. Verificar dados na tabela missoes_diarias
    console.log('\n1. Verificando missões diárias existentes...')
    
    const { data: missoesDiarias, error: missoesError } = await supabase
      .from('missoes_diarias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (missoesError) {
      console.error('❌ Erro ao buscar missões diárias:', missoesError.message)
    } else {
      console.log(`✅ Encontradas ${missoesDiarias.length} missões diárias`)
      
      if (missoesDiarias.length > 0) {
        console.log('📊 Exemplo de missão:')
        const primeira = missoesDiarias[0]
        console.log(`  - ID: ${primeira.id}`)
        console.log(`  - Loja ID: ${primeira.loja_id}`)
        console.log(`  - Template ID: ${primeira.template_id}`)
        console.log(`  - Data: ${primeira.data_missao}`)
        console.log(`  - Status: ${primeira.status}`)
        console.log(`  - Criada em: ${primeira.created_at}`)
      }
    }

    // 2. Verificar dados na view v_missoes_timeline
    console.log('\n2. Verificando view v_missoes_timeline...')
    
    const { data: viewMissoes, error: viewError } = await supabase
      .from('v_missoes_timeline')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (viewError) {
      console.error('❌ Erro ao buscar view missões:', viewError.message)
    } else {
      console.log(`✅ View retornou ${viewMissoes.length} registros`)
      
      if (viewMissoes.length > 0) {
        console.log('📊 Exemplo da view:')
        const primeira = viewMissoes[0]
        console.log(`  - ID: ${primeira.id}`)
        console.log(`  - Loja: ${primeira.loja_nome}`)
        console.log(`  - Missão: ${primeira.missao_nome}`)
        console.log(`  - Data: ${primeira.data_missao}`)
        console.log(`  - Status: ${primeira.status}`)
        console.log(`  - Tipo: ${primeira.tipo}`)
      }
    }

    // 3. Verificar missões para datas específicas
    console.log('\n3. Verificando missões por data...')
    
    for (const data of [hoje, ontem]) {
      const { data: missoesPorData, error: dataError } = await supabase
        .from('v_missoes_timeline')
        .select('*')
        .eq('data_missao', data)
      
      if (!dataError) {
        console.log(`📅 ${data}: ${missoesPorData.length} missões`)
        
        if (missoesPorData.length > 0) {
          const lojas = [...new Set(missoesPorData.map(m => m.loja_nome))]
          console.log(`  Lojas com missões: ${lojas.join(', ')}`)
        }
      }
    }

    // 4. Verificar se há templates de missões
    console.log('\n4. Verificando templates de missões...')
    
    const tabelasTemplates = ['missoes_templates', 'templates_missoes', 'mission_templates']
    
    for (const tabela of tabelasTemplates) {
      try {
        const { data: templates, error: templateError } = await supabase
          .from(tabela)
          .select('*')
          .limit(5)
        
        if (!templateError && templates) {
          console.log(`✅ Tabela ${tabela} existe com ${templates.length} templates`)
          
          if (templates.length > 0) {
            console.log('📋 Exemplos de templates:')
            templates.forEach(t => {
              console.log(`  - ${t.nome || t.missao_nome || t.title}: ${t.tipo || t.categoria || 'sem tipo'}`)
            })
          }
        }
      } catch (e) {
        // Tabela não existe
      }
    }

    // 5. Verificar para lojas específicas
    console.log('\n5. Verificando missões por loja específica...')
    
    const lojasIds = [
      'e974fc5d-ed39-4831-9e5e-4a5544489de6', // Escritório Central
      'c1aa5124-bdec-4cd2-86ee-cba6eea5041d', // Mauá
      'f1dd8fe9-b783-46cd-ad26-56ad364a85d7'  // Perus
    ]
    
    for (const lojaId of lojasIds) {
      const { data: missoesPorLoja, error: lojaError } = await supabase
        .from('v_missoes_timeline')
        .select('*')
        .eq('loja_id', lojaId)
        .limit(5)
      
      if (!lojaError) {
        const { data: lojaInfo } = await supabase
          .from('lojas')
          .select('nome')
          .eq('id', lojaId)
          .single()
        
        console.log(`🏪 ${lojaInfo?.nome || lojaId}: ${missoesPorLoja.length} missões total`)
      }
    }

    // 6. Verificar views do dashboard
    console.log('\n6. Verificando views de dashboard...')
    
    try {
      const { data: dashboardView, error: dashError } = await supabase
        .from('v_mission_control_dashboard')
        .select('*')
        .limit(3)
      
      if (!dashError && dashboardView) {
        console.log(`✅ View v_mission_control_dashboard existe com ${dashboardView.length} registros`)
        
        if (dashboardView.length > 0) {
          console.log('📊 Estrutura do dashboard:', Object.keys(dashboardView[0]))
        }
      }
    } catch (e) {
      console.log('❌ View v_mission_control_dashboard não existe')
    }

    console.log('\n🎯 Análise de dados concluída!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigarDadosMissoes()