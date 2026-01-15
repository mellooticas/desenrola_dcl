-- ============================================================
-- VERIFICAR: Como está a view v_kanban_colunas atualmente
-- ============================================================

-- Ver estrutura da view
SELECT * FROM v_kanban_colunas LIMIT 1;

| coluna_id | coluna_nome | icone | ordem | descricao                                                | cor     |
| --------- | ----------- | ----- | ----- | -------------------------------------------------------- | ------- |
| pendente  | Pendente    | ⏳     | 1     | Aguardando DCL escolher lente e registrar no laboratório | #94a3b8 |


-- Ver todas as colunas
SELECT * FROM v_kanban_colunas ORDER BY ordem;

| coluna_id  | coluna_nome | icone | ordem | descricao                                                | cor     |
| ---------- | ----------- | ----- | ----- | -------------------------------------------------------- | ------- |
| pendente   | Pendente    | ⏳     | 1     | Aguardando DCL escolher lente e registrar no laboratório | #94a3b8 |
| rascunho   | Rascunho    | 📝    | 2     | Pedido em rascunho                                       | #6b7280 |
| registrado | Registrado  | 📋    | 3     | Registrado no laboratório, aguardando número do pedido   | #3b82f6 |
| pago       | Pago        | 💰    | 4     | Pagamento confirmado                                     | #eab308 |
| producao   | Produção    | ⚙️    | 5     | Em produção no laboratório                               | #f97316 |
| pronto     | Pronto      | ✅     | 6     | Pronto no laboratório                                    | #8b5cf6 |
| enviado    | Enviado     | 📦    | 7     | Laboratório enviou o produto                             | #8b5cf6 |
| entregue   | Entregue    | 🎉    | 8     | Produto entregue na loja                                 | #10b981 |


-- Ver quantas colunas temos
SELECT COUNT(*) as total_colunas FROM v_kanban_colunas;


| total_colunas |
| ------------- |
| 8             |
