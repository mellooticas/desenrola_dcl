# 🔧 Ordem de Execução: Lentes de Contato

## ⚠️ Problema do Enum Resolvido

**Erro original:**

```
ERROR: 55P04: unsafe use of new value "LENTES_CONTATO" of enum type tipo_pedido_enum
HINT: New enum values must be committed before they can be used.
```

**Causa:** PostgreSQL requer que novos valores de ENUM sejam commitados antes de poderem ser usados.

---

## ✅ Ordem Correta de Execução

### 1️⃣ Adicionar valor ao ENUM (EXECUTAR SOZINHO)

**Arquivo:** `database/ADD-LENTES-CONTATO-ENUM.sql`

```bash
# Execute este script SOZINHO no Supabase SQL Editor
# Aguarde o commit automático antes de continuar
```

**O que faz:**

- Adiciona `'LENTES_CONTATO'` ao enum `public.tipo_pedido_enum`
- Verifica se já existe antes de adicionar
- Mostra todos os valores do enum

---

### 2️⃣ Criar tabela e view (EXECUTAR DEPOIS)

**Arquivo:** `database/reestruturation_database_sis_lens/12_CREATE_LENTES_CONTATO.sql`

```bash
# Execute APÓS o passo 1 estar completo
```

**O que faz:**

- Cria `lens_catalog.lentes_contato` (SEM grupos canônicos)
- Cria índices de performance
- Cria trigger `updated_at`
- Cria **view pública** `public.v_lentes_contato` para frontend
- Insere 1 exemplo (Acuvue Oasys)

---

## 📊 Estrutura Simplificada

### Sem Grupos Canônicos ✅

Cada produto é **único** por marca/referência:

- Acuvue Oasys 24 lentes = 1 registro
- Biofinity 6 lentes = 1 registro
- Dailies Total 1 = 1 registro

### View Pública para Frontend

```sql
-- Frontend consome:
SELECT * FROM public.v_lentes_contato
WHERE eh_torica = true
ORDER BY preco_venda_sugerido_caixa;
```

---

## 🎯 Hook React (a criar)

```typescript
// src/lib/hooks/useLentesContato.ts
export function useLentesContato(filtros?: {
  tipo?: string;
  marca_id?: string;
  eh_torica?: boolean;
  eh_multifocal?: boolean;
}) {
  return useQuery({
    queryKey: ["lentes-contato", filtros],
    queryFn: async () => {
      let query = supabase
        .from("v_lentes_contato")
        .select("*")
        .order("preco_venda_sugerido_caixa");

      if (filtros?.tipo) {
        query = query.eq("tipo_lente_contato", filtros.tipo);
      }

      if (filtros?.marca_id) {
        query = query.eq("marca_id", filtros.marca_id);
      }

      if (filtros?.eh_torica) {
        query = query.eq("eh_torica", true);
      }

      if (filtros?.eh_multifocal) {
        query = query.eq("eh_multifocal", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

---

## ✅ Checklist de Execução

- [ ] 1. Executar `ADD-LENTES-CONTATO-ENUM.sql` no Supabase
- [ ] 2. Aguardar mensagem "✅ Valor LENTES_CONTATO adicionado ao enum"
- [ ] 3. Executar `12_CREATE_LENTES_CONTATO.sql` no Supabase
- [ ] 4. Verificar view: `SELECT * FROM public.v_lentes_contato LIMIT 1;`
- [ ] 5. Criar hook `useLentesContato.ts`
- [ ] 6. Criar componente `Step4LentesContato.tsx`
- [ ] 7. Testar fluxo completo no wizard

---

## 📝 Diferença da Abordagem

### Lentes de Grau (ATUAL)

```
✅ Tem grupos canônicos
✅ View: v_grupos_canonicos
✅ Múltiplas lentes → 1 grupo
```

### Lentes de Contato (NOVO)

```
❌ SEM grupos canônicos
✅ View: v_lentes_contato
✅ 1 produto = 1 registro único
```

**Por quê?** Lentes de contato têm especificações muito variadas por marca (DK/t, curvatura, material) que tornam agrupamento impraticável.

---

**Data:** 20/01/2026  
**Status:** ✅ Scripts corrigidos e prontos
