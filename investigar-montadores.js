require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigarMontadores() {
    console.log('� Investigando tabela MONTADORES...\n');
    
    try {
        // 1. Verificar dados na tabela montadores
        const { data: montadores, error: errorMontadores } = await supabase
            .from('montadores')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (errorMontadores) {
            console.error('❌ Erro ao buscar montadores:', errorMontadores.message);
        } else {
            console.log(`� MONTADORES encontrados: ${montadores?.length || 0}`);
            if (montadores && montadores.length > 0) {
                console.log('\n� Dados dos montadores:');
                montadores.forEach((montador, index) => {
                    console.log(`${index + 1}. ${montador.nome} (${montador.tipo}) - ${montador.ativo ? 'ATIVO' : 'INATIVO'}`);
                    if (montador.laboratorio_id) {
                        console.log(`   � Laboratório ID: ${montador.laboratorio_id}`);
                    }
                });
            }
        }
        
        console.log('\n� Investigando tabela LABORATORIOS...\n');
        
        // 2. Verificar dados na tabela laboratorios
        const { data: laboratorios, error: errorLaboratorios } = await supabase
            .from('laboratorios')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (errorLaboratorios) {
            console.error('❌ Erro ao buscar laboratórios:', errorLaboratorios.message);
        } else {
            console.log(`� LABORATÓRIOS encontrados: ${laboratorios?.length || 0}`);
            if (laboratorios && laboratorios.length > 0) {
                console.log('\n� Dados dos laboratórios:');
                laboratorios.forEach((lab, index) => {
                    console.log(`${index + 1}. ID: ${lab.id}`);
                    console.log(`   Nome: ${lab.nome || 'N/A'}`);
                    console.log(`   Status: ${lab.ativo ? 'ATIVO' : 'INATIVO'}`);
                });
            }
        }
        
        // 3. Buscar montadores com joins
        console.log('\n� Montadores com dados dos laboratórios:\n');
        
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
            console.error('❌ Erro no join:', errorJoin.message);
        } else if (montadoresCompletos) {
            montadoresCompletos.forEach((montador, index) => {
                console.log(`${index + 1}. �‍� ${montador.nome}`);
                console.log(`   Tipo: ${montador.tipo}`);
                console.log(`   Status: ${montador.ativo ? 'ATIVO' : 'INATIVO'}`);
                if (montador.laboratorios) {
                    console.log(`   � Laboratório: ${montador.laboratorios.nome}`);
                } else {
                    console.log(`   � Montador interno`);
                }
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

investigarMontadores();
