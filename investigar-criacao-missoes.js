// Verificar se há APIs para criação de missões e criar solução temporária
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function investigarCriacaoMissoes() {
  console.log('🔧 Investigando possibilidades de criação de missões...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const hoje = new Date().toISOString().split('T')[0]

  try {
    // 1. Buscar todos os templates ativos
    console.log('\n1. Coletando templates ativos...')
    
    const { data: templates, error: templateError } = await supabase
      .from('missao_templates')
      .select('*')
      .eq('ativo', true)
      .eq('eh_repetitiva', true) // Apenas templates que devem repetir diariamente
    
    if (templateError) {
      console.error('❌ Erro ao buscar templates:', templateError.message)
      return
    }
    
    console.log(`✅ Encontrados ${templates.length} templates ativos e repetitivos`)
    templates.forEach(t => {
      console.log(`   - ${t.nome} (${t.tipo}) - ${t.categoria}`)
    })

    // 2. Buscar lojas ativas
    console.log('\n2. Coletando lojas ativas...')
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .eq('ativo', true)
    
    if (lojasError) {
      console.error('❌ Erro ao buscar lojas:', lojasError.message)
      return
    }
    
    console.log(`✅ Encontradas ${lojas.length} lojas ativas`)
    lojas.forEach(l => {
      console.log(`   - ${l.nome} (${l.id})`)
    })

    // 3. Verificar se já existem missões para hoje
    console.log(`\n3. Verificando missões existentes para ${hoje}...`)
    
    const { data: missoesHoje, error: missoesError } = await supabase
      .from('missoes_diarias')
      .select('id, loja_id, template_id')
      .eq('data_missao', hoje)
    
    if (!missoesError) {
      console.log(`📊 Já existem ${missoesHoje.length} missões para hoje`)
      
      if (missoesHoje.length > 0) {
        console.log('⚠️ Missões já existem para hoje. Cancelando criação automática.')
        return
      }
    }

    // 4. Simular criação de missões (sem inserir ainda)
    console.log('\n4. Simulando criação de missões para hoje...')
    
    const missoesParaCriar = []
    
    for (const loja of lojas) {
      for (const template of templates) {
        // Criar data de vencimento baseada no horário limite
        let dataVencimento = null
        if (template.horario_limite) {
          dataVencimento = new Date(`${hoje}T${template.horario_limite}`)
          // Se já passou o horário, definir para amanhã
          if (dataVencimento < new Date()) {
            dataVencimento.setDate(dataVencimento.getDate() + 1)
          }
        }

        const missao = {
          loja_id: loja.id,
          template_id: template.id,
          data_missao: hoje,
          data_vencimento: dataVencimento?.toISOString(),
          status: 'pendente',
          pontos_base: template.pontos_base,
          pontos_total: template.pontos_base, // Sem multiplicadores iniciais
          eh_missao_extra: false,
          criada_automaticamente: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        missoesParaCriar.push(missao)
      }
    }
    
    console.log(`📋 Preparadas ${missoesParaCriar.length} missões para criação`)
    console.log(`   ${templates.length} templates × ${lojas.length} lojas = ${missoesParaCriar.length} missões`)
    
    // 5. Mostrar exemplos
    console.log('\n5. Exemplos de missões que seriam criadas:')
    missoesParaCriar.slice(0, 3).forEach((missao, index) => {
      const template = templates.find(t => t.id === missao.template_id)
      const loja = lojas.find(l => l.id === missao.loja_id)
      
      console.log(`\n   Missão ${index + 1}:`)
      console.log(`   - Loja: ${loja?.nome}`)
      console.log(`   - Template: ${template?.nome}`)
      console.log(`   - Tipo: ${template?.tipo}`)
      console.log(`   - Vencimento: ${missao.data_vencimento ? new Date(missao.data_vencimento).toLocaleString('pt-BR') : 'Sem prazo'}`)
      console.log(`   - Pontos: ${missao.pontos_total}`)
    })

    // 6. Opção de criação real
    console.log('\n6. 🎯 PRONTO PARA CRIAR MISSÕES!')
    console.log(`   Para criar as ${missoesParaCriar.length} missões para hoje, execute:`)
    console.log(`   node criar-missoes-hoje.js`)
    
    // Salvar dados para uso posterior
    require('fs').writeFileSync(
      './missoes-para-criar.json', 
      JSON.stringify({ missoesParaCriar, templates, lojas }, null, 2)
    )
    console.log('   ✅ Dados salvos em missoes-para-criar.json')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigarCriacaoMissoes()