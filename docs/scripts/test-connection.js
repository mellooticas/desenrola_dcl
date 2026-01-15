
const { createClient } = require('@supabase/supabase-js');

// Lendo do .env.local simulado
const SUPABASE_URL = 'https://jrhevexrzaoeyhmpwvgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: 'public' }
});

async function testarConexao() {
    console.log('🔍 Testando conexão com view v_grupos_canonicos_completos...');

    // Tentar pegar 1 registro real para ver se vem dados
    const { data, error, count } = await client
        .from('v_grupos_canonicos_completos')
        .select('*', { count: 'exact' })
        .limit(1);

    if (error) {
        console.error('❌ Erro:', error.message);
        console.error('Detalhes:', error);
    } else {
        console.log(`✅ Sucesso! Total de Grupos Canônicos: ${count}`);
        if (data && data.length > 0) {
            console.log('📦 Exemplo de grupo:', data[0].nome_grupo);
            console.log('💰 Preço Médio:', data[0].preco_medio);
        } else {
            console.warn('⚠️ A query funcionou mas não retornou linhas (tabela vazia?)');
        }
    }
}

testarConexao();
