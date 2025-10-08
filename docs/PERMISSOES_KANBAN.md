# 🎯 Sistema de Permissões do Kanban

## 📋 Colunas do Kanban (em ordem do fluxo)

```
┌──────────────┬──────────────┬──────┬──────────┬────────┬─────────┬─────────┐
│  REGISTRADO  │ AG_PAGAMENTO │ PAGO │ PRODUCAO │ PRONTO │ ENVIADO │ CHEGOU  │
└──────────────┴──────────────┴──────┴──────────┴────────┴─────────┴─────────┘
```

**Nota:** As colunas `ENTREGUE` e `CANCELADO` não aparecem no Kanban (são status finais gerenciados via ações nos cards).

---

## 👥 Perfis de Usuário

### 1️⃣ **ADMIN** (admin@dcl.com.br)
- **Descrição**: Administrador do sistema - Acesso total
- **Colunas Visíveis**: TODAS (7 colunas)
- **Pode Criar Pedidos**: ✅ SIM
- **Pode Ver Financeiro**: ✅ SIM

#### Movimentações Permitidas:

| De → Para | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU | ENTREGUE |
|-----------|------------|--------------|------|----------|--------|---------|--------|----------|
| **REGISTRADO** | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AG_PAGAMENTO** | ✅ | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PAGO** | ❌ | ✅ | - | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PRODUCAO** | ❌ | ❌ | ✅ | - | ✅ | ❌ | ❌ | ❌ |
| **PRONTO** | ❌ | ❌ | ❌ | ✅ | - | ✅ | ❌ | ❌ |
| **ENVIADO** | ❌ | ❌ | ❌ | ❌ | ✅ | - | ✅ | ❌ |
| **CHEGOU** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | - | ✅ |

**Pode Cancelar**: ✅ De qualquer status

---

### 2️⃣ **GESTOR** (gestor@dcl.com.br, junior@oticastatymello.com.br)
- **Descrição**: Gestor/Supervisor - Acesso completo para gestão
- **Colunas Visíveis**: TODAS (7 colunas)
- **Pode Criar Pedidos**: ✅ SIM
- **Pode Ver Financeiro**: ✅ SIM

#### Movimentações Permitidas:

| De → Para | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU | ENTREGUE |
|-----------|------------|--------------|------|----------|--------|---------|--------|----------|
| **REGISTRADO** | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AG_PAGAMENTO** | ❌ | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PAGO** | ❌ | ❌ | - | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PRODUCAO** | ❌ | ❌ | ❌ | - | ✅ | ❌ | ❌ | ❌ |
| **PRONTO** | ❌ | ❌ | ❌ | ❌ | - | ✅ | ❌ | ❌ |
| **ENVIADO** | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ | ❌ |
| **CHEGOU** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ |

**Pode Cancelar**: ✅ De qualquer status

---

### 3️⃣ **DCL** (dcl@oticastatymello.com.br)
- **Descrição**: Equipe DCL Laboratório - Gerencia produção e logística
- **Colunas Visíveis**: TODAS (7 colunas)
- **Pode Criar Pedidos**: ✅ SIM
- **Pode Ver Financeiro**: ❌ NÃO

#### Movimentações Permitidas:

| De → Para | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU | ENTREGUE |
|-----------|------------|--------------|------|----------|--------|---------|--------|----------|
| **REGISTRADO** | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AG_PAGAMENTO** | ❌ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PAGO** | ❌ | ❌ | - | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PRODUCAO** | ❌ | ❌ | ❌ | - | ✅ | ❌ | ❌ | ❌ |
| **PRONTO** | ❌ | ❌ | ❌ | ❌ | - | ✅ | ❌ | ❌ |
| **ENVIADO** | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ | ❌ |
| **CHEGOU** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ |

**Responsabilidades:**
- ✅ Registra novos pedidos
- ✅ Move para Aguardando Pagamento
- 👁️ **Apenas visualiza** AG_PAGAMENTO (não pode mover - responsabilidade do Financeiro)
- ✅ Inicia produção (PAGO → PRODUCAO)
- ✅ Finaliza produção (PRODUCAO → PRONTO)
- ✅ Envia para loja (PRONTO → ENVIADO)
- ✅ Confirma chegada na loja (ENVIADO → CHEGOU)
- 👁️ **Apenas visualiza** CHEGOU (não pode entregar - responsabilidade da Loja)

**Pode Cancelar**: ✅ Nos status que controla

---

### 4️⃣ **FINANCEIRO** (financeiroesc@hotmail.com)
- **Descrição**: Equipe financeira - Gerencia pagamentos
- **Colunas Visíveis**: 3 colunas (REGISTRADO, AG_PAGAMENTO, PAGO)
- **Pode Criar Pedidos**: ❌ NÃO
- **Pode Ver Financeiro**: ✅ SIM

