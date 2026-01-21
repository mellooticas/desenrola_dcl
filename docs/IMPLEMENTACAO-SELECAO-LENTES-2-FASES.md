# ✅ Implementação: Seleção de Lentes em 2 Fases

## 📋 Resumo

Implementado sistema de seleção de lentes em **2 fases** no wizard de Nova Ordem:

1. **FASE 1**: Usuário escolhe **grupo canônico** (separado por premium/genéricas)
2. **FASE 2**: Usuário escolhe **lente específica** do grupo (por fornecedor/preço/prazo)

---

## 🎯 Arquitetura da Solução

### Views Consolidadas (Banco de Dados)

- ✅ `v_grupos_canonicos` - 461 grupos canônicos consolidados
- ✅ `v_lentes` - 1.411 lentes individuais com relacionamento

### Componentes Criados

#### 1. `SeletorGruposLentes.tsx`

**Localização:** `src/components/forms/wizard-steps/components/`

**Responsabilidade:** Mostrar grupos canônicos separados por premium/genéricas

**Features:**

- Tabs para separação premium vs genéricas
- Card layout com:
  - Nome do grupo
  - Material e índice de refração
  - Badges de tratamentos (AR, UV, Blue Light, Foto)
  - Faixa de preço (mínimo → máximo)
  - Total de lentes disponíveis
- Badge count em cada tab
- Estado de seleção visual (ring-2 ring-primary)
- Gradiente amarelo para grupos premium

**Interface:**

```typescript
interface Props {
  filtros?: FiltrosLente;
  grupoSelecionadoId?: string | null;
  onSelecionarGrupo: (grupoId: string, nomeGrupo: string) => void;
  className?: string;
}
```

**Hooks:**

- `useGruposCanonicos({ is_premium: false })` - Busca genéricas
- `useGruposCanonicos({ is_premium: true })` - Busca premium

---

#### 2. `SeletorLentesDetalhadas.tsx`

**Localização:** `src/components/forms/wizard-steps/components/`

**Responsabilidade:** Mostrar lentes individuais de um grupo selecionado

**Features:**

- Grid de cards de lentes
- Informações por lente:
  - Nome canonizado
  - Fornecedor/laboratório
  - Marca (opcional)
  - Badges de tratamentos
  - Preço (destaque em grande)
  - Prazo de entrega (com badges: ⚡ Express / 📦 Normal / 🐌 Econômico)
- Botão de seleção individual
- Estado visual de lente selecionada (check icon + ring)
- Empty states (nenhuma lente disponível, nenhum grupo selecionado)

**Interface:**

```typescript
interface Props {
  grupoCanonicoId: string | null;
  lenteSelecionadaId?: string | null;
  onSelecionarLente: (
    lenteId: string,
    fornecedorId: string,
    preco: number,
    prazo: number,
  ) => void;
  className?: string;
}
```

**Hooks:**

- `useLentesDoGrupo(grupoCanonicoId)` - Busca lentes do grupo

---

#### 3. `Step4Lentes.tsx` (Atualizado)

**Localização:** `src/components/forms/wizard-steps/`

**Responsabilidade:** Orquestrar o fluxo completo de seleção

**Fluxo:**

```
┌─────────────────────────────────────┐
│ Step 4: Selecionar Lentes           │
├─────────────────────────────────────┤
│                                     │
│ FASE 1: SeletorGruposLentes         │
│   ├─ Tab Genéricas                  │
│   └─ Tab Premium                    │
│                                     │
│       ↓ onSelecionarGrupo           │
│                                     │
│ FASE 2: SeletorLentesDetalhadas     │
│   ├─ Lista de lentes do grupo       │
│   └─ Seleção por fornecedor         │
│                                     │
│       ↓ onSelecionarLente           │
│                                     │
│ RESUMO: Card verde com detalhes     │
│   ├─ Grupo selecionado              │
│   ├─ Fornecedor                     │
│   ├─ Preço (verde)                  │
│   └─ Prazo                          │
└─────────────────────────────────────┘
```

**Estado Interno:**

```typescript
const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>;
const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState<string>;
```

**Handlers:**

```typescript
handleSelecionarGrupo(grupoId, nomeGrupo) {
  // Atualiza estado interno
  // Atualiza WizardData.grupo_canonico_id
}

handleSelecionarLente(lenteId, fornecedorId, preco, prazo) {
  // Atualiza WizardData.lente_selecionada_id
  // Atualiza WizardData.fornecedor_lente_id
  // Atualiza WizardData.lente_dados (preco, prazo, fornecedor)
}
```

**Breadcrumb de Navegação:**

```
[← Voltar aos Grupos] → [Grupo Selecionado]
```

Permite voltar à FASE 1 sem perder dados do wizard.

---

## 🔌 Integração com WizardData

### Campos do Wizard Atualizados

```typescript
interface WizardData {
  // ... outros campos

  // Step 4 (Lentes)
  lente_selecionada_id: string | null; // ID da lente específica
  grupo_canonico_id: string | null; // ID do grupo
  fornecedor_lente_id: string | null; // ID do fornecedor/lab

  lente_dados?: {
    nome_lente: string;
    nome_grupo: string;
    fornecedor_id: string;
    fornecedor_nome: string;
    preco_custo: number; // Preço específico do fornecedor
    prazo_dias: number; // Prazo específico do fornecedor
  };
}
```

---

## 📊 Dados Utilizados

### View: `v_grupos_canonicos`

**Campos principais:**

- `id`, `nome_grupo`, `slug`
- `tipo_lente` (visao_simples, multifocal, bifocal)
- `material`, `indice_refracao`
- `tratamento_*` (antirreflexo, uv, blue_light, fotossensiveis)
- `preco_minimo`, `preco_medio`, `preco_maximo`
- `total_lentes`
- `is_premium` ← **Separação premium/genéricas**
- `fornecedores_disponiveis` (JSON)

**Distribuição:**

- 232 grupos visao_simples
- 228 grupos multifocal
- 1 grupo bifocal
- **Total: 461 grupos**

### View: `v_lentes`

**Campos principais:**

- `id`, `nome_lente`, `slug`
- `fornecedor_id`, `fornecedor_nome`
- `marca_id`, `marca_nome`
- `grupo_canonico_id` ← **Link para grupo**
- `preco_venda_sugerido`, `preco_custo`
- `prazo_dias`
- `tem_ar`, `tem_uv`, `tem_blue`, `tratamento_foto`
- `tipo_lente`, `material`, `indice_refracao`

**Distribuição:**

- So Blocos: 1.097 lentes
- Polylux: 158 lentes
- Express: 84 lentes
- Brascor: 58 lentes
- Sygma: 14 lentes
- **Total: 1.411 lentes**
- **100% cobertura** (todas com grupo_canonico_id)

---

## 🎨 UX/UI

### Loading States

- ✅ Spinner central durante carregamento de grupos
- ✅ Spinner durante carregamento de lentes do grupo

### Empty States

- ✅ "Nenhum grupo de lentes genéricas encontrado" (tab genéricas vazia)
- ✅ "Nenhum grupo de lentes premium encontrado" (tab premium vazia)
- ✅ "Selecione um grupo de lentes..." (nenhum grupo selecionado)
- ✅ "Nenhuma lente disponível neste grupo" (grupo sem lentes)

### Visual Feedback

- ✅ Ring azul ao redor de card selecionado (grupos e lentes)
- ✅ Check icon no card selecionado (lentes individuais)
- ✅ Botão muda de "Selecionar" para "Selecionado" (estado ativo)
- ✅ Gradiente amarelo para grupos premium
- ✅ Badge "Premium" com ícone Sparkles
- ✅ Badge de prazo colorido:
  - Verde: Express (≤3 dias)
  - Azul: Normal (4-7 dias)
  - Cinza: Econômico (>7 dias)

### Resumo Final

Card verde com borda ao finalizar seleção:

```
✓ Lente Selecionada
┌─────────────────────────────────┐
│ Grupo: Resina CR39 1.50 AR+UV   │
│ Fornecedor: So Blocos           │
│ Custo: R$ 45,00                 │ ← Verde
│ Prazo: 5 dias úteis             │
└─────────────────────────────────┘
```

---

## 🧪 Testes Necessários

### 1. Teste de Navegação

- [ ] Abrir wizard → Step 4
- [ ] Verificar tabs "Genéricas" e "Premium" aparecem
- [ ] Verificar contadores de grupos nos badges
- [ ] Selecionar grupo genérico → ver lentes aparecerem
- [ ] Selecionar lente → ver resumo verde
- [ ] Clicar "Voltar aos Grupos" → retornar à FASE 1 sem perder dados
- [ ] Selecionar grupo premium → ver gradiente amarelo
- [ ] Selecionar lente premium → ver resumo verde

### 2. Teste de Dados

- [ ] Verificar se preços estão corretos (sem undefined/NaN)
- [ ] Verificar se prazos aparecem (sem null)
- [ ] Verificar se badges de tratamentos aparecem corretamente
- [ ] Verificar se `fornecedor_nome` aparece (não "Desconhecido")

### 3. Teste de Loading

- [ ] Verificar spinner durante fetch inicial
- [ ] Verificar spinner ao trocar de tab
- [ ] Verificar spinner ao selecionar grupo (carregando lentes)

### 4. Teste de Empty States

- [ ] Aplicar filtro que retorna 0 grupos → ver empty state
- [ ] Selecionar grupo sem lentes (se existir) → ver empty state

### 5. Teste de Persistência

- [ ] Selecionar lente → avançar step → voltar step → ver lente ainda selecionada
- [ ] Verificar se `WizardData` tem todos os campos preenchidos
- [ ] Console: verificar se `grupo_canonico_id`, `lente_selecionada_id`, `fornecedor_lente_id` estão corretos

---

## 📝 Próximos Passos

### Triggers Automáticos (Pendente)

Executar script para auto-sync de grupos:

```sql
-- database/reestruturation_database_sis_lens/11_TRIGGERS_AUTO_GRUPOS_CANONICOS.sql
```

Isso garante que:

- INSERT em lente → atualiza/cria grupo_canonico automaticamente
- UPDATE em lente → recalcula estatísticas do grupo
- DELETE em lente → atualiza contadores do grupo

### Validação no Wizard

Adicionar validação no Step 4:

```typescript
const isStep4Valid =
  data.grupo_canonico_id !== null &&
  data.lente_selecionada_id !== null &&
  data.fornecedor_lente_id !== null &&
  data.lente_dados?.preco_custo > 0;
```

### Salvamento Final

Verificar se todos os campos são salvos corretamente:

```sql
INSERT INTO desenrola_dcl.pedidos (
  loja_id,
  numero_os_fisica,
  tipo_pedido,

  -- Campos de lente
  grupo_canonico_id,
  lente_selecionada_id,
  fornecedor_lente_id,
  -- ...
)
```

---

## 🎉 Resultado Final

Fluxo intuitivo e eficiente para seleção de lentes:

1. **Separação Premium/Genéricas**: Facilita decisão comercial
2. **Visão de Grupo**: Mostra faixa de preços antes de detalhar
3. **Comparação Fácil**: Vê todas as opções de fornecedores lado a lado
4. **Informação Rica**: Preço, prazo, tratamentos, tudo visível
5. **Visual Moderno**: Cards, badges, cores, animações

**Tempo estimado de seleção**: ~15-20 segundos (vs 1-2 minutos no fluxo antigo)

---

## 📚 Arquivos Envolvidos

```
src/
├── components/
│   └── forms/
│       ├── wizard-steps/
│       │   ├── Step4Lentes.tsx                    ← Orquestrador (ATUALIZADO)
│       │   └── components/
│       │       ├── SeletorGruposLentes.tsx        ← NOVO (FASE 1)
│       │       └── SeletorLentesDetalhadas.tsx    ← NOVO (FASE 2)
│       └── NovaOrdemWizard.tsx                    ← Interface WizardData (existente)
└── lib/
    └── hooks/
        └── useLentesCatalogo.ts                   ← Hooks de dados (ATUALIZADO)

database/
└── reestruturation_database_sis_lens/
    ├── 05_CONSOLIDAR_VIEWS_GRUPOS.sql             ← View consolidada
    ├── 06_CONSOLIDAR_VIEWS_LENTES.sql             ← View consolidada
    └── 11_TRIGGERS_AUTO_GRUPOS_CANONICOS.sql      ← Triggers (PENDENTE executar)
```

---

## ✅ Checklist de Conclusão

- [x] Hook atualizado para usar `v_lentes` e `v_grupos_canonicos`
- [x] Componente `SeletorGruposLentes` criado com tabs premium/genéricas
- [x] Componente `SeletorLentesDetalhadas` criado com cards de lentes
- [x] Step4Lentes atualizado com fluxo de 2 fases
- [x] Breadcrumb de navegação implementado
- [x] Loading states implementados
- [x] Empty states implementados
- [x] Visual feedback (rings, checks, colors) implementados
- [x] Resumo verde ao finalizar seleção
- [ ] Testes manuais realizados
- [ ] Triggers automáticos executados
- [ ] Validação de Step 4 adicionada
- [ ] Teste end-to-end do wizard completo

---

**Data de Implementação:** 2025-01-XX  
**Autor:** GitHub Copilot  
**Status:** ✅ Componentes criados - Aguardando testes
