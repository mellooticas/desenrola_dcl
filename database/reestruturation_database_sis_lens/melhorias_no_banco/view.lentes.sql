create view public.v_lentes as
select
  l.id,
  l.slug,
  l.sku_fornecedor,
  l.codigo_original,
  l.nome_lente,
  l.nome_canonizado,
  l.nome_comercial,
  l.fornecedor_id,
  f.nome as fornecedor_nome,
  f.razao_social as fornecedor_razao_social,
  f.cnpj as fornecedor_cnpj,
  l.marca_id,
  m.nome as marca_nome,
  m.slug as marca_slug,
  m.is_premium as marca_premium,
  l.grupo_canonico_id,
  gc.nome_grupo as grupo_nome,
  gc.slug as grupo_slug,
  l.tipo_lente,
  l.categoria,
  l.material,
  l.indice_refracao,
  l.linha_produto,
  l.diametro,
  l.espessura_central,
  l.peso_aproximado as peso,
  l.esferico_min as grau_esferico_min,
  l.esferico_max as grau_esferico_max,
  l.cilindrico_min as grau_cilindrico_min,
  l.cilindrico_max as grau_cilindrico_max,
  l.adicao_min,
  l.adicao_max,
  l.dnp_min,
  l.dnp_max,
  l.ar as tem_ar,
  l.antirrisco as tem_antirrisco,
  l.blue as tem_blue,
  l.uv400 as tem_uv,
  l.fotossensivel as tratamento_foto,
  l.polarizado as tem_polarizado,
  l.hidrofobico as tem_hidrofobico,
  l.preco_custo,
  l.preco_venda_sugerido,
  l.preco_fabricante,
  COALESCE(
    l.prazo_entrega,
    l.lead_time_dias,
    case l.tipo_lente
      when 'visao_simples'::lens_catalog.tipo_lente then COALESCE(f.prazo_visao_simples, 7)
      when 'multifocal'::lens_catalog.tipo_lente then COALESCE(f.prazo_multifocal, 10)
      when 'bifocal'::lens_catalog.tipo_lente then COALESCE(f.prazo_multifocal, 10)
      else 7
    end
  ) as prazo_dias,
  l.ativo,
  l.destaque,
  l.created_at,
  l.updated_at
from
  lens_catalog.lentes l
  left join core.fornecedores f on f.id = l.fornecedor_id
  left join lens_catalog.marcas m on m.id = l.marca_id
  left join lens_catalog.grupos_canonicos gc on gc.id = l.grupo_canonico_id
where
  l.ativo = true
order by
  l.preco_venda_sugerido,
  l.nome_lente;



  create view public.v_grupos_canonicos as
