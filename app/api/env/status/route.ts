export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function present(name: string) {
  return typeof process.env[name] === 'string' && process.env[name]!.length > 0
}

export async function GET() {
  const data = {
    server: {
      SUPABASE_URL: present('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: present('SUPABASE_SERVICE_ROLE_KEY'),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_URL: present('NEXT_PUBLIC_SUPABASE_URL'),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: present('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    },
    note: 'Somente presença/ausência; valores não são retornados.'
  }
  return Response.json(data)
}
