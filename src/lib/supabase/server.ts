// src/lib/supabase/server.ts
// Cliente Supabase para uso em rotas/ambiente de servidor (Node)
// Usa variáveis de ambiente de servidor para evitar depender de NEXT_PUBLIC_*.
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function hasServerSupabaseEnv() {
	return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getServerSupabase(): SupabaseClient {
	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl) {
		throw new Error('SUPABASE_URL is required (server)')
	}
	if (!supabaseServiceRoleKey) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is required (server)')
	}

	return createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	})
}