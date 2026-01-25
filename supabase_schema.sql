
-- ... (Mantenha as tabelas 1 a 7 e o bloco DO $$ ... END $$ de migração inalterados. Substitua da seção "8. Funções RPC e Helpers" para baixo) ...

-- 8. Funções RPC e Helpers

-- HELPER: Encontrar o nome da Categoria Raiz de uma categoria específica
-- Usado para agrupar estatísticas por "Departamento" (Categoria Raiz)
CREATE OR REPLACE FUNCTION get_category_root_name(start_cat_id text)
RETURNS text AS $$
DECLARE
    current_parent_id text;
    current_name text;
    next_parent_id text;
BEGIN
    -- Pegar dados iniciais
    SELECT name, parent_id INTO current_name, current_parent_id 
    FROM categories WHERE id = start_cat_id;
    
    -- Se não achou categoria (ex: documento sem categoria), retorna padrão
    IF current_name IS NULL THEN
        RETURN 'Geral';
    END IF;

    -- Subir na árvore até parent_id ser NULL
    WHILE current_parent_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_name, next_parent_id 
        FROM categories WHERE id = current_parent_id;
        
        current_parent_id := next_parent_id;
    END LOOP;
    
    RETURN current_name;
END;
$$ LANGUAGE plpgsql;

-- Busca de Documentos (Full Text Search)
CREATE OR REPLACE FUNCTION search_documents(query_text text)
RETURNS SETOF documents AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM documents
  WHERE 
    deleted_at IS NULL AND (
      to_tsvector('portuguese', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('portuguese', query_text)
      OR title ILIKE '%' || query_text || '%'
      OR content ILIKE '%' || query_text || '%'
      OR array_to_string(tags, ',') ILIKE '%' || query_text || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- === CORREÇÕES DE ANALYTICS ===

-- RPC: Registrar Visualização
DROP FUNCTION IF EXISTS register_view(text, text);
CREATE OR REPLACE FUNCTION register_view(p_doc_id text, p_user_id text)
RETURNS integer
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Incrementa contador no documento
  UPDATE documents 
  SET views = views + 1 
  WHERE id = p_doc_id
  RETURNING views INTO new_count;

  -- Registra evento
  INSERT INTO analytics_events (event_type, document_id, user_id)
  VALUES ('VIEW', p_doc_id, p_user_id);

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- RPC: Registrar Busca
DROP FUNCTION IF EXISTS log_search_event(text, text);
CREATE OR REPLACE FUNCTION log_search_event(p_query text, p_user_id text)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  IF length(trim(p_query)) > 0 THEN
    INSERT INTO analytics_events (event_type, user_id, metadata)
    VALUES ('SEARCH', p_user_id, jsonb_build_object('query', trim(p_query)));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC ANALYTICS: Estatísticas Diárias (Últimos 30 dias)
DROP FUNCTION IF EXISTS get_daily_analytics();
CREATE OR REPLACE FUNCTION get_daily_analytics()
RETURNS TABLE (
  date text,
  views bigint,
  unique_users bigint
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(date_trunc('day', series), 'DD Mon') as date,
    COALESCE(count(ae.id), 0) as views,
    COALESCE(count(DISTINCT ae.user_id), 0) as unique_users
  FROM generate_series(now() - interval '29 days', now(), '1 day') as series
  LEFT JOIN analytics_events ae 
    ON date_trunc('day', ae.created_at) = date_trunc('day', series) 
    AND ae.event_type = 'VIEW'
  GROUP BY series
  ORDER BY series ASC;
END;
$$ LANGUAGE plpgsql;

-- RPC ANALYTICS: Estatísticas por Departamento (Baseado em Categoria Raiz)
DROP FUNCTION IF EXISTS get_department_analytics();
CREATE OR REPLACE FUNCTION get_department_analytics()
RETURNS TABLE (
  name text,
  doc_count bigint,
  view_count bigint,
  published_count bigint,
  draft_count bigint
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH doc_roots AS (
      SELECT 
          d.id,
          d.views,
          d.status,
          get_category_root_name(d.category_id) as root_name
      FROM documents d
      WHERE d.deleted_at IS NULL
  )
  SELECT 
    dr.root_name as name,
    count(dr.id) as doc_count,
    COALESCE(sum(dr.views), 0) as view_count,
    count(CASE WHEN dr.status = 'PUBLISHED' THEN 1 END) as published_count,
    count(CASE WHEN dr.status = 'DRAFT' OR dr.status = 'PENDING_REVIEW' THEN 1 END) as draft_count
  FROM doc_roots dr
  GROUP BY dr.root_name
  ORDER BY view_count DESC;
END;
$$ LANGUAGE plpgsql;

-- RPC ANALYTICS: Top Buscas (Correção JSONB)
DROP FUNCTION IF EXISTS get_top_searches();
CREATE OR REPLACE FUNCTION get_top_searches()
RETURNS TABLE (
  query text,
  count bigint
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (metadata->>'query')::text as query,
    count(*) as count
  FROM analytics_events
  WHERE event_type = 'SEARCH' 
  AND metadata->>'query' IS NOT NULL
  AND length(metadata->>'query') > 2 -- Ignorar buscas muito curtas
  GROUP BY (metadata->>'query')::text
  ORDER BY count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Seed Inicial (Admin Persistente)
INSERT INTO public.users (id, username, email, password, name, role, department, avatar)
VALUES (
  'u_admin_seed', 
  'admin', 
  'admin@petawiki.com', 
  'admin', 
  'Admin', 
  'ADMIN', 
  'Gestão', 
  'https://ui-avatars.com/api/?name=Admin&background=111827&color=fff'
)
ON CONFLICT (email) DO NOTHING;
