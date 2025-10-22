import { NextResponse } from 'next/server'

// Redirecionamento para alertas-criticos
export async function GET(request: Request) {
  const url = new URL(request.url)
  const newUrl = url.pathname.replace('/alertas', '/alertas-criticos') + url.search
  
  // Fazer redirecionamento interno
  return fetch(new URL(newUrl, url.origin))
    .then(res => res.json())
    .then(data => NextResponse.json(data))
    .catch(() => NextResponse.json({ error: 'Erro ao carregar alertas' }, { status: 500 }))
}