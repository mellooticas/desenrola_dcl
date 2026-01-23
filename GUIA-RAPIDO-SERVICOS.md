# 🚀 GUIA RÁPIDO - Implementar Serviços

## 📋 Passo 1: Executar SQL no Supabase

**Arquivo:** `database/ADD-CAMPOS-SERVICOS.sql`

1. Abra o Supabase SQL Editor
2. Cole o conteúdo do arquivo
3. Execute (Run)
4. Verifique a mensagem: "Campos de serviço adicionados com sucesso!"

---

## 🧪 Passo 2: Testar no Sistema

### Teste 1: Pedido de Lentes + Montagem

```
1. Abrir "Nova Ordem"
2. Selecionar loja e OS
3. Tipo: "Só Lentes"
4. Selecionar lentes do laboratório
5. Na tela de cliente:
   - Preencher dados do cliente
   - 🔧 Seção "Serviço Adicional":
     * Selecionar "Montagem de Lentes" (R$ 30)
     * Aplicar desconto: 10% → R$ 27
     * Informar montador: "João Silva"
6. Revisar (deve mostrar serviço com preços)
7. Salvar
```

### Teste 2: Pedido Completo + Serviço

```
1. Nova Ordem
2. Tipo: "Completo"
3. Selecionar armação
4. Selecionar lentes
5. Cliente + Serviço:
   - Escolher "Ajuste de Armação" (R$ 10)
   - Sem desconto
6. Revisar e Salvar
```

---

## 🔍 Passo 3: Verificar no Banco

```sql
-- Ver último pedido com serviço
SELECT
  id,
  numero_os_fisica,
  tipo_pedido,
  cliente_nome,
  servico_descricao,
  servico_preco_tabela,
  servico_desconto_percentual,
  servico_preco_final,
  montador_nome,
  created_at
FROM pedidos
WHERE servico_produto_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado Esperado:**

```
| id | numero_os_fisica | tipo_pedido | servico_descricao | servico_preco_final | montador_nome |
|----|------------------|-------------|-------------------|---------------------|---------------|
| ... | 12345 | LENTES | Montagem de Lentes | 27.00 | João Silva |
```

---

## ✅ Checklist de Validação

- [ ] Script SQL executado sem erros
- [ ] Campos aparecem na tabela `pedidos`
- [ ] Seção "Serviço Adicional" aparece no Step5
- [ ] Lista mostra os 15 serviços disponíveis
- [ ] Campo desconto calcula corretamente
- [ ] Campo montador aparece para serviços de montagem
- [ ] Step6 (revisão) mostra serviço selecionado
- [ ] Pedido salva sem erros
- [ ] Dados aparecem corretamente no banco

---

## 🐛 Troubleshooting

### Erro: "relation does not exist"

**Solução:** Execute o script ADD-CAMPOS-SERVICOS.sql no Supabase

### Serviços não aparecem na lista

**Solução:** Verifique se o banco CRM_ERP está configurado nas variáveis de ambiente:

```env
CRM_ERP_SUPABASE_URL=...
CRM_ERP_SUPABASE_ANON_KEY=...
```

### Campo montador não aparece

**Solução:** O campo só aparece se o serviço contém "montag" no nome

### Desconto não calcula

**Solução:** Certifique-se de que o valor está entre 0-100

---

## 📊 Queries Úteis

### Total de pedidos com serviço hoje:

```sql
SELECT COUNT(*)
FROM pedidos
WHERE servico_produto_id IS NOT NULL
  AND DATE(created_at) = CURRENT_DATE;
```

### Serviço mais usado:

```sql
SELECT
  servico_descricao,
  COUNT(*) as total
FROM pedidos
WHERE servico_produto_id IS NOT NULL
GROUP BY servico_descricao
ORDER BY total DESC
LIMIT 1;
```

### Receita de serviços hoje:

```sql
SELECT
  SUM(servico_preco_final) as receita_servicos
FROM pedidos
WHERE servico_produto_id IS NOT NULL
  AND DATE(created_at) = CURRENT_DATE;
```

---

## 🎯 Próximo: Acessórios

Após validar os serviços, implementar salvamento de acessórios:

1. Decidir: JSONB ou tabela relacionada
2. Criar campos/tabela
3. Adicionar lógica de salvamento
4. Testar fluxo completo

---

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** Fácil ⭐  
**Status:** Pronto para produção ✅
