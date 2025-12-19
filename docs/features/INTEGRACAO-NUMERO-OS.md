# 🔧 Guia de Integração - NumeroOSInput

## 📋 Objetivo

Substituir o input simples de `numero_os_fisica` pelo componente inteligente que previne duplicidades.

## 🎯 Onde Integrar

### 1. Formulário de Nova Ordem ([NovaOrdemForm.tsx](../../src/components/forms/NovaOrdemForm.tsx))

#### ❌ Código Atual (Remover)

```tsx
<div className="grid gap-2">
  <Label htmlFor="numero_os_fisica">Número da OS Física</Label>
  <Input
    id="numero_os_fisica"
    type="text"
    value={formData.numero_os_fisica}
    onChange={(e) =>
      setFormData({ ...formData, numero_os_fisica: e.target.value })
    }
    placeholder="Ex: 1234"
  />
  <p className="text-xs text-muted-foreground">
    Opcional: Deixe vazio se não tiver OS física
  </p>
</div>
```

#### ✅ Código Novo (Adicionar)

```tsx
import { NumeroOSInput } from "@/components/forms/NumeroOSInput";

// No JSX, substituir o bloco acima por:
<NumeroOSInput
  value={formData.numero_os_fisica}
  onChange={(value) => setFormData({ ...formData, numero_os_fisica: value })}
  lojaId={formData.loja_id}
  prefixo="OS-" // Opcional: adiciona prefixo nas sugestões
  obrigatorio={false}
  disabled={!formData.loja_id} // Desabilita se loja não selecionada
  placeholder="Ex: 1234 ou deixe vazio"
/>;
```

### 2. Formulário de Edição ([editar/page.tsx](../../src/app/pedidos/[id]/editar/page.tsx))

#### Localizar seção de Número de OS (aproximadamente linha 377)

```tsx
// ANTES
<div className="grid gap-2">
  <Label htmlFor="numero_os_fisica">Número OS Física</Label>
  <Input
    id="numero_os_fisica"
    value={formData.numero_os_fisica}
    onChange={(e) => handleInputChange("numero_os_fisica", e.target.value)}
  />
</div>;

// DEPOIS
import { NumeroOSInput } from "@/components/forms/NumeroOSInput";

<NumeroOSInput
  value={formData.numero_os_fisica}
  onChange={(value) => handleInputChange("numero_os_fisica", value)}
  lojaId={pedido.loja_id}
  pedidoIdAtual={pedido.id} // IMPORTANTE: Evita conflito com próprio número
  obrigatorio={false}
  disabled={saving}
/>;
```

## 📝 Validação Adicional no Submit

### NovaOrdemForm.tsx - Adicionar antes de `supabaseHelpers.criarPedidoCompleto`

```tsx
import { useValidacaoNumeroOS } from '@/lib/hooks/useValidacaoNumeroOS'

// No início do componente
const { validarNumeroOS } = useValidacaoNumeroOS()

// Na função handleSubmit, ANTES de criar o pedido
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validações existentes...
  if (!formData.loja_id || !formData.laboratorio_id) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  // ✅ NOVA VALIDAÇÃO: Verificar duplicidade de OS
  if (formData.numero_os_fisica && formData.numero_os_fisica.trim() !== '') {
    const validacao = await validarNumeroOS(
      formData.numero_os_fisica,
      formData.loja_id
    )

    if (!validacao.isValid) {
      toast.error(validacao.mensagem || 'Número de OS já está em uso')
      return // Bloqueia o salvamento
    }
  }

  try {
    setLoading(true)
    const resultado = await supabaseHelpers.criarPedidoCompleto(pedidoData)
    // ... resto do código
  }
}
```

### EditarPedidoPage - Adicionar no handleSave

```tsx
import { useValidacaoNumeroOS } from '@/lib/hooks/useValidacaoNumeroOS'

// No início do componente
const { validarNumeroOS } = useValidacaoNumeroOS()

// Na função handleSave, ANTES do update
const handleSave = async () => {
  if (!pedido) return

  // ✅ NOVA VALIDAÇÃO: Verificar duplicidade de OS
  if (formData.numero_os_fisica && formData.numero_os_fisica.trim() !== '') {
    const validacao = await validarNumeroOS(
      formData.numero_os_fisica,
      pedido.loja_id,
      pedido.id // Importante: ignora o próprio pedido
    )

    if (!validacao.isValid) {
      toast.error(validacao.mensagem || 'Número de OS já está em uso')
      setSaving(false)
      return
    }
  }

  try {
    setSaving(true)
    const updateData = {
      // ... dados do update
    }
    // ... resto do código
  }
}
```

## 🎨 Personalização Visual

### Tema Escuro Automático

O componente já suporta tema escuro via Tailwind:

```tsx
// Classes dark: aplicadas automaticamente
className = "border-green-500 dark:border-green-600";
```

### Customizar Cores

