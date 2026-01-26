# ✅ CORREÇÕES APLICADAS - Salvamento de Campos Editáveis

## 📋 Resumo Executivo

**Data**: 26/01/2026  
**Problema**: Valores não salvando no wizard de pedidos  
**Status**: ✅ **CORRIGIDO** (backend + frontend)

---

## 🔍 Problemas Identificados

### 1️⃣ **Backend** - ✅ Resolvido

- **Problema**: Triggers recalculavam datas em todo UPDATE
- **Solução**: Modificados triggers para só calcular no INSERT
- **Arquivo**: `CORRECAO-SALVAMENTO-CRITICO.sql`
- **Status**: ✅ Testado e funcionando

### 2️⃣ **Frontend - Problema 1** - ✅ Resolvido

- **Campo**: `numero_pedido_laboratorio`
- **Problema**: Condicional `if` impedia envio de valores vazios
- **Antes**:
  ```tsx
  if (data.numero_pedido_laboratorio) {
    pedidoData.numero_pedido_laboratorio = data.numero_pedido_laboratorio;
  }
  ```
- **Depois**:
  ```tsx
  pedidoData.numero_pedido_laboratorio = data.numero_pedido_laboratorio || null;
  ```
- **Arquivo**: [NovaOrdemWizard.tsx](src/components/forms/NovaOrdemWizard.tsx#L404-L407)
- **Status**: ✅ Corrigido

### 3️⃣ **Frontend - Problema 2** - ✅ Resolvido

- **Campo**: `data_previsao_entrega`
- **Problema 1**: Salvando no campo errado (`data_prometida` em vez de `data_previsao_entrega`)
- **Problema 2**: Condicional impedia envio de valores vazios
- **Antes**:
  ```tsx
  if (data.data_prometida_manual) {
    pedidoData.data_prometida = data.data_prometida_manual; // ❌ Campo errado
  }
  ```
- **Depois**:
  ```tsx
  pedidoData.data_previsao_entrega = data.data_prometida_manual || null; // ✅ Correto
  ```
- **Arquivo**: [NovaOrdemWizard.tsx](src/components/forms/NovaOrdemWizard.tsx#L341-L347)
- **Status**: ✅ Corrigido

---

## 📊 Evidências do Problema (Antes da Correção)

```sql
-- Últimos 5 pedidos criados (26/01/2026):
OS 752: JOÃO FELIPE   → ✅ numero_lab | ❌ data_entrega = NULL
OS 751: PRISCILA      → ✅ numero_lab | ❌ data_entrega = NULL
OS 750: BEATRIZ       → ❌ numero_lab = NULL | ❌ data_entrega = NULL
OS 749: IVALCIR       → ❌ numero_lab = NULL | ❌ data_entrega = NULL
OS 748: DELZENI       → ❌ numero_lab = NULL | ❌ data_entrega = NULL
```

**Taxa de falha**:

- `numero_pedido_laboratorio`: 60% (3 de 5 sem valor)
- `data_previsao_entrega`: 100% (5 de 5 sem valor)

---

## 🧪 Testes de Validação

### ✅ Teste 1: Backend (SQL)

```bash
# Executar script de validação
# Resultado: TODOS OS TESTES PASSARAM ✅
```

**Resultados**:

- ✅ INSERT com campos editáveis: OK
- ✅ UPDATE preserva valores: OK
- ✅ Triggers não sobrescrevem: OK
- ✅ Margens calculadas corretamente: 68.75%

### ⏳ Teste 2: Frontend (Aguardando)

**Instruções**: Ver seção "Roteiro de Teste" abaixo

---

## 🎯 Arquivos Modificados

### Backend (Database)

1. ✅ `INVESTIGACAO-SALVAMENTO-CRITICO.sql` - Queries de diagnóstico
2. ✅ `CORRECAO-SALVAMENTO-CRITICO.sql` - Correção de triggers
3. ✅ `VALIDACAO-SALVAMENTO-PRATICO.sql` - Testes automatizados

### Frontend (TypeScript/React)

1. ✅ `src/components/forms/NovaOrdemWizard.tsx`
   - Linha 404: `numero_pedido_laboratorio` sempre enviado
   - Linha 342: `data_previsao_entrega` campo correto + sempre enviado

---

## 📝 Roteiro de Teste (Frontend)

### Pré-requisitos

1. ✅ Backend corrigido (triggers atualizados)
2. ✅ Frontend corrigido (campos sempre enviados)
3. ✅ Build/restart do Next.js (se necessário)

### Teste 1: Criar Pedido Completo

1. Abrir wizard de novo pedido
2. Preencher dados básicos (loja, cliente, etc)
3. **Campo crítico 1**: Preencher "Número do Pedido no Laboratório" = `TESTE-001`
4. **Campo crítico 2**: Editar "Data de Previsão de Entrega" = `28/02/2026`
5. Aplicar desconto em lentes (ex: 20% desconto)
6. **SALVAR**
7. Verificar no banco:
   ```sql
   SELECT numero_sequencial, numero_pedido_laboratorio,
          data_previsao_entrega, preco_lente, margem_lente_percentual
   FROM pedidos
   ORDER BY created_at DESC LIMIT 1;
   ```

**Resultado esperado**:

```
OS    | numero_lab | data_entrega | preco_lente | margem
------|------------|--------------|-------------|-------
762   | TESTE-001  | 2026-02-28   | 280.00      | 66.07%
```

### Teste 2: Criar Pedido SEM Preencher Campos Opcionais

1. Criar novo pedido
2. **NÃO preencher** "Número do Pedido no Laboratório"
3. **NÃO editar** data de previsão (deixar calculada automaticamente)
4. Salvar
5. Verificar no banco:
   ```sql
   SELECT numero_sequencial, numero_pedido_laboratorio,
          data_previsao_entrega
   FROM pedidos
   ORDER BY created_at DESC LIMIT 1;
   ```

**Resultado esperado**:

```
OS  | numero_lab | data_entrega
----|------------|-------------
763 | NULL       | 2026-02-05  (calculada automaticamente)
```

### Teste 3: Editar Pedido Existente

1. Abrir pedido existente (ex: OS 750 que tinha NULL)
2. Editar "Número do Pedido no Laboratório" = `LAB-EDITADO-999`
3. Editar "Data de Previsão de Entrega" = `10/03/2026`
4. **SALVAR**
5. Verificar no banco:
   ```sql
   SELECT numero_pedido_laboratorio, data_previsao_entrega
   FROM pedidos
   WHERE numero_sequencial = 750;
   ```

**Resultado esperado**:

```
numero_lab        | data_entrega
------------------|-------------
LAB-EDITADO-999   | 2026-03-10
```

---

## 🔍 Debug (Se Algo Falhar)

### Console do Browser (F12)

Procurar logs do wizard:

```
[Wizard] 🔢 Número pedido laboratório: TESTE-001
[Wizard] 📅 Data previsão entrega manual: 2026-02-28
[NovaOrdemWizard] Dados preparados para insert: {...}
```

### Network Tab (DevTools)

1. Filtrar por `POST /rest/v1/pedidos`
2. Clicar na requisição → aba **Payload**
3. Verificar se está presente:
   ```json
   {
     "numero_pedido_laboratorio": "TESTE-001",
     "data_previsao_entrega": "2026-02-28",
     "preco_lente": 280.0,
     "custo_lente": 95.0
   }
   ```

### Query de Diagnóstico Rápido

```sql
-- Ver últimos 10 pedidos criados hoje
SELECT
  numero_sequencial,
  cliente_nome,
  numero_pedido_laboratorio,
  data_previsao_entrega,
  margem_lente_percentual,
  created_at::TIME as hora_criacao
FROM pedidos
WHERE created_at::DATE = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist de Validação Final

### Backend

- [x] Script de correção executado
- [x] Triggers modificados (atualizar_datas_pedido, populate_data_prometida)
- [x] Testes SQL passaram (5/5)
- [x] Pedido de teste criado (OS 761)

### Frontend

- [x] `numero_pedido_laboratorio` sempre enviado
- [x] `data_previsao_entrega` campo correto
- [x] `data_previsao_entrega` sempre enviado
- [ ] **PENDENTE**: Teste end-to-end no wizard
- [ ] **PENDENTE**: Verificar payload no Network Tab
- [ ] **PENDENTE**: Consultar banco após criação de pedido real

---

## 🚀 Próximos Passos

1. **Testar wizard de criação** (roteiro acima)
2. **Verificar pedidos reais** criados após correção
3. **Monitorar** se problema persiste nos próximos pedidos
4. **Se tudo OK**: Fechar issue e documentar solução
5. **Se problema persistir**: Investigar outros wizards (CriarPedidoWizardV2.tsx)

---

## 📚 Documentação Relacionada

- [INVESTIGACAO-SALVAMENTO-CRITICO.sql](../database/INVESTIGACAO-SALVAMENTO-CRITICO.sql) - Diagnóstico completo
- [CORRECAO-SALVAMENTO-CRITICO.sql](../database/CORRECAO-SALVAMENTO-CRITICO.sql) - Correção de triggers
- [VALIDACAO-SALVAMENTO-PRATICO.sql](../database/VALIDACAO-SALVAMENTO-PRATICO.sql) - Suite de testes
- [CHECKLIST-DEBUG-FRONTEND-SALVAMENTO.md](../CHECKLIST-DEBUG-FRONTEND-SALVAMENTO.md) - Guia de debug frontend
- [NovaOrdemWizard.tsx](src/components/forms/NovaOrdemWizard.tsx) - Wizard corrigido

---

## 💡 Lições Aprendidas

### Problema Raiz

1. **Confusão de campos**: `data_prometida` vs `data_previsao_entrega`
2. **Condicionais excessivas**: `if (campo)` impedia envio de NULL
3. **Triggers agressivos**: Recalculavam em UPDATE

### Solução

1. **Sempre enviar campos editáveis** (mesmo que null)
2. **Usar campo correto** no banco
3. **Triggers inteligentes**: Só calculam no INSERT

### Prevenção Futura

- ✅ Documentar campos editáveis vs calculados
- ✅ Sempre enviar campos no payload (evitar condicionais)
- ✅ Triggers devem verificar TG_OP (INSERT vs UPDATE)
- ✅ Testes automatizados para campos críticos

---

**Status Final**: ✅ Correções aplicadas - Aguardando teste end-to-end no frontend
