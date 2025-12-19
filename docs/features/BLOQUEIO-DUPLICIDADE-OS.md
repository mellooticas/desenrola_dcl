# 🔒 Solução Completa: Bloqueio de Duplicidade de Número de OS

## 📋 Problema Identificado

O sistema atual permite que diferentes pedidos usem o **mesmo número de OS física** dentro da mesma loja, causando:

- ❌ Confusão no controle de pedidos
- ❌ Problemas de rastreamento
- ❌ Dificuldade em identificar pedidos únicos
- ❌ Inconsistências no sistema de OS físicas

## ✅ Solução Implementada

### Camadas de Proteção

#### 1. **Nível Banco de Dados** (Mais Forte)

```sql
-- Constraint UNIQUE parcial
ALTER TABLE pedidos
ADD CONSTRAINT pedidos_numero_os_loja_unique
UNIQUE (loja_id, numero_os_fisica)
WHERE numero_os_fisica IS NOT NULL AND numero_os_fisica != '';
```

**Características:**

- ✅ Bloqueia duplicatas no nível mais baixo
- ✅ Permite múltiplos pedidos com `numero_os_fisica = NULL`
- ✅ Impossível burlar (mesmo via SQL direto)

#### 2. **Trigger de Validação** (Mensagens Amigáveis)

```sql
CREATE TRIGGER trigger_validar_numero_os
  BEFORE INSERT OR UPDATE OF numero_os_fisica
  ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION validar_numero_os_unico();
```

**Características:**

- ✅ Mensagens de erro claras e detalhadas
- ✅ Informa qual pedido já está usando o número
- ✅ Executa antes da tentativa de salvar

#### 3. **Validação Frontend** (UX Preventiva)

- Hook customizado: `useValidacaoNumeroOS`
- Componente inteligente: `NumeroOSInput`
- Validação em tempo real com debounce
- Sugestão automática de próximo número

## 📁 Arquivos Criados

### 1. Script SQL Principal

**Arquivo:** [fix-unicidade-numero-os.sql](../database/migrations/fix-unicidade-numero-os.sql)

**Contém:**

- ✅ Análise de duplicatas existentes
- ✅ Estratégias de correção (renumerar ou limpar)
- ✅ Criação de constraint única
- ✅ Trigger de validação
- ✅ Função auxiliar para sugerir próximo número
- ✅ View de números em uso
- ✅ Testes automatizados

### 2. Hook React

**Arquivo:** [useValidacaoNumeroOS.ts](../src/lib/hooks/useValidacaoNumeroOS.ts)

**Funções:**

```typescript
// Validar se número está disponível
const { isValid, mensagem } = await validarNumeroOS(
  "1234", // Número a validar
  lojaId, // UUID da loja
  pedidoId // UUID do pedido (opcional, para edição)
);

// Buscar próximo número disponível
const { numero } = await buscarProximoNumero(
  lojaId, // UUID da loja
  "OS-" // Prefixo opcional
);

// Listar números em uso (autocomplete)
const { numerosOS } = useNumerosOSEmUso(lojaId);
```

### 3. Componente de Input

**Arquivo:** [NumeroOSInput.tsx](../src/components/forms/NumeroOSInput.tsx)

**Recursos:**

- ✅ Validação em tempo real (debounce 800ms)
- ✅ Ícones de status (✓ válido, ✗ inválido, ⟳ validando)
- ✅ Botão "Sugerir número"
- ✅ Aplicação rápida da sugestão
- ✅ Mensagens contextuais

## 🚀 Como Implementar

### Passo 1: Aplicar no Banco de Dados

1. Abra o **Supabase SQL Editor**
2. Execute: [fix-unicidade-numero-os.sql](../database/migrations/fix-unicidade-numero-os.sql)
3. Revise as duplicatas encontradas (se houver)
4. Escolha estratégia de correção:
   - **Opção A:** Renumerar duplicatas (adiciona sufixo `-DUP-N`)
   - **Opção B:** Limpar duplicatas (mantém apenas a primeira)
5. Descomente e execute a opção escolhida

### Passo 2: Atualizar Formulários

#### Formulário de Novo Pedido

Substituir o input atual por:

```tsx
import { NumeroOSInput } from "@/components/forms/NumeroOSInput";

// No componente
<NumeroOSInput
  value={formData.numero_os_fisica}
  onChange={(value) => handleInputChange("numero_os_fisica", value)}
  lojaId={formData.loja_id}
  prefixo="OS-" // Opcional
  obrigatorio={false}
/>;
```

#### Formulário de Edição

```tsx
<NumeroOSInput
  value={formData.numero_os_fisica}
  onChange={(value) => handleInputChange("numero_os_fisica", value)}
  lojaId={pedido.loja_id}
  pedidoIdAtual={pedido.id} // Importante para edição!
  obrigatorio={false}
/>
```

### Passo 3: Adicionar Validação Pré-Salvamento

```typescript
import { useValidacaoNumeroOS } from "@/lib/hooks/useValidacaoNumeroOS";

const { validarNumeroOS } = useValidacaoNumeroOS();

const handleSave = async () => {
  // Validar número de OS antes de salvar
  if (formData.numero_os_fisica) {
    const validacao = await validarNumeroOS(
      formData.numero_os_fisica,
      formData.loja_id,
      pedido?.id // Apenas em edição
    );

    if (!validacao.isValid) {
      toast.error(validacao.mensagem);
      return;
    }
  }

  // Continuar com salvamento...
};
```

## 📊 Monitoramento e Controle

