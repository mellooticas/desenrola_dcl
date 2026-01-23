# 🧪 Guia de Testes - Impressão Térmica

## 📋 Roteiro de Testes

### Pré-requisitos

- [ ] Impressora térmica ESC/POS 80mm
- [ ] Papel térmico carregado
- [ ] Chrome ou Edge instalado
- [ ] Sistema Desenrola DCL rodando
- [ ] Pedido de teste criado no sistema

---

## 🧪 Teste 1: Download .PRN (Básico)

**Objetivo:** Validar geração de comandos ESC/POS

**Passos:**

1. Abra qualquer pedido no sistema
2. Clique em "Imprimir"
3. Selecione aba "Impressora Térmica (80mm)"
4. Configure:
   - [ ] OS Loja ✓
   - [ ] Telefone ✓
   - [ ] Valores ✓
   - [ ] Observações ✓
5. Clique em "Download .PRN"
6. Arquivo `pedido-XXXX.prn` deve baixar

**Validação:**

- [x] Arquivo .prn gerado?
- [ ] Tamanho entre 200-1000 bytes?
- [ ] Nome correto (`pedido-1234.prn`)?

**Enviar para impressora:**

**Windows:**

```cmd
copy /b pedido-1234.prn \\localhost\NomeDaImpressora
```

**Linux:**

```bash
cat pedido-1234.prn > /dev/usb/lp0
```

**Resultado Esperado:**
✅ Impressora imprime cupom com:

- Título "PEDIDO #XXXX"
- Dados da loja e cliente
- Números de OS
- Datas e SLA
- Valores
- Observações
- Rodapé com data de impressão

---

## 🧪 Teste 2: QR Code

**Objetivo:** Validar geração e leitura de QR Code

**Passos:**

1. Mesmos passos do Teste 1
2. **Marque** "QR Code do Pedido" ☑️
3. Download .PRN e envie para impressora

**Validação:**

- [ ] QR Code aparece no cupom?
- [ ] Está centralizado?
- [ ] Tamanho adequado?

**Teste de leitura:**

1. Use app leitor de QR (celular)
2. Escaneie o código
3. Deve ler: `OS:1234|Cliente Nome|Loja Nome`

**Resultado Esperado:**
✅ QR Code legível e contém dados corretos

---

## 🧪 Teste 3: USB Direto (Web Serial API)

**Objetivo:** Validar conexão USB direta

**Requisitos:**

- Chrome ou Edge (versão 89+)
- Impressora conectada via USB
- Driver instalado

**Passos:**

1. Abra pedido no sistema
2. Clique "Imprimir" → Tab "Térmica"
3. Configure opções desejadas
4. Clique em **"USB Direto"**
5. Navegador abre dialog: "Deseja conectar?"
6. **Permitir**
7. Lista de portas aparece
8. Selecione impressora (ex: "Epson", "USB Serial Device")
9. Aguarde impressão

**Validação:**

- [ ] Dialog de permissão apareceu?
- [ ] Impressora listada?
- [ ] Conexão estabelecida?
- [ ] Toast "Impressa com sucesso"?
- [ ] Cupom impresso corretamente?

**Troubleshooting:**

| Problema                    | Solução                             |
| --------------------------- | ----------------------------------- |
| Nenhuma porta lista         | Instale driver / Verifique cabo USB |
| "Web Serial não disponível" | Use Chrome/Edge 89+                 |
| Impressão não sai           | Verifique se impressora está online |
| Toast erro                  | Veja console (F12) para detalhes    |

---

## 🧪 Teste 4: Múltiplas Cópias

**Objetivo:** Validar impressão de várias cópias

**Passos:**

1. Abra pedido → "Imprimir" → Tab "Térmica"
2. Slider "Número de Cópias" → **3**
3. Clique "USB Direto" ou "Download .PRN"

**Validação:**

- [ ] Sistema mostra "Imprimindo cópia 1 de 3"?
- [ ] Toast para cada cópia?
- [ ] 3 cupons impressos?
- [ ] Conteúdo idêntico em todos?
- [ ] Delay entre cópias (~500ms)?

**Resultado Esperado:**
✅ 3 cupons impressos sequencialmente com mesmos dados

---

## 🧪 Teste 5: Abertura de Gaveta

**Objetivo:** Validar comando de abertura de gaveta

**Requisitos:**

