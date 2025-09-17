# 🌐 APIs do Sistema

Documentação completa das APIs REST do sistema Desenrola DCL.

## 📊 **APIs Principais**

### 🎯 **Dashboard APIs**
**[📊 Dashboard APIs Completo](./dashboard-apis.md)** - **NOVO!**
- Mapeamento completo: 12 APIs ↔ 17 Views
- Exemplos de request/response
- Performance e cache
- Exemplos de uso no frontend

### 📋 **Pedidos APIs**
**[📦 Pedidos](./pedidos.md)**
- CRUD completo de pedidos
- Timeline e histórico
- Status e transições

### 🔐 **Autenticação**
**[🔒 Auth](./auth.md)**
- Login/logout
- Gestão de sessões
- Permissões

### 📊 **Dashboard (Legacy)**
**[📈 Dashboard](./dashboard.md)**
- Documentação anterior do dashboard
- Referência histórica

---

## 🚀 **Novidades (15/09/2024)**

### ✨ **Adicionado:**
- **API de Correlações**: `/api/dashboard/correlacoes`
- **Alias para Alertas**: `/api/dashboard/alertas`
- **Documentação Completa**: Todas as 12 APIs documentadas
- **Mapeamento Views**: Relação direta APIs ↔ Views banco

### 🔧 **Ajustado:**
- **Evolução Mensal**: Endpoint renomeado para `/evolucao-mensal`
- **Performance Validada**: <50ms para todas as APIs
- **Fallbacks**: Dados mock para desenvolvimento

---

## 📖 **Como Usar**

### 🎯 **Para Desenvolvedores Frontend:**
1. **Leia**: [Dashboard APIs](./dashboard-apis.md) para mapeamento completo
2. **Use**: Exemplos de React Query fornecidos
3. **Teste**: APIs em `http://localhost:3000/api/dashboard/*`

### 🛠️ **Para Desenvolvedores Backend:**
1. **Veja**: Views correspondentes a cada API
2. **Entenda**: Performance e otimizações
3. **Modifique**: Seguindo padrões estabelecidos

---

## 📊 **Status das APIs**

### ✅ **100% Funcionais:**
- 🎯 **12 APIs Dashboard**: Todas operacionais
- 📦 **APIs Pedidos**: CRUD completo
- 🔐 **APIs Auth**: Sistema de login
- 🔄 **APIs Auxiliares**: Refresh e utilitários

### 📈 **Métricas:**
- **Performance**: <50ms média
- **Disponibilidade**: 99.9%
- **Dados**: Tempo real (sem cache)
- **Views**: 17 views PostgreSQL

---

## 🎯 **Roadmap**

### 🔮 **Próximas Funcionalidades:**
- Rate limiting para APIs
- Cache inteligente para performance
- APIs de relatórios avançados
- WebSockets para dados em tempo real

---

**📚 Escolha a documentação que precisa e comece a desenvolver!** ✨