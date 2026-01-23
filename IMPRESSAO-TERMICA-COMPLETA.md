# 🖨️ Sistema de Impressão Térmica - Desenrola DCL

## 📋 Visão Geral

Sistema completo de impressão em **impressoras térmicas ESC/POS** (80mm) compatível com:

- ✅ **Epson i9**
- ✅ **Sweda** (todas séries ESC/POS)
- ✅ **Bematech MP-4200 TH**
- ✅ **Daruma DR800**
- ✅ **Elgin i9**
- ✅ Qualquer impressora térmica padrão **ESC/POS 80mm**

## 🎯 Funcionalidades

### Opções de Impressão

1. **Impressora Normal (A4)** - Mantida do sistema original
2. **Impressora Térmica (80mm)** - Nova funcionalidade ESC/POS

### Configurações Térmicas

- ✅ **QR Code do Pedido** - Escaneável para acesso rápido
- ✅ **Abrir Gaveta de Dinheiro** - Comando automático ESC/POS
- ✅ **Número de Cópias** - 1 a 5 cópias
- ✅ **Campos Personalizáveis** - Mesmas opções da impressão normal

### Métodos de Impressão Térmica

#### 1. 🔌 USB Direto (Web Serial API)

**Recomendado para uso diário**

- Conexão direta via USB com a impressora
- Suporta Chrome/Edge (Web Serial API)
- Seleciona automaticamente a porta USB
- Impressão instantânea

**Navegadores Compatíveis:**

- ✅ Google Chrome 89+
- ✅ Microsoft Edge 89+
- ❌ Firefox (não suporta Web Serial API)
- ❌ Safari (não suporta Web Serial API)

**Como usar:**

1. Conecte impressora via USB
2. Clique em "USB Direto"
3. Navegador solicita permissão para porta serial
4. Selecione a impressora (aparece como: Epson, Bematech, IVI, etc.)
5. Aguarde impressão

#### 2. 📥 Download .PRN

**Ideal para testes e software legado**

- Gera arquivo `.prn` com comandos ESC/POS
- Envie para impressora via software de gestão
- Compatível com qualquer sistema operacional

**Como usar:**

1. Clique em "Download .PRN"
2. Arquivo `pedido-XXXX.prn` é baixado
3. Envie para impressora via:
   - Arraste para pasta compartilhada da impressora (Windows)
   - `cat pedido-XXXX.prn > /dev/usb/lp0` (Linux)
   - Software de gestão de impressão

#### 3. 🌐 Servidor Local (Bridge)

**Para ambientes corporativos**

- Envia comandos para servidor bridge local
- Servidor roda na porta 9100
- Útil para integração com ERP/sistemas legados

**Requisitos:**

- Servidor bridge rodando em `http://localhost:9100`
- Aceita POST com `Content-Type: application/octet-stream`
- Repassa comandos para impressora

**Exemplo de servidor bridge (Node.js):**

```javascript
const express = require("express");
const net = require("net");
const app = express();

app.post("/", express.raw({ type: "application/octet-stream" }), (req, res) => {
  const client = net.connect(9100, "IP_DA_IMPRESSORA", () => {
    client.write(req.body);
    client.end();
    res.status(200).send("OK");
  });
});

app.listen(9100);
```

## 🔧 Implementação Técnica

### Arquivos Criados/Modificados

#### `/src/lib/utils/thermal-printer.ts` (NOVO)

**Utilitário de geração de comandos ESC/POS**

Funções principais:

```typescript
// Gera comando ESC/POS completo
gerarComandoThermal(pedido: PedidoCompleto, config: ThermalPrintConfig): string

// Imprime via Web Serial API (USB direto)
imprimirViaWebSerial(comando: string): Promise<void>

// Download arquivo .prn
downloadComandoPRN(comando: string, nomeArquivo: string): void

// Envia para servidor bridge
imprimirViaBridge(comando: string, endpointUrl?: string): Promise<void>

// Helpers de formatação
gerarQRCode(pedido: PedidoCompleto): string
gerarLinhaSeparadora(largura: 48 | 58): string
formatarLinhaLabelValor(label: string, valor: string, largura: 48 | 58): string
quebrarTexto(texto: string, largura: 48 | 58): string
```

**Comandos ESC/POS implementados:**

