# 🏪⚙️ Sistema de Configurações de Loja - Horários e Ações Personalizadas

## 📋 Visão Geral

Este sistema permite configurar horários de funcionamento e ações personalizadas para cada loja através de uma interface administrativa, eliminando a necessidade de alterações diretas no banco de dados.

## 🎯 Principais Benefícios

✅ **Configuração sem mexer no banco**: Interface web para todas as configurações  
✅ **Horários personalizados por loja**: Cada loja tem seus próprios horários  
✅ **Ações customizáveis**: Ativar/desativar ações específicas por loja  
✅ **Prioridades e pontuações**: Personalizar importância e recompensas  
✅ **Dias da semana configuráveis**: Definir quando cada ação deve aparecer  
✅ **Horários específicos**: Cada ação pode ter deadline personalizado  

## 🗂️ Estrutura do Sistema

### 1. Tabelas do Banco de Dados

#### `loja_configuracoes_horario`
Configurações gerais de horário por loja:
- `hora_abertura` / `hora_fechamento`: Horários de funcionamento
- `hora_limite_missoes`: Deadline padrão para missões
- `hora_renovacao_sistema`: Quando o sistema renova (customizável)
- `prazo_padrao_horas`: Prazo padrão em horas
- `permite_execucao_apos_horario`: Se permite executar após horário
- `[dia]_ativa`: Controle de dias da semana ativos

#### `loja_acoes_customizadas`
Ações específicas configuradas por loja:
- `template_id`: Referência ao template da missão
- `ativa`: Se a ação está ativa para esta loja
- `prioridade`: Importância da ação (1-5)
- `horario_especifico`: Deadline específico para esta ação
- `prazo_customizado_horas`: Prazo diferente do padrão
- `pontos_customizados`: Pontos diferentes do template
- `obrigatoria`: Se é obrigatória para esta loja
- `dias_semana`: Quais dias da semana aparece
- `permite_delegacao`: Se pode ser delegada
- `requer_evidencia`: Se precisa de foto/evidência
- `requer_justificativa_se_nao_feita`: Se precisa justificar se não fizer

### 2. APIs Disponíveis

#### Configurações da Loja
```
GET    /api/admin/lojas/[lojaId]/configuracoes
PUT    /api/admin/lojas/[lojaId]/configuracoes
POST   /api/admin/lojas/[lojaId]/configuracoes
```

#### Gerenciar Ações Específicas
```
GET    /api/admin/lojas/[lojaId]/configuracoes/acoes/[acaoId]
PATCH  /api/admin/lojas/[lojaId]/configuracoes/acoes/[acaoId]
DELETE /api/admin/lojas/[lojaId]/configuracoes/acoes/[acaoId]
```

#### Gerar Missões Personalizadas
```
POST   /api/admin/missoes/gerar-personalizadas
GET    /api/admin/missoes/gerar-personalizadas?tipo=configuracoes
GET    /api/admin/missoes/gerar-personalizadas?tipo=preview
```

### 3. Interface de Configuração

**Localização**: `/admin/lojas/[lojaId]/configuracoes`

#### Aba Horários
- Configurar horários de abertura/fechamento
- Definir horário limite para missões
- Configurar horário de renovação do sistema
- Definir prazo padrão em horas
- Controlar dias da semana ativos
- Permitir execução após horário

#### Aba Ações
- Visualizar todas as ações configuradas
- Adicionar novas ações dos templates disponíveis
- Ativar/desativar ações específicas
- Configurar prioridades (1-5)
- Definir horários específicos por ação
- Personalizar pontuação
- Configurar dias da semana por ação
- Marcar como obrigatória
- Configurar delegação e evidências

## 🚀 Como Usar

### 1. Migração Inicial

Execute o script de migração para criar as estruturas:

```bash
node scripts/aplicar-configuracoes-loja.js
```

Este script:
- Cria as tabelas necessárias
- Aplica configurações padrão para todas as lojas
- Configura ações baseadas nos templates existentes
- Personaliza configurações por categoria de template

### 2. Configuração via Interface

1. Acesse `/admin/lojas/[lojaId]/configuracoes`
2. Configure horários na aba "Horários"
3. Adicione/configure ações na aba "Ações"
4. Salve as alterações

### 3. Geração Automática de Missões

O sistema utiliza as configurações para gerar missões:

