
# ⚙️ Blueprint: Administração e Configurações

Módulo de controle para superusuários (Admins) gerenciarem a infraestrutura do sistema.

## 🎯 Objetivos
- Gerenciar cadastro de Lojas Físicas.
- Gerenciar cadastro de Laboratórios e seus SLAs.
- Controlar Usuários e Permissões.
- Monitorar saúde do sistema (Logs, Erros).

## 🔄 Funcionalidades

### 1. Gestão de Lojas
- **Rota:** `/configuracoes/lojas`
- **Dados:** Nome, Endereço, Metas, Configurações de SLA específico.
- **Ação:** CRUD completo.

### 2. Gestão de Laboratórios
- **Rota:** `/configuracoes/laboratorios`
- **Dados:** Nome, Códigos de integração, Dias úteis, Tabela de Preços (futuro).
- **Importante:** Sincronização com `core.fornecedores` do catálogo de lentes.

### 3. Gestão de Usuários
- **Rota:** `/configuracoes/usuarios`
- **Dados:** Email, Role, Loja Vinculada.
- **Segurança:** Apenas Admins podem alterar roles.

### 4. Classes e Tratamentos
- **Rota:** `/configuracoes/produtos`
- **Dados:** Definição manual de classes de lentes e tratamentos extras (backup do catálogo).

## 🧩 Componentes Chave
- Tabela Genérica de CRUD (`DataTable` do Shadcn).
- Modais de Edição (`LojaForm`, `UsuarioForm`).

## 📦 Banco de Dados
- `public.lojas`
- `public.laboratorios`
- `public.usuarios`
- `public.classes_lente`
- `public.tratamentos`

## ✅ Status Atual
- ✅ CRUDs básicos funcionais.
- ✅ Tabelas de referência populadas.
- 🚧 Interface de gestão de usuários precisa de refinamento (convite vs cadastro).