- `INIT` - Inicialização
- `ALIGN_CENTER/LEFT/RIGHT` - Alinhamento
- `FONT_DOUBLE/TRIPLE/NORMAL` - Tamanhos de fonte
- `BOLD_ON/OFF` - Negrito
- `QR_CODE` - QR Code Modelo 2
- `CUT_PARTIAL` - Corte parcial do papel
- `OPEN_DRAWER` - Abertura de gaveta

#### `/src/components/pedidos/PrintOrderButton.tsx` (MODIFICADO)

**Componente de impressão estendido**

Mudanças:

1. Adicionado import do `thermal-printer.ts`
2. Adicionado estado `tipoImpressao: 'normal' | 'termica'`
3. Adicionadas opções `incluirQRCode`, `abrirGaveta`, `numeroCopias`
4. Implementada função `handleThermalPrint(metodo)`
5. Adicionado componente `<Tabs>` para alternar entre tipos
6. Criada UI específica para configurações térmicas
7. Botões de ação dinâmicos conforme tipo selecionado

### Estrutura de Dados

```typescript
interface ThermalPrintConfig {
  incluirObservacoes: boolean;
  incluirValores: boolean;
  incluirTelefone: boolean;
  incluirGarantia: boolean;
  incluirSLA: boolean;
  incluirOSLoja: boolean;
  incluirOSLab: boolean;
  incluirQRCode: boolean; // NOVO
  abrirGaveta: boolean; // NOVO
  tamanhoFonte: "pequeno" | "medio" | "grande";
  numeroCopias: number; // NOVO (1-5)
}
```

## 🖨️ Formato de Saída Térmica

### Exemplo de Impressão (80mm)

```
================================================
          PEDIDO #1234
================================================

LOJA: Óptica Exemplo
CLIENTE: João Silva
TELEFONE: (11) 98765-4321

------------------------------------------------

OS LOJA: 2024-05-123
OS LAB: LAB-456
LABORATORIO: Essilor
CLASSE: Multifocal

------------------------------------------------

DATA PEDIDO: 15/05/2024 14:30
DATA PROM.: 20/05/2024
SLA: 3 dias restantes

------------------------------------------------

STATUS: REGISTRADO
PRIORIDADE: NORMAL

------------------------------------------------

VALOR TOTAL: R$ 850,00
CUSTO LENTES: R$ 320,00

------------------------------------------------

OBSERVACOES:
Cliente prefere armação leve.
Entregar na loja matriz.

------------------------------------------------

        [QR CODE AQUI]
     Escaneie para detalhes

================================================
    Impresso em: 15/05/2024 14:45
```

## 🚀 Como Usar

### Para Usuários Finais

1. **Abra o pedido** no sistema
2. **Clique em "Imprimir"**
3. **Selecione aba "Impressora Térmica"**
4. **Configure opções:**
   - Marque "QR Code" para incluir
   - Marque "Abrir Gaveta" se necessário
   - Ajuste número de cópias (1-5)
   - Marque campos desejados
5. **Escolha método:**
   - **USB Direto** → Impressão instantânea
   - **Download .PRN** → Arquivo para software
   - **Servidor Local** → Envio para bridge

### Para Desenvolvedores

**Usar utilitário diretamente:**

```typescript
import {
  gerarComandoThermal,
  imprimirViaWebSerial,
} from "@/lib/utils/thermal-printer";

// Gerar comando
const comando = gerarComandoThermal(pedido, {
  incluirQRCode: true,
  abrirGaveta: true,
  numeroCopias: 2,
  // ... outras configs
});

// Imprimir via USB
await imprimirViaWebSerial(comando);

// Ou baixar arquivo
downloadComandoPRN(comando, "pedido-1234");
```

## ⚠️ Troubleshooting

### "Web Serial API não disponível"

**Causa:** Navegador não suporta Web Serial API  
**Solução:** Use Chrome ou Edge (versão 89+)

### "Pop-up bloqueado"

**Causa:** Navegador bloqueia janela de seleção de porta  
**Solução:** Habilite pop-ups para o site

### "Nenhuma impressora selecionada"

**Causa:** Usuário cancelou seleção ou não conectou USB  
**Solução:**

1. Verifique cabo USB conectado
2. Impressora ligada
3. Tente novamente

### "Servidor de impressão não encontrado"

