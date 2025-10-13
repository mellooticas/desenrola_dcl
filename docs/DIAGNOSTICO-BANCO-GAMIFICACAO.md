# 🔍 DIAGNÓSTICO - Banco de Dados de Gamificação

**Data**: 08/10/2025  
**Objetivo**: Mapear exatamente o que temos no banco Supabase

---

## 📊 TABELAS IDENTIFICADAS

### 1️⃣ **Tabela: `lojas_gamificacao`**
**Status**: ✅ **CRIADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha 10)

**Estrutura**:
```sql
CREATE TABLE lojas_gamificacao (
  id UUID PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id),
  liga_atual TEXT ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE'),
  pontos_mes_atual INTEGER,
  pontos_total INTEGER,
  streak_dias INTEGER,
  maior_streak INTEGER,
  badges_conquistadas TEXT[],
  ultima_atividade TIMESTAMPTZ,
  promocoes INTEGER,
  rebaixamentos INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Uso no Frontend**:
- ✅ Hook: `useGamificacao()` → busca via `/api/gamificacao`
- ✅ Componente: `GamificationDashboardPremium`
- ✅ API: `/api/gamificacao/route.ts`

---

### 2️⃣ **Tabela: `pontuacao_diaria`**
**Status**: ✅ **CRIADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha 28)

**Estrutura**:
```sql
CREATE TABLE pontuacao_diaria (
  id UUID PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id),
  data DATE UNIQUE(loja_id, data),
  pontos_possiveis INTEGER,
  pontos_conquistados INTEGER,
  missoes_totais INTEGER,
  missoes_completadas INTEGER,
  percentual_eficiencia DECIMAL(5,2),
  liga_no_dia TEXT,
  streak_dias INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Uso no Frontend**:
- ✅ Hook: `useGamificacao()` → campo `historicoDiario`
- ✅ Componente: `HistoricoDiario` (Tab 2)
- ⚠️ **ATENÇÃO**: Precisa ser populada diariamente

---

### 3️⃣ **Tabela: `badges`**
**Status**: ✅ **CRIADA + POPULADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha 45)

**Estrutura**:
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY,
  tipo TEXT UNIQUE,
  nome TEXT,
  descricao TEXT,
  icone TEXT,
  cor TEXT,
  pontos_requisito INTEGER,
  condicao_especial TEXT,
  raridade TEXT ('COMUM', 'RARO', 'EPICO', 'LENDARIO'),
  created_at TIMESTAMPTZ
)
```

**Badges Disponíveis** (10 tipos):
1. 🌟 PRIMEIRO_DIA - "Primeira Missão"
2. 🔥 STREAK_7 - "Sequência de 7"
3. 💪 STREAK_30 - "Mês Completo"
4. 🥈 LIGA_PRATA - "Liga Prata"
5. 🥇 LIGA_OURO - "Liga Ouro"
6. 💎 LIGA_DIAMANTE - "Liga Diamante"
7. ✨ PERFEITO - "Dia Perfeito"
8. 🎯 MISSAO_10 - "10 Missões"
9. 🚀 MISSAO_50 - "50 Missões"
10. 👑 MISSAO_100 - "100 Missões"

**Uso no Frontend**:
- ⚠️ Componente: `GamificationDashboardPremium` (Tab 3 - Placeholder)
- ⚠️ **NÃO IMPLEMENTADO** ainda no dashboard

---

### 4️⃣ **Tabela: `missoes`**
**Status**: ✅ **CRIADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha 62)

**Estrutura**:
```sql
CREATE TABLE missoes (
  id UUID PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id),
  titulo TEXT,
  descricao TEXT,
  tipo TEXT ('DIARIA', 'SEMANAL', 'MENSAL', 'ESPECIAL'),
  prioridade TEXT ('baixa', 'media', 'alta', 'critica'),
  status TEXT ('pendente', 'ativa', 'concluida', 'cancelada'),
  pontos_total INTEGER,
  pontos_conquistados INTEGER,
  data_inicio DATE,
  data_vencimento DATE,
  data_conclusao TIMESTAMPTZ,
  progresso_percentual DECIMAL(5,2),
  meta_pedidos INTEGER,
  pedidos_completados INTEGER,
  observacoes TEXT,
  criado_por UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Uso no Frontend**:
