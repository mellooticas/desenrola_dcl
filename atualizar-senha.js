// Atualizar senha do usuário junior via API
const { createClient } = require('@supabase/supabase-js');

async function atualizarSenha() {
  const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.jK9CWJu3_WO4WYhxtqPJthwOKq8zjD5O4Kv2V84Rxnw';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('🔐 Atualizando senha do usuário junior...');
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        senha_hash: '$2b$12$zxjbFON/gpfrLfw77DUDfeLecXaXDrrLMSJwh439yNjEsiTKPbdym',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'junior@oticastatymello.com.br')
      .select();
    
    if (error) {
      console.log('❌ Erro ao atualizar senha:', error.message);
      return;
    }
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('📧 Email:', data[0]?.email);
    console.log('👤 Nome:', data[0]?.nome);
    console.log('🔐 Senha:', 'DCL@2025#c09ef0');
    console.log('');
    console.log('🎉 Agora você pode fazer login!');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

atualizarSenha();