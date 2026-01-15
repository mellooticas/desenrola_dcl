# ✅ Checklist Final - O Que Fazer Agora

## 🎯 Baseado nos Dados do Diagnóstico

### Situação Confirmada:

- ✅ 5 pedidos com montador já vinculado (status ENVIADO)
- ✅ 10+ montadores cadastrados
- ❌ Tabela `pedidos` falta 4 colunas essenciais
- ❌ Sistema em produção com problema

---

## 📝 Ações Imediatas

### 1️⃣ EXECUTAR SQL NO SUPABASE (1 minuto)

**Arquivo:** `database/EXECUTAR-AGORA-fix-montadores.sql`

**Como fazer:**

1. Abrir Supabase → SQL Editor
2. Copiar todo o conteúdo do arquivo
3. Clicar em "Run"
4. Verificar se apareceram 3 seções de resultados

**O que vai acontecer:**

- ✅ Adiciona 5 colunas na tabela `pedidos`
- ✅ Atualiza os 5 pedidos existentes com dados dos montadores
- ✅ Corrige permissão de edição (RLS)
- ✅ Valida tudo automaticamente

---

### 2️⃣ TESTAR (3 minutos)

#### Teste A: Kanban - Atribuir Montador

```
1. Ir para /kanban
2. Pegar um pedido qualquer
3. Arrastar para "Enviado"
4. Selecionar montador "Thiago" ou "Douglas"
5. ✅ Deve salvar SEM erro no console
6. ✅ Toast de sucesso deve aparecer
```

#### Teste B: Ver Detalhes do Montador

```
1. Abrir pedido #629 ou #577 (que têm montador)
2. Ir para /pedidos/[id]
3. ✅ Deve aparecer card "Montador Responsável"
4. ✅ Deve mostrar nome e local
```

#### Teste C: Editar Pedido

```
1. Abrir qualquer pedido
2. Clicar em "Editar"
3. Mudar "Observações"
4. Salvar
5. ✅ Deve salvar sem erro
```

---

### 3️⃣ VERIFICAR Console do Navegador

Após cada teste, apertar **F12** e verificar:

- ✅ Sem erros vermelhos
- ✅ Update do Supabase retorna 200 OK

---

## 🐛 Se Algo Der Errado

### Erro: "column already exists"

- ✅ Normal! Significa que alguém já executou
- Ignorar e continuar

### Erro: "permission denied"

- Usar SQL Editor do Supabase (não API)
- Verificar se está logado como admin

### Kanban não salva montador

- Verificar console do navegador
- Procurar erro específico
- Ver aba Network → procurar request que falhou

### Montador não aparece nos detalhes

1. Verificar se pedido realmente tem `montador_id` preenchido
2. Rodar query:

```sql
SELECT montador_id, montador_nome, montador_local
FROM pedidos
WHERE id = 'COLE_ID_DO_PEDIDO_AQUI';
```

---

## 📊 Queries Úteis (se precisar debugar)

### Ver todos os pedidos com montador:

```sql
SELECT
  numero_sequencial,
  cliente_nome,
  montador_nome,
  montador_local
FROM pedidos
WHERE montador_id IS NOT NULL;
```

### Ver colunas da tabela pedidos:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%montador%';
```

---

## ✅ Critérios de Sucesso

**Tudo funcionando quando:**

- ✅ SQL executou sem erro
- ✅ Kanban salva montador sem erro
- ✅ Detalhes mostram informações do montador
- ✅ Edição de pedidos funciona
- ✅ Console sem erros

**Pronto para commit quando:**

- ✅ Todos os 3 testes passaram
- ✅ Nenhum erro no console
- ✅ Queries de validação retornam dados corretos

---

## 🚀 Após Tudo Funcionar

```bash
git add .
git commit -m "fix: adicionar campos de montador e corrigir RLS de edição"
git push
```

---

## 📞 Precisa de Ajuda?

**Se encontrar erro específico:**

1. Copiar mensagem de erro completa
2. Copiar query SQL que deu erro (se houver)
3. Me mostrar o erro e eu ajudo

**Tempo estimado total:** 5 minutos ⏱️

- 1 min: executar SQL
- 3 min: testes
- 1 min: commit

Boa sorte! 🍀
