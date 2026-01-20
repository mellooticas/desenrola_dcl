# 🎯 MIGRAÇÃO PARA PADRÃO CRM_ERP - GUIA COMPLETO

## 📊 SITUAÇÃO IDENTIFICADA

### **Problema:**

- O sistema usa **múltiplos bancos Supabase** (crm_erp, sis_vendas, sis_marketing, sis_finance)
- Todos esses bancos usam **O MESMO padrão de lojas** (7 lojas com IDs específicos)
- O banco **desenrola_dcl** tem lojas **DIFERENTES** (IDs antigos)
- Resultado: Filtros não funcionam (loja_id incompatível entre bancos)

### **Solução:**

Migrar o **desenrola_dcl** para usar o **padrão CRM_ERP** (usado em todos os outros sistemas)

---

## 📋 DADOS DA MIGRAÇÃO

### **Mapeamento de Lojas (Antigo → Novo):**

| Loja Antiga (desenrola_dcl) | Pedidos | →   | Loja Nova (padrão CRM)     | Produtos |
| --------------------------- | ------- | --- | -------------------------- | -------- |
| Suzano                      | 591     | →   | **Lancaster - Suzano**     | 491      |
| Escritório Central          | 47      | →   | Mello Óticas - Escritório  | 0        |
| Mauá                        | 1       | →   | Lancaster - Mauá           | 0        |
| Perus                       | 1       | →   | Mello Óticas - Perus       | 0        |
| Rio Pequeno                 | 0       | →   | Mello Óticas - Rio Pequeno | 17       |
| São Mateus                  | 0       | →   | Mello Óticas - São Mateus  | 0        |
| Suzano Centro               | 0       | →   | Mello Óticas - Suzano II   | 0        |

**Total:** 640 pedidos serão migrados

---

## 🚀 PASSO A PASSO DA MIGRAÇÃO

### **ETAPA 1: Validação Pré-Migração** ✅

```bash
node database/VALIDAR-PRE-MIGRACAO.js
```

**Verificações realizadas:**

- ✅ 7 lojas atuais identificadas
- ✅ 640 pedidos mapeados
- ✅ Integridade referencial OK
- ⚠️ 7 usuários precisam ser atualizados
- ⚠️ 14 laboratórios precisam ser atualizados

---

### **ETAPA 2: Backup Manual** (OBRIGATÓRIO)

1. Acesse: https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd
2. Vá em: **Database** → **Backups**
3. Clique: **Create backup**
4. Aguarde confirmação

---

### **ETAPA 3: Executar Migração SQL**

1. Abra: https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql/new
2. Copie todo o conteúdo de: `database/MIGRAR-LOJAS-PARA-PADRAO-CRM.sql`
3. Cole no editor SQL
4. Clique: **Run**
5. Aguarde execução completa (pode levar 1-2 minutos)

**O script vai:**

- ✅ Criar backup das lojas antigas (`lojas_backup_migracao`)
- ✅ Criar tabela de mapeamento temporária
- ✅ Atualizar 640 pedidos com novos IDs
- ✅ Atualizar 7 usuários
- ✅ Atualizar 14 laboratórios
- ✅ Deletar lojas antigas
- ✅ Inserir 7 lojas do padrão CRM_ERP
- ✅ Verificar integridade final

---

### **ETAPA 4: Validação Pós-Migração**

Execute no SQL Editor do Supabase:

```sql
-- Verificar lojas (deve ter 7 com nomes novos)
SELECT id, nome, ativo FROM lojas ORDER BY nome;

-- Verificar pedidos por loja (deve ter 640 total)
SELECT
  l.nome,
  COUNT(p.id) as total_pedidos
FROM lojas l
LEFT JOIN pedidos p ON p.loja_id = l.id
GROUP BY l.id, l.nome
ORDER BY l.nome;

-- Verificar se ficou algum órfão (deve ser 0)
SELECT COUNT(*) as pedidos_orfaos
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM lojas l WHERE l.id = p.loja_id
);
```

**Resultado esperado:**

- ✅ 7 lojas com nomes do padrão CRM
- ✅ 640 pedidos distribuídos nas novas lojas
- ✅ 0 pedidos órfãos

---

### **ETAPA 5: Testes no Sistema**

1. **Wizard de Nova Ordem:**
   - Criar novo pedido tipo COMPLETO (armação + lentes)
   - Verificar se filtro de armações funciona
   - Verificar se seleção de lente funciona
   - Salvar pedido com sucesso

2. **Dashboard:**
   - Verificar KPIs por loja (deve mostrar Lancaster - Suzano)
   - Verificar filtro de loja no topo

3. **Kanban:**
   - Verificar se pedidos aparecem corretamente
   - Filtrar por loja
   - Arrastar cards entre colunas

---

## 🔄 REVERSÃO (Se Necessário)

Caso algo dê errado, execute:

```sql
-- Restaurar lojas antigas
DELETE FROM lojas;

INSERT INTO lojas
SELECT * FROM lojas_backup_migracao;

-- ⚠️ ATENÇÃO: Pedidos ficarão com IDs novos!
-- Precisará refazer migração ou restaurar backup completo
```

**Recomendação:** Se precisar reverter, use o **backup do Supabase** (mais seguro)

---

## ✅ CRITÉRIOS DE SUCESSO

Após migração, você deve conseguir:

- ✅ Criar novo pedido no wizard sem erros
- ✅ Filtrar armações e ver produtos do CRM_ERP
- ✅ Selecionar lentes do catálogo sis_lens
- ✅ Ver dashboard com dados da loja Lancaster - Suzano
- ✅ Filtrar pedidos por loja no kanban

---

## 📁 ARQUIVOS CRIADOS

1. ✅ `database/VALIDAR-PRE-MIGRACAO.js` - Validação antes de migrar
2. ✅ `database/MIGRAR-LOJAS-PARA-PADRAO-CRM.sql` - Script SQL completo
3. ✅ `database/INVESTIGACAO-COMPLETA-LOJAS.js` - Análise detalhada
4. ✅ `docs/GUIA-MIGRACAO-PADRAO-CRM.md` - Este documento

---

## 🎯 RESULTADO FINAL

Após migração, o **desenrola_dcl** estará sincronizado com:

- crm_erp (produtos/estoque) ✅
- sis_vendas (PDV) ✅
- sis_marketing (campanhas) ✅
- sis_finance (financeiro) ✅
- Todos os outros sistemas que usam o padrão CRM ✅

**Benefícios:**

- ✅ Filtros de armação funcionam (loja_id compatível)
- ✅ Produtos aparecem corretamente
- ✅ Dados consistentes entre sistemas
- ✅ Facilita expansão futura
- ✅ Um único padrão para manter

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas:

1. Verifique os logs no SQL Editor
2. Execute as queries de validação pós-migração
3. Consulte o backup criado: `lojas_backup_migracao`
4. Se necessário, restaure o backup do Supabase

---

**Data de criação:** 19 de janeiro de 2026  
**Validação:** Pré-migração aprovada ✅  
**Status:** Pronto para executar 🚀