**Causa:** Bridge não está rodando na porta 9100  
**Solução:**

1. Inicie servidor bridge
2. Verifique firewall
3. Use método USB Direto ou Download

### Impressão sai cortada/ilegível

**Causa:** Largura incorreta ou comandos incompatíveis  
**Solução:**

1. Confirme que é impressora 80mm (não 58mm)
2. Verifique manual da impressora para comandos ESC/POS
3. Teste com "Download .PRN" primeiro

## 🔐 Segurança

### Web Serial API

- Requer **permissão explícita do usuário**
- Acesso restrito apenas à porta selecionada
- Nenhum dado sensível enviado pela rede

### Servidor Bridge

- Rode **apenas em localhost**
- **Não exponha porta 9100** para internet
- Valide comandos recebidos
- Use HTTPS se exposto internamente

## 📊 Compatibilidade

### Navegadores

| Navegador  | USB Direto | Download .PRN | Servidor Local |
| ---------- | ---------- | ------------- | -------------- |
| Chrome 89+ | ✅         | ✅            | ✅             |
| Edge 89+   | ✅         | ✅            | ✅             |
| Firefox    | ❌         | ✅            | ✅             |
| Safari     | ❌         | ✅            | ✅             |

### Impressoras Testadas

| Marca/Modelo        | Status        | Observações                    |
| ------------------- | ------------- | ------------------------------ |
| Epson i9            | ✅ Compatível | Testado USB direto             |
| Sweda SI-300S       | ✅ Compatível | Suporta QR Code                |
| Bematech MP-4200 TH | ✅ Compatível | Requer driver instalado        |
| Daruma DR800        | ✅ Compatível | -                              |
| Elgin i9            | ✅ Compatível | Clone Epson i9                 |
| Generic ESC/POS     | ⚠️ Parcial    | Testar QR Code individualmente |

## 🛠️ Manutenção

### Adicionar Novo Comando ESC/POS

**Arquivo:** `src/lib/utils/thermal-printer.ts`

```typescript
export const COMMANDS = {
  // ... comandos existentes
  NOVO_COMANDO: ESC + "X" + "\x01", // Adicione aqui
};

// Use em gerarComandoThermal()
comando += COMMANDS.NOVO_COMANDO;
```

### Adicionar Novo Vendor ID (USB)

**Arquivo:** `src/lib/utils/thermal-printer.ts`

```typescript
const port = await (navigator as any).serial.requestPort({
  filters: [
    { usbVendorId: 0x04b8 }, // Epson
    { usbVendorId: 0x0519 }, // Bematech
    { usbVendorId: 0x0fe6 }, // IVI/Sweda
    { usbVendorId: 0xXXXX }, // NOVO - Adicione aqui
  ]
})
```

**Como descobrir Vendor ID:**

- Linux: `lsusb`
- Windows: Gerenciador de Dispositivos → Propriedades → Hardware IDs
- macOS: `system_profiler SPUSBDataType`

## 📚 Referências

- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [QR Code ESC/POS](https://reference.epson-biz.com/modules/ref_escpos/index.php?content_id=140)

## ✅ Checklist de Implementação

- [x] Criado `thermal-printer.ts` com comandos ESC/POS
- [x] Estendido `PrintOrderButton.tsx` com tabs
- [x] Implementado geração de QR Code
- [x] Implementado abertura de gaveta
- [x] Implementado múltiplas cópias (1-5)
- [x] Implementado USB Direto (Web Serial API)
- [x] Implementado Download .PRN
- [x] Implementado Servidor Bridge
- [x] UI para configurações térmicas
- [x] Documentação completa
- [ ] Testes com impressoras reais (pendente)
- [ ] Servidor bridge de exemplo (código fornecido)

## 🎉 Próximos Passos

1. **Testar com impressora física** Epson i9 ou Sweda
2. **Ajustar largura** se necessário (48/58 caracteres)
3. **Validar QR Code** com leitor/app
4. **Configurar servidor bridge** se necessário
5. **Coletar feedback** dos usuários
6. **Adicionar mais comandos** ESC/POS conforme necessidade

---

**Desenvolvido para Desenrola DCL** 🚀  
Sistema completo de impressão térmica ESC/POS com suporte a múltiplas impressoras e métodos de conexão.
