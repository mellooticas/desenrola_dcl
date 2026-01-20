# 📋 ESPECIFICAÇÃO COMPLETA - Nova Ordem (Pedido Multimodal)

**Data:** 19/01/2026  
**Status:** 🎯 Mapeamento Completo - Pronto para Implementação

---

## 🎯 OBJETIVO

Criar sistema de pedidos multimodal que suporte:

- **Lentes** (sis_lens)
- **Armações** (produtos do SIS_Estoque)
- **Completo** (lentes + armação)
- **Serviços** (montagem, ajuste, reparo)

---

## 📦 BANCOS DE DADOS MAPEADOS

### 1. **desenrola_dcl** (Principal)

```
Tabela: pedidos
├─ tipo_pedido ENUM ('LENTES', 'ARMACAO', 'COMPLETO', 'SERVICO', 'LENTE_AVULSA')
├─ armacao_id UUID (sem FK, será preenchido com produto_id do estoque)
├─ lente_selecionada_id UUID (sis_lens.lentes.id)
├─ grupo_canonico_id UUID (sis_lens.grupos_canonicos.id)
├─ fornecedor_lente_id UUID (sis_lens.fornecedores.id = laboratorio_id)
└─ numero_pedido_laboratorio TEXT (informado manualmente)
```

### 2. **sis_lens** (Catálogo de Lentes)

```
View: v_grupos_canonicos
├─ 461 grupos canônicos
├─ Filtros: tipo_lente, material, indice_refracao, tratamentos
└─ Retorna: preco_medio, total_lentes, fornecedores_disponiveis[]

View: v_lentes_cotacao_compra
├─ 1.411 lentes ativas
├─ Por grupo → múltiplos fornecedores com preços diferentes
└─ Retorna: lente_id, fornecedor_id, preco_custo, prazo_dias
```

### 3. **CRM_ERP** (Produtos e Estoque)

```
View: vw_estoque_completo
├─ Produtos por loja
├─ Campos: produto_id, sku, sku_visual, descricao, preco_venda, quantidade_atual
├─ Tipos: tipo (filtro) = 'armacao', 'acessorio', 'servico'
└─ Status: status_estoque = 'normal', 'critico', 'esgotado'

Tabela: produtos
├─ Campos principais:
│   ├─ id, sku, sku_visual, sku_num
│   ├─ descricao, tipo, tamanho, cor_id
│   ├─ marca_id, categoria_id, modelo_id
│   ├─ custo, preco_venda, markup
│   ├─ pode_lente_grau, is_exclusivo, is_novidade
│   └─ nivel_critico, nivel_ideal, lead_time
└─ Relacionamentos: marcas, categorias, modelos, cores
```

---

## 🔄 FLUXO COMPLETO DO PEDIDO

### **STEP 1: Loja + OS Física** ✅ (já implementado)

```typescript
- Selecionar loja_id
- Informar numero_os_fisica (opcional, pode gerar automaticamente)
- Validar unicidade de OS por loja
```

### **STEP 2: Tipo de Serviço** 🆕

```typescript
Radio buttons:
[ ] Só Lentes       → tipo_pedido = 'LENTES'
[ ] Só Armação      → tipo_pedido = 'ARMACAO'
[ ] Completo        → tipo_pedido = 'COMPLETO'
[ ] Serviços        → tipo_pedido = 'SERVICO'

Condicional:
- Se LENTES ou COMPLETO → STEP 4 (Lentes)
- Se ARMACAO ou COMPLETO → STEP 3 (Armações)
- Se SERVICO → STEP 5 (Dados Cliente) + tipo_servico
```

### **STEP 3: Seleção de Armação** 🆕

```typescript
Componente: <ArmacaoSelector>

Busca:
- Input: SKU, SKU Visual, Código de Barras
- Busca via CRM_ERP client: vw_estoque_completo
- Filtros:
  * tipo_produto = 'armacao'
  * loja_id = loja selecionada
  * status != 'esgotado'

Campos mostrados:
- sku_visual (código visual)
- descricao (nome comercial)
- marca_nome
- preco_venda
- quantidade_atual (disponível na loja)

Ao selecionar:
- Salvar armacao_id = produto.id
- Salvar valor_armacao = produto.preco_venda
- origem_armacao = 'estoque'

Opção alternativa:
- [x] Cliente trouxe armação própria
  └─ origem_armacao = 'cliente_trouxe'
  └─ armacao_id = null
  └─ valor_armacao = 0 (ou valor informado)
```

### **STEP 4: Seleção de Lentes** ✅ (já implementado, melhorar filtros)

