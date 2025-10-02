// � Script para verificar se existe tabela "motador"
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelaMotador() {
    console.log('� Verificando existência da tabela "motador"...\n');
    
    try {
        // 1. Tentar fazer um SELECT básico na tabela
        const { data, error } = await supabase
            .from('motador')
            .select('*')
            .limit(5);
        
        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Tabela "motador" NÃO existe no banco de dados');
                console.log('Erro:', error.message);
            } else {
                console.log('⚠️ Tabela existe mas houve erro ao consultar:');
                console.log('Erro:', error.message);
            }
        } else {
            console.log('✅ Tabela "motador" EXISTE!');
            console.log(`� Registros encontrados: ${data?.length || 0}`);
            
            if (data && data.length > 0) {
                console.log('\n� Estrutura dos dados (primeiros registros):');
                console.log(JSON.stringify(data, null, 2));
            }
        }
        
    } catch (err) {
        console.error('❌ Erro geral:', err.message);
    }
    
    // 2. Listar todas as tabelas para confirmar
    console.log('\n� Listando todas as tabelas do banco:');
    try {
        const { data: allTables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_type', 'BASE TABLE');
            
        if (!tablesError && allTables) {
            const tableNames = allTables.map(t => t.table_name).sort();
            console.log('� Tabelas encontradas:');
            tableNames.forEach(name => {
                const isMotador = name.toLowerCase().includes('motador');
                console.log(`${isMotador ? '�' : '�'} ${name}`);
            });
            
            // Procurar por tabelas similares
            const similares = tableNames.filter(name => 
                name.toLowerCase().includes('mot') || 
                name.toLowerCase().includes('motor') ||
                name.toLowerCase().includes('moderador')
            );
            
            if (similares.length > 0) {
                console.log('\n� Tabelas com nomes similares encontradas:');
                similares.forEach(name => console.log(`� ${name}`));
            }
        }
    } catch (err) {
        console.log('⚠️ Erro ao listar tabelas:', err.message);
    }
}

verificarTabelaMotador()
    .then(() => {
        console.log('\n✅ Verificação concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
