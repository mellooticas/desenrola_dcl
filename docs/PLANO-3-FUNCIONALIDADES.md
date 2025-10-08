# 🎯 PLANO DE IMPLEMENTAÇÃO - 3 FUNCIONALIDADES CRÍTICAS

**Data**: 08/10/2025  
**Objetivo**: Adicionar 3 funcionalidades essenciais ao sistema

---

## 1️⃣ DASHBOARD COM MISSÕES DA LOJA (Gamificação)

### ✅ Status Atual
- Sistema Mission Control **100% funcional**
- API, hooks, componentes prontos
- Dados de pontuação, ranking, histórico funcionando

### 📍 O que fazer
**Local**: `src/app/dashboard/page.tsx`

**Adicionar seção de Gamificação**:
```tsx
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard'

// No componente Dashboard, adicionar:
<div className="mt-6">
  <h2 className="text-2xl font-bold mb-4">🎮 Sistema de Gamificação</h2>
  <GamificationDashboard lojaId={selectedLojaId} />
</div>
```

**Funcionalidades incluídas**:
- ✅ Pontos do mês atual
- ✅ Ranking entre lojas
- ✅ Liga atual (Bronze/Prata/Ouro/Diamante)
- ✅ Streak de dias consecutivos
- ✅ Histórico diário de missões
- ✅ Badges conquistadas

**Estimativa**: 30 minutos (só integração visual)

---

## 2️⃣ ATRIBUIR MONTADOR AO RECEBER LENTES

### ⚠️ Status Atual
- Campo `montador_id` existe no banco ✅
- Join com `montadores` na view ✅
- Componente `MontadorSelector` existe ✅
- Permissão `canSelectMontador()` existe ✅
- **FALTA**: Validação de bloqueio

### 📍 O que fazer

#### A) Adicionar Validação de Bloqueio
**Local**: `src/app/kanban/page.tsx` → função `handleAdvanceStatus`

```tsx
// ANTES de mover de PRONTO → ENVIADO
if (pedido.status === 'PRONTO' && nextStatus === 'ENVIADO') {
  if (!pedido.montador_id) {
    toast.error('⚠️ Selecione um montador antes de enviar para montagem!', {
      description: 'Abra o pedido e escolha quem fará a montagem'
    })
    return
  }
}
```

#### B) Adicionar Indicador Visual no Card
**Local**: `src/components/kanban/KanbanCard.tsx`

```tsx
{/* Adicionar após OSs, só se status = PRONTO */}
{pedido.status === 'PRONTO' && !pedido.montador_id && (
  <div className="bg-yellow-50 border border-yellow-300 rounded p-2 flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 text-yellow-600" />
    <span className="text-xs font-medium text-yellow-700">
      Montador não selecionado
    </span>
  </div>
)}

{pedido.montador_id && pedido.montador_nome && (
  <div className="bg-blue-50 border border-blue-300 rounded p-2 flex items-center gap-2">
    <User className="w-4 h-4 text-blue-600" />
    <span className="text-xs font-medium text-blue-700">
      {pedido.montador_nome}
    </span>
  </div>
)}
```

#### C) Melhorar Feedback Visual no Drawer
**Local**: `src/components/kanban/PedidoDetailDrawer.tsx`

```tsx
{/* Já existe, mas adicionar destaque quando PRONTO */}
{permissions.canSelectMontador() && pedido.status === 'PRONTO' && (
  <Card className={pedido.montador_id ? 'border-blue-500' : 'border-yellow-500 bg-yellow-50'}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {!pedido.montador_id && (
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        )}
        Montador Responsável
        {!pedido.montador_id && (
          <Badge variant="destructive">Obrigatório</Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* MontadorSelector existente */}
    </CardContent>
  </Card>
)}
```

**Estimativa**: 1 hora

---

## 3️⃣ COMPROVANTE DE PAGAMENTO PIX OBRIGATÓRIO

### 🔴 Status Atual
- Componente `PagamentoPIXForm.tsx` existe mas é **MOCK**
- Form tem estrutura completa (3 steps)
- Falta integração com banco e storage

### 📍 Estrutura do Banco de Dados