- ✅ Página: `/mission-control` (Kanban de Missões)
- ✅ API: `/api/mission-control`
- ✅ Hook: `useMissions()` em `use-mission-control.ts`

---

### 5️⃣ **Tabela: `missoes_historico`**
**Status**: ✅ **CRIADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha 85)

**Estrutura**:
```sql
CREATE TABLE missoes_historico (
  id UUID PRIMARY KEY,
  missao_id UUID REFERENCES missoes(id),
  loja_id UUID REFERENCES lojas(id),
  status_anterior TEXT,
  status_novo TEXT,
  pontos_anteriores INTEGER,
  pontos_novos INTEGER,
  observacao TEXT,
  alterado_por UUID,
  created_at TIMESTAMPTZ
)
```

**Uso**:
- ✅ Trigger automático ao atualizar missão
- ⚠️ **NÃO usado** no dashboard ainda (futuro)

---

### 6️⃣ **View: `v_missoes_timeline`**
**Status**: ✅ **CRIADA**  
**Localização SQL**: `database/setup/setup-mission-control-completo.sql` (linha ~190)

**Retorna**:
```sql
SELECT 
  m.*,
  l.nome as loja_nome,
  CASE 
    WHEN data_vencimento < CURRENT_DATE THEN 'ATRASADA'
    WHEN data_vencimento = CURRENT_DATE THEN 'VENCE_HOJE'
    WHEN status = 'concluida' THEN 'OK'
    ELSE 'NO_PRAZO'
  END as situacao_prazo,
  ...
FROM missoes m
JOIN lojas l ON l.id = m.loja_id
```

**Uso no Frontend**:
- ✅ Página: `/mission-control`
- ✅ API: `/api/mission-control?action=missions`

---

## 🔌 APIs DISPONÍVEIS

### API 1: `/api/gamificacao`
**Arquivo**: `src/app/api/gamificacao/route.ts`

**Endpoints**:
```typescript
GET /api/gamificacao?loja_id={id}
  → Retorna: { loja, ranking, badges }

POST /api/gamificacao
  Body: { loja_id, pontos, acao }
  → Atualiza pontos e verifica promoção de liga
```

**O que faz**:
- ✅ Busca dados de `lojas_gamificacao`
- ✅ Calcula ranking entre todas as lojas
- ✅ Cria registro se não existir
- ✅ Atualiza liga automaticamente

---

### API 2: `/api/gamificacao/historico`
**Status**: ⚠️ **NÃO ENCONTRADA!**

**Esperado**:
```typescript
GET /api/gamificacao/historico?loja_id={id}&periodo=30d
  → Retorna: PontuacaoDiaria[]
```

**Problema**: Hook `useGamificacao` tenta buscar, mas API não existe!

---

### API 3: `/api/mission-control`
**Arquivo**: `src/app/api/mission-control/route.ts`

**Endpoints**:
```typescript
GET /api/mission-control?action=missions&loja_id={id}&data={date}
  → Retorna missões do dia

GET /api/mission-control?action=dashboard&loja_id={id}&data={date}
  → Retorna dashboard de missões

GET /api/mission-control?action=stats&loja_id={id}
  → Retorna estatísticas gerais

POST /api/mission-control?action=start
  Body: { missao_id }
  → Inicia missão

POST /api/mission-control?action=complete
  Body: { missao_id, qualidade, tempo }
  → Completa missão e ganha pontos
```

---

## 🐛 PROBLEMAS IDENTIFICADOS

### ❌ **Problema 1: API de Histórico Faltando**
**Impacto**: Tab "Histórico" não funciona

**Solução**:
```bash
Criar: src/app/api/gamificacao/historico/route.ts
```

