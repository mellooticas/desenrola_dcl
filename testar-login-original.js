// Teste da API de login original
async function testarLoginOriginal() {
  console.log('🔐 Testando API de login original...')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'junior@oticastatymello.com.br',
        senha: 'DCL@2025#c09ef0'
      })
    })

    console.log('📊 Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Login bem-sucedido!')
      console.log('👤 Usuário:', data.user?.nome)
      console.log('📧 Email:', data.user?.email)
      console.log('🎭 Role:', data.user?.role)
      
      // Verificar cookies
      const cookies = response.headers.get('set-cookie')
      console.log('🍪 Cookies definidos:', !!cookies)
      if (cookies) {
        console.log('🍪 Headers:', cookies)
      }
    } else {
      const error = await response.text()
      console.error('❌ Erro no login:', error)
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error)
  }
}

// Aguardar um pouco e executar
setTimeout(testarLoginOriginal, 2000)