#### Movimentações Permitidas:

| De → Para | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU | ENTREGUE |
|-----------|------------|--------------|------|----------|--------|---------|--------|----------|
| **REGISTRADO** | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AG_PAGAMENTO** | ❌ | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PAGO** | ❌ | ✅ | - | ❌ | ❌ | ❌ | ❌ | ❌ |

**Responsabilidades:**
- 👁️ **Apenas visualiza** REGISTRADO (para acompanhar novos pedidos)
- ✅ Confirma pagamento recebido (AG_PAGAMENTO → PAGO)
- ✅ Pode reverter pagamento se necessário (PAGO → AG_PAGAMENTO)

**Pode Cancelar**: ✅ Pode cancelar por questões financeiras

---

### 5️⃣ **LOJA** (lojas@oticastatymello.com.br)
- **Descrição**: Operadores das lojas - Recebe e entrega ao cliente
- **Colunas Visíveis**: 2 colunas (ENVIADO, CHEGOU)
- **Pode Criar Pedidos**: ❌ NÃO
- **Pode Ver Financeiro**: ❌ NÃO

#### Movimentações Permitidas:

| De → Para | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU | ENTREGUE |
|-----------|------------|--------------|------|----------|--------|---------|--------|----------|
| **ENVIADO** | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ |
| **CHEGOU** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ |

**Responsabilidades:**
- 👁️ **Apenas visualiza** ENVIADO (aguardando chegada na loja)
- ✅ Confirma entrega ao cliente (CHEGOU → ENTREGUE)

**Pode Cancelar**: ❌ NÃO

---

## 🔄 Fluxo Completo do Pedido

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO NORMAL DE UM PEDIDO                               │
└────────────────────────────────────────────────────────────────────────────────┘

1. REGISTRADO
   │ [DCL/Gestor/Admin cria pedido]
   ↓
2. AG_PAGAMENTO
   │ [Financeiro efetuar o pagamento]
   ↓
3. PAGO
   │ [DCL enviar para produção]
   ↓
4. PRODUCAO
   │ [DCL aguarda surfaçagem das lentes]
   ↓
5. PRONTO
   │ [DCL envia para os montadores]
   ↓
6. ENVIADO
   │ [DCL confere e enviar para a loja]
   ↓
7. CHEGOU
   │ [Loja entrega ao cliente]
   ↓
8. ENTREGUE ✅
```

---

## 🚨 Regras Importantes

### ⛔ Bloqueios de Segurança
- ❌ Não é possível arrastar cards para `ENTREGUE` ou `CANCELADO` (use botões de ação)
- ❌ Não é possível pular etapas (ex: REGISTRADO direto para PAGO)
- ❌ Usuário DEMO não pode mover nenhum card

### 🔐 Segregação de Responsabilidades
- **Financeiro** controla apenas: `AG_PAGAMENTO` ↔ `PAGO`
- **Loja** controla apenas: `CHEGOU` → `ENTREGUE`
- **DCL** controla: Todo o fluxo EXCETO financeiro e entrega final
- **Gestor/Admin** tem acesso total para resolver problemas

### 📊 Visualização de Dados
- **Valores Financeiros**: Apenas Gestor, Admin e Financeiro
- **Custos**: Apenas Gestor e Admin
- **Loja**: Não vê nenhum valor financeiro

---

## 📝 Status Atual das Permissões

### ✅ O QUE ESTÁ FUNCIONANDO CORRETAMENTE:
- Admin e Gestor têm acesso total
- Financeiro vê e move apenas colunas de pagamento
- Loja vê apenas final do fluxo (ENVIADO/CHEGOU)
- Proteção contra usuário DEMO

### ⚠️ O QUE PRECISA SER AJUSTADO:
Por favor, **revise este documento** e me informe:

1. **DCL está correto?**
   - Deve poder mover ENVIADO → CHEGOU?
   - Ou a loja deve confirmar quando CHEGA na loja?

2. **Loja está correto?**
   - Precisa ver mais colunas além de ENVIADO/CHEGOU?
   - Precisa criar pedidos?

3. **Financeiro está correto?**
   - Ver REGISTRADO é útil ou só confunde?
   - Pode reverter pagamento (PAGO → AG_PAGAMENTO)?

---

## 🔧 Próximos Passos

Após sua validação, vou ajustar as permissões em:
- `src/app/kanban/page.tsx` (objeto `ROLE_PERMISSIONS`)
- `src/lib/utils/permissions.ts` (se necessário)

**Me informe as mudanças necessárias usando este formato:**

```
PERFIL: DCL
- ENVIADO → CHEGOU: SIM ou NÃO
- Motivo: [explicação]

PERFIL: LOJA  
- Ver coluna REGISTRADO: SIM ou NÃO
- Criar pedidos: SIM ou NÃO
- Motivo: [explicação]
```