---

### ⚠️ **Problema 2: Tabela `pontuacao_diaria` Vazia**
**Impacto**: Sem dados para gráficos

**Solução**: Criar função para popular diariamente
```sql
-- Já existe: calcular_pontuacao_diaria()
-- Precisa: Agendar execução diária
```

---

### ⚠️ **Problema 3: Badges Não Aparecem**
**Impacto**: Tab "Badges" é só placeholder

**Solução**: Implementar lógica de desbloqueio
```typescript
// Verificar conquistas ao completar missões
// Atualizar badges_conquistadas em lojas_gamificacao
```

---

### ⚠️ **Problema 4: Missões Não Criam Automaticamente**
**Impacto**: Lojas sem missões para completar

**Solução**: Agendar função `criar_missoes_diarias()`
```sql
-- Já existe a função (linha 325 do setup)
-- Precisa: Cron job ou Edge Function no Supabase
```

---

## ✅ O QUE ESTÁ FUNCIONANDO

1. ✅ **Tabelas criadas** no Supabase
2. ✅ **API `/api/gamificacao`** funcionando
3. ✅ **Hook `useGamificacao()`** buscando dados
4. ✅ **Dashboard Premium** renderizando
5. ✅ **Cards de estatísticas** mostrando pontos/liga/streak
6. ✅ **Hero section** com gradiente
7. ✅ **Seletor de lojas** carregando
8. ✅ **Triggers** de updated_at funcionando

---

## 🔧 O QUE PRECISA SER FEITO

### Priority 1 - Alta (Crítico)
- [ ] **Criar API `/api/gamificacao/historico/route.ts`**
- [ ] **Popular `pontuacao_diaria` com dados iniciais**
- [ ] **Testar com loja real do banco**

### Priority 2 - Média (Importante)
- [ ] **Implementar lógica de badges**
- [ ] **Agendar `criar_missoes_diarias()` diariamente**
- [ ] **Adicionar queries de diagnóstico**

### Priority 3 - Baixa (Futuro)
- [ ] **Gráficos interativos (Recharts)**
- [ ] **Exportar relatório PDF**
- [ ] **Sistema de notificações**

---

## 📝 PRÓXIMOS PASSOS

### Passo 1: Verificar Dados Reais
```sql
-- Executar no Supabase SQL Editor:

-- 1. Verificar lojas cadastradas
SELECT * FROM lojas WHERE ativo = true;

-- 2. Verificar se tem gamificação criada
SELECT * FROM lojas_gamificacao;

-- 3. Verificar missões
SELECT * FROM missoes WHERE data_vencimento >= CURRENT_DATE;

-- 4. Verificar pontuação diária
SELECT * FROM pontuacao_diaria ORDER BY data DESC LIMIT 30;

-- 5. Verificar badges
SELECT * FROM badges ORDER BY pontos_requisito;
```

### Passo 2: Criar API de Histórico
```typescript
// src/app/api/gamificacao/historico/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lojaId = searchParams.get('loja_id')
  const periodo = searchParams.get('periodo') || '30d'
  
  // Buscar pontuacao_diaria
  // Retornar array formatado
}
```

### Passo 3: Popular Dados Iniciais
```sql
-- Executar para criar dados de teste
SELECT calcular_pontuacao_diaria('LOJA-UUID', CURRENT_DATE);
```

---

## 💡 RECOMENDAÇÕES

1. **Usar dados REAIS do banco** ✅ (já implementado no hook)
2. **Criar API faltante de histórico** ⏳ (próximo passo)
3. **Testar com loja específica** 🔍 (aguardando dados)
4. **Popular `pontuacao_diaria`** 📊 (função existe, precisa executar)
5. **Implementar badges corretamente** 🏅 (próxima fase)

---

**Conclusão**: A estrutura está 80% pronta! Falta apenas conectar os últimos pontos e popular com dados reais.

**Status**: 🟡 **AGUARDANDO DADOS REAIS DO BANCO**
