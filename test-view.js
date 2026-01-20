const { createClient } = require('@supabase/supabase-js')

const url = 'https://ahcikwsoxhmqqteertkx.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY2lrd3NveGhtcXF0ZWVydGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzAwMzMsImV4cCI6MjA3NTAwNjAzM30.29PQSkRCNgmer_h7AcePf0BnOigyKJk4no8VqtmWBFk'
const supabase = createClient(url, key)

const grupo_id = '573729aa-91b7-4f74-b2dc-00e5bcd9ea34'

async function test() {
  // A view v_grupos_canonicos funciona, então vamos buscar os relacionamentos dela
  console.log('1️⃣ Buscando estrutura da v_grupos_canonicos...')
  const { data: grupos } = await supabase
    .from('v_grupos_canonicos')
    .select('*')
    .limit(1)

  console.log('✅ Campos da v_grupos_canonicos:', Object.keys(grupos[0]).join(', '))
  
  // Testar se tem uma view com lentes individuais
  console.log('\n2️⃣ Testando sis_lens.lentes...')
  const { data: lentesData, error: lentesError } = await supabase
    .schema('sis_lens')
    .from('lentes')
    .select('*')
    .eq('grupo_canonico_id', grupo_id)
    .limit(3)

  if (lentesError) {
    console.log('❌ ERRO:', lentesError.message)
    
    console.log('\n3️⃣ Listando tabelas/views disponíveis...')
    const { data: tables, error: tablesError } = await supabase
      .from('v_grupos_canonicos')
      .select('id')
      .limit(1) // Só pra confirmar que funciona
      
    console.log('View v_grupos_canonicos acessível:', !tablesError)
  } else {
    console.log('✅ SUCESSO! Retornou', lentesData.length, 'lentes')
    console.log('\nCOLUNAS:', Object.keys(lentesData[0]).join(', '))
    console.log('\nEXEMPLO:\n', JSON.stringify(lentesData[0], null, 2))
  }
}

test()
