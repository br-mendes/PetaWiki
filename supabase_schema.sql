
-- ... (Tabela users mantida) ...

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id text REFERENCES public.categories(id),
  department_id text,
  sort_order integer DEFAULT 0, -- RENOMEADO de "order" para sort_order
  doc_count integer DEFAULT 0,
  description text,
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ... (Restante das tabelas e functions mantidas, apenas verifique se não há referências a "order" nas functions antigas, mas as fornecidas anteriormente não usavam essa coluna explicitamente em lógica SQL complexa) ...

-- Nova tabela de Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'FAVORITE', 'APPROVE', 'REJECT', 'RENAME', 'MOVE')),
  target_type text NOT NULL CHECK (target_type IN ('document', 'category', 'user', 'system')),
  target_id uuid NOT NULL,
  target_title text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON public.activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_id ON public.activity_logs(target_id);

-- Registrar atividade no sistema
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_target_title TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  activity_id := gen_random_uuid();
  
  INSERT INTO activity_logs (
    id,
    user_id,
    user_name,
    user_email,
    action,
    target_type,
    target_id,
    target_title,
    old_values,
    new_values,
    metadata,
    created_at
  ) VALUES (
    activity_id,
    p_user_id,
    p_user_name,
    p_user_email,
    p_action,
    p_target_type,
    p_target_id,
    p_target_title,
    p_old_values,
    p_new_values,
    p_metadata,
    NOW()
  );
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Buscar logs de atividade com filtros
CREATE OR REPLACE FUNCTION get_activity_logs(
  p_user_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  action TEXT,
  target_type TEXT,
  target_id UUID,
  target_title TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  where_clause TEXT := '';
BEGIN
  IF p_user_id IS NOT NULL THEN
    where_clause := where_clause || ' AND user_id = ''' || p_user_id || '''';
  END IF;
  
  IF p_action IS NOT NULL THEN
    where_clause := where_clause || ' AND action = ''' || p_action || '''';
  END IF;
  
  IF p_target_type IS NOT NULL THEN
    where_clause := where_clause || ' AND target_type = ''' || p_target_type || '''';
  END IF;
  
  IF p_date_from IS NOT NULL THEN
    where_clause := where_clause || ' AND created_at >= ''' || p_date_from || '''';
  END IF;
  
  IF p_date_to IS NOT NULL THEN
    where_clause := where_clause || ' AND created_at <= ''' || p_date_to || '''';
  END IF;
  
  IF p_search_query IS NOT NULL AND p_search_query != '' THEN
    where_clause := where_clause || ' AND (target_title ILIKE '' || p_search_query || '' OR metadata::text ILIKE '' || p_search_query || '')';
  END IF;
  
  RETURN QUERY
    SELECT 
      id,
      user_id,
      user_name,
      user_email,
      action,
      target_type,
      target_id,
      target_title,
      old_values,
      new_values,
      metadata,
      created_at
    FROM activity_logs 
    WHERE 1=1 ' || where_clause || '
    ORDER BY created_at DESC
    LIMIT ' || p_limit || ' 
    OFFSET ' || p_offset;
END;
$$ LANGUAGE plpgsql;

-- Obter estatísticas de atividade
CREATE OR REPLACE FUNCTION get_activity_stats(
  p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  stat_type TEXT,
  stat_value BIGINT,
  stat_label TEXT
) AS $$
BEGIN
  RETURN QUERY
    -- Total de ações
    SELECT 
      'total_actions' AS stat_type,
      COUNT(*)::BIGINT AS stat_value,
      'Total de Ações' AS stat_label
    FROM activity_logs 
    WHERE (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to);
  
  UNION ALL
  
  -- Ações por tipo
  SELECT 
      'actions_by_type' AS stat_type,
      COUNT(*)::BIGINT AS stat_value,
      action AS stat_label
    FROM activity_logs 
    WHERE (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to)
    GROUP BY action;
  
  UNION ALL
  
  -- Ações por dia (últimos 7 dias)
  SELECT 
      'actions_by_day' AS stat_type,
      COUNT(*)::BIGINT AS stat_value,
      DATE(created_at) AS stat_label
    FROM activity_logs 
    WHERE created_at >= NOW() - INTERVAL '7 days'
      AND (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to)
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) DESC;
    
  UNION ALL
    
  -- Top usuários
  SELECT 
      'actions_by_user' AS stat_type,
      COUNT(*)::BIGINT AS stat_value,
      user_name AS stat_label
    FROM activity_logs 
    WHERE (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to)
    GROUP BY user_id, user_name
    ORDER BY COUNT(*) DESC
    LIMIT 10;
    
  UNION ALL
    
  -- Top documentos
  SELECT 
      'top_documents' AS stat_type,
      COUNT(*)::BIGINT AS stat_value,
      target_title AS stat_label
    FROM activity_logs 
    WHERE target_type = 'document'
      AND (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to)
    GROUP BY target_id, target_title
    ORDER BY COUNT(*) DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
