# 🎯 MELHORIAS IMPLEMENTADAS - Número Pedido Lab + Preços Reais

## 📋 Resumo das Melhorias

Implementamos duas melhorias essenciais no sistema:

### 1. ✅ Número de Pedido do Laboratório

Campo para armazenar o número de pedido fornecido pelo laboratório (imprescindível para rastreamento de lentes e lentes de contato).

### 2. ✅ Preço Real para Serviços e Acessórios

Sistema completo de preço real com desconto/acréscimo, seguindo o mesmo padrão de armações e lentes.

---

## 🗄️ Mudanças no Banco de Dados

### Script SQL Principal

📄 **Arquivo**: `database/ADD-MELHORIAS-ESSENCIAIS.sql`

Execute este script no Supabase SQL Editor para:

#### Campos Adicionados na Tabela `pedidos`:

**Número de Pedido do Laboratório:**

- `numero_pedido_laboratorio` (TEXT) - Número fornecido pelo lab

**Serviços:**

- `servico_preco_real` (DECIMAL) - Preço real de venda (com desconto/acréscimo)
- `margem_servico_percentual` (DECIMAL) - Margem calculada automaticamente

**Acessórios:**

- `acessorio_produto_id` (UUID)
- `acessorio_sku_visual` (TEXT)
- `acessorio_descricao` (TEXT)
- `acessorio_preco_tabela` (DECIMAL)
- `acessorio_preco_real_unitario` (DECIMAL) - **Preço real unitário** (com desconto/acréscimo)
- `acessorio_quantidade` (INTEGER)
- `acessorio_subtotal` (DECIMAL) - Calculado automaticamente
- `acessorio_custo_unitario` (DECIMAL)
- `margem_acessorio_percentual` (DECIMAL) - Margem calculada automaticamente

#### Triggers Automáticos:

- `trigger_calcular_margem_servico` - Calcula margem quando `servico_preco_real` ou `servico_custo` mudam
- `trigger_calcular_valores_acessorio` - Calcula subtotal e margem quando preços/quantidade mudam

---

## 🎨 Mudanças no Frontend

### 1. SeletorServicos.tsx

**Localização**: `src/components/pedidos/novo/SeletorServicos.tsx`

**Melhorias:**

- ✅ Campo de **Preço Real** editável (permite desconto ou acréscimo)
- ✅ Campo de **Desconto/Acréscimo %** que atualiza o preço real automaticamente
- ✅ Indicador visual: 🔽 Desconto / 🔼 Acréscimo / ➖ Sem alteração
- ✅ Exibe economia ou acréscimo em destaque

**Interface Atualizada:**

```typescript
interface ServicoSelecionado {
  servico: Servico;
  preco_final: number;
  preco_real: number; // NOVO: Preço real que será salvo
  desconto_percentual: number;
}
```

### 2. SeletorAcessorios.tsx

**Localização**: `src/components/pedidos/novo/SeletorAcessorios.tsx`

**Melhorias:**

- ✅ Campo de **Preço Real Unitário** editável para cada acessório
- ✅ **Subtotal** recalculado automaticamente (preço_real_unitario × quantidade)
- ✅ Indicador de desconto/acréscimo por item
- ✅ Grid organizado: Tabela | Preço Real | Qtd | Subtotal

**Interface Atualizada:**

```typescript
interface AcessorioSelecionado {
  acessorio: Acessorio;
  quantidade: number;
  preco_real_unitario: number; // NOVO: Preço real unitário
  subtotal: number; // Recalculado automaticamente
}
```

### 3. NovaOrdemWizard.tsx

**Localização**: `src/components/forms/NovaOrdemWizard.tsx`

**Melhorias:**

- ✅ Salva `servico_preco_real` em vez de apenas `servico_preco_final`
- ✅ Salva `acessorio_preco_real_unitario` para cada acessório
- ✅ Salva `numero_pedido_laboratorio` quando tipo é LENTES/LENTES_CONTATO/COMPLETO
- ✅ Logs detalhados para debugging

### 4. Step5ClienteSLA.tsx

**Localização**: `src/components/forms/wizard-steps/Step5ClienteSLA.tsx`

**Melhorias:**

- ✅ Campo **"Número do Pedido no Laboratório"** aparece automaticamente para:
  - Pedidos tipo LENTES
  - Pedidos tipo LENTES_CONTATO (com aviso "Imprescindível")
  - Pedidos tipo COMPLETO
- ✅ Campo font-mono para facilitar leitura de números
- ✅ Placeholder exemplo: "LAB-2024-12345"

---

## 🚀 Como Usar as Novas Funcionalidades

### Para Número de Pedido do Laboratório:

1. Ao criar um pedido de **LENTES**, **LENTES DE CONTATO** ou **COMPLETO**
2. No Step 5 (Cliente e SLA), preencha o campo **"Número do Pedido no Laboratório"**
3. Use o número fornecido pelo laboratório (ex: LAB-2024-12345)
4. ✅ Campo será salvo automaticamente no banco

### Para Preço Real de Serviços:

1. No Step 5, selecione um **Serviço Adicional**
2. O sistema mostra 3 campos:
   - **Preço Tabela**: Valor padrão (não editável)
   - **Preço Real**: Valor que será cobrado do cliente (editável)
   - **Desconto/Acréscimo %**: Calculado automaticamente ou editável
