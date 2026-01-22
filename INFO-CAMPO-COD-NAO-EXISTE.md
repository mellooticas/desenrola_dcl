# ℹ️ Informação: Campo `cod` não existe na view

## Situação

Você pediu para adicionar a coluna `cod` (código da haste da armação) na busca de armações. Porém, **essa coluna não existe** na view `vw_estoque_completo` do CRM_ERP.

## Colunas Disponíveis

A view `vw_estoque_completo` contém apenas estas 15 colunas:

```
produto_id          - UUID do produto
sku                 - Código SKU (ex: AR-QUA-PRE-55181401-192)
sku_visual          - Código Visual (ex: MO056094) ← Usado para busca
descricao           - Descrição completa da armação
tipo_produto        - Tipo (armacao, servico, null)
categoria_id        - ID da categoria
custo               - Preço de custo
preco_venda         - Preço de venda
codigo_barras       - Código de barras
loja_id             - ID da loja
quantidade_atual    - Quantidade em estoque
nivel_critico       - Nível crítico de estoque
nivel_ideal         - Nível ideal de estoque
ativo               - Se está ativo
status_estoque      - Status (NORMAL, CRITICO, SEM_ESTOQUE)
```

## O que está sendo buscado atualmente

A busca funciona com:

- ✅ `sku` - Código técnico (AR-QUA-PRE-55181401-192)
- ✅ `sku_visual` - Código visual (MO056094)
- ✅ `descricao` - Descrição completa (MELLO QUADRADO Preto ML52020...)

## Informações que poderiam ajudar

Se você quer adicionar **código da haste** ou outras informações técnicas da armação:

1. **Verificar na tabela `produtos`** (base table):
   - Pode ter colunas adicionais que não estão na view
   - Exemplo: `cod`, `tamanho`, `modelo_id`, `cor_id`, etc

2. **Criar uma nova query** que busque na tabela `produtos` diretamente:

   ```sql
   SELECT * FROM produtos
   WHERE tipo = 'armacao'
   AND (sku ILIKE '%MO056094%' OR cod ILIKE '%..%')
   ```

3. **Estender a view** `vw_estoque_completo`:
   - Adicionar as colunas que faltam (cod, tamanho, modelo, cor, marca)

## Recomendação

Qual informação específica você quer buscar? Assim posso:

- ✅ Verificar na tabela `produtos` se existe
- ✅ Atualizar a query para incluir
- ✅ Criar uma nova função se necessário
