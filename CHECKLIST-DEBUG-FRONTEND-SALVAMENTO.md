# 🔍 Checklist de Debug - Frontend (Salvamento de Campos)

## ✅ Validação Backend - CONCLUÍDA

- ✅ Triggers corrigidos (não sobrescrevem mais valores editados)
- ✅ Campos aceitam valores no banco
- ✅ Testes de INSERT/UPDATE funcionando

## ⚠️ PROBLEMA IDENTIFICADO: Frontend

### Evidência dos Dados Reais

```
Últimos 5 pedidos (26/01/2026):
- 3 pedidos SEM numero_pedido_laboratorio (60% falha)
- 5 pedidos SEM data_previsao_entrega (100% falha)
- Margens sendo calculadas corretamente
```

### 🎯 Hipótese Principal

**O wizard NÃO está enviando os campos no payload inicial.**

---

## 📋 CHECKLIST DE INSPEÇÃO

### 1️⃣ Localizar Arquivo do Wizard

**Procurar por:**

- [ ] `src/app/pedidos/novo/` ou similar
- [ ] `src/components/**/wizard*.tsx`
- [ ] Arquivo que contém o formulário de criação de pedido

**Comando para localizar:**

```bash
# No terminal do VS Code
grep -r "numero_pedido_laboratorio" src/ --include="*.tsx" --include="*.ts"
grep -r "data_previsao_entrega" src/ --include="*.tsx" --include="*.ts"
```

---

### 2️⃣ Verificar Estado/Form do Componente

**Buscar declarações de estado:**

```tsx
// Procurar por algo como:
const [numeroPedidoLaboratorio, setNumeroPedidoLaboratorio] = useState("");
const [dataPrevisaoEntrega, setDataPrevisaoEntrega] = useState<Date>();

// Ou Zustand/context:
const { numeroPedidoLaboratorio, dataPrevisaoEntrega } = usePedidoForm();
```

**Perguntas:**

- [ ] O estado existe no componente?
- [ ] Há inputs controlados para esses campos?
- [ ] Os valores são atualizados nos handlers (onChange)?

---

### 3️⃣ Inspecionar Payload do POST/PUT

**Procurar função de submit:**

```tsx
// Geralmente algo como:
const handleSubmit = async () => {
  const payload = {
    loja_id: lojaId,
    cliente_nome: clienteNome,
    // ⚠️ VERIFICAR SE ESSES CAMPOS ESTÃO INCLUÍDOS:
    numero_pedido_laboratorio: numeroPedidoLab, // ❓
    data_previsao_entrega: dataPrevisao, // ❓
    preco_lente: precoLente,
    custo_lente: custoLente,
  };

  await supabase.from("pedidos").insert(payload);
};
```

**Checklist do Payload:**

- [ ] `numero_pedido_laboratorio` está no objeto enviado?
- [ ] `data_previsao_entrega` está no objeto enviado?
- [ ] `preco_lente` (com desconto aplicado) está correto?
- [ ] `custo_lente` está sendo enviado?
- [ ] `servico_preco_real` (com desconto) está correto?

---

### 4️⃣ Teste de Console.log

**Adicionar logs temporários antes do insert/update:**

```tsx
const handleSubmit = async () => {
  const payload = {
    // ... todos os campos
  };

  // 🔍 DEBUG TEMPORÁRIO:
  console.log("🔍 PAYLOAD COMPLETO:", payload);
  console.log(
    "✅ numero_pedido_laboratorio:",
    payload.numero_pedido_laboratorio,
  );
  console.log("✅ data_previsao_entrega:", payload.data_previsao_entrega);
  console.log("✅ preco_lente (com desconto?):", payload.preco_lente);

  await supabase.from("pedidos").insert(payload);
};
```

---

### 5️⃣ Verificar Campos Condicionais

**Possíveis bloqueios:**

```tsx
// ⚠️ Verificar se há condições que impedem envio:
const payload = {
  ...(numeroPedidoLab && { numero_pedido_laboratorio: numeroPedidoLab }), // ❌ Ruim!
  data_previsao_entrega: dataPrevisao || null, // ✅ Melhor
};
```

**Problemas comuns:**

- [ ] Spread condicional (`&&`) remove campos vazios/undefined
- [ ] Validação impede envio se campo vazio
- [ ] Campo só é enviado em UPDATE, não em INSERT

---

