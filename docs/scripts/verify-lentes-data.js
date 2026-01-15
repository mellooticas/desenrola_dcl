
const { createClient } = require('@supabase/supabase-js');

// Configuração do Banco de Lentes
const LENTES_URL = 'https://jrhevexrzaoeyhmpwvgs.supabase.co';
const LENTES_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo';

const client = createClient(LENTES_URL, LENTES_ANON_KEY);

async function verificarIntegracao() {
    console.log('🚀 Verificando integração final com o Catálogo de Lentes...');

    const { data, error } = await client
        .from('v_grupos_canonicos_completos')
        .select('*')
        .limit(3);

    if (error) {
        console.error('❌ ERRO CRÍTICO:', error);
    } else {
        console.log(`✅ SUCESSO! A view respondeu com ${data.length} registros de teste.`);
        console.log('📦 Exemplo de Lente Retornada para o Frontend:');

        // Mostra o primeiro item formatado para o usuário entender o que o front vai receber
        const exemplo = data[0];
        console.log(JSON.stringify({
            id: exemplo.id,
            nome_grupo: exemplo.nome_grupo,
            preco_medio: exemplo.preco_medio,
            fornecedores: exemplo.fornecedores_disponiveis ? exemplo.fornecedores_disponiveis.length : 0,
            tipo: exemplo.tipo_lente
        }, null, 2));

        console.log('\n🎉 O FRONTEND ESTÁ PRONTO PARA RODAR!');
    }
}

verificarIntegracao();
