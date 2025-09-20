# PROBLEMA IDENTIFICADO - DASHBOARD KPIs
Data: 2025-09-18
Investigação: APIs Dashboard vs Terminal

## 🚨 PROBLEMA CONFIRMADO

### Sintomas
- **Dashboard Web**: Mostra 2 pedidos, R$ 601
- **Terminal/Script**: Encontra 3 pedidos, R$ 2.001  
- **API Browser**: GET /api/dashboard/kpis retorna 2 pedidos
- **API Terminal**: Mesmo Supabase client retorna 3 pedidos

### Dados Reais Confirmados
```
3 pedidos existem na tabela:
1. c99b4b8b-c9f5-46c6-9ccd-46cbea6eeb60 - R$ 350 - AG_PAGAMENTO
2. 6adfa937-e72b-4fbf-a172-05886d3d8b75 - R$ 1.400 - AG_PAGAMENTO  
3. f0cfb380-5039-45b3-a25c-624a77d9b19b - R$ 251 - AG_PAGAMENTO
Total: R$ 2.001
```

### APIs Testadas
- **API /api/dashboard/**: ✅ Funciona (retorna 3 pedidos)
- **API /api/dashboard/kpis**: ❌ Falha (retorna 2 pedidos via HTTP)

## 🔍 POSSÍVEIS CAUSAS

### 1. Row Level Security (RLS) 
- Terminal usa SERVICE_ROLE_KEY (bypassa RLS)
- Browser usa ANON_KEY (sujeito a RLS)
- **HIPÓTESE PRINCIPAL**: RLS está filtrando 1 pedido

### 2. Context de Autenticação
- Terminal: Sem cookies/sessão
- Browser: Com cookies/headers de auth
- Pode estar aplicando filtros por usuário/loja

### 3. Cache/Estado
- API pode ter cache diferente entre contexts
- Estado React pode estar desatualizado

### 4. Política Supabase
- Possível política que filtra por created_at
- Possível política que filtra por loja_id
- Possível política por user role

## 🎯 PRÓXIMAS AÇÕES

### IMEDIATA: Verificar RLS
1. Verificar políticas na tabela `pedidos`
2. Testar API com SERVICE_ROLE_KEY
3. Verificar se há filtros por loja_id implícitos

### CORREÇÃO: Forçar dados corretos
1. Temporariamente forçar cálculo manual na API
2. Verificar autenticação do usuário na sessão
3. Ajustar políticas RLS se necessário

### VALIDAÇÃO: Confirmar fix
1. Reload dashboard no browser
2. Verificar se mostra 3 pedidos
3. Confirmar valor R$ 2.001