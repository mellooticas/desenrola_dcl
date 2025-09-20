// Investigação do banco de dados - Desenrola DCL
// Script para verificar estrutura e dados reais

import { supabase } from './src/lib/supabase/client.js'

async function investigarBanco() {
  console.log('=== INVESTIGAÇÃO DO BANCO DE DADOS ===\n')
  
  try {
    // 1. Listar todas as tabelas
    console.log('1. TABELAS DISPONÍVEIS:')
    console.log('=' .repeat(50))
    
    const { data: tabelas, error: errorTabelas } = await supabase
      .rpc('get_tables_info')
      .catch(() => ({ data: null, error: 'RPC não disponível' }))
    
    if (errorTabelas) {
      console.log('Não foi possível listar via RPC, tentando método alternativo...')
    }

    // 2. Verificar estrutura da tabela pedidos
    console.log('\n2. ESTRUTURA DA TABELA PEDIDOS:')
    console.log('=' .repeat(50))
    
    const { data: pedidoSample, error: errorPedido } = await supabase
      .from('pedidos')
      .select('*')
      .limit(1)
    
    if (pedidoSample && pedidoSample.length > 0) {
      const campos = Object.keys(pedidoSample[0])
      console.log(`Total de campos: ${campos.length}`)
      campos.forEach((campo, index) => {
        const valor = pedidoSample[0][campo]
        const tipo = typeof valor
        console.log(`${index + 1}. ${campo} (${tipo}) = ${valor !== null ? String(valor).substring(0, 50) + (String(valor).length > 50 ? '...' : '') : 'null'}`)
      })
    } else {
      console.log('Erro ao buscar pedidos:', errorPedido)
    }

    // 3. Verificar dados de lojas
    console.log('\n3. ESTRUTURA DA TABELA LOJAS:')
    console.log('=' .repeat(50))
    
    const { data: lojaSample, error: errorLoja } = await supabase
      .from('lojas')
      .select('*')
      .limit(1)
    
    if (lojaSample && lojaSample.length > 0) {
      const campos = Object.keys(lojaSample[0])
      console.log(`Total de campos: ${campos.length}`)
      campos.forEach((campo, index) => {
        const valor = lojaSample[0][campo]
        const tipo = typeof valor
        console.log(`${index + 1}. ${campo} (${tipo}) = ${valor !== null ? String(valor).substring(0, 50) + (String(valor).length > 50 ? '...' : '') : 'null'}`)
      })
    } else {
      console.log('Erro ao buscar lojas:', errorLoja)
    }

    // 4. Verificar dados de laboratórios
    console.log('\n4. ESTRUTURA DA TABELA LABORATORIOS:')
    console.log('=' .repeat(50))
    
    const { data: labSample, error: errorLab } = await supabase
      .from('laboratorios')
      .select('*')
      .limit(1)
    
    if (labSample && labSample.length > 0) {
      const campos = Object.keys(labSample[0])
      console.log(`Total de campos: ${campos.length}`)
      campos.forEach((campo, index) => {
        const valor = labSample[0][campo]
        const tipo = typeof valor
        console.log(`${index + 1}. ${campo} (${tipo}) = ${valor !== null ? String(valor).substring(0, 50) + (String(valor).length > 50 ? '...' : '') : 'null'}`)
      })
    } else {
      console.log('Erro ao buscar laboratórios:', errorLab)
    }

    // 5. Verificar relacionamentos
    console.log('\n5. ANÁLISE DE RELACIONAMENTOS:')
    console.log('=' .repeat(50))
    
    const { data: pedidosRelacionados, error: errorRel } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_sequencial,
        loja_id,
        laboratorio_id,
        classe_lente_id,
        lojas:loja_id(nome, codigo),
        laboratorios:laboratorio_id(nome, codigo),
        classes_lente:classe_lente_id(nome, codigo)
      `)
      .limit(3)
    
    if (pedidosRelacionados) {
      console.log(`Encontrados ${pedidosRelacionados.length} pedidos com relacionamentos:`)
      pedidosRelacionados.forEach((pedido, index) => {
        console.log(`\nPedido ${index + 1}:`)
        console.log(`- ID: ${pedido.id}`)
        console.log(`- Sequencial: ${pedido.numero_sequencial}`)
        console.log(`- Loja: ${pedido.lojas ? pedido.lojas.nome + ' (' + pedido.lojas.codigo + ')' : 'Não encontrada'}`)
        console.log(`- Laboratório: ${pedido.laboratorios ? pedido.laboratorios.nome + ' (' + pedido.laboratorios.codigo + ')' : 'Não encontrado'}`)
        console.log(`- Classe: ${pedido.classes_lente ? pedido.classes_lente.nome + ' (' + pedido.classes_lente.codigo + ')' : 'Não encontrada'}`)
      })
    }

    // 6. Verificar campos específicos que podem estar faltando
    console.log('\n6. VERIFICAÇÃO DE CAMPOS ESPECÍFICOS:')
    console.log('=' .repeat(50))
    
    const { data: camposEspecificos, error: errorCampos } = await supabase
      .from('pedidos')
      .select('numero_os_fisica, numero_pedido_laboratorio, observacoes, observacoes_internas')
      .not('numero_os_fisica', 'is', null)
      .limit(5)
    
    if (camposEspecificos) {
      console.log(`Pedidos com OS física preenchida: ${camposEspecificos.length}`)
      camposEspecificos.forEach((pedido, index) => {
        console.log(`${index + 1}. OS: ${pedido.numero_os_fisica}, Pedido Lab: ${pedido.numero_pedido_laboratorio}`)
      })
    }

  } catch (error) {
    console.error('Erro na investigação:', error)
  }
}

// Executar investigação
investigarBanco().then(() => {
  console.log('\n=== INVESTIGAÇÃO CONCLUÍDA ===')
})