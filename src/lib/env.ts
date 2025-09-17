// src/lib/env.ts
// Validação centralizada das variáveis de ambiente

export function validateClientEnv() {
  const errors: string[] = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
}

export function validateServerEnv() {
  const errors: string[] = []
  
  if (!process.env.SUPABASE_URL) {
    errors.push('SUPABASE_URL is required')
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  
  if (errors.length > 0) {
    throw new Error(`Server environment validation failed:\n${errors.join('\n')}`)
  }
  
  return {
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  }
}

export function hasRequiredEnv() {
  return {
    client: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    server: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
}