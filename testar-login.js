const fetch = require('node-fetch');

async function testarLogin() {
  console.log('🔍 Testando login...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'junior@oticastatymello.com.br',
        senha: 'DCL@2025#c09ef0'
      })
    });

    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta:', data);
    
    if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', data.user?.nome);
      console.log('🎯 Role:', data.user?.role);
    } else {
      console.log('❌ Erro no login:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    console.log('🔧 Verifique se o servidor está rodando em http://localhost:3000');
  }
}

testarLogin();