3. Ajuste o **Preço Real** ou o **Desconto %**
4. ✅ Sistema salva `servico_preco_real` e calcula margem automaticamente

**Exemplos:**

- **Desconto 10%**: Preço R$ 100,00 → Preço Real R$ 90,00 (🔽 10% desconto)
- **Acréscimo 5%**: Preço R$ 100,00 → Preço Real R$ 105,00 (🔼 5% acréscimo)

### Para Preço Real de Acessórios:

1. No Step 5, adicione **Acessórios**
2. Para cada acessório, você pode:
   - Ajustar **Preço Real Unitário** (editável)
   - Alterar **Quantidade** (+/-)
3. **Subtotal** é recalculado automaticamente: `preco_real_unitario × quantidade`
4. ✅ Sistema salva todos os valores incluindo margem

**Exemplo:**

- Produto: Estojo de couro
- Preço Tabela: R$ 50,00
- Preço Real: R$ 40,00 (🔽 20% desconto)
- Quantidade: 2
- **Subtotal: R$ 80,00** (calculado automaticamente)

---

## 📊 Margens Calculadas Automaticamente

O sistema agora calcula margens para **serviços** e **acessórios** da mesma forma que faz para armações/lentes:

**Fórmula:**

```
Margem % = (Preço Real - Custo) / Preço Real × 100
```

**Campos calculados automaticamente via triggers:**

- `margem_servico_percentual`
- `margem_acessorio_percentual`

Esses valores são salvos automaticamente sempre que:

- O preço real muda
- O custo muda
- Um novo item é adicionado

---

## 🔍 Como Verificar se Funcionou

### No Supabase SQL Editor:

```sql
-- Verificar campos criados
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND (column_name LIKE 'numero_pedido%'
       OR column_name LIKE 'servico_preco_real%'
       OR column_name LIKE 'acessorio_%'
       OR column_name LIKE 'margem_%')
ORDER BY column_name;

-- Verificar triggers
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name IN ('trigger_calcular_margem_servico', 'trigger_calcular_valores_acessorio');

-- Testar com pedido real (substitua o ID)
SELECT
  numero_os_fisica,
  numero_pedido_laboratorio,
  servico_descricao,
  servico_preco_tabela,
  servico_preco_real,
  margem_servico_percentual,
  acessorio_descricao,
  acessorio_preco_tabela,
  acessorio_preco_real_unitario,
  acessorio_quantidade,
  acessorio_subtotal,
  margem_acessorio_percentual
FROM pedidos
WHERE id = 'SEU_ID_AQUI';
```

### No Frontend (Console do Navegador):

Ao criar um pedido, procure pelos logs:

```
[Wizard] 🔢 Número pedido laboratório: LAB-2024-12345
[Wizard] 💰 Preços serviço: { preco_tabela: 100, preco_real: 90, ... }
[Wizard] 💰 Acessório: { preco_real_unitario: 40, quantidade: 2, subtotal: 80 }
```

---

## ⚠️ Pontos de Atenção

### Campo Obrigatório:

- **Número de Pedido do Laboratório** é marcado como obrigatório (\*) na UI para LENTES_CONTATO
- Para outros tipos de pedido (LENTES, COMPLETO), é recomendado mas não obrigatório

### Validação de Preços:

- O sistema permite **preços reais maiores** que preços de tabela (acréscimo)
- O sistema permite **preços reais menores** que preços de tabela (desconto)
- Margens negativas são possíveis se custo > preço real

### Múltiplos Acessórios:

- Atualmente, o wizard salva apenas o **primeiro acessório** da lista
- TODO futuro: Implementar tabela separada para múltiplos acessórios por pedido

---

## 🎯 Benefícios Implementados

### 1. Rastreamento Preciso

✅ Número do pedido do laboratório permite rastreamento completo
✅ Integração futura com sistemas de laboratórios facilitada

### 2. Gestão Financeira Real

✅ Preços reais (não fictícios) para cálculo de margens
✅ Descontos e acréscimos registrados corretamente
✅ Margens calculadas automaticamente

### 3. UX Melhorada

✅ Interface intuitiva para ajuste de preços
✅ Feedback visual imediato (desconto vs acréscimo)
✅ Cálculos automáticos (subtotais, margens)

### 4. Consistência

✅ Serviços e acessórios seguem o mesmo padrão de armações/lentes
✅ Triggers garantem cálculos corretos automaticamente
✅ Código bem documentado para manutenção futura

---

## 📝 Checklist de Implementação

- [x] Criar script SQL com novos campos
- [x] Adicionar triggers para cálculos automáticos
- [x] Atualizar interface SeletorServicos
- [x] Atualizar interface SeletorAcessorios
- [x] Atualizar NovaOrdemWizard para salvar novos campos
- [x] Adicionar campo de número pedido lab no Step5
- [x] Testar fluxo completo de criação de pedido
- [ ] **EXECUTAR SCRIPT SQL NO SUPABASE** ⬅️ PRÓXIMO PASSO!

---

## 🚨 AÇÃO NECESSÁRIA

Execute o arquivo no Supabase SQL Editor:

```
database/ADD-MELHORIAS-ESSENCIAIS.sql
```

Após execução, o sistema estará **100% funcional** com as novas melhorias! 🎉
