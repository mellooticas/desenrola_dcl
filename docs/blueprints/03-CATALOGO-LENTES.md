
# 👓 Blueprint: Catálogo de Lentes Inteligente

Módulo de integração com o banco de dados mestre "Best Lens Catalog" para padronização e inteligência de vendas.

## 🎯 Objetivos
- Eliminar o cadastro manual de lentes ("Lente Xpto").
- Garantir preços e prazos atualizados via catálogo centralizado.
- Permitir busca por nome comercial (Varilux, Kodak, Hoya).
- Mapear automaticamente fornecedor ideal para cada lente.

## 🔄 Fluxo de Dados
1.  **Frontend:** `LenteSelector` chama hook `useGruposCanonicos`.
2.  **Hook:** Conecta via `lentesClient` (Supabase Client secundário) ao banco `jrhevexrzaoeyhmpwvgs`.
3.  **Database (Externo):** View `public.v_grupos_canonicos_completos` retorna dados agregados (Lente + Fornecedores + Preços).
4.  **Seleção:** Usuário clica -> Sistema retorna objeto completo com `slug`, `preco_medio`, `fornecedor_id`.
5.  **Persistência:** Dados críticos (ID do grupo, ID da lente, Nome Snapshot) salvos na tabela `pedidos` do DCL.

## 🧩 Componentes Chave
- `src/components/lentes/LenteSelector.tsx`: UI de busca e filtros.
- `src/lib/supabase/lentes-client.ts`: Cliente isolado e seguro.
- `src/lib/hooks/useLentesCatalogo.ts`: React Query hooks para caching e fetch.

## 📦 Banco de Dados (Best Lens Catalog)
- `lens_catalog.grupos_canonicos`: Agrupamentos lógicos (ex: Varilux Comfort 1.50).
- `lens_catalog.lentes`: SKUs específicos.
- `core.fornecedores`: Laboratórios parceiros (ex: So Blocos, Polylux).
- `public.v_grupos_canonicos_completos`: View Interface para o DCL.

## ✅ Status Atual
- ✅ Cliente configurado e autenticado.
- ✅ View criada e acessível (Erro 205 resolvido).
- ✅ Seletor integrado ao formulário de pedidos.
- ✅ Snapshots de nome implementados.
