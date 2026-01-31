
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

-- Password reset / setup tokens (server-generated, single-use)
CREATE TABLE IF NOT EXISTS public.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  action text NOT NULL CHECK (action IN ('reset', 'setup')),
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_ip text,
  created_user_agent text
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON public.password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON public.password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_lookup ON public.password_resets(email, action, token_hash);

-- ... (Restante das tabelas e functions mantidas, apenas verifique se não há referências a "order" nas functions antigas, mas as fornecidas anteriormente não usavam essa coluna explicitamente em lógica SQL complexa) ...

-- Workflow de revisao (comentario do revisor)
-- NOTE: Se sua coluna `status` tiver CHECK constraint, garanta que ela permite o valor 'REJECTED'.
ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS review_note text;

-- Templates de documentos (modelos)
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'OTHER',
  description text,
  icon text,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  is_global boolean NOT NULL DEFAULT true,
  department_id text,
  usage_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_global ON public.document_templates(is_global);

CREATE OR REPLACE FUNCTION public.increment_template_usage(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.document_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_template_id;
END;
$$;

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
BEGIN
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
    WHERE 
      (p_user_id IS NULL OR user_id = p_user_id) AND
      (p_action IS NULL OR action = p_action) AND
      (p_target_type IS NULL OR target_type = p_target_type) AND
      (p_date_from IS NULL OR created_at >= p_date_from) AND
      (p_date_to IS NULL OR created_at <= p_date_to) AND
      (p_search_query IS NULL OR p_search_query = '' OR 
       (target_title ILIKE '%' || p_search_query || '%' OR metadata::text ILIKE '%' || p_search_query || '%'))
    ORDER BY created_at DESC
    LIMIT p_limit 
    OFFSET p_offset;
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

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type_created ON activity_logs(target_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category_status ON documents(category_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_author_created ON documents(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_resets_email_action_used ON password_resets(email, action, used_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_document_favorites_user_doc ON document_favorites(user_id, document_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_order ON categories(parent_id, sort_order);
