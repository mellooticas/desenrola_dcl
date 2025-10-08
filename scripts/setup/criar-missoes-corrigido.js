// Script corrigido para criar missões sem campo pontos_total
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function criarMissoesCorrigido() {
  console.log('🚀 Criando missões para hoje (versão corrigida)...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const hoje = new Date().toISOString().split('T')[0]

  try {
    // 1. Buscar templates e lojas novamente
    console.log('\n1. Carregando templates e lojas...')
    
    const { data: templates, error: templateError } = await supabase
      .from('missao_templates')
      .select('*')
      .eq('ativo', true)
      .eq('eh_repetitiva', true)
    
    if (templateError) {
      console.error('❌ Erro ao buscar templates:', templateError.message)
      return
    }
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .eq('ativo', true)
    
    if (lojasError) {
      console.error('❌ Erro ao buscar lojas:', lojasError.message)
      return
    }

    console.log(`✅ ${templates.length} templates × ${lojas.length} lojas`)

    // 2. Verificar se já existem missões para hoje
    const { data: verificacao, error: verifError } = await supabase
      .from('missoes_diarias')
      .select('id')
      .eq('data_missao', hoje)
    
    if (verifError) {
      console.error('❌ Erro ao verificar missões existentes:', verifError.message)
      return
    }

    if (verificacao.length > 0) {
      console.log(`⚠️ Já existem ${verificacao.length} missões para hoje. Cancelando criação.`)
      return
    }

    // 3. Criar missões com estrutura corrigida
    console.log('\n3. Preparando missões...')
    
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
          // REMOVIDO: pontos_total (é campo calculado)
          eh_missao_extra: false,
          criada_automaticamente: true
          // REMOVIDO: created_at e updated_at (são automáticos)
        }
        
        missoesParaCriar.push(missao)
      }
    }
    
    console.log(`📋 Preparadas ${missoesParaCriar.length} missões`)

    // 4. Inserir em lotes menores
    console.log('\n4. Inserindo missões...')
    
    const tamanhoBatch = 20 // Lotes menores
    const totalBatches = Math.ceil(missoesParaCriar.length / tamanhoBatch)
    let totalInseridas = 0

    for (let i = 0; i < totalBatches; i++) {
      const inicio = i * tamanhoBatch
      const fim = Math.min(inicio + tamanhoBatch, missoesParaCriar.length)
      const batch = missoesParaCriar.slice(inicio, fim)

      console.log(`   Batch ${i + 1}/${totalBatches}: Inserindo missões ${inicio + 1}-${fim}...`)

      const { data: resultado, error: insertError } = await supabase
        .from('missoes_diarias')
        .insert(batch)
        .select('id')

      if (insertError) {
        console.error(`❌ Erro no batch ${i + 1}:`, insertError.message)
        
        // Tentar inserção individual para identificar problema específico
        console.log('   Tentando inserção individual...')
        for (const missao of batch) {
          const { data: individual, error: individualError } = await supabase
            .from('missoes_diarias')
            .insert([missao])
            .select('id')
          
          if (individualError) {
            console.error(`   ❌ Erro individual:`, individualError.message)
            console.error(`   Missão problemática:`, {
              loja_id: missao.loja_id,
              template_id: missao.template_id,
              error: individualError.message
            })
          } else {
            totalInseridas++
          }
        }
      } else {
        totalInseridas += resultado.length
        console.log(`   ✅ Batch ${i + 1} inserido: ${resultado.length} missões`)
      }

      // Pausa entre batches
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`\n✅ Processo concluído!`)
    console.log(`📊 Total de missões inseridas: ${totalInseridas}/${missoesParaCriar.length}`)

    // 5. Verificar resultado e testar API
    if (totalInseridas > 0) {
      console.log('\n5. Verificando resultado...')
      
      const { data: missoesFinais, error: finalError } = await supabase
        .from('missoes_diarias')
        .select('id, loja_id')
        .eq('data_missao', hoje)
      
      if (!finalError) {
        console.log(`✅ Verificação: ${missoesFinais.length} missões criadas para ${hoje}`)
        
        // Resumo por loja
        const resumoPorLoja = {}
        missoesFinais.forEach(missao => {
          const loja = lojas.find(l => l.id === missao.loja_id)
          const nomeLoja = loja ? loja.nome : missao.loja_id
          resumoPorLoja[nomeLoja] = (resumoPorLoja[nomeLoja] || 0) + 1
        })
        
        console.log('\n📋 Resumo por loja:')
        Object.entries(resumoPorLoja).forEach(([loja, quantidade]) => {
          console.log(`   - ${loja}: ${quantidade} missões`)
        })

        // Testar API
        console.log('\n6. Testando API Mission Control...')
        const lojaId = lojas[0].id
        
        try {
          const response = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
          
          if (response.ok) {
            const result = await response.json()
            console.log(`✅ API funcional: ${result.missions?.length || 0} missões retornadas para ${lojas[0].nome}`)
            
            if (result.missions?.length > 0) {
              console.log('📋 Exemplo de missão retornada:')
              const missao = result.missions[0]
              console.log(`   - ${missao.missao_nome} (${missao.tipo})`)
              console.log(`   - Status: ${missao.status}`)
              console.log(`   - Pontos: ${missao.pontos_total || missao.pontos_base}`)
            }
          } else {
            console.log('❌ Erro na API:', response.status)
          }
        } catch (e) {
          console.log('❌ Erro ao testar API:', e.message)
        }

        console.log('\n🎉 Mission Control deve estar funcionando agora!')
      }
    } else {
      console.log('\n❌ Nenhuma missão foi inserida. Verifique os erros acima.')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

criarMissoesCorrigido()