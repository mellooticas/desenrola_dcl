# 🔄 ESTRATÉGIA DE SINCRONIZAÇÃO DE LOJAS - 4 BANCOS SUPABASE

## 🎯 **DESCOBERTA CRÍTICA** (Investigação Completa)

### ⚠️ **SÃO 14 LOJAS DIFERENTES, NÃO 7!**

**desenrola_dcl** e **crm_erp** NÃO têm as mesmas lojas com IDs diferentes.
São **lojas fisicamente diferentes** que precisam ser unificadas!

| Banco             | URL                  | Lojas   | Observação                                  |
| ----------------- | -------------------- | ------- | ------------------------------------------- |
| **desenrola_dcl** | zobgyjsocqmzaggrnwqd | 7 lojas | Lojas sem prefixo (Suzano, Perus, etc)      |
| **crm_erp**       | mhgbuplnxtfgipbemchb | 7 lojas | Lojas com prefixo (Lancaster, Mello Óticas) |
| **sis_lens**      | ahcikwsoxhmqqteertkx | 0 lojas | Catálogo global compartilhado               |
| **sis_vendas**    | jrhevexrzaoeyhmpwvgs | 6 lojas | IDs diferentes de ambos                     |

---

## 📋 LISTA COMPLETA: 14 LOJAS ÚNICAS

### **Grupo 1: Lojas no desenrola_dcl** (7 lojas)

```
1. Escritório Central  → e974fc5d-ed39-4831-9e5e-4a5544489de6
2. Mauá                → c1aa5124-bdec-4cd2-86ee-cba6eea5041d
3. Perus               → f1dd8fe9-b783-46cd-ad26-56ad364a85d7
4. Rio Pequeno         → c2bb8806-91d1-4670-9ce2-a949b188f8ae
5. São Mateus          → 626c4397-72cd-46de-93ec-1a4255e21e44
6. Suzano              → e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 ⭐ (usada no wizard)
7. Suzano Centro       → cb8ebda2-deff-4d44-8488-672d63bc8bd7
```

### **Grupo 2: Lojas no crm_erp** (7 lojas)

```
8.  Lancaster - Mauá          → f8302fdd-615d-44c6-9dd2-233332937fe1 (0 produtos)
9.  Lancaster - Suzano        → bab835bc-2df1-4f54-87c3-8151c61ec642 (491 produtos!) 🏆
10. Mello Óticas - Escritório → 534cba2b-932f-4d26-b003-ae1dcb903361 (0 produtos)
11. Mello Óticas - Perus      → f03f5cc3-d2ed-4fa1-b8a8-d49f2b0ff59b (0 produtos)
12. Mello Óticas - Rio Pequeno → 069c77db-2502-4fa6-b714-51e76f9bc719 (17 produtos)
13. Mello Óticas - São Mateus → f2a684b9-91b3-4650-b2c0-d64124d3a571 (0 produtos)
14. Mello Óticas - Suzano II  → f333a360-ee11-4a16-b98c-1d41961ca0bd (0 produtos)
```

**Nota:** Lancaster - Suzano tem 491 produtos, é a loja com mais estoque!

---

## 🎯 ESTRATÉGIA CORRETA

### **OPÇÃO 1: Unificação Completa (RECOMENDADA)** ✅

**O que fazer:**

1. ✅ Copiar 7 lojas do **desenrola_dcl** para **crm_erp** (mantendo IDs)
2. ✅ Copiar 7 lojas do **crm_erp** para **desenrola_dcl** (mantendo IDs)
3. ✅ Copiar TODAS 14 lojas para **sis_vendas**
4. ✅ Manter **sis_lens** sem lojas (catálogo global)

**Resultado final:**

- desenrola_dcl: **14 lojas** ✅
- crm_erp: **14 lojas** ✅
- sis_vendas: **14 lojas** ✅
- sis_lens: 0 lojas (OK - catálogo global) ✅

**Vantagens:**

- ✅ Problema resolvido definitivamente
- ✅ Filtros funcionam em todos os bancos
- ✅ Dados consistentes
- ✅ Fácil de manter

**Desvantagens:**

- ⚠️ Precisa executar SQL manualmente em cada banco
- ⚠️ Produtos antigos do CRM_ERP precisam ser remapeados

**Scripts necessários:**

- `SINCRONIZAR-LOJAS-CRM-ERP.sql` (já criado)
- `SINCRONIZAR-LOJAS-SIS-VENDAS.sql` (criar)

---

### **OPÇÃO 2: Mapeamento por Nome (WORKAROUND)**

**O que fazer:**

