# 🔐 APIs de Autenticação

Documentação completa das APIs de autenticação do sistema Desenrola DCL.

## Endpoints Disponíveis

### 1. Login com BCrypt

**POST** `/api/auth/login`

Realiza autenticação usando email e senha com hash BCrypt.

#### Request Body
```json
{
  "email": "junior@oticastatymello.com.br",
  "senha": "senha_real_do_usuario"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "junior@oticastatymello.com.br",
    "nome": "Junior - Admin",
    "perfil": "admin",
    "ativo": true,
    "ultimo_acesso": "2025-09-15T10:30:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Response Error (400)
```json
{
  "error": "Email e senha são obrigatórios"
}
```

#### Response Error (401)
```json
{
  "error": "Credenciais inválidas"
}
```

#### Response Error (403)
```json
{
  "error": "Usuário inativo"
}
```

---

### 2. Login BCrypt (Endpoint Alternativo)

**POST** `/api/auth/login-bcrypt`

Endpoint específico para login com validação BCrypt (funcionalidade similar ao `/login`).

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "dcl@oticastatymello.com.br",
  "senha": "senha123"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "email": "dcl@oticastatymello.com.br",
    "nome": "DCL Laboratório",
    "perfil": "laboratorio"
  }
}
```

---

### 3. Validar Token

**GET** `/api/auth/validate`

Valida se o token de autenticação está válido.

#### Headers
```
Authorization: Bearer jwt_token_here
```

#### Response Success (200)
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nome": "Nome do Usuário",
    "perfil": "admin"
  }
}
```

#### Response Error (401)
```json
{
  "valid": false,
  "error": "Token inválido"
}
```

---

### 4. Logout

**POST** `/api/auth/logout`

Realiza logout do usuário, invalidando o token.

#### Headers
```
Authorization: Bearer jwt_token_here
```

#### Response Success (200)
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### 5. Verificar Usuários

**GET** `/api/auth/check-users`

Endpoint para debug - lista usuários cadastrados (apenas para desenvolvimento).

#### Response Success (200)
```json
{
  "usuarios": [
    {
      "id": "uuid",
      "email": "junior@oticastatymello.com.br",
      "nome": "Junior - Admin",
      "perfil": "admin",
      "ativo": true,
      "criado_em": "2025-09-01T10:00:00Z",
      "ultimo_acesso": "2025-09-15T10:30:00Z"
    }
  ],
  "total": 4
}
```

## 🔒 Perfis de Usuário

O sistema suporta os seguintes perfis:

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| `admin` | Administrador | Acesso total ao sistema |
| `laboratorio` | Laboratório | Gestão de pedidos do lab |
| `loja` | Operador de Loja | Criação e consulta de pedidos |
| `financeiro` | Financeiro | Relatórios e dashboards |

## 🛡️ Segurança

### Hash de Senhas
- Utiliza **BCrypt** com salt rounds 6
- Senhas são hasheadas antes de salvar no banco
- Comparação segura durante login

### Tokens JWT
- Tokens com expiração configurável
- Validação em todas as rotas protegidas
- Refresh automático quando necessário

### Usuários Ativos

| Email | Nome | Perfil |
|-------|------|--------|
| `junior@oticastatymello.com.br` | Junior - Admin | admin |
| `dcl@oticastatymello.com.br` | DCL Laboratório | laboratorio |
| `financeiroesc@hotmail.com` | Financeiro ESC | financeiro |
| `lojas@oticastatymello.com.br` | Operadores Lojas | loja |

## 📝 Exemplos de Uso

### Login com cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "junior@oticastatymello.com.br",
    "senha": "senha_real"
  }'
```

### Validar Token
```bash
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer seu_jwt_token"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer seu_jwt_token"
```

## ⚠️ Notas Importantes

1. **Senhas Reais**: O sistema utiliza senhas reais hashadas com BCrypt
2. **Ambiente**: Em desenvolvimento, use `http://localhost:3000`
3. **Headers**: Sempre inclua `Content-Type: application/json` para POST
4. **Tokens**: Guarde o token JWT para requisições autenticadas
5. **Debugging**: Use `/api/auth/check-users` apenas em desenvolvimento