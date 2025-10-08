# 🇧🇷 Sistema de Renovação Diária - Timezone Brasil

## ⏰ Automatização às 20:00 (Horário de Brasília)

### 🎯 Objetivo
Sistema automático que renova diariamente às 20:00 (Brasília):
- ✅ Calcula performance do dia anterior
- ✅ Atualiza ligas baseado na performance mensal
- ✅ Mantém streak de dias consecutivos
- ✅ Limpa dados antigos mantendo histórico
- ✅ Prepara sistema para novo dia

## 🔧 Configuração Implementada

### 1. Timezone Brasileiro
```sql
-- Todas as funções usam timezone 'America/Sao_Paulo'
SET timezone TO 'America/Sao_Paulo';

-- Funções auxiliares
brasil_now()    -- Data/hora atual no Brasil
brasil_today()  -- Data atual no Brasil (sem hora)
```

### 2. Tabela de Controle
```sql
-- Registra cada execução da renovação
CREATE TABLE renovacao_diaria (
  data_renovacao DATE,
  hora_renovacao TIMESTAMP WITH TIME ZONE,
  total_lojas_processadas INTEGER,
  total_pontuacoes_calculadas INTEGER,
  status TEXT -- PENDENTE, PROCESSANDO, CONCLUIDO, ERRO
);
```

### 3. Função Principal
```sql
-- Executa renovação completa
SELECT * FROM executar_renovacao_diaria();

-- Retorna:
-- - Status da execução
-- - Lojas processadas
-- - Pontuações calculadas
-- - Detalhes do processo
```

## 🚀 Como Funciona

### Fluxo Automático (20:00 diárias)

1. **Verificação**: Sistema verifica se é após 20h e ainda não foi processado
2. **Cálculo de Ontem**: Calcula performance de todas as lojas do dia anterior
3. **Atualização de Ligas**: Recalcula liga baseado na performance do mês
4. **Atualização de Streaks**: Mantém ou reseta sequência de dias ativos
5. **Limpeza**: Marca dados como processados (mantém histórico)
6. **Preparação**: Sistema pronto para novo dia

### Dados Calculados

#### Performance Diária (salva na `pontuacao_diaria`)
```sql
-- Para cada loja, do dia anterior:
- pontos_conquistados (soma das missões concluídas)
- pontos_possiveis (total de pontos disponíveis)
- missoes_completadas vs missoes_totais
- percentual_eficiencia (pontos/possíveis * 100)
- liga_no_dia (Bronze/Prata/Ouro/Diamante)
```

#### Atualização de Gamificação
```sql
-- Na tabela lojas_gamificacao:
- streak_dias (mantém ou reseta baseado na atividade)
- maior_streak (histórico do maior streak)
- liga_atual (recalculada baseada na média do mês)
- ultima_atividade (timestamp da renovação)
```

## 📱 Interface de Monitoramento

### Componente React
```tsx
import RenovacaoDiariaMonitor from '@/components/gamification/RenovacaoDiariaMonitor'

// Mostra:
// - Status da última renovação
// - Próxima renovação (data/hora/tempo restante)
// - Botão para execução manual
// - Histórico de execuções
```

### APIs Disponíveis
```typescript
// Consultar status
GET /api/renovacao-diaria?action=status
GET /api/renovacao-diaria?action=proxima
GET /api/renovacao-diaria?action=historico

// Executar manualmente
POST /api/renovacao-diaria { action: 'executar' }
```

## ⚙️ Automação com Cron

### Vercel Cron (Recomendado)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/renovacao-diaria",
      "schedule": "0 23 * * *"  // 23:00 UTC = 20:00 Brasília
    }
  ]
}
```

### Webhook Externo
```bash
# Chamar diariamente às 20:00 (Brasília)
curl -H "Authorization: Bearer SEU_TOKEN_SECRETO" \
     https://seu-app.vercel.app/api/cron/renovacao-diaria
```

### GitHub Actions (Alternativa)
```yaml
# .github/workflows/renovacao-diaria.yml
name: Renovação Diária
on:
  schedule:
    - cron: '0 23 * * *'  # 23:00 UTC = 20:00 Brasília
  
jobs:
  renovacao:
    runs-on: ubuntu-latest
    steps:
      - name: Executar Renovação
        run: |
          curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
               ${{ secrets.APP_URL }}/api/cron/renovacao-diaria
```

## 🔍 Monitoramento e Logs

### Verificar Status
```sql
-- Última renovação
SELECT * FROM status_ultima_renovacao();

-- Próxima renovação  
SELECT * FROM proxima_renovacao();

-- Histórico completo
SELECT * FROM renovacao_diaria ORDER BY data_renovacao DESC;
```

### Dashboard de Controle
- ✅ Status em tempo real
- ✅ Tempo restante para próxima renovação
- ✅ Estatísticas de execução
- ✅ Histórico de 30 dias
- ✅ Execução manual de emergência

## 🛠️ Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_key
CRON_SECRET=token_secreto_para_cron
```

## 🎯 Benefícios do Sistema

### Para os Colaboradores
- **Transparência**: Sabem exatamente quando o sistema "zera"
- **Motivação**: Corrida contra o tempo até às 20h
- **Justiça**: Sistema automático, sem favoritismo
- **Continuidade**: Histórico preservado para análises

### Para a Gestão
- **Automação**: Zero intervenção manual necessária
- **Confiabilidade**: Sistema robusto com logs completos
- **Flexibilidade**: Execução manual disponível se necessário
- **Insights**: Dados históricos para análise de performance

## 🚨 Cenários de Contingência

### Se a Renovação Falhar
1. **Log de Erro**: Sistema registra erro na tabela
2. **Notificação**: API retorna detalhes do problema
3. **Execução Manual**: Botão no dashboard para retry
4. **Backup**: Função pode ser executada diretamente no SQL

### Se o Cron Falhar
1. **Verificação Manual**: Dashboard mostra status
2. **API Direta**: Chamar endpoint manualmente
3. **SQL Direto**: Executar função no Supabase
4. **Múltiplos Crons**: Configurar redundância

## ✅ Sistema Pronto!

**Tudo implementado e funcionando:**
- ✅ Timezone brasileiro configurado
- ✅ Renovação automática às 20:00
- ✅ Interface de monitoramento
- ✅ APIs para controle
- ✅ Cron jobs configurados
- ✅ Sistema de backup manual
- ✅ Logs completos

**O sistema agora é 100% brasileiro e automático!** 🇧🇷⏰🎮