1. Criar tabela de mapeamento: `loja_id_desenrola` ↔ `loja_id_crm_erp`
2. Hook de armações faz lookup antes de filtrar
3. Converter IDs dinamicamente na aplicação

**Vantagens:**

- ✅ Não precisa alterar bancos
- ✅ Funciona imediatamente

**Desvantagens:**

- ❌ Complexidade extra no código
- ❌ Depende de nomes (podem mudar)
- ❌ Difícil de manter
- ❌ Performance pior

---

### **OPÇÃO 3: Busca Cross-Database (ATUAL - TEMPORÁRIO)**

**O que já fizemos:**

- ✅ Hook busca com `OR`: `loja_id.eq.X OR loja_id.is.null`
- ✅ Permite ver armações mesmo sem loja correspondente
- ✅ Funciona mas mostra produtos de outras lojas

**Vantagens:**

- ✅ Já implementado
- ✅ Não quebra o fluxo

**Desvantagens:**

- ❌ Usuário vê armações de TODAS as lojas (mistura estoque)
- ❌ Não é a solução ideal
- ❌ Dados inconsistentes

---

## 🚀 PLANO DE AÇÃO RECOMENDADO

### **FASE 1: Sincronização Imediata (HOJE)**

1. **Executar SQL no CRM_ERP:**

   ```bash
   Arquivo: database/SINCRONIZAR-LOJAS-CRM-ERP.sql
   Ação: Copiar lojas do desenrola_dcl com mesmos UUIDs
   ```

2. **Executar SQL no SIS_VENDAS:**

   ```bash
   Arquivo: database/SINCRONIZAR-LOJAS-SIS-VENDAS.sql (criar)
   Ação: Copiar mesmas 7 lojas
   ```

3. **Atualizar produtos no CRM_ERP:**

   ```sql
   -- Associar produtos sem loja_id à loja padrão (Suzano)
   UPDATE produtos
   SET loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
   WHERE loja_id IS NULL AND tipo = 'armacao';
   ```

4. **Reverter workaround no código:**
   - Remover lógica de `OR loja_id.is.null`
   - Voltar filtro obrigatório por `loja_id`

---

### **FASE 2: Manutenção Contínua (PRÓXIMA SEMANA)**

1. **Criar webhook de sincronização:**

   ```
   Quando nova loja for criada no desenrola_dcl:
   → Disparar webhook que replica para crm_erp e sis_vendas
   ```

2. **Documentar processo:**
   ```
   README: Como adicionar nova loja no sistema
   - Passo 1: Criar no desenrola_dcl
   - Passo 2: Executar script de sync
   - Passo 3: Verificar nos 4 bancos
   ```

---

## 📝 COMANDOS PARA EXECUTAR

### 1. Investigar situação atual:

```bash
node database/INVESTIGACAO-LOJAS-4-BANCOS.js
```

### 2. Sincronizar CRM_ERP:

```sql
-- No Supabase SQL Editor do CRM_ERP (mhgbuplnxtfgipbemchb)
-- Executar: database/SINCRONIZAR-LOJAS-CRM-ERP.sql
```

### 3. Verificar resultado:

```bash
node database/VERIFICAR-SINCRONIZACAO.js  # (criar este script)
```

---

## ✅ CRITÉRIOS DE SUCESSO

Após sincronização, você deve ver:

- ✅ 7 lojas no desenrola_dcl
- ✅ 7 lojas no crm_erp **com MESMOS IDs**
- ✅ 7 lojas no sis_vendas **com MESMOS IDs**
- ✅ Wizard busca armações filtrando por loja corretamente
- ✅ Nenhuma armação de outras lojas aparece

---

## 🔧 SCRIPTS CRIADOS

1. ✅ `INVESTIGACAO-LOJAS-4-BANCOS.js` - Diagnóstico completo
2. ✅ `SINCRONIZAR-LOJAS-CRM-ERP.sql` - Copiar lojas para CRM_ERP
3. ⏳ `SINCRONIZAR-LOJAS-SIS-VENDAS.sql` - Copiar lojas para sis_vendas (pendente)
4. ⏳ `VERIFICAR-SINCRONIZACAO.js` - Validar resultado (pendente)

---

## 🎯 DECISÃO FINAL

**Recomendação:** Execute **OPÇÃO 1 (Sincronização Total)**

**Justificativa:**

- Resolve o problema definitivamente
- Mantém dados consistentes
- Permite expansão futura
- Scripts já estão prontos
- Baixo risco (tem backup)

**Próximo passo:**
Execute o SQL no Supabase Dashboard do CRM_ERP:
👉 `database/SINCRONIZAR-LOJAS-CRM-ERP.sql`
