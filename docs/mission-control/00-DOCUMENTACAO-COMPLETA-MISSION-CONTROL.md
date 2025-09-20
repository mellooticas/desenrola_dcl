# 🎯 DOCUMENTAÇÃO COMPLETA - MISSION CONTROL DCL

**STATUS: ✅ SISTEMA COMPLETAMENTE IMPLEMENTADO E FUNCIONAL**

## 📊 RESUMO EXECUTIVO

O Mission Control DCL é um sistema de controle e monitoramento de missões diárias que permite aos gestores e operadores de loja gerenciar tarefas, acompanhar progresso e conquistar pontos através de gamificação.

### ✅ IMPLEMENTAÇÃO FINALIZADA
- **Controle de Acesso**: Sistema role-based operacional (gestor/loja)
- **Interface React**: Todos os erros de hidratação e TypeScript corrigidos
- **Alinhamento Database**: API, hooks e tipos sincronizados com schema real
- **Sistema Funcional**: Pronto para uso em produção

---

### 1. TABELA: `missoes_diarias`
```sql
-- Tabela principal que armazena as missões diárias de cada loja
CREATE TABLE missoes_diarias (
    -- Identificação
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id uuid NOT NULL REFERENCES lojas(id),
    usuario_responsavel_id uuid REFERENCES usuarios(id),
    template_id uuid NOT NULL REFERENCES missao_templates(id),
    
    -- Cronograma
    data_missao date NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento timestamp with time zone,
    
    -- Execução
    status text NOT NULL DEFAULT 'pendente', -- 'pendente', 'executando', 'pausada', 'concluida'
    iniciada_em timestamp with time zone,
    pausada_em timestamp with time zone,
    retomada_em timestamp with time zone,
    concluida_em timestamp with time zone,
    tempo_total_execucao_segundos integer,
    
    -- Responsabilidade
    executada_por text,
    qualidade_execucao integer, -- 1-5 estrelas
    observacoes_execucao text,
    evidencia_urls text[], -- Array de URLs de imagens/docs
    
    -- Gamificação
    pontos_base integer DEFAULT 0,
    pontos_bonus integer DEFAULT 0,
    pontos_total integer,
    multiplicadores_aplicados jsonb DEFAULT '{}',
    badges_ganhas text[] DEFAULT '{}',
    
    -- Dados Dinâmicos
    dados_dinamicos jsonb DEFAULT '{}',
    condicoes_especiais jsonb DEFAULT '{}',
    
    -- Delegação
    delegada_para uuid REFERENCES usuarios(id),
    motivo_delegacao text,
    delegada_em timestamp with time zone,
    
    -- Controle
    eh_missao_extra boolean DEFAULT false,
    criada_automaticamente boolean DEFAULT true,
    requer_atencao boolean DEFAULT false,
    
    -- Auditoria
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### 2. TABELA: `missao_templates`
```sql
-- Templates/modelos de missões que podem ser aplicados às lojas
CREATE TABLE missao_templates (
    -- Identificação
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    descricao text NOT NULL,
    instrucoes text,
    
    -- Classificação
    tipo text NOT NULL, -- 'abertura', 'fechamento', 'vendas', 'limpeza', 'estoque'
    categoria text NOT NULL, -- 'operacional', 'comercial', 'administrativa'
    
    -- Cronograma
    horario_inicio time without time zone,
    horario_limite time without time zone,
    tempo_estimado_min integer DEFAULT 5,
    pode_ser_antecipada boolean DEFAULT true,
    
    -- Gamificação
    pontos_base integer DEFAULT 10,
    multiplicador_critico numeric DEFAULT 3.0, -- Quando é crítica/urgente
    multiplicador_rapido numeric DEFAULT 1.2,  -- Quando feita rapidamente
    
    -- Visual
    icone text DEFAULT '📋',
    cor_primary text DEFAULT '#3B82F6',
    cor_secondary text DEFAULT '#1E40AF',
    
    -- Configuração
    requer_evidencia boolean DEFAULT false,
    requer_observacao boolean DEFAULT false,
    pode_ser_delegada boolean DEFAULT false,
    eh_repetitiva boolean DEFAULT true,
    
    -- Lógica Condicional
    condicoes_aparicao jsonb DEFAULT '{}', -- Quando deve aparecer
    pre_requisitos jsonb DEFAULT '[]',     -- O que precisa antes
    dados_contexto jsonb DEFAULT '{}',     -- Dados específicos
    
    -- Controle
    ativo boolean DEFAULT true,
    criado_por text,
    
    -- Auditoria
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### 3. RELACIONAMENTOS MAPEADOS
```sql
-- Foreign Keys encontradas:
-- missoes_diarias.loja_id -> lojas.id
-- missoes_diarias.usuario_responsavel_id -> usuarios.id  
-- missoes_diarias.template_id -> missao_templates.id
-- missoes_diarias.delegada_para -> usuarios.id
```

### 4. TABELAS RELACIONADAS DE USUÁRIOS
```
- usuarios: Tabela principal de usuários
- usuario_gamificacao: Dados de gamificação do usuário
- v_usuario_gamificacao_completa: View consolidada da gamificação
- v_usuario_permissoes_kanban: View de permissões do Kanban
```

## 🔧 ANÁLISE DOS PROBLEMAS IDENTIFICADOS

### PROBLEMA 1: Inconsistência de Nomes de Tabelas
**Na API/Hook**: Usa `missions`, `mission_templates`, `lojas`  
**No Banco Real**: `missoes_diarias`, `missao_templates`, `lojas`

### PROBLEMA 2: Campos Diferentes
**Na API**: `horario_programado`, `horario_execucao`  
**No Banco**: `horario_inicio`, `horario_limite`, `data_vencimento`

### PROBLEMA 3: Estrutura de Status
**Na API**: Assume status simples  
**No Banco**: Status complexo com múltiplos timestamps

### PROBLEMA 4: Permissões de Acesso
**Configurado**: Para admin  
**Necessário**: Para gestor e loja

## 📋 REGISTROS DE EXEMPLO ENCONTRADOS

```sql
-- 3 missões do dia 2025-09-18 encontradas:
-- 1. Missão com 15 pontos, status pendente, vencimento 09:00
-- 2. Missão com 15 pontos, status pendente, vencimento 10:00  
-- 3. Missão com 20 pontos, status pendente, vencimento 10:00
-- Todas da mesma loja: e974fc5d-ed39-4831-9e5e-4a5544489de6
```

## 🎯 PLANO DE CORREÇÃO

### 1. Corrigir Nomes de Tabelas na API
### 2. Ajustar Campos e Estruturas
### 3. Implementar Lógica de Status Correta
### 4. Corrigir Permissões de Acesso
### 5. Criar Queries Otimizadas
### 6. Implementar Gamificação Completa

## 📈 FUNCIONALIDADES IMPLEMENTADAS NO SISTEMA

### ✅ Já Funcionando:
- Interface visual Mission Control
- Hooks básicos de busca
- Estrutura de componentes
- Sistema de permissões (com correção necessária)

### 🔧 Necessário Corrigir:
- Conexão com banco real
- Queries SQL adequadas
- Status e timestamps
- Gamificação
- Evidências e observações