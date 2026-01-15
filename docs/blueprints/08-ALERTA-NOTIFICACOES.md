
# 🔔 Blueprint: Alertas & Notificações

Sistema proativo para avisar usuários e clientes sobre eventos importantes.

## 🎯 Objetivos
- Avisar equipe sobre prazos vencendo (SLA).
- Notificar cliente sobre status do óculos (WhatsApp/SMS).
- Alertas de sistema (Erros, Atualizações).

## 🔄 Tipos de Notificação

### 1. Internas (Sistema)
- **Local:** Central de Notificações (Sino no Header).
- **Gatilhos:**
    - Pedido atrasado.
    - Pedido chegou do laboratório.
    - Meta batida.

### 2. Externas (Cliente)
- **Canal:** Integração WhatsApp API (Evolution API ou similar).
- **Mensagens Automáticas:**
    - "Seu pedido foi para produção! 🏭"
    - "Seus óculos estão prontos! 😎"

## 🧩 Componentes Chave
- `NotificationBell.tsx`: UI no header.
- `NotificationList.tsx`: Histórico.
- `src/lib/services/whatsapp.ts`: Service (Mock/Futuro).

## 📦 Banco de Dados
- `public.notificacoes`: id, usuario_id, mensagem, lida, tipo.
- `public.alertas_sla`: View ou Tabela de monitoramento.

## 🚧 Status Atual
- 🚧 Componentes de UI (Badge de Notificação) existem.
- 🚧 Lógica de cálculo de atraso existe no Kanban.
- ❌ Tabela de notificações persistentes não populada ativamente.
- ❌ Integração WhatsApp não iniciada.
