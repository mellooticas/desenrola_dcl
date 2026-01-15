
const { createClient } = require('@supabase/supabase-js');

// Configuração EXPLÍCITA do Banco de Lentes (Best Lens Catalog)
const LENTES_URL = 'https://jrhevexrzaoeyhmpwvgs.supabase.co';
// Usando a chave anon que estava no .env.example ou fornecida anteriormente
const LENTES_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo';

const client = createClient(LENTES_URL, LENTES_ANON_KEY);

async function diagnosticarBanco() {
    console.log(`🕵️ DIAGNÓSTICO DO BANCO DE LENTES (URL: ${LENTES_URL})`);
    console.log('===========================================================');

    // 1. Tentar ler a view diretamente
    console.log('\n1. Tentando acessar a view "v_grupos_canonicos_completos"...');
    const { data: viewData, error: viewError } = await client
        .from('v_grupos_canonicos_completos')
        .select('*')
        .limit(1);

    if (viewError) {
        console.error('❌ ERRO ao acessar a view:', viewError.message, `(Code: ${viewError.code})`);
        if (viewError.code === 'PGRST205') {
            console.error('   -> CONCLUSÃO: A view NÃO EXISTE neste banco ou o cache está desatualizado.');
        }
    } else {
        console.log('✅ SUCESSO! A view existe e retornou dados.');
    }

    // 2. Tentar listar tabelas do schema lens_catalog (para ver se o schema base existe)
    // Nota: Isso pode falhar se não tiver permissão de leitura no schema, mas vale o teste.
    console.log('\n2. Testando acesso ao schema "lens_catalog" (tabela grupos_canonicos)...');
    const { data: lensData, error: lensError } = await client
        .from('grupos_canonicos') // pode precisar de prefixo se não estiver no search_path, mas client acessa via REST que expõe views/tabelas
        .select('*')
        .limit(1);

    if (lensError) {
        console.log('⚠️  Acesso direto a tabelas base falhou (esperado se for protegido):', lensError.message);
    } else {
        console.log('✅ Tabelas base acessíveis.');
    }

    console.log('\n===========================================================');
    console.log('RESUMO PARA O USUÁRIO:');
    if (viewError && viewError.code === 'PGRST205') {
        console.log('🚨 A VIEW NÃO EXISTE NO BANCO "jrhevexrsa...".');
        console.log('   Você precisa criar a view NESTE banco específico, não no DCL.');
    } else if (!viewError) {
        console.log('🎉 A view existe! Se o frontend ainda falha, tente reiniciar o servidor local.');
    }
}

diagnosticarBanco();
