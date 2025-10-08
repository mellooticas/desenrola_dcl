const bcrypt = require('bcryptjs');

async function gerarHashSenha() {
  const senha = 'DCL@2025#c09ef0';
  
  console.log('🔐 Gerando hash BCrypt para a senha...');
  
  try {
    // Gerar hash com salt de 12 rounds (mesmo padrão usado no sistema)
    const hash = await bcrypt.hash(senha, 12);
    
    console.log('✅ Hash gerado com sucesso!');
    console.log('📧 Email: junior@oticastatymello.com.br');
    console.log('🔑 Senha original:', senha);
    console.log('🏷️  Hash BCrypt:', hash);
    console.log('');
    console.log('📝 SQL para inserir no Supabase:');
    console.log(`INSERT INTO usuarios (email, nome, role, permissoes, ativo, senha_hash) VALUES`);
    console.log(`('junior@oticastatymello.com.br', 'Junior - Admin', 'dcl', ARRAY['admin'], true, '${hash}')`);
    console.log(`ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash;`);
    
  } catch (error) {
    console.log('❌ Erro ao gerar hash:', error.message);
  }
}

gerarHashSenha();