### View de Números em Uso

```sql
-- Ver todos os números de OS cadastrados por loja
SELECT
  loja_nome,
  numero_os_fisica,
  pedido_id,
  numero_sequencial,
  status
FROM v_numeros_os_em_uso
WHERE loja_id = 'UUID_DA_LOJA'
ORDER BY numero_os_numerico DESC;
```

### Estatísticas por Loja

```sql
-- Ver estatísticas de numeração por loja
SELECT
  loja_nome,
  COUNT(*) as total_os_cadastradas,
  MIN(numero_os_numerico) as menor_os,
  MAX(numero_os_numerico) as maior_os,
  MAX(numero_os_numerico) - MIN(numero_os_numerico) - COUNT(*) + 1 as gaps
FROM v_numeros_os_em_uso
WHERE numero_os_numerico IS NOT NULL
GROUP BY loja_id, loja_nome;
```

## 🎯 Fluxo de Trabalho Recomendado

### Para Novos Pedidos

1. **Usuário deixa campo vazio:**

   - Sistema aceita (campo opcional)
   - Pedido criado sem número de OS física

2. **Usuário digita um número:**

   - Input valida em tempo real (debounce)
   - Mostra ✓ se disponível ou ✗ se duplicado
   - Se duplicado, oferece alternativas

3. **Usuário clica "Sugerir número":**
   - Sistema busca próximo número disponível
   - Mostra sugestão com botão "Usar este"
   - Aplica automaticamente ao clicar

### Para Edição

1. **Mantém número atual:**

   - Validação ignora o próprio pedido
   - Permite salvar sem problemas

2. **Altera para número novo:**
   - Valida disponibilidade
   - Bloqueia se já existir em outro pedido

## 🔍 Testes e Validação

### Teste Automático (incluído no script)

```sql
-- Executa automaticamente ao rodar o script
-- Tenta criar dois pedidos com mesma OS
-- Verifica se o segundo é bloqueado
```

### Teste Manual

1. Criar pedido com OS "TEST-001"
2. Tentar criar outro com mesma OS
3. Deve mostrar erro: "Número de OS já está em uso"
4. Clicar "Sugerir número"
5. Deve oferecer "TEST-002" ou próximo disponível

## 📝 Notas Importantes

### ✅ Permitido

- Múltiplos pedidos com `numero_os_fisica = NULL`
- Múltiplos pedidos com `numero_os_fisica = ''`
- Mesma OS em lojas diferentes
- Editar pedido mantendo seu próprio número

### ❌ Bloqueado

- Mesma OS em dois pedidos da mesma loja
- Alterar OS para número já usado na loja
- Criar pedido com OS duplicada

## 🛠️ Manutenção

### Identificar Gaps na Numeração

```sql
-- Ver OSs que deveriam existir mas não estão lançadas
SELECT * FROM view_os_gaps
WHERE status = 'nao_lancada'
AND loja_id = 'UUID_DA_LOJA'
ORDER BY numero_os;
```

### Justificar OS Não Lançada

```sql
-- Registrar por que uma OS não foi usada
INSERT INTO os_nao_lancadas (
  numero_os,
  loja_id,
  justificativa,
  tipo_justificativa,
  usuario_id
) VALUES (
  1234,
  'UUID_DA_LOJA',
  'Cliente desistiu antes de finalizar',
  'nao_concretizada',
  auth.uid()
);
```

## 🔄 Migração de Dados Existentes

Se houver **duplicatas existentes**, escolha uma estratégia:

### Opção A: Renumerar Duplicatas

```sql
-- Adiciona sufixo -DUP-1, -DUP-2, etc
UPDATE pedidos
SET numero_os_fisica = numero_os_fisica || '-DUP-' || ROW_NUMBER() OVER (...)
WHERE id IN (SELECT ids_duplicados FROM temp_duplicatas);
```

### Opção B: Limpar Duplicatas

```sql
-- Remove número das duplicatas, mantém apenas a primeira
UPDATE pedidos
SET numero_os_fisica = NULL,
    observacoes = observacoes || ' | OS duplicada removida'
WHERE id IN (SELECT ids_duplicados FROM temp_duplicatas);
```

## 📈 Benefícios da Solução

1. **Integridade de Dados**

   - Impossível criar duplicatas
   - Garantia no nível do banco

2. **Experiência do Usuário**

   - Validação em tempo real
   - Sugestões automáticas
   - Mensagens claras

3. **Rastreabilidade**

   - Números únicos facilitam busca
   - Elimina confusão entre pedidos

4. **Controle de Qualidade**
   - Sistema identifica gaps
   - Permite justificar OSs não usadas

## 🎓 Próximos Passos Sugeridos

1. ✅ Aplicar script SQL no banco
2. ✅ Corrigir duplicatas existentes
3. ✅ Integrar `NumeroOSInput` nos formulários
4. ✅ Adicionar validação pré-salvamento
5. ⬜ Treinar equipe sobre novo fluxo
6. ⬜ Monitorar uso por 1 semana
7. ⬜ Implementar geração automática opcional

## 🆘 Troubleshooting

### Erro: "Constraint violation"

**Causa:** Tentando inserir OS duplicada  
**Solução:** Use a função `proximo_numero_os_disponivel()`

### Sugestão não aparece

**Causa:** Loja não tem OSs cadastradas  
**Solução:** Sistema começará do 1

### Validação muito lenta

**Causa:** Muitos pedidos no banco  
**Solução:** Índice já criado, verificar query plan

---

**Implementado em:** 19 de dezembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para produção
