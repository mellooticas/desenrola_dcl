# 🚀 Guia de Deploy - Variáveis de Ambiente

## 📋 Problema Identificado

O erro "supabaseUrl is required" indica que as variáveis de ambiente do Supabase não estão sendo encontradas durante o build/deploy.

## 🔧 Solução

### 1. Variáveis Necessárias

Tanto Vercel quanto Netlify precisam destas variáveis:

```bash
# Frontend (Cliente)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (Servidor)  
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Autenticação
NEXTAUTH_SECRET=uma-chave-secreta-muito-forte-aqui
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

### 2. Configurar no Vercel

1. **Via Dashboard**:
   - Vá para seu projeto → Settings → Environment Variables
   - Adicione cada variável acima
   - Marque: Production, Preview, Development

2. **Via CLI**:
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel --env NEXT_PUBLIC_SUPABASE_URL=seu-valor
   ```

### 3. Configurar no Netlify  

1. **Via Dashboard**:
   - Vá para Site settings → Environment variables
   - Adicione cada variável listada acima

2. **Via CLI**:
   ```bash
   # Instalar Netlify CLI
   npm i -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod
   ```

## 🔍 Como Obter as Credenciais do Supabase

1. **Acesse** [app.supabase.com](https://app.supabase.com)
2. **Selecione** seu projeto
3. **Vá para** Settings → API
4. **Copie**:
   - Project URL = `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_URL`
   - anon public = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role = `SUPABASE_SERVICE_ROLE_KEY`

## 📊 Status Atual dos Arquivos

✅ `.env.example` - Criado com todas as variáveis  
✅ `vercel.json` - Configurado para Vercel  
✅ `netlify.toml` - Configurado para Netlify

## 🚨 Próximos Passos

1. **Configure as variáveis** no dashboard da plataforma escolhida
2. **Teste o deploy** novamente
3. **Verifique os logs** se ainda houver erros

## 📞 Debug

Para verificar se as variáveis estão funcionando:

```bash
# Endpoint de debug (remover em produção)
GET /api/env/status
```

Retorna quais variáveis estão presente/ausente sem expor os valores.