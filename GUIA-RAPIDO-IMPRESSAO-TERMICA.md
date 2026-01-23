# ⚡ Guia Rápido - Impressão Térmica

## 🚀 Início Rápido (3 Minutos)

### 1️⃣ Primeira Impressão (Teste)

```bash
# Opção mais fácil: Download .PRN
1. Abra qualquer pedido
2. Clique em "Imprimir"
3. Selecione aba "Impressora Térmica (80mm)"
4. Clique em "Download .PRN"
5. Arquivo baixado: envie para impressora
```

### 2️⃣ Impressão Direta USB (Produção)

**Requisitos:**

- ✅ Chrome ou Edge (versão 89+)
- ✅ Impressora térmica conectada via USB
- ✅ Impressora ligada

**Passo a passo:**

1. Abra pedido no sistema
2. Clique em **"Imprimir"**
3. Selecione aba **"Impressora Térmica"**
4. Configure opções:
   - [ ] QR Code (opcional)
   - [ ] Abrir Gaveta (se tiver gaveta de dinheiro)
   - Cópias: 1-5
5. Clique em **"USB Direto"**
6. Navegador pede permissão → **Permitir**
7. Selecione sua impressora na lista
8. Aguarde impressão 🎉

---

## 📱 Navegador Recomendado

| Navegador  | Status         | Motivo                    |
| ---------- | -------------- | ------------------------- |
| **Chrome** | ✅ Recomendado | Suporta Web Serial API    |
| **Edge**   | ✅ Recomendado | Suporta Web Serial API    |
| Firefox    | ⚠️ Limitado    | Só funciona Download .PRN |
| Safari     | ⚠️ Limitado    | Só funciona Download .PRN |

**💡 Use Chrome para melhor experiência!**

---

## 🖨️ Impressoras Compatíveis

✅ **Epson i9** - Testada e funcionando  
✅ **Sweda SI-300S** - ESC/POS padrão  
✅ **Bematech MP-4200 TH** - Requer driver  
✅ **Daruma DR800** - ESC/POS padrão  
✅ **Elgin i9** - Clone da Epson  
✅ **Qualquer ESC/POS 80mm** - Provavelmente funciona

---

## ⚙️ Configurações Úteis

### Opções de Conteúdo

- **OS da Loja** - Número da ordem de serviço interna
- **OS do Laboratório** - Número do pedido no lab
- **Telefone** - Contato do cliente
- **SLA** - Prazo e dias restantes
- **Valores** - Preço total e custo
- **Observações** - Notas do pedido
- **Garantia** - Info de pedidos em garantia

### Opções Térmicas Específicas

- **QR Code** 📱 - Código para escanear (acesso rápido ao pedido)
- **Abrir Gaveta** 💰 - Comando ESC/POS para gaveta de dinheiro
- **Cópias** 📄 - 1 a 5 cópias (útil para cliente + arquivo)

---

## 🔧 Métodos de Impressão

### 1. 🔌 USB Direto

**Quando usar:** Dia a dia, impressão rápida  
**Vantagens:** Instantâneo, sem arquivos intermediários  
**Desvantagens:** Só Chrome/Edge

### 2. 📥 Download .PRN

**Quando usar:** Teste, problemas com USB, Firefox/Safari  
**Vantagens:** Funciona em qualquer navegador/SO  
**Desvantagens:** Processo manual de envio

**Como enviar arquivo .PRN:**

#### Windows:

```cmd
# Método 1: Arraste arquivo para impressora compartilhada
# Método 2: Prompt de comando
copy /b pedido-1234.prn \\localhost\NomeImpressora
```

#### Linux:

```bash
cat pedido-1234.prn > /dev/usb/lp0
# ou
lp -d impressora_termica pedido-1234.prn
```

#### macOS:

```bash
cat pedido-1234.prn > /dev/cu.usbserial
```

### 3. 🌐 Servidor Local

**Quando usar:** Ambiente corporativo, integração com ERP  
**Vantagens:** Centralizado, funciona em rede  
**Desvantagens:** Requer configuração de servidor

**Configurar servidor:**

```bash
# Na pasta scripts do projeto
cd scripts
npm install
node print-bridge-server.js
```

