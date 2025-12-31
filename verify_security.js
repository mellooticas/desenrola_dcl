const http = require('http');

const tests = [
  { method: 'GET', path: '/api/debug/banco', expectedStatus: [404, 401], name: 'Rota de Debug (Coleta de IDs)' },
  { method: 'GET', path: '/create-function', expectedStatus: [404], name: 'Página Create Function (Chave Exposta)' },
  { method: 'POST', path: '/api/admin/execute-sql', expectedStatus: [404, 401], name: 'API Execute SQL (RCE)' },
  { method: 'GET', path: '/api/health', expectedStatus: [200], name: 'API Health (Rota Pública)' }
];

function runTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method,
    };

    const req = http.request(options, (res) => {
      const passed = test.expectedStatus.includes(res.statusCode);
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} [${test.name}] ${test.method} ${test.path} -> Status: ${res.statusCode} (Esperado: ${test.expectedStatus.join(' ou ')})`);
      resolve(passed);
    });

    req.on('error', (e) => {
      console.log(`❌ [${test.name}] Erro de conexão: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runAll() {
  console.log('🛡️ Iniciando Verificação de Segurança...\n');
  let passedCount = 0;
  
  // Esperar um pouco para garantir que o servidor reiniciou após as mudanças
  await new Promise(r => setTimeout(r, 2000));

  for (const test of tests) {
    if (await runTest(test)) passedCount++;
  }

  console.log(`\nResultado: ${passedCount}/${tests.length} testes passaram.`);
}

runAll();