select
  gc.id,
  gc.slug,
  gc.nome_grupo,
  gc.tipo_lente,
  gc.material,
  gc.indice_refracao,
  gc.categoria_predominante,
  gc.grau_esferico_min,
  gc.grau_esferico_max,
  gc.grau_cilindrico_min,
  gc.grau_cilindrico_max,
  gc.adicao_min,
  gc.adicao_max,
  gc.descricao_ranges,
  gc.tratamento_antirreflexo as tem_antirreflexo,
  gc.tratamento_antirrisco as tem_antirrisco,
  gc.tratamento_uv as tem_uv,
  gc.tratamento_blue_light as tem_blue_light,
  gc.tratamento_fotossensiveis as tratamento_foto,
  gc.preco_minimo,
  gc.preco_medio,
  gc.preco_maximo,
  gc.total_lentes,
  gc.total_marcas,
  gc.peso,
  gc.is_premium,
  avg(l.preco_custo) as custo_medio,
  min(l.preco_custo) as custo_minimo,
  max(l.preco_custo) as custo_maximo,
  case
    when avg(l.preco_custo) > 0::numeric then round(
      (gc.preco_medio - avg(l.preco_custo)) / avg(l.preco_custo) * 100::numeric,
      2
    )
    else 0::numeric
  end as margem_percentual,
  round(gc.preco_medio - avg(l.preco_custo), 2) as lucro_unitario,
  case
    when avg(l.preco_custo) > 0::numeric then round(gc.preco_medio / avg(l.preco_custo), 2)
    else null::numeric
  end as markup,
  case
    when gc.preco_medio < 150::numeric then '< R$150'::text
    when gc.preco_medio >= 150::numeric
    and gc.preco_medio < 300::numeric then 'R$150-300'::text
    when gc.preco_medio >= 300::numeric
    and gc.preco_medio < 500::numeric then 'R$300-500'::text
    when gc.preco_medio >= 500::numeric
    and gc.preco_medio < 800::numeric then 'R$500-800'::text
    else 'R$800+'::text
  end as faixa_preco,
  case
    when gc.preco_medio < 150::numeric then 'Entrada'::text
    when gc.preco_medio >= 150::numeric
    and gc.preco_medio < 300::numeric then 'Básico'::text
    when gc.preco_medio >= 300::numeric
    and gc.preco_medio < 500::numeric then 'Intermediário'::text
    when gc.preco_medio >= 500::numeric
    and gc.preco_medio < 800::numeric then 'Premium'::text
    else 'Super Premium'::text
  end as categoria_preco,
  count(distinct l.fornecedor_id) as total_fornecedores,
  jsonb_agg(
    distinct jsonb_build_object(
      'id',
      f.id,
      'nome',
      f.nome,
      'prazo_visao_simples',
      COALESCE(f.prazo_visao_simples, 0),
      'prazo_multifocal',
      COALESCE(f.prazo_multifocal, 0)
    )
  ) filter (
    where
      f.id is not null
  ) as fornecedores_disponiveis,
  jsonb_agg(
    distinct jsonb_build_object(
      'marca_id',
      m.id,
      'marca_nome',
      m.nome,
      'marca_slug',
      m.slug,
      'is_premium',
      m.is_premium
    )
  ) filter (
    where
      m.id is not null
  ) as marcas_disponiveis,
  string_agg(
    distinct m.nome::text,
    ', '::text
    order by
      (m.nome::text)
  ) as marcas_nomes,
  round(
    avg(
      case gc.tipo_lente
        when 'visao_simples'::lens_catalog.tipo_lente then COALESCE(f.prazo_visao_simples, 7)
        when 'multifocal'::lens_catalog.tipo_lente then COALESCE(f.prazo_multifocal, 10)
        when 'bifocal'::lens_catalog.tipo_lente then COALESCE(f.prazo_multifocal, 10)
        when 'leitura'::lens_catalog.tipo_lente then COALESCE(f.prazo_visao_simples, 7)
        when 'ocupacional'::lens_catalog.tipo_lente then COALESCE(f.prazo_multifocal, 10)
        else 10
      end
    )
  )::integer as prazo_medio_dias,
  gc.ativo,
  gc.created_at,
  gc.updated_at
from
  lens_catalog.grupos_canonicos gc
  left join lens_catalog.lentes l on l.grupo_canonico_id = gc.id
  and l.ativo = true
  left join core.fornecedores f on f.id = l.fornecedor_id
  left join lens_catalog.marcas m on m.id = l.marca_id
  and m.ativo = true
where
  gc.ativo = true
group by
  gc.id,
  gc.slug,
  gc.nome_grupo,
  gc.tipo_lente,
  gc.material,
  gc.indice_refracao,
  gc.categoria_predominante,
  gc.grau_esferico_min,
  gc.grau_esferico_max,
  gc.grau_cilindrico_min,
  gc.grau_cilindrico_max,
  gc.adicao_min,
  gc.adicao_max,
  gc.descricao_ranges,
  gc.tratamento_antirreflexo,
  gc.tratamento_antirrisco,
  gc.tratamento_uv,
  gc.tratamento_blue_light,
  gc.tratamento_fotossensiveis,
  gc.preco_minimo,
  gc.preco_medio,
  gc.preco_maximo,
  gc.total_lentes,
  gc.total_marcas,
  gc.peso,
  gc.is_premium,
  gc.ativo,
  gc.created_at,
  gc.updated_at
order by
  gc.preco_medio;

  