- Gaveta de dinheiro conectada à impressora

**Passos:**

1. Abra pedido → "Imprimir" → Tab "Térmica"
2. **Marque** "Abrir Gaveta de Dinheiro" ☑️
3. Clique "USB Direto" ou envie .PRN

**Validação:**

- [ ] Gaveta abriu automaticamente?
- [ ] Abertura ocorreu no início da impressão?
- [ ] Som/click da gaveta?

**Troubleshooting:**
Se gaveta não abrir:

1. Verifique conexão física (cabo RJ da gaveta → impressora)
2. Teste comando manual:

```bash
# Linux
echo -e "\x1Bp\x00\x19\xFA" > /dev/usb/lp0
```

3. Consulte manual: porta 0 ou 1?
4. Ajuste em `thermal-printer.ts` se necessário:

```typescript
OPEN_DRAWER: ESC + 'p' + '\x01' + '\x19' + '\xFA', // Porta 1
```

---

## 🧪 Teste 6: Servidor Bridge

**Objetivo:** Validar impressão via servidor local

**Setup:**

```bash
cd scripts
npm install express cors
node print-bridge-server.js
```

**Validação do servidor:**

1. Terminal deve mostrar:

```
🖨️  SERVIDOR BRIDGE DE IMPRESSÃO TÉRMICA
🚀 Servidor rodando em: http://localhost:9100
✅ Pronto para receber comandos de impressão!
```

2. Teste status:

```bash
curl http://localhost:9100/status
```

Deve retornar:

```json
{
  "status": "online",
  "method": "usb",
  "config": { "device": "/dev/usb/lp0" },
  "uptime": 12.34
}
```

**Teste de impressão:**

1. Sistema → Pedido → "Imprimir" → Tab "Térmica"
2. Clique **"Servidor Local"**

**Validação:**

- [ ] Requisição enviada (veja Network no DevTools)?
- [ ] Servidor recebe (veja console do servidor)?
- [ ] Log criado em `print-logs/`?
- [ ] Impressora imprime?
- [ ] Toast "Enviada para impressora!"?

**Troubleshooting:**

| Erro                      | Causa                | Solução                       |
| ------------------------- | -------------------- | ----------------------------- |
| "Servidor não encontrado" | Servidor não rodando | `node print-bridge-server.js` |
| "CORS error"              | Porta bloqueada      | Verifique firewall            |
| "Timeout"                 | Impressora offline   | Verifique conexão             |

---

## 🧪 Teste 7: Campos Personalizados

**Objetivo:** Validar seleção de campos

**Teste A - Mínimo:**

1. **Desmarque** todos os campos opcionais
2. Deixe apenas: Loja, Cliente, Laboratório, Status
3. Imprima

**Esperado:** Cupom minimalista com apenas dados essenciais

**Teste B - Completo:**

1. **Marque** todos os campos:
   - OS Loja ✓
   - OS Lab ✓
   - Telefone ✓
   - SLA ✓
   - Valores ✓
   - Observações ✓
   - Garantia ✓ (se pedido for garantia)
   - QR Code ✓
2. Imprima

**Esperado:** Cupom completo com todas as informações

**Validação:**

- [ ] Campos desmarcados não aparecem?
- [ ] Campos marcados aparecem?
- [ ] Formatação correta?
- [ ] Sem linhas em branco extras?

---

## 🧪 Teste 8: Pedidos Especiais

### Teste 8A - Pedido com Garantia

**Objetivo:** Validar destacamento de garantia

**Passos:**

1. Crie pedido com `eh_garantia = true`
2. Preencha `observacoes_garantia`
3. Imprima com "Garantia" marcado

**Esperado:**

```
------------------------------------------------
*** GARANTIA ***
Troca de lente riscada. Cliente apresentou
nota fiscal original.
------------------------------------------------
```

### Teste 8B - Pedido Atrasado (SLA)

**Objetivo:** Validar exibição de atraso

**Passos:**

1. Pedido com SLA negativo (atrasado)
2. Imprima com "SLA" marcado

**Esperado:**

```
SLA: ATRASADO (3 dias)
```

### Teste 8C - Pedido com Observações Longas

**Objetivo:** Validar quebra de texto

**Passos:**

1. Pedido com observações > 48 caracteres por linha
2. Imprima

**Esperado:**