```typescript
Componente: <LenteSelector>

View: v_grupos_canonicos (sis_lens)

Filtros (igual sis_lens):
├─ Busca por texto (nome da lente)
├─ Tipo: visao_simples, multifocal, bifocal
├─ Material: resina, policarbonato, trivex, cristal
├─ Índice de refração: 1.50, 1.56, 1.60, 1.67, 1.74, 1.76
├─ Tratamentos (checkboxes):
│   ├─ [x] Anti-reflexo
│   ├─ [x] Anti-risco
│   ├─ [x] UV
│   ├─ [x] Blue Light
│   └─ [x] Fotossensível (fotocromático/polarizado)
├─ Faixa de preço: slider (R$ min - R$ max)
└─ [x] Apenas Premium

Resultado: Lista de grupos canônicos
- Ao clicar → Modal com fornecedores disponíveis

Modal: Escolha de Fornecedor/Laboratório
├─ Tabela com opções:
│   ├─ Fornecedor (nome)
│   ├─ Prazo (dias)
│   ├─ Preço (custo)
│   └─ [Selecionar]
└─ Ao confirmar:
    ├─ lente_selecionada_id
    ├─ grupo_canonico_id
    ├─ fornecedor_lente_id (= laboratorio_id)
    ├─ preco_lente (custo)
    ├─ nome_lente, nome_grupo_canonico
    └─ prazo_dias (para cálculo SLA)
```

### **STEP 5: Dados do Cliente + SLA** 🆕

```typescript
Campos obrigatórios:
- cliente_nome
- cliente_telefone
- data_prometida_manual (opcional)

Número do Pedido do Laboratório:
- Input manual: numero_pedido_laboratorio
- Info: "Informado pelo laboratório ao efetuar a compra"
- Validação: não obrigatório se tipo != 'LENTES'

Cálculo de SLA:
┌─────────────────────────────────────────┐
│ SLA do Laboratório                      │
│ ├─ Prazo base: prazo_dias (da lente)   │
│ ├─ + Dias úteis (ignora sáb/dom)       │
│ └─ Data estimada: [DD/MM/AAAA]         │
│                                         │
│ Data Prometida ao Cliente               │
│ ├─ SLA lab + margem_seguranca_dias (2) │
│ ├─ Ou manual: [input date]             │
│ └─ Data final: [DD/MM/AAAA]            │
│                                         │
│ ⚠️ Alerta se manual < SLA lab          │
└─────────────────────────────────────────┘

Resumo financeiro:
- Valor lentes: R$ XXX,XX
- Valor armação: R$ XXX,XX (se houver)
- Valor serviço: R$ XXX,XX (se houver)
- Total: R$ XXX,XX
```

### **STEP 6: Revisão Final** 🆕

```typescript
Mostrar resumo completo:
├─ Loja: [nome]
├─ OS Física: [número]
├─ Tipo: [LENTES/ARMACAO/COMPLETO/SERVICO]
├─ Cliente: [nome] - [telefone]
│
├─ [Se houver Lentes]
│   ├─ Lente: [nome_lente]
│   ├─ Grupo: [nome_grupo]
│   ├─ Laboratório: [fornecedor_nome]
│   ├─ Prazo: [X dias] → [data estimada]
│   └─ Custo: R$ XXX,XX
│
├─ [Se houver Armação]
│   ├─ Armação: [descricao]
│   ├─ SKU: [sku_visual]
│   ├─ Origem: [estoque/cliente_trouxe]
│   └─ Valor: R$ XXX,XX
│
├─ Data prometida: [DD/MM/AAAA]
│   └─ ⚠️ SLA lab: [data] | Cliente: [data]
│
└─ Total: R$ XXX,XX

Botões:
[Voltar] [Salvar e Imprimir] [Salvar]
```

### **STEP 7: Salvamento**

```typescript
Status inicial:
- tipo = 'LENTES' ou 'COMPLETO' → 'REGISTRADO'
- tipo = 'ARMACAO' → 'REGISTRADO'
- tipo = 'SERVICO' → 'SERVICO' (status específico?)

Campos salvos:
{
  loja_id,
  numero_os_fisica,
  tipo_pedido,
  cliente_nome,
  cliente_telefone,
  data_prometida_manual,
  numero_pedido_laboratorio, // manual

  // Lentes (se houver)
  lente_selecionada_id,
  grupo_canonico_id,
  fornecedor_lente_id, // = laboratorio_id
  preco_lente,
  custo_lente,
  nome_lente,
  nome_grupo_canonico,

  // Armação (se houver)
  armacao_id, // produto_id do estoque
  valor_armacao,
  origem_armacao, // 'estoque' | 'cliente_trouxe'

  // Serviço (se houver)
  tipo_servico, // 'montagem' | 'ajuste' | 'reparo' | etc
  valor_servico,

  // Calculados
  valor_pedido, // total
  status // inicial conforme tipo
}

Após salvar:
- Retornar para Kanban com highlight no card criado
- OU abrir modal de impressão
```

---

## 🗂️ ESTRUTURA DE COMPONENTES

```
src/components/forms/NovaOrdemForm.tsx (já existe, refatorar)
├─ Step1: Loja + OS ✅
├─ Step2: TipoServico 🆕
│   └─ RadioGroup com 4 opções
├─ Step3: ArmacaoSelector 🆕 (condicional)
│   ├─ Input busca (SKU/código barras)
│   ├─ Lista de resultados (vw_estoque_completo)
│   └─ Checkbox "Cliente trouxe"
├─ Step4: LenteSelector (já existe, melhorar)
│   ├─ Filtros avançados (modal)
│   ├─ Lista grupos
│   └─ Modal fornecedores
├─ Step5: DadosClienteSLA 🆕
│   ├─ Form cliente
│   ├─ Input numero_pedido_laboratorio
│   ├─ Cálculo SLA visual
│   └─ Resumo financeiro
└─ Step6: RevisaoFinal 🆕
    ├─ Resumo completo
    └─ Botões ação

src/components/armacoes/ArmacaoSelector.tsx 🆕
├─ useArmacoes hook
├─ Busca no CRM_ERP
└─ Card de resultado

src/lib/hooks/useArmacoes.ts 🆕
├─ buscarArmacoes(filtros)
├─ buscarPorSKU(sku)
└─ Usa getCrmErpClient()

src/lib/utils/sla-calculator.ts 🆕
├─ calcularDataSLA(dataBase, dias, incluirSabado)
├─ calcularDiasUteis(dataInicio, dataFim)
└─ validarDataPrometida(dataSLA, dataManual)
```

---

## 🔌 APIs NECESSÁRIAS

### 1. **API de Armações** (novo)

```typescript
// GET /api/armacoes?loja_id=xxx&busca=xxx&tipo=armacao
// Retorna produtos do vw_estoque_completo
```

### 2. **API de Pedidos** (já existe, validar)

```typescript
// POST /api/pedidos
// Body: PedidoCompleto (já suporta campos novos)
```

### 3. **API de Validação OS** (já existe)

```typescript
// GET /api/pedidos/validar-os?numero_os=xxx&loja_id=xxx
```

---

## 📊 QUERIES SQL NECESSÁRIAS

### Buscar Armações no CRM_ERP

```sql
-- Via helper getCrmErpClient()
SELECT *
FROM vw_estoque_completo
WHERE tipo_produto = 'armacao'
  AND loja_id = $1
  AND ativo = true
  AND (
    sku_visual ILIKE $2
    OR sku ILIKE $2
    OR descricao ILIKE $2
  )
ORDER BY descricao
LIMIT 20;
```

### Salvar Pedido Multimodal

```sql
-- Já existe, apenas validar campos
INSERT INTO pedidos (
  loja_id, numero_os_fisica, tipo_pedido,
  cliente_nome, cliente_telefone,
  lente_selecionada_id, grupo_canonico_id, fornecedor_lente_id,
  armacao_id, valor_armacao, origem_armacao,
  tipo_servico, valor_servico,
  numero_pedido_laboratorio,
  data_prometida_manual,
  valor_pedido, status
) VALUES (...);
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura (2-3h)

- [ ] Criar `useArmacoes` hook
- [ ] Criar helper `buscarArmacoes` no crm-erp-client
- [ ] Criar `sla-calculator.ts` utils
- [ ] Testar queries no banco CRM_ERP via terminal

### Fase 2: Componentes (4-5h)

- [ ] Criar `<ArmacaoSelector>`
- [ ] Adicionar Step2 (TipoServico) no NovaOrdemForm
- [ ] Adicionar Step3 (condicional Armação)
- [ ] Melhorar filtros do `<LenteSelector>` (igualar sis_lens)
- [ ] Criar Step5 (DadosClienteSLA)
- [ ] Criar Step6 (RevisaoFinal)

### Fase 3: Lógica de Negócio (2-3h)

- [ ] Implementar cálculo SLA com dias úteis
- [ ] Implementar validação de data prometida
- [ ] Implementar resumo financeiro por tipo
- [ ] Ajustar salvamento para tipos diferentes

### Fase 4: Testes e Validação (2h)

- [ ] Testar fluxo LENTES
- [ ] Testar fluxo ARMACAO
- [ ] Testar fluxo COMPLETO
- [ ] Testar fluxo SERVICO
- [ ] Validar impressão
- [ ] Validar Kanban com novos tipos

---

## 🚨 PONTOS DE ATENÇÃO

1. **Armações sem estoque**: Mostrar aviso mas permitir selecionar
2. **SLA manual < SLA lab**: Mostrar alerta visual
3. **Tratamentos**: JÁ estão na lente canônica, não adicionar passo extra
4. **Número pedido lab**: Campo opcional, mas importante
5. **Cliente trouxe armação**: Permitir sem cadastro no estoque
6. **Múltiplos fornecedores**: Usuário SEMPRE escolhe manualmente

---

## 📝 NOTAS FINAIS

- **Pedidos temporários**: NÃO implementar agora (futuro com PDV)
- **Filtros lentes**: Usar EXATAMENTE igual ao sis_lens
- **Dados do banco**: Tudo já mapeado e validado
- **Fluxo aprovado**: 7 steps claros e lineares

**Próximo passo**: Começar implementação pela Fase 1 (infraestrutura)
