
const { createClient } = require('@supabase/supabase-js');

// ============================================
// SCRIPT DE VARREDURA COMPLETA
// ============================================

// 1. Definição HARDCODED das credenciais (conforme solicitação do usuário)
const TARGET_URL = 'https://jrhevexrzaoeyhmpwvgs.supabase.co';
const TARGET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo';

console.log(`\n🔍 INICIANDO VARREDURA NO BANCO: ${TARGET_URL}`);
console.log('----------------------------------------------------');

const client = createClient(TARGET_URL, TARGET_KEY, {
    db: { schema: 'public' }
});

async function sweep() {
    // TESTE 1: Tentar listar qualquer coisa da tabela 'pgrst_indexes' ou similar,
    // mas como não temos acesso a system tables via API, tentaremos uma query inválida
    // para ver se o erro muda, ou listar uma tabela que sabemos que existe.

    // Vamos tentar acessar a view problemática
    console.log('1. Tentando ler v_grupos_canonicos_completos...');
    const { data, error, count } = await client
        .from('v_grupos_canonicos_completos')
        .select('*', { count: 'exact', head: true }); // HEAD request para ser rápido

    if (error) {
        console.error('❌ FALHA NO TESTE 1:', error.message);
        console.error('   Code:', error.code);
        console.error('   Hint:', error.hint);
    } else {
        console.log(`✅ SUCESSO NO TESTE 1! A view existe e tem ${count} registros.`);
    }

    // TESTE 2: Tentar ler tabela de fornecedores (Core)
    console.log('\n2. Tentando ler core.fornecedores...');
    // Nota: cliente configurado para schema public, então precisamos mudar ou usar fully qualified se suportado
    // PostgREST geralmente requer mudar o header Accept-Profile.

    const coreClient = createClient(TARGET_URL, TARGET_KEY, {
        db: { schema: 'core' }
    });

    const { data: coreData, error: coreError } = await coreClient
        .from('fornecedores')
        .select('nome')
        .limit(3);

    if (coreError) {
        console.log('⚠️  Schema CORE inacessível ou vazio:', coreError.message);
    } else {
        console.log('✅ Schema CORE acessível. Fornecedores encontrados:', coreData.map(f => f.nome).join(', '));
    }

    console.log('----------------------------------------------------');
    console.log('CONCLUSÃO:');

    if (error && error.code === 'PGRST205') {
        console.log('🚨 DIAGNÓSTICO CONFIRMADO: ERRO DE CACHE (PGRST205)');
        console.log('   O endpoint API está ONLINE, mas não atualizou a definição do banco de dados.');
        console.log('   SOLUÇÃO: É necessário reiniciar a API via Dashboard do Supabase.');
    } else if (!error) {
        console.log('🎉 Tudo parece funcionar neste script. Se o frontend falha, é ENV VAR errada no .env.local.');
    }
}

sweep();