#### Opção 1: Adicionar Campos na Tabela `pedidos`
```sql
ALTER TABLE pedidos
ADD COLUMN comprovante_pagamento_url TEXT,
ADD COLUMN comprovante_pagamento_tipo VARCHAR(10) CHECK (comprovante_pagamento_tipo IN ('PDF', 'JPG', 'PNG')),
ADD COLUMN comprovante_upload_at TIMESTAMPTZ,
ADD COLUMN chave_pix_utilizada TEXT,
ADD COLUMN observacoes_pagamento TEXT;
```

**Prós**:
- ✅ Simples e direto
- ✅ Dados do pagamento junto com o pedido
- ✅ Consultas rápidas

**Contras**:
- ❌ Não permite múltiplos comprovantes (caso de estorno/reembolso)
- ❌ Histórico de pagamentos limitado

#### Opção 2: Criar Tabela Separada `pagamentos`
```sql
CREATE TABLE pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  valor_recebido DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL DEFAULT 'PIX',
  chave_pix_utilizada TEXT,
  data_pagamento DATE NOT NULL,
  
  -- Comprovante
  comprovante_url TEXT NOT NULL,
  comprovante_tipo VARCHAR(10) CHECK (comprovante_tipo IN ('PDF', 'JPG', 'PNG', 'JPEG')),
  comprovante_tamanho_bytes INTEGER,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  processado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(pedido_id, data_pagamento) -- Prevenir duplicatas
);

-- Índices
CREATE INDEX idx_pagamentos_pedido ON pagamentos(pedido_id);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);
```

**Prós**:
- ✅ Histórico completo de pagamentos
- ✅ Permite múltiplos comprovantes
- ✅ Separação de responsabilidades
- ✅ Facilita auditoria e relatórios financeiros
- ✅ Pode registrar estornos/reembolsos no futuro

**Contras**:
- ❌ Join adicional nas queries
- ❌ Mais complexo

### 💡 RECOMENDAÇÃO: **Opção 2 (Tabela separada)**

**Por quê?**
1. **Auditoria**: Financeiro precisa rastrear todos os pagamentos
2. **Flexibilidade**: Cliente pode pagar em múltiplas parcelas
3. **Histórico**: Importante ter log de quando/quem processou
4. **Estornos**: No futuro, pode precisar registrar devoluções

---

### 📍 Configuração do Storage

#### Supabase Storage - Bucket de Comprovantes
```sql
-- Criar bucket no Supabase Dashboard ou via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-pagamento', 'comprovantes-pagamento', false);

-- Políticas de acesso
-- 1. Apenas usuários autenticados podem fazer upload
CREATE POLICY "Upload comprovantes - Authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprovantes-pagamento');

-- 2. Apenas usuários autenticados podem visualizar
CREATE POLICY "Download comprovantes - Authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes-pagamento');

-- 3. Usuários podem atualizar seus próprios uploads
CREATE POLICY "Update own comprovantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'comprovantes-pagamento' AND auth.uid() = owner);
```

#### Estrutura de Pastas no Storage
```
comprovantes-pagamento/
  ├── 2025/
  │   ├── 10/  (outubro)
  │   │   ├── pedido-UUID-1728394847.pdf
  │   │   ├── pedido-UUID-1728394901.jpg
  │   │   └── pedido-UUID-1728395023.png
  │   └── 11/  (novembro)
  └── 2024/
```

**Padrão de nome**: `pedido-{PEDIDO_UUID}-{TIMESTAMP}.{ext}`

---

### 📍 Implementação do Upload

#### A) Atualizar `PagamentoPIXForm.tsx`

**Função de Upload Real**:
```tsx
const uploadComprovante = async (file: File): Promise<string> => {
  try {
    // Gerar nome único
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const fileName = `pedido-${pedido.id}-${timestamp}.${ext}`
    
    // Path com estrutura de data
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const filePath = `${year}/${month}/${fileName}`
    
    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('comprovantes-pagamento')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Erro no upload:', error)
      throw new Error('Erro ao fazer upload do comprovante')
    }
    
    // Retornar URL pública (ou signed URL se bucket for privado)
    const { data: urlData } = supabase.storage
      .from('comprovantes-pagamento')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}
```

#### B) Criar API para Salvar Pagamento
**Local**: `src/app/api/pedidos/pagamento/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const body = await request.json()
    
    const {
      pedido_id,
      valor_recebido,
      chave_utilizada,
      comprovante_url,
      comprovante_tipo,
      observacoes_pagamento,
      processado_por
    } = body
    
    // 1. Validar pedido existe e está em AG_PAGAMENTO
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, status')
      .eq('id', pedido_id)
      .single()
    
    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    if (pedido.status !== 'AG_PAGAMENTO') {
      return NextResponse.json(
        { error: 'Pedido não está aguardando pagamento' },
        { status: 400 }
      )
    }
    
    // 2. Inserir registro de pagamento
    const { data: pagamento, error: pagamentoError } = await supabase
      .from('pagamentos')
      .insert({
        pedido_id,
        valor_recebido,
        forma_pagamento: 'PIX',
        chave_pix_utilizada: chave_utilizada,
        data_pagamento: new Date().toISOString().split('T')[0],
        comprovante_url,
        comprovante_tipo,
        observacoes,
        processado_por
      })
      .select()
      .single()
    
    if (pagamentoError) {
      console.error('Erro ao criar pagamento:', pagamentoError)
      return NextResponse.json(
        { error: 'Erro ao registrar pagamento' },
        { status: 500 }
      )
    }
    
    // 3. Atualizar pedido para PAGO usando função do banco
    const { error: statusError } = await supabase
      .rpc('marcar_pagamento', {
        pedido_uuid: pedido_id,
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'PIX',
        usuario: processado_por || 'Sistema'
      })
    
    if (statusError) {
      console.error('Erro ao marcar pagamento:', statusError)
      return NextResponse.json(
        { error: 'Erro ao atualizar status do pedido' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      pagamento,
      message: 'Pagamento processado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro no endpoint de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

#### C) Adicionar Validação no Kanban
**Local**: `src/app/kanban/page.tsx`

```tsx
// Na função handleAdvanceStatus, ANTES de mover AG_PAGAMENTO → PAGO
if (pedido.status === 'AG_PAGAMENTO' && nextStatus === 'PAGO') {
  // Verificar se tem comprovante
  const { data: pagamento, error } = await supabase
    .from('pagamentos')
    .select('id, comprovante_url')
    .eq('pedido_id', pedido.id)
    .single()
  
  if (error || !pagamento || !pagamento.comprovante_url) {
    toast.error('⚠️ Upload do comprovante obrigatório!', {
      description: 'Use o botão "Confirmar PIX" para enviar o comprovante'
    })
    return
  }
}
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1 - Rápida (1-2 horas)
1. ✅ Dashboard com Gamificação (30min)
2. ✅ Validação de Montador (1h)

### Fase 2 - Banco e Storage (2-3 horas)
3. 🔧 Criar tabela `pagamentos` no Supabase
4. 🔧 Configurar bucket `comprovantes-pagamento`
5. 🔧 Testar upload manual no Supabase Dashboard

### Fase 3 - Implementação Frontend (3-4 horas)
6. 🔧 Atualizar `PagamentoPIXForm.tsx` com upload real
7. 🔧 Criar API `/api/pedidos/pagamento`
8. 🔧 Adicionar validação no Kanban
9. 🔧 Testes completos

### Fase 4 - Melhorias (1-2 horas)
10. 🔧 Adicionar preview do comprovante no drawer
11. 🔧 Download do comprovante
12. 🔧 Relatório de pagamentos para Financeiro

**TOTAL ESTIMADO**: 7-11 horas

---

## 💬 CONVERSAÇÃO NECESSÁRIA

### Perguntas para Decidir:

1. **Sobre Comprovantes**:
   - [ ] Vamos com tabela separada `pagamentos`? (recomendado)
   - [ ] Bucket privado ou público? (recomendado: privado)
   - [ ] Permitir edição/exclusão de comprovante?
   - [ ] Notificar Financeiro quando comprovante é enviado?

2. **Sobre Montadores**:
   - [ ] Bloquear completamente ou só avisar?
   - [ ] Mostrar lista de montadores disponíveis?
   - [ ] Rastrear tempo de montagem?

3. **Sobre Dashboard**:
   - [ ] Mostrar gamificação para todas as lojas ou só a selecionada?
   - [ ] Adicionar filtro de período?
   - [ ] Permitir exportar relatório de missões?

---

## 📝 PRÓXIMOS PASSOS

Depois desta conversa, vou:
1. Criar os scripts SQL necessários
2. Implementar as validações
3. Atualizar os componentes
4. Testar tudo em desenvolvimento
5. Documentar as mudanças
6. Fazer deploy

**Vamos começar por qual funcionalidade?** 🚀
