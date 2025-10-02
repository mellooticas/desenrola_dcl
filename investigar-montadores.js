require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigarMontadores() {
    console.log('Ì¥ß Investigando tabela MONTADORES...\n');
    
    try {
        // 1. Verificar dados na tabela montadores
        const { data: montadores, error: errorMontadores } = await supabase
            .from('montadores')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (errorMontadores) {
            console.error('‚ùå Erro ao buscar montadores:', errorMontadores.message);
        } else {
            console.log(`Ì≥ä MONTADORES encontrados: ${montadores?.length || 0}`);
            if (montadores && montadores.length > 0) {
                console.log('\nÌ≥ã Dados dos montadores:');
                montadores.forEach((montador, index) => {
                    console.log(`${index + 1}. ${montador.nome} (${montador.tipo}) - ${montador.ativo ? 'ATIVO' : 'INATIVO'}`);
                    if (montador.laboratorio_id) {
                        console.log(`   Ì¥¨ Laborat√≥rio ID: ${montador.laboratorio_id}`);
                    }
                });
            }
        }
        
        console.log('\nÌ¥¨ Investigando tabela LABORATORIOS...\n');
        
        // 2. Verificar dados na tabela laboratorios
        const { data: laboratorios, error: errorLaboratorios } = await supabase
            .from('laboratorios')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (errorLaboratorios) {
            console.error('‚ùå Erro ao buscar laborat√≥rios:', errorLaboratorios.message);
        } else {
            console.log(`Ì≥ä LABORAT√ìRIOS encontrados: ${laboratorios?.length || 0}`);
            if (laboratorios && laboratorios.length > 0) {
                console.log('\nÌ≥ã Dados dos laborat√≥rios:');
                laboratorios.forEach((lab, index) => {
                    console.log(`${index + 1}. ID: ${lab.id}`);
                    console.log(`   Nome: ${lab.nome || 'N/A'}`);
                    console.log(`   Status: ${lab.ativo ? 'ATIVO' : 'INATIVO'}`);
                });
            }
        }
        
        // 3. Buscar montadores com joins
        console.log('\nÌ¥ó Montadores com dados dos laborat√≥rios:\n');
        
        const { data: montadoresCompletos, error: errorJoin } = await supabase
            .from('montadores')
            .select(`
                id,
                nome,
                tipo,
                ativo,
                created_at,
                laboratorios (
                    id,
                    nome
                )
            `)
            .order('created_at', { ascending: false });
        
        if (errorJoin) {
            console.error('‚ùå Erro no join:', errorJoin.message);
        } else if (montadoresCompletos) {
            montadoresCompletos.forEach((montador, index) => {
                console.log(`${index + 1}. Ì±®‚ÄçÌ¥ß ${montador.nome}`);
                console.log(`   Tipo: ${montador.tipo}`);
                console.log(`   Status: ${montador.ativo ? 'ATIVO' : 'INATIVO'}`);
                if (montador.laboratorios) {
                    console.log(`   Ì¥¨ Laborat√≥rio: ${montador.laboratorios.nome}`);
                } else {
                    console.log(`   Ìø¢ Montador interno`);
                }
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('‚ùå Erro geral:', error.message);
    }
}

investigarMontadores();
