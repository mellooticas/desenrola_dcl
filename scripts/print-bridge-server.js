/**
 * Servidor Bridge para Impressão Térmica
 * Ponte entre navegador e impressora térmica via rede/USB
 * 
 * INSTALAÇÃO:
 * npm install express cors
 * 
 * EXECUTAR:
 * node print-bridge-server.js
 */

const express = require('express');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 9100;

// Configurações da impressora
const CONFIG = {
  // Método de impressão: 'network', 'usb', 'file'
  method: 'usb',
  
  // Para método 'network'
  printerIP: '192.168.1.100',
  printerPort: 9100,
  
  // Para método 'usb' (Linux/macOS)
  usbDevice: '/dev/usb/lp0',
  
  // Para método 'file' (Windows compartilhamento)
  sharePath: '\\\\SERVIDOR\\ImpressoraTermica',
  
  // Log
  enableLog: true,
  logPath: './print-logs'
};

// Middleware
app.use(cors());
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));
app.use(express.json());

// Criar pasta de logs
if (CONFIG.enableLog && !fs.existsSync(CONFIG.logPath)) {
  fs.mkdirSync(CONFIG.logPath);
}

/**
 * Log de impressão
 */
function logPrint(data) {
  if (!CONFIG.enableLog) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${CONFIG.logPath}/print-${timestamp}.log`;
  
  fs.writeFileSync(filename, `Timestamp: ${new Date().toISOString()}\n`);
  fs.appendFileSync(filename, `Data Length: ${data.length} bytes\n`);
  fs.appendFileSync(filename, `\n--- RAW DATA ---\n`);
  fs.appendFileSync(filename, data);
  
  console.log(`✅ Log salvo: ${filename}`);
}

/**
 * Imprime via rede TCP/IP
 */
function printViaNetwork(data) {
  return new Promise((resolve, reject) => {
    const client = net.connect(CONFIG.printerPort, CONFIG.printerIP, () => {
      console.log(`📡 Conectado em ${CONFIG.printerIP}:${CONFIG.printerPort}`);
      client.write(data);
      client.end();
    });
    
    client.on('end', () => {
      console.log('✅ Impressão enviada com sucesso');
      resolve();
    });
    
    client.on('error', (err) => {
      console.error('❌ Erro na impressão:', err.message);
      reject(err);
    });
  });
}

/**
 * Imprime via USB (Linux/macOS)
 */
function printViaUSB(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(CONFIG.usbDevice, data, (err) => {
      if (err) {
        console.error('❌ Erro ao escrever em USB:', err.message);
        reject(err);
      } else {
        console.log(`✅ Dados enviados para ${CONFIG.usbDevice}`);
        resolve();
      }
    });
  });
}

/**
 * Imprime via compartilhamento de rede (Windows)
 */
function printViaFile(data) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const tempFile = `${CONFIG.logPath}/temp-${timestamp}.prn`;
    
    // Salva arquivo temporário
    fs.writeFileSync(tempFile, data);
    
    // Copia para impressora compartilhada
    const command = process.platform === 'win32'
      ? `copy /b "${tempFile}" "${CONFIG.sharePath}"`
      : `lp -d impressora_termica "${tempFile}"`;
    
    exec(command, (error, stdout, stderr) => {
      // Remove arquivo temporário
      fs.unlinkSync(tempFile);
      
      if (error) {
        console.error('❌ Erro ao imprimir:', error.message);
        reject(error);
      } else {
        console.log('✅ Arquivo enviado para impressora');
        resolve();
      }
    });
  });
}

/**
 * Endpoint principal de impressão
 */
app.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'Dados vazios' });
    }
    
    console.log(`\n📄 Recebido comando de impressão (${data.length} bytes)`);
    
    // Log dos dados
    logPrint(data);
    
    // Imprime conforme método configurado
    switch (CONFIG.method) {
      case 'network':
        await printViaNetwork(data);
        break;
      
      case 'usb':
        await printViaUSB(data);
        break;
      
      case 'file':
        await printViaFile(data);
        break;
      
      default:
        throw new Error(`Método inválido: ${CONFIG.method}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Impressão enviada com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint de status
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    method: CONFIG.method,
    config: CONFIG.method === 'network' 
      ? { ip: CONFIG.printerIP, port: CONFIG.printerPort }
      : CONFIG.method === 'usb'
        ? { device: CONFIG.usbDevice }
        : { path: CONFIG.sharePath },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint de teste
 */
app.post('/test', async (req, res) => {
  try {
    // Comando ESC/POS de teste simples
    const testCommand = 
      '\x1B@' +                    // Inicializa
      '\x1Ba\x01' +                // Centraliza
      '\x1D!\x11' +                // Fonte dupla
      'TESTE DE IMPRESSAO\n' +
      '\x1D!\x00' +                // Fonte normal
      '\n' +
      'Servidor Bridge Online\n' +
      `Porta: ${PORT}\n` +
      `Método: ${CONFIG.method}\n` +
      '\n\n\n' +
      '\x1DV\x01';                 // Corte parcial
    
    const data = Buffer.from(testCommand, 'binary');
    
    // Imprime conforme método configurado
    switch (CONFIG.method) {
      case 'network':
        await printViaNetwork(data);
        break;
      case 'usb':
        await printViaUSB(data);
        break;
      case 'file':
        await printViaFile(data);
        break;
    }
    
    res.json({ 
      success: true, 
      message: 'Teste de impressão enviado'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log('\n🖨️  SERVIDOR BRIDGE DE IMPRESSÃO TÉRMICA');
  console.log('==========================================');
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📡 Método de impressão: ${CONFIG.method}`);
  
  if (CONFIG.method === 'network') {
    console.log(`🌐 Impressora: ${CONFIG.printerIP}:${CONFIG.printerPort}`);
  } else if (CONFIG.method === 'usb') {
    console.log(`🔌 Dispositivo USB: ${CONFIG.usbDevice}`);
  } else if (CONFIG.method === 'file') {
    console.log(`📁 Caminho: ${CONFIG.sharePath}`);
  }
  
  console.log(`📝 Logs: ${CONFIG.enableLog ? 'Ativado' : 'Desativado'}`);
  console.log('\n✅ Pronto para receber comandos de impressão!');
  console.log('💡 Teste com: POST http://localhost:9100/test\n');
});

// Tratamento de erros
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Servidor encerrado');
  process.exit(0);
});
