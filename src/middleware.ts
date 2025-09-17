import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/pedidos',
  '/kanban',
  '/configuracoes',
]

// Rotas públicas (não requerem autenticação)
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
  
  console.log('🔐 Middleware:', { pathname, token: !!token, isProtectedRoute })
  
  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    console.log('❌ Sem token, redirecionando para login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Se tem token e está tentando acessar login, redirecionar para dashboard
  if (token && pathname === '/login') {
    console.log('✅ Com token, redirecionando para dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplicar middleware em todas as rotas exceto:
    // - APIs (tratadas separadamente dentro do middleware)
    // - arquivos estáticos
    // - arquivos do Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}