# 🚀 Guia de Deploy

Documentação completa para deploy do sistema Desenrola DCL em produção.

## 🌐 Deploy na Vercel (Recomendado)

A Vercel é a plataforma oficial do Next.js e oferece integração perfeita.

### 1. Preparação do Repositório

#### Verificar Build Local
```bash
# Testar build antes do deploy
npm run build
npm start

# Verificar se não há erros
npm run lint
npm run type-check
```

#### Configurar .env.production
```bash
# Criar arquivo para produção
cp .env.local .env.production

# Configurar variáveis de produção
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 2. Deploy via Vercel CLI

#### Instalação
```bash
npm i -g vercel
vercel login
```

#### Deploy
```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### 3. Deploy via GitHub Integration

#### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Import seu repositório GitHub
4. Configure o projeto:

```yaml
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

#### 2. Configurar Variáveis de Ambiente
No dashboard da Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### 3. Deploy Automático
- **Main branch**: Deploy em produção
- **Feature branches**: Deploy preview automático
- **Pull Requests**: Deploy preview para testes

---

## 🗄️ Configuração do Supabase

### 1. Projeto em Produção

#### Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. **New Project**
3. Configure:
   - **Name**: desenrola-dcl-prod
   - **Database Password**: senha segura
   - **Region**: South America (São Paulo)

#### Configurar URL e Keys
```bash
# Obter do dashboard Supabase
Project URL: https://your-id.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Executar Migrations

#### Via Supabase CLI
```bash
# Instalar CLI
npm i -g supabase

# Login
supabase login

# Conectar ao projeto
supabase link --project-ref your-project-id

# Aplicar migrations
supabase db push
```

#### Via SQL Editor
1. Acesse **SQL Editor** no dashboard
2. Execute os arquivos de migration em ordem:

```sql
-- 019_create_pedidos_timeline_table.sql
-- 020_create_lead_time_comparativo_view.sql
-- 021_create_timeline_completo_view.sql
-- etc...
```

### 3. Configurar RLS e Policies

#### Verificar Row Level Security
```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Habilitar se necessário
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

#### Configurar Policies
```sql
-- Política para pedidos
CREATE POLICY "Usuários autenticados podem ver pedidos" 
ON pedidos FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política para usuários
CREATE POLICY "Admins gerenciam usuários" 
ON usuarios FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND perfil = 'admin'
  )
);
```

---

## 🔧 Configurações Avançadas

### Next.js Config para Produção

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de produção
  compress: true,
  poweredByHeader: false,
  
  // Otimizações de imagem
  images: {
    domains: ['your-domain.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
```

### Otimizações de Performance

#### Bundle Analysis
```bash
# Instalar analisador
npm install --save-dev @next/bundle-analyzer

# Configurar next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfig)

# Executar análise
ANALYZE=true npm run build
```

#### Code Splitting
```typescript
// Lazy loading de componentes pesados
import dynamic from 'next/dynamic'

const DashboardChart = dynamic(
  () => import('../components/DashboardChart'),
  {
    loading: () => <p>Carregando gráfico...</p>,
    ssr: false
  }
)
```

---

## 📊 Monitoramento

### Vercel Analytics

#### Configuração
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking

#### Sentry (Opcional)
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

### Performance Monitoring

#### Web Vitals
```typescript
// app/layout.tsx
import { reportWebVitals } from 'next/web-vitals'

export function reportWebVitals(metric) {
  console.log(metric)
  // Enviar para analytics
}
```

---

## 🔒 Segurança

### Variáveis de Ambiente

#### Validação
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
})

export const env = envSchema.parse(process.env)
```

### Headers de Segurança
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

---

## 🌐 Domínio Personalizado

### Configurar Domínio na Vercel

#### 1. Adicionar Domínio
1. Acesse projeto na Vercel
2. **Settings** → **Domains**
3. Adicione: `desenrola.oticastatymello.com.br`

#### 2. Configurar DNS
```
Type: CNAME
Name: desenrola
Value: cname.vercel-dns.com
```

#### 3. Certificado SSL
- Vercel configura automaticamente
- Let's Encrypt SSL gratuito
- Renovação automática

---

## 📈 CI/CD Pipeline

### GitHub Actions

#### Deploy Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Quality Gates
```yaml
      - name: Run tests
        run: npm test
      
      - name: Check bundle size
        run: npm run size-limit
      
      - name: Security audit
        run: npm audit --audit-level moderate
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### Build Failures
```bash
# Erro de memória
Error: JavaScript heap out of memory

# Solução: aumentar heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Supabase Connection
```bash
# Testar conexão
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/usuarios
```

#### Vercel Deployment
```bash
# Ver logs de deploy
vercel logs your-deployment-url

# Redeploy forçado
vercel --force
```

### Debug em Produção

#### Logging
```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Enviar para serviço de log
      console.error(`[PROD ERROR] ${message}`, error)
    } else {
      console.error(message, error)
    }
  }
}
```

---

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] ✅ Build local funcionando
- [ ] ✅ Testes passando
- [ ] ✅ Lint sem erros
- [ ] ✅ TypeScript sem erros
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Database migrations aplicadas

### Deploy
- [ ] ✅ Projeto criado na Vercel
- [ ] ✅ Repositório conectado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Deploy bem-sucedido
- [ ] ✅ URL de produção acessível

### Pós-Deploy
- [ ] ✅ Testar login
- [ ] ✅ Testar criação de pedido
- [ ] ✅ Testar dashboard
- [ ] ✅ Verificar performance
- [ ] ✅ Configurar monitoramento

---

## 🎯 URLs de Produção

### Aplicação
- **Produção**: https://desenrola-dcl.vercel.app
- **Staging**: https://desenrola-dcl-staging.vercel.app

### Serviços
- **Supabase**: https://app.supabase.com/project/your-id
- **Vercel**: https://vercel.com/your-team/desenrola-dcl
- **GitHub**: https://github.com/mellooticas/desenrola_dcl

## 📞 Suporte de Deploy

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs/deployment