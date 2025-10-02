// Script para criar missões para hoje baseado nos templates
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function criarMissoesHoje() {
  console.log('🚀 Criando missões para hoje...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  try {
    // 1. Carregar dados preparados
    console.log('\n1. Carregando dados preparados...')
    
    if (!fs.existsSync('./missoes-para-criar.json')) {
      console.error('❌ Arquivo missoes-para-criar.json não encontrado!')
      console.log('Execute primeiro: node investigar-criacao-missoes.js')
      return
    }

    const dadosPreparados = JSON.parse(fs.readFileSync('./missoes-para-criar.json', 'utf8'))
    const { missoesParaCriar, templates, lojas } = dadosPreparados

    console.log(`✅ Carregados dados para ${missoesParaCriar.length} missões`)

    // 2. Verificar novamente se não há missões para hoje
    const hoje = new Date().toISOString().split('T')[0]
    
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

    // 3. Criar missões em lotes para evitar timeout
    console.log('\n3. Inserindo missões no banco de dados...')
    
    const tamanhoBatch = 50 // Inserir 50 de cada vez
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
        console.error('Detalhes:', insertError)
        
        // Tentar inserir uma por vez para identificar problema
        console.log('Tentando inserção individual...')
        for (const missao of batch) {
          const { error: individualError } = await supabase
            .from('missoes_diarias')
            .insert([missao])
          
          if (individualError) {
            console.error(`❌ Erro na missão individual:`, individualError.message)
            console.error('Missão problemática:', missao)
          } else {
            totalInseridas++
          }
        }
      } else {
        totalInseridas += resultado.length
        console.log(`   ✅ Batch ${i + 1} inserido com sucesso: ${resultado.length} missões`)
      }

      // Pequena pausa entre batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n✅ Processo concluído!`)
    console.log(`📊 Total de missões inseridas: ${totalInseridas}/${missoesParaCriar.length}`)

    // 4. Verificar resultado final
    console.log('\n4. Verificando resultado final...')
    
    const { data: missoesFinais, error: finalError } = await supabase
      .from('missoes_diarias')
      .select('id, loja_id, template_id')
      .eq('data_missao', hoje)
    
    if (!finalError) {
      console.log(`✅ Verificação final: ${missoesFinais.length} missões criadas para ${hoje}`)
      
      // Agrupar por loja para mostrar resumo
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
    }

    // 5. Testar API Mission Control
    console.log('\n5. Testando Mission Control API...')
    
    const lojaId = lojas[0].id // Primeira loja
    const response = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ API funcional: ${result.missions?.length || 0} missões retornadas para ${lojas[0].nome}`)
    } else {
      console.log('❌ Erro na API:', response.status)
    }

    console.log('\n🎉 Missões criadas com sucesso!')
    console.log('🎯 Agora o Mission Control deve funcionar normalmente!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Verificar se deve executar
const args = process.argv.slice(2)
if (args.includes('--confirmar') || args.includes('-y')) {
  criarMissoesHoje()
} else {
  console.log('🔧 Script pronto para criar missões para hoje.')
  console.log('Para executar, use: node criar-missoes-hoje.js --confirmar')
  console.log('Isso criará aproximadamente 217 missões (31 templates × 7 lojas)')
}