/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    // Disponibilizar variáveis de ambiente para o build
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Configurações para deploy
  experimental: {
    // Força server-side rendering para APIs
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Otimizações para produção
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
}

module.exports = nextConfig