```typescript
import { gerarMissoesComConfiguracoes } from '@/lib/gerador-missoes-personalizadas';

// Gerar missões para hoje com as configurações personalizadas
const resultado = await gerarMissoesComConfiguracoes();

// Gerar para loja específica
const resultadoLoja = await gerarMissoesParaLojaEspecifica(lojaId);
```

## ⚙️ Configurações Automáticas por Categoria

O sistema aplica configurações inteligentes baseadas na categoria do template:

### 📊 Vendas
- **Prioridade**: 4 (Alta)
- **Obrigatória**: Sim
- **Horário**: 16:00
- **Finalidade**: Acompanhar resultados de vendas

### 📦 Estoque
- **Prioridade**: 3 (Média)
- **Horário**: 09:00
- **Requer Evidência**: Sim
- **Finalidade**: Controle de estoque matinal

### 🧽 Limpeza
- **Prioridade**: 2 (Normal)
- **Horário**: 08:30
- **Finalidade**: Organização do ambiente

### 👥 Atendimento
- **Prioridade**: 4 (Alta)
- **Obrigatória**: Sim
- **Finalidade**: Qualidade do atendimento

### 📋 Administrativo
- **Prioridade**: 2 (Normal)
- **Dias**: Segunda, Quarta, Sexta
- **Horário**: 17:00
- **Finalidade**: Tarefas administrativas

## 🔄 Fluxo de Funcionamento

### 1. Configuração
```
Admin → Interface → Configura Loja → Salva no Banco
```

### 2. Geração de Missões
```
Sistema → Lê Configurações → Aplica Regras → Gera Missões Personalizadas
```

### 3. Execução
```
Funcionário → Vê Missões → Executa → Sistema Avalia conforme Configurações
```

## 📊 Monitoramento e Relatórios

### Relatório de Configurações
```typescript
const relatorio = await obterRelatorioConfiguracoes();
```

Retorna:
- Total de lojas configuradas
- Ações ativas por loja
- Estatísticas de prioridades
- Categorias de ações mais usadas

### Preview de Missões
```typescript
// Ver quais missões seriam geradas hoje sem criar de fato
GET /api/admin/missoes/gerar-personalizadas?tipo=preview
```

## 🔧 Vantagens Técnicas

### 🏗️ Arquitetura Modular
- **Separação de responsabilidades**: Configurações separadas da lógica de negócio
- **Facilidade de manutenção**: Mudanças via interface, não via código
- **Auditoria completa**: Rastro de todas as alterações

### 🔒 Segurança
- **Validações robustas**: Verificações de horários e configurações
- **Controle de acesso**: Apenas admins podem configurar
- **Verificação de integridade**: Missões ativas não podem ser removidas

### ⚡ Performance
- **Índices otimizados**: Para consultas rápidas
- **Cache inteligente**: Configurações carregadas eficientemente
- **Processamento em lote**: Geração de múltiplas missões otimizada

## 🎯 Casos de Uso Práticos

### 1. Loja com Horário Especial
```
Loja do Shopping:
- Abre às 10:00, fecha às 22:00
- Missões de vendas até 21:30
- Não trabalha domingo
- Renovação às 23:00
```

### 2. Loja com Perfil Diferenciado
```
Loja Premium:
- Todas as ações obrigatórias
- Prioridades altas
- Requer evidência em tudo
- Pontuação 50% maior
```

### 3. Franquia Simples
```
Loja Pequena:
- Só ações essenciais ativas
- Horários padrão
- Sem obrigatoriedade
- Pontuação normal
```

## 📈 Próximas Evoluções

### 🔮 Melhorias Planejadas

1. **Configurações por Período**
   - Configurações sazonais
   - Horários de feriados
   - Campanhas especiais

2. **Inteligência Artificial**
   - Sugestões automáticas de configurações
   - Análise de performance por configuração
   - Otimização automática

3. **Templates de Configuração**
   - Perfis pré-definidos por tipo de loja
   - Aplicação em massa
   - Versionamento de configurações

4. **Métricas Avançadas**
   - Dashboard de efetividade
   - Comparação entre lojas
   - ROI por configuração

## ✅ Conclusão

Este sistema oferece controle total sobre horários e ações por loja através de uma interface intuitiva, eliminando a necessidade de alterações no banco de dados e proporcionando flexibilidade máxima para diferentes perfis de loja.

**Resultado**: Cada loja pode ter sua configuração única, respeitando suas especificidades operacionais! 🎯🏪