- Texto quebrado automaticamente
- Sem corte de palavras no meio
- Formatação legível

---

## 🧪 Teste 9: Browsers

### Chrome

- [ ] USB Direto funciona?
- [ ] Download .PRN funciona?
- [ ] Servidor Local funciona?
- [ ] Todas configurações salvam?

### Edge

- [ ] USB Direto funciona?
- [ ] Download .PRN funciona?
- [ ] Servidor Local funciona?

### Firefox

- [ ] USB Direto → Deve mostrar erro "não disponível"
- [ ] Download .PRN funciona?
- [ ] Servidor Local funciona?

---

## 🧪 Teste 10: Performance

**Objetivo:** Validar velocidade de impressão

**Teste A - Impressão Simples:**

1. Pedido básico (sem QR, sem observações longas)
2. Cronometrar: Clique "USB Direto" → Cupom sai
3. **Meta:** < 3 segundos

**Teste B - Impressão Completa:**

1. Pedido completo (QR Code, observações, garantia)
2. Cronometrar
3. **Meta:** < 5 segundos

**Teste C - Múltiplas Cópias:**

1. 5 cópias de pedido completo
2. Cronometrar total
3. **Meta:** < 20 segundos (4s por cópia)

---

## 📊 Planilha de Testes

| #   | Teste                 | Status | Observações | Data |
| --- | --------------------- | ------ | ----------- | ---- |
| 1   | Download .PRN         | ⏳     | Pendente    | -    |
| 2   | QR Code               | ⏳     | Pendente    | -    |
| 3   | USB Direto            | ⏳     | Pendente    | -    |
| 4   | Múltiplas Cópias      | ⏳     | Pendente    | -    |
| 5   | Abertura Gaveta       | ⏳     | Pendente    | -    |
| 6   | Servidor Bridge       | ⏳     | Pendente    | -    |
| 7   | Campos Personalizados | ⏳     | Pendente    | -    |
| 8   | Pedidos Especiais     | ⏳     | Pendente    | -    |
| 9   | Browsers              | ⏳     | Pendente    | -    |
| 10  | Performance           | ⏳     | Pendente    | -    |

**Status:** ⏳ Pendente | ✅ Passou | ❌ Falhou | ⚠️ Parcial

---

## 🐛 Log de Bugs

Registre problemas encontrados:

### Bug #1: [Nome do Problema]

**Data:** DD/MM/YYYY  
**Teste:** Teste #X  
**Descrição:** [O que aconteceu]  
**Esperado:** [O que deveria acontecer]  
**Ambiente:** Chrome 120 / Epson i9 / Windows 11  
**Reproduzir:**

1. Passo 1
2. Passo 2
3. Resultado

**Fix:** [Como foi resolvido] ou [Status: Pendente]

---

## ✅ Critérios de Aceitação

Para considerar implementação **APROVADA**, todos devem passar:

- [x] Código compila sem erros
- [ ] Download .PRN gera arquivo válido
- [ ] Impressão USB funciona em Chrome/Edge
- [ ] QR Code é legível
- [ ] Múltiplas cópias imprimem corretamente
- [ ] Formatação 80mm está correta (sem cortes)
- [ ] Campos personalizáveis funcionam
- [ ] Performance < 5s por cupom
- [ ] Servidor bridge funciona (se usar)
- [ ] Documentação está completa

**Meta:** 10/10 ✅

---

## 📝 Relatório Final

Após testes, preencha:

**Testado por:** [Nome]  
**Data:** DD/MM/YYYY  
**Impressora:** [Marca/Modelo]  
**SO:** [Windows/Linux/macOS]  
**Browser:** [Chrome/Edge] versão [XX]

**Resumo:**

- Testes executados: X/10
- Testes passaram: X/10
- Bugs encontrados: X
- Bugs resolvidos: X

**Recomendação:**
[ ] Aprovar para produção  
[ ] Corrigir bugs antes de produção  
[ ] Mais testes necessários

**Observações:**
[Comentários gerais sobre a funcionalidade]

---

**Boa sorte nos testes! 🚀**

Qualquer problema, consulte:

- `IMPRESSAO-TERMICA-COMPLETA.md` - Documentação técnica
- `GUIA-RAPIDO-IMPRESSAO-TERMICA.md` - Guia do usuário
- `thermal-printer.ts` - Código fonte (comentado)
