// Verificar conectividade e usuários no banco
const { createClient } = require('@supabase/supabase-js');

async function verificarConectividade() {
  const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('🔍 Testando conectividade com Supabase...');
  console.log('🌐 URL:', supabaseUrl);
  
  try {
    // Teste 1: Conexão básica
    console.log('\n📡 Teste 1: Verificando conexão...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('❌ Erro de conexão:', healthError.message);
      return;
    }
    
    console.log('✅ Conexão OK! Total de usuários:', healthCheck);
    
    // Teste 2: Listar todos os usuários
    console.log('\n👥 Teste 2: Listando usuários...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('email, nome, role, ativo')
      .order('email');
    
    if (usuariosError) {
      console.log('❌ Erro ao buscar usuários:', usuariosError.message);
      return;
    }
    
    console.log(`📊 Encontrados ${usuarios?.length || 0} usuários:`);
    usuarios?.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.nome}) - Role: ${user.role} - Ativo: ${user.ativo}`);
    });
    
    // Teste 3: Buscar usuário específico
    console.log('\n🔍 Teste 3: Buscando junior@oticastatymello.com.br...');
    const { data: junior, error: juniorError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'junior@oticastatymello.com.br')
      .single();
    
    if (juniorError) {
      console.log('❌ Usuário junior não encontrado:', juniorError.message);
    } else {
      console.log('✅ Usuário junior encontrado!');
      console.log('📧 Email:', junior.email);
      console.log('👤 Nome:', junior.nome);
      console.log('🎯 Role:', junior.role);
      console.log('✨ Ativo:', junior.ativo);
      console.log('🔐 Tem senha:', junior.senha_hash ? 'Sim' : 'Não');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

verificarConectividade();