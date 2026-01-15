// ========================================
// 2. MIDDLEWARE ATUALIZADO
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mapeamento de rotas e roles permitidos
const ROUTE_PERMISSIONS = {
  '/dashboard': ['gestor', 'financeiro', 'demo_viewer'],
  '/kanban': ['gestor', 'dcl', 'financeiro', 'loja', 'demo_viewer'],
  '/alertas': ['gestor', 'dcl', 'demo_viewer'],
  '/pedidos': ['gestor', 'dcl', 'financeiro', 'loja', 'demo_viewer'], 
  '/montagens': ['gestor', 'dcl', 'financeiro', 'demo_viewer'], // Módulo de controle de montagens
  '/configuracoes': ['gestor'] // Demo NÃO pode acessar configurações
}

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/pedidos', 
  '/kanban',
  '/alertas',
  '/montagens', // Módulo de controle de montagens
  '/configuracoes',
]

// Rotas públicas
const publicRoutes = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/logout', 
  '/api/health',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se a rota é protegida (inclui dashboards E APIs)
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  ) || pathname.startsWith('/api/')

  // Verificar se é rota pública específica
  const isPublicRoute = publicRoutes.includes(pathname)

  // Permitir rotas públicas
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value 

  console.log('🔐 Middleware:', { pathname, token: !!token, userRole, isProtectedRoute })

  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    // Se for API, retorna 401 JSON em vez de redirecionar
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 })
    }

    console.log('❌ Sem token, redirecionando para login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // NOVO: Verificar permissões de role por rota
  if (token && userRole && isProtectedRoute) {
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
      pathname.startsWith(route)
    )
    
    if (matchedRoute) {
      const allowedRoles = ROUTE_PERMISSIONS[matchedRoute as keyof typeof ROUTE_PERMISSIONS]
      
      if (!allowedRoles.includes(userRole)) {
        console.log(`❌ Role ${userRole} não permitido para ${matchedRoute}`)
        // Redirecionar para página de acesso negado ou página permitida
        const redirectPage = getDefaultPageForRole(userRole)
        return NextResponse.redirect(new URL(redirectPage, request.url))
      }
    }
  }

  // Se tem token e está tentando acessar login, redirecionar baseado no role
  if (token && userRole && pathname === '/login') {
    console.log('✅ Com token, redirecionando baseado no role')
    const defaultPage = getDefaultPageForRole(userRole)
    return NextResponse.redirect(new URL(defaultPage, request.url))
  }

  return NextResponse.next()
}

// Helper para obter página padrão por role
function getDefaultPageForRole(role: string): string {
  switch (role) {
    case 'gestor':
      return '/dashboard'
    case 'financeiro': 
      return '/dashboard'
    case 'dcl':
      return '/kanban'
    case 'loja':
      return '/kanban' // Página padrão para lojas é kanban
    case 'demo_viewer':
      return '/kanban' // Demo vai para kanban (somente visualização)
    default:
      return '/kanban'
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}