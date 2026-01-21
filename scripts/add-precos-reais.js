#!/usr/bin/env node

/**
 * Script para adicionar campos de preço real e margens na tabela pedidos
 * Executa: ADD-PRECOS-REAIS-ARMACAO-LENTE.sql
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executarSQL() {
  try {
    console.log('🚀 Executando ADD-PRECOS-REAIS-ARMACAO-LENTE.sql...\n')
    
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'ADD-PRECOS-REAIS-ARMACAO-LENTE.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Dividir em statements (remover comentários e query de verificação)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !s.startsWith('--'))
      .filter(s => !s.includes('SELECT column_name')) // Pular query de verificação
      .filter(s => !s.includes('/*')) // Pular bloco de teste
    
    console.log(`📝 Total de statements: ${statements.length}\n`)
    
    // Executar cada statement
    let sucessos = 0
    let erros = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      // Extrair descrição do statement para log
      const descricao = statement.includes('ALTER TABLE') ? 'ALTER TABLE' :
                        statement.includes('CREATE OR REPLACE FUNCTION') ? 'CREATE FUNCTION' :
                        statement.includes('CREATE TRIGGER') ? 'CREATE TRIGGER' :
                        statement.includes('DROP TRIGGER') ? 'DROP TRIGGER' :
                        statement.includes('COMMENT ON') ? 'COMMENT' :
                        'SQL'
      
      process.stdout.write(`[${i+1}/${statements.length}] ${descricao}... `)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        console.log('❌')
        console.error(`   Erro: ${error.message}`)
        erros++
      } else {
        console.log('✅')
        sucessos++
      }
    }
    
    console.log(`\n📊 Resultado: ${sucessos} sucessos, ${erros} erros\n`)
    
    // Verificar colunas criadas
    console.log('🔍 Verificando colunas criadas...\n')
    
    const { data: colunas, error: erroVerify } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          column_name,
          data_type,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pedidos'
          AND column_name SIMILAR TO '%(preco|custo|margem)%'
        ORDER BY ordinal_position;
      `
    })
    
    if (erroVerify) {
      console.error('❌ Erro ao verificar:', erroVerify.message)
    } else {
      console.table(colunas)
    }
    
    console.log('\n✅ Script executado com sucesso!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Verificar se as colunas foram criadas corretamente')
    console.log('   2. Testar criação de pedido no wizard')
    console.log('   3. Verificar cálculo automático de margens')
    
  } catch (error) {
    console.error('\n❌ Erro ao executar script:', error)
    process.exit(1)
  }
}

// Função helper para executar SQL direto (se a RPC não existir)
async function executarSQLDireto(statement) {
  // Supabase não tem API direta para executar SQL arbitrário
  // Precisamos usar a interface web ou CLI
  console.log('⚠️  Nota: Execute o SQL manualmente no Supabase Dashboard se houver erros')
  console.log('   URL: https://zobgyjsocqmzaggrnwqd.supabase.co/project/zobgyjsocqmzaggrnwqd/sql')
}

executarSQL()