### 6️⃣ Inspecionar Network Tab (DevTools)

**Como fazer:**

1. Abrir DevTools (F12) → aba **Network**
2. Filtrar por **Fetch/XHR**
3. Criar novo pedido no wizard
4. Procurar requisição `POST /rest/v1/pedidos`
5. Clicar na requisição → aba **Payload**

**Verificar:**

```json
{
  "loja_id": "uuid-aqui",
  "cliente_nome": "Nome do Cliente",
  "numero_pedido_laboratorio": "LAB-123", // ❓ Está presente?
  "data_previsao_entrega": "2026-02-28", // ❓ Está presente?
  "preco_lente": 280.0, // ❓ Com desconto?
  "custo_lente": 95.0
}
```

**Se os campos NÃO aparecerem no payload → problema confirmado no frontend.**

---

## 🛠️ Correções Prováveis

### Cenário 1: Campos não estão no estado

```tsx
// ✅ Adicionar estados faltantes:
const [numeroPedidoLaboratorio, setNumeroPedidoLaboratorio] =
  useState<string>("");
const [dataPrevisaoEntrega, setDataPrevisaoEntrega] = useState<Date | null>(
  null,
);
```

### Cenário 2: Inputs não existem no formulário

```tsx
// ✅ Adicionar inputs:
<Input
  label="Nº Pedido Laboratório"
  value={numeroPedidoLaboratorio}
  onChange={(e) => setNumeroPedidoLaboratorio(e.target.value)}
/>

<DatePicker
  label="Data Previsão Entrega"
  value={dataPrevisaoEntrega}
  onChange={setDataPrevisaoEntrega}
/>
```

### Cenário 3: Payload incompleto

```tsx
// ✅ Garantir que TODOS os campos editáveis sejam enviados:
const payload = {
  ...camposBasicos,
  // Campos editáveis (mesmo que vazios):
  numero_pedido_laboratorio: numeroPedidoLaboratorio || null,
  data_previsao_entrega: dataPrevisaoEntrega || null,
  // Preços com descontos aplicados:
  preco_lente: calcularPrecoComDesconto(precoTabela, descontoLente),
  custo_lente: custoLente,
  servico_preco_real: calcularPrecoComDesconto(servicoTabela, descontoServico),
  servico_custo: servicoCusto,
};
```

---

## 📊 Comparação: Esperado vs Realidade

### Comportamento ESPERADO (após correções):

```
Wizard → Preenche campos → Salvar
  ↓
POST /pedidos com payload COMPLETO
  ↓
Banco salva valores + triggers calculam margens
  ↓
✅ Tudo salvo corretamente
```

### Comportamento ATUAL (com problema):

```
Wizard → Preenche campos → Salvar
  ↓
POST /pedidos com payload INCOMPLETO (falta numero_pedido_laboratorio, data_previsao_entrega)
  ↓
Banco salva NULL nesses campos
  ↓
❌ Usuário precisa EDITAR depois para salvar
```

---

## 🎯 Próxima Ação

1. **Encontrar arquivo do wizard** (grep ou busca manual)
2. **Adicionar console.logs** no handleSubmit
3. **Criar pedido de teste** e verificar console
4. **Inspecionar Network** para confirmar payload
5. **Corrigir campos faltantes** no payload

---

## 📝 Observações Importantes

### ✅ O que JÁ está funcionando:

- Margens sendo calculadas (triggers OK)
- Salvamento direto no banco (testes passaram)
- UPDATE de campos funciona

### ❌ O que NÃO está funcionando:

- Campos não sendo enviados no INSERT inicial
- Necessidade de editar pedido após criação para salvar

### 🔍 Evidência nos dados reais:

```sql
-- Pedidos recentes mostram o padrão:
OS 752-751: têm numero_lab (foram editados depois?)
OS 750-749-748: NULL em tudo (criação inicial incompleta)
```

---

## 🚀 Depois da Correção

**Testar sequência completa:**

1. Criar novo pedido no wizard
2. Preencher número do laboratório
3. Editar data de entrega
4. Aplicar desconto
5. Salvar
6. Consultar banco imediatamente:

```sql
SELECT numero_sequencial, numero_pedido_laboratorio,
       data_previsao_entrega, preco_lente, margem_lente_percentual
FROM pedidos
ORDER BY created_at DESC LIMIT 1;
```

7. ✅ Todos os campos devem estar salvos no primeiro INSERT
