// ========================================
// 2. MIDDLEWARE ATUALIZADO
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mapeamento de rotas e roles permitidos
const ROUTE_PERMISSIONS = {
  '/dashboard': ['gestor', 'financeiro', 'demo_viewer'],
  '/kanban': ['gestor', 'dcl', 'financeiro', 'loja', 'demo_viewer'],
  '/pedidos': ['gestor', 'dcl', 'financeiro', 'loja', 'demo_viewer'], 
  '/mission-control': ['gestor', 'loja', 'demo_viewer'], // Página de missões - acesso para gestores e lojas
  '/configuracoes': ['gestor'] // Demo NÃO pode acessar configurações
}

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/pedidos', 
  '/kanban',
  '/mission-control',
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

  // Verificar se a rota é protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Verificar se é API route
  const isApiRoute = pathname.startsWith('/api/')
  
  // Verificar se é rota pública específica
  const isPublicRoute = publicRoutes.includes(pathname)

  // Permitir todas as APIs e rotas públicas
  if (isApiRoute || isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value // ← NOVO: cookie com role

  console.log('🔐 Middleware:', { pathname, token: !!token, userRole, isProtectedRoute })

  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
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
      return '/mission-control' // Página padrão para lojas agora é mission-control
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