// Análise de dados reais - Desenrola DCL
// Verificar quais campos estão sendo utilizados

import { createClient } from '@supabase/supabase-js'

// Vou usar as variáveis de ambiente se existirem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analisarDadosReais() {
  console.log('=== ANÁLISE DE DADOS REAIS ===\n')
  
  try {
    // 1. Verificar campos básicos dos pedidos
    console.log('1. ANÁLISE DE CAMPOS POPULADOS:')
    console.log('=' .repeat(60))
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('Erro:', error)
      return
    }

    if (pedidos && pedidos.length > 0) {
      console.log(`Total de pedidos analisados: ${pedidos.length}\n`)
      
      // Analisar cada campo
      const analise = {}
      const primeiroRegistro = pedidos[0]
      
      Object.keys(primeiroRegistro).forEach(campo => {
        const valoresNaoNull = pedidos.filter(p => p[campo] !== null && p[campo] !== undefined && p[campo] !== '').length
        const percentualPreenchido = ((valoresNaoNull / pedidos.length) * 100).toFixed(1)
        
        analise[campo] = {
          total: pedidos.length,
          preenchidos: valoresNaoNull,
          percentual: percentualPreenchido,
          exemplo: pedidos.find(p => p[campo] !== null && p[campo] !== undefined && p[campo] !== '')?.[campo] || 'N/A'
        }
      })

      // Mostrar campos com dados
      console.log('CAMPOS COM DADOS (>0% preenchimento):')
      console.log('-'.repeat(80))
      console.log('Campo'.padEnd(30) + 'Preench.'.padEnd(10) + '%'.padEnd(8) + 'Exemplo')
      console.log('-'.repeat(80))
      
      Object.entries(analise)
        .filter(([_, dados]) => dados.preenchidos > 0)
        .sort(([_, a], [__, b]) => b.percentual - a.percentual)
        .forEach(([campo, dados]) => {
          const exemplo = String(dados.exemplo).length > 25 
            ? String(dados.exemplo).substring(0, 25) + '...'
            : String(dados.exemplo)
          
          console.log(
            campo.padEnd(30) + 
            `${dados.preenchidos}/${dados.total}`.padEnd(10) + 
            `${dados.percentual}%`.padEnd(8) + 
            exemplo
          )
        })

      console.log('\n')
      
      // Campos vazios ou com baixo preenchimento
      console.log('CAMPOS VAZIOS OU COM BAIXO PREENCHIMENTO (<20%):')
      console.log('-'.repeat(80))
      
      Object.entries(analise)
        .filter(([_, dados]) => parseFloat(dados.percentual) < 20)
        .sort(([_, a], [__, b]) => a.percentual - b.percentual)
        .forEach(([campo, dados]) => {
          console.log(`${campo.padEnd(30)} ${dados.percentual}% preenchido`)
        })

      // 2. Verificar campos específicos importantes
      console.log('\n2. CAMPOS ESPECÍFICOS IMPORTANTES:')
      console.log('=' .repeat(60))
      
      const camposImportantes = [
        'numero_os_fisica',
        'numero_pedido_laboratorio', 
        'laboratorio_responsavel_producao',
        'data_limite_pagamento',
        'data_prevista_pronto',
        'distancia_pupilar',
        'material_lente',
        'indice_refracao'
      ]
      
      camposImportantes.forEach(campo => {
        if (analise[campo]) {
          console.log(`${campo}: ${analise[campo].percentual}% preenchido - Exemplo: ${analise[campo].exemplo}`)
        } else {
          console.log(`${campo}: CAMPO NÃO ENCONTRADO`)
        }
      })

      // 3. Verificar relacionamentos
      console.log('\n3. VERIFICAÇÃO DE RELACIONAMENTOS:')
      console.log('=' .repeat(60))
      
      const pedidoCompleto = await supabase
        .from('pedidos')
        .select(`
          id,
          numero_sequencial,
          numero_os_fisica,
          lojas!inner(nome, codigo),
          laboratorios!inner(nome, codigo),
          classes_lente!inner(nome, codigo, categoria)
        `)
        .limit(3)
      
      if (pedidoCompleto.data) {
        pedidoCompleto.data.forEach((p, i) => {
          console.log(`\nPedido ${i + 1}:`)
          console.log(`  Sequencial: ${p.numero_sequencial}`)
          console.log(`  OS Física: ${p.numero_os_fisica || 'NÃO INFORMADO'}`)
          console.log(`  Loja: ${p.lojas.nome} (${p.lojas.codigo})`)
          console.log(`  Lab: ${p.laboratorios.nome} (${p.laboratorios.codigo})`)
          console.log(`  Classe: ${p.classes_lente.nome} - ${p.classes_lente.categoria}`)
        })
      }

      // 4. Verificar tabelas relacionadas
      console.log('\n4. TABELAS RELACIONADAS:')
      console.log('=' .repeat(60))
      
      // Contar registros nas tabelas relacionadas
      const tabelas = [
        'pedido_tratamentos',
        'pedido_eventos',
        'alertas',
        'pedidos_timeline',
        'pedidos_historico'
      ]
      
      for (const tabela of tabelas) {
        try {
          const { count, error } = await supabase
            .from(tabela)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            console.log(`${tabela}: ERRO - ${error.message}`)
          } else {
            console.log(`${tabela}: ${count} registros`)
          }
        } catch (e) {
          console.log(`${tabela}: TABELA NÃO ACESSÍVEL`)
        }
      }

    } else {
      console.log('Nenhum pedido encontrado')
    }

  } catch (error) {
    console.error('Erro na análise:', error)
  }
}

// Executar
analisarDadosReais().then(() => {
  console.log('\n=== ANÁLISE CONCLUÍDA ===')
  process.exit(0)
})