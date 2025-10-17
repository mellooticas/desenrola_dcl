// src/lib/supabase/server.ts
// Cliente Supabase para uso em rotas/ambiente de servidor (Node)
// Usa variáveis de ambiente de servidor para evitar depender de NEXT_PUBLIC_*.
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { validateServerEnv, hasRequiredEnv } from '../env'

export function hasServerSupabaseEnv() {
	return hasRequiredEnv().server
}

export function getServerSupabase(): SupabaseClient {
	const { supabaseUrl, supabaseServiceRoleKey } = validateServerEnv()

	return createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	})
}