
# 🎮 Blueprint: Sistema de Gamificação

Sistema de engajamento para lojas e vendedores, visando aumentar produtividade e qualidade via mecânicas de jogos.

## 🎯 Objetivos
- Motivar equipes a cumprirem prazos e metas.
- Criar competição saudável entre lojas (Ligas).
- Recompensar comportamentos positivos (Streaks, Pontualidade).
- Visualizar progresso individual e coletivo.

## 🔄 Mecânicas Principais

### 1. Sistema de Ligas
- **Níveis:** Bronze 🥉, Prata 🥈, Ouro 🥇, Diamante 💎.
- **Promoção/Rebaixamento:** Mensal, baseado em pontuação percentual.
- **Configuração:** `LIGAS_CONFIG` em `database.ts`.

### 2. Pontuação (Score)
- **Venda (R$):** 1 ponto a cada R$ X.
- **SLA Cumprido:** Bônus por entrega no prazo.
- **Streak:** Multiplicador por dias consecutivos de vendas/atualizações.
- **Missões:** Pontos extras por objetivos específicos ("Vender 3 Multifocais hoje").

### 3. Badges (Conquistas)
- Ícones visuais exibidos no perfil da loja/vendedor.
- Ex: "Primeira Missão", "Streak 30 Dias", "Líder de Equipe".

## 🧩 Componentes Chave
- `src/components/gamification/LeagueCard.tsx`: Exibe liga atual e progresso.
- `src/components/gamification/BadgeList.tsx`: Grade de conquistas.
- `src/components/gamification/DailyMission.tsx`: Tarefas do dia.

## 📦 Banco de Dados
- `public.lojas_gamificacao`: Estado atual da loja (Pontos, Liga).
- `public.pontuacao_diaria`: Histórico granular (Log de pontos).
- `public.desafios`: Metas temporais.
- `public.badges`: Definição de conquistas disponíveis.

## ✅ Status Atual
- ✅ Tabelas e Types definidos.
- ✅ Lógica de Ligas configurada.
- 🚧 Interface Visual (Dashboards de Ranking) em desenvolvimento inicial.
- 🚧 Triggers de Pontuação automática (venda -> ponto) precisam revisão.
