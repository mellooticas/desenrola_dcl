// Ì¥ç Script para verificar se existe tabela "motador"
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('‚ùå Vari√°veis de ambiente n√£o encontradas');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelaMotador() {
    console.log('Ì¥ç Verificando exist√™ncia da tabela "motador"...\n');
    
    try {
        // 1. Tentar fazer um SELECT b√°sico na tabela
        const { data, error } = await supabase
            .from('motador')
            .select('*')
            .limit(5);
        
        if (error) {
            if (error.code === '42P01') {
                console.log('‚ùå Tabela "motador" N√ÉO existe no banco de dados');
                console.log('Erro:', error.message);
            } else {
                console.log('‚ö†Ô∏è Tabela existe mas houve erro ao consultar:');
                console.log('Erro:', error.message);
            }
        } else {
            console.log('‚úÖ Tabela "motador" EXISTE!');
            console.log(`Ì≥ä Registros encontrados: ${data?.length || 0}`);
            
            if (data && data.length > 0) {
                console.log('\nÌ≥ã Estrutura dos dados (primeiros registros):');
                console.log(JSON.stringify(data, null, 2));
            }
        }
        
    } catch (err) {
        console.error('‚ùå Erro geral:', err.message);
    }
    
    // 2. Listar todas as tabelas para confirmar
    console.log('\nÌ≥ù Listando todas as tabelas do banco:');
    try {
        const { data: allTables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_type', 'BASE TABLE');
            
        if (!tablesError && allTables) {
            const tableNames = allTables.map(t => t.table_name).sort();
            console.log('Ì≥ã Tabelas encontradas:');
            tableNames.forEach(name => {
                const isMotador = name.toLowerCase().includes('motador');
                console.log(`${isMotador ? 'ÌæØ' : 'Ì≥Ñ'} ${name}`);
            });
            
            // Procurar por tabelas similares
            const similares = tableNames.filter(name => 
                name.toLowerCase().includes('mot') || 
                name.toLowerCase().includes('motor') ||
                name.toLowerCase().includes('moderador')
            );
            
            if (similares.length > 0) {
                console.log('\nÌ¥ç Tabelas com nomes similares encontradas:');
                similares.forEach(name => console.log(`ÌæØ ${name}`));
            }
        }
    } catch (err) {
        console.log('‚ö†Ô∏è Erro ao listar tabelas:', err.message);
    }
}

verificarTabelaMotador()
    .then(() => {
        console.log('\n‚úÖ Verifica√ß√£o conclu√≠da!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('‚ùå Erro fatal:', error);
        process.exit(1);
    });