```tsx
<NumeroOSInput
  value={value}
  onChange={onChange}
  lojaId={lojaId}
  className="custom-input-class" // Suas classes personalizadas
/>
```

### Customizar Label

```tsx
<NumeroOSInput
  value={value}
  onChange={onChange}
  lojaId={lojaId}
  label="Número da Ordem de Serviço" // Label customizada
/>
```

## 🧪 Testes Recomendados

### Teste 1: Criar Pedido com OS Duplicada

1. Criar pedido com OS "1234"
2. Tentar criar outro com OS "1234"
3. **Esperado:** Input fica vermelho, mostra erro
4. **Esperado:** Botão "Sugerir número" oferece "1235"

### Teste 2: Editar Mantendo Próprio Número

1. Editar pedido que tem OS "1234"
2. Salvar sem alterar o número
3. **Esperado:** Salva normalmente (não valida contra si mesmo)

### Teste 3: Editar Para Número Duplicado

1. Editar pedido A (OS "1000")
2. Alterar para OS "2000" (já usado no pedido B)
3. **Esperado:** Input fica vermelho, mostra erro com info do pedido B

### Teste 4: Sugestão Automática

1. Criar novo pedido
2. Clicar "Sugerir número" sem selecionar loja
3. **Esperado:** Botão desabilitado ou mensagem de erro
4. Selecionar loja e clicar novamente
5. **Esperado:** Mostra próximo número disponível

### Teste 5: Campo Vazio (Opcional)

1. Criar pedido deixando OS vazio
2. **Esperado:** Salva normalmente sem validação

## 🐛 Troubleshooting

### Input sempre mostra "validando"

**Causa:** `lojaId` não está sendo passado  
**Solução:** Verificar se `formData.loja_id` ou `pedido.loja_id` existe

```tsx
// Debug temporário
console.log('Loja ID:', formData.loja_id)

<NumeroOSInput
  lojaId={formData.loja_id || ''} // Nunca undefined
  // ...
/>
```

### Sugestão retorna null

**Causa:** Função `proximo_numero_os_disponivel` não existe no banco  
**Solução:** Executar o script SQL completo

### Validação não funciona em edição

**Causa:** Faltou passar `pedidoIdAtual`  
**Solução:**

```tsx
// ✅ CORRETO
<NumeroOSInput
  pedidoIdAtual={pedido.id} // Adicionar esta prop
  // ...
/>
```

### Erro de importação

**Causa:** Arquivos não foram criados  
**Solução:** Verificar existência dos arquivos:

```bash
# Verificar arquivos criados
ls src/lib/hooks/useValidacaoNumeroOS.ts
ls src/components/forms/NumeroOSInput.tsx
```

## 📦 Dependências

O componente usa apenas dependências já existentes:

- ✅ `@/components/ui/*` (shadcn/ui)
- ✅ `lucide-react`
- ✅ `sonner` (toast)
- ✅ `@/lib/supabase/client`

Nenhuma instalação adicional necessária.

## 🚀 Rollout Sugerido

### Fase 1: Banco de Dados (Crítico)

1. Executar [fix-unicidade-numero-os.sql](../../database/migrations/fix-unicidade-numero-os.sql)
2. Revisar duplicatas existentes
3. Corrigir duplicatas (escolher Opção A ou B)

### Fase 2: Backend (Importante)

1. Verificar se função RPC `proximo_numero_os_disponivel` existe
2. Testar chamada via SQL Editor
3. Garantir que RLS permite acesso à view `v_numeros_os_em_uso`

### Fase 3: Frontend (Gradual)

1. **Dia 1:** Adicionar componente apenas no formulário de edição
2. **Dia 2:** Adicionar no formulário de nova ordem
3. **Dia 3:** Monitorar logs de erro
4. **Dia 4:** Habilitar validação pré-submit
5. **Dia 5:** Remover inputs antigos completamente

## 📊 Métricas de Sucesso

Após implementação, verificar:

- ✅ 0 duplicatas criadas (query de verificação)
- ✅ Taxa de uso da sugestão automática
- ✅ Tempo médio de preenchimento do campo
- ✅ Número de erros de validação capturados

```sql
-- Query para verificar sucesso
SELECT
  COUNT(*) as total_pedidos_criados,
  COUNT(numero_os_fisica) as com_numero_os,
  COUNT(DISTINCT numero_os_fisica) as numeros_unicos,
  COUNT(numero_os_fisica) - COUNT(DISTINCT numero_os_fisica) as duplicatas
FROM pedidos
WHERE created_at > '2025-12-19' -- Data da implementação
  AND loja_id = 'UUID_DA_LOJA';
```

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar [documentação completa](./BLOQUEIO-DUPLICIDADE-OS.md)
2. Revisar logs do Supabase
3. Testar queries SQL diretamente
4. Verificar console do navegador

---

**Última atualização:** 19 de dezembro de 2025  
**Testado em:** Next.js 14, Supabase, TypeScript 5  
**Status:** ✅ Pronto para produção