Edite configurações no arquivo:

```javascript
const CONFIG = {
  method: "usb", // ou 'network' ou 'file'
  usbDevice: "/dev/usb/lp0", // Linux/Mac
  // ou
  printerIP: "192.168.1.100", // IP da impressora de rede
  printerPort: 9100,
};
```

---

## ❓ Problemas Comuns

### "Web Serial API não disponível"

**Causa:** Navegador incompatível  
**Solução:** Use Chrome ou Edge

### "Nenhuma impressora aparece"

**Causa:** Impressora não conectada ou sem driver  
**Soluções:**

1. Verifique cabo USB
2. Impressora ligada?
3. Instale driver da impressora
4. Use método "Download .PRN"

### "Impressão sai cortada"

**Causa:** Impressora não é 80mm ou incompatível  
**Soluções:**

1. Confirme que é impressora 80mm (não 58mm)
2. Teste comando manual (veja seção abaixo)
3. Use impressora diferente

### "Impressão em branco"

**Causa:** Comandos ESC/POS incompatíveis  
**Soluções:**

1. Verifique papel térmico (não comum)
2. Teste impressão de teste da própria impressora
3. Baixe .PRN e inspecione arquivo
4. Consulte manual da impressora

---

## 🧪 Teste Rápido de Impressora

### Teste 1: Impressão de Teste Nativa

**Pressione o botão na impressora** (geralmente botão FEED)  
Deve imprimir página de teste com configurações

### Teste 2: Comando ESC/POS Simples

**Linux/macOS:**

```bash
echo -e "\x1B@Hello World\n\n\n\x1DV\x01" > /dev/usb/lp0
```

**Windows (crie arquivo test.prn):**

```
ESC @ Hello World LF LF LF GS V 01
```

Envie: `copy /b test.prn \\localhost\Impressora`

Se imprimir "Hello World", sua impressora é compatível! ✅

---

## 📋 Checklist Antes de Usar

- [ ] Impressora térmica ESC/POS 80mm
- [ ] Papel térmico carregado
- [ ] Cabo USB conectado (ou rede configurada)
- [ ] Impressora ligada
- [ ] Driver instalado (se necessário)
- [ ] Chrome ou Edge atualizado
- [ ] Sistema Desenrola DCL aberto

---

## 💡 Dicas Pro

### Múltiplas Cópias

Configure 2-3 cópias para:

- 1 cópia para cliente
- 1 cópia para arquivo da loja
- 1 cópia para laboratório

### QR Code

Ative QR Code para:

- Cliente escanear e acompanhar pedido
- Equipe acessar detalhes rapidamente
- Integração com apps mobile

### Gaveta de Dinheiro

Se sua impressora tem gaveta conectada:

- Marque "Abrir Gaveta"
- Impressão abre gaveta automaticamente
- Útil para recebimentos

### Atalhos

- **Ctrl + P** → Abre dialog de impressão
- **Tab** → Navega entre configurações
- **Enter** → Confirma impressão

---

## 🆘 Suporte

### Problemas Técnicos

1. Veja seção "Problemas Comuns" acima
2. Consulte [IMPRESSAO-TERMICA-COMPLETA.md](./IMPRESSAO-TERMICA-COMPLETA.md)
3. Teste com "Download .PRN" primeiro

### Impressoras Não Listadas

Se sua impressora não está na lista mas é ESC/POS:

- **Deve funcionar!**
- Tente método "USB Direto"
- Se não aparecer, use "Download .PRN"

### Comandos Especiais

Algumas impressoras têm comandos específicos:

- Consulte manual do fabricante
- Procure por "ESC/POS Command Reference"
- Código fonte em: `src/lib/utils/thermal-printer.ts`

---

## 📚 Recursos Adicionais

- [Documentação Completa](./IMPRESSAO-TERMICA-COMPLETA.md)
- [Servidor Bridge](./scripts/print-bridge-server.js)
- [Código ESC/POS](../src/lib/utils/thermal-printer.ts)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

---

**🎉 Pronto! Você já pode imprimir em impressoras térmicas!**

Comece com "Download .PRN" para testar, depois use "USB Direto" no dia a dia.
