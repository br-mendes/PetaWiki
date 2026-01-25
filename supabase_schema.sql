
-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  username text,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text,
  role text CHECK (role IN ('ADMIN', 'EDITOR', 'READER')),
  avatar text,
  department text,
  theme_preference text DEFAULT 'light',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id text REFERENCES public.categories(id),
  department_id text,
  "order" integer DEFAULT 0,
  doc_count integer DEFAULT 0,
  description text,
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Documentos
CREATE TABLE IF NOT EXISTS public.documents (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text,
  category_id text REFERENCES public.categories(id),
  status text CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED')),
  author_id text REFERENCES public.users(id),
  tags text[],
  views integer DEFAULT 0,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Reações (Feedback)
CREATE TABLE IF NOT EXISTS public.document_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id text REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('THUMBS_UP', 'THUMBS_DOWN', 'HEART')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(document_id, user_id, reaction_type)
);

-- 5. Tabela de Logs de Email (Webhooks)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, 
  email_id text,
  recipient text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  payload jsonb
);

-- 6. Tabela de Configurações Globais
CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 7. NOVA TABELA: Eventos de Analytics (Histórico)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MIGRATION: Correção de Tipos e Garantia de Colunas
DO $$
BEGIN
    -- 1. Garantir event_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'event_type') THEN
        ALTER TABLE public.analytics_events ADD COLUMN event_type text CHECK (event_type IN ('VIEW', 'SEARCH', 'EXPORT'));
    END IF;

    -- 2. Garantir document_id (e corrigir tipo se for UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'document_id') THEN
        ALTER TABLE public.analytics_events ADD COLUMN document_id text REFERENCES public.documents(id) ON DELETE SET NULL;
    ELSE
        -- Se existe e é UUID, converte para TEXT para compatibilidade com o app
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'document_id' AND data_type = 'uuid') THEN
             -- Tenta remover constraint antiga se existir para evitar conflito na conversão
             ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_document_id_fkey;
             ALTER TABLE public.analytics_events ALTER COLUMN document_id TYPE text USING document_id::text;
             -- Recria constraint correta
             ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- 3. Garantir user_id (e corrigir tipo se for UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'user_id') THEN
        ALTER TABLE public.analytics_events ADD COLUMN user_id text REFERENCES public.users(id) ON DELETE SET NULL;
    ELSE
        -- Se existe e é UUID, converte para TEXT
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'user_id' AND data_type = 'uuid') THEN
             ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey;
             ALTER TABLE public.analytics_events ALTER COLUMN user_id TYPE text USING user_id::text;
             ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- 4. Garantir metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'metadata') THEN
        ALTER TABLE public.analytics_events ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 8. Funções RPC e Helpers

-- Busca de Documentos
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

-- === CORREÇÕES DE FUNÇÕES EXISTENTES (DROP ANTES DE RECREATE) ===

-- RPC: Registrar Visualização (Atomicamente incrementa contador e salva histórico)
-- Removemos a versão antiga que retornava void, se existir
DROP FUNCTION IF EXISTS register_view(text, text);

CREATE OR REPLACE FUNCTION register_view(p_doc_id text, p_user_id text)
RETURNS integer
SECURITY DEFINER -- Executa como admin para garantir permissão de escrita
AS $$
DECLARE
  new_count integer;
BEGIN
  -- 1. Incrementa contador no documento e retorna o novo valor
  UPDATE documents 
  SET views = views + 1 
  WHERE id = p_doc_id
  RETURNING views INTO new_count;

  -- 2. Insere log histórico
  -- Verifica se as colunas existem antes de inserir (Segurança extra, mas o ALTER TABLE acima deve garantir)
  INSERT INTO analytics_events (event_type, document_id, user_id)
  VALUES ('VIEW', p_doc_id, p_user_id);

  -- 3. Retorna o valor atualizado para o frontend
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
  -- Só registra se houver texto válido
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

-- RPC ANALYTICS: Estatísticas por Departamento
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
  SELECT 
    COALESCE(u.department, 'Sem Departamento') as name,
    count(d.id) as doc_count,
    COALESCE(sum(d.views), 0) as view_count,
    count(CASE WHEN d.status = 'PUBLISHED' THEN 1 END) as published_count,
    count(CASE WHEN d.status = 'DRAFT' THEN 1 END) as draft_count
  FROM documents d
  LEFT JOIN users u ON d.author_id = u.id
  WHERE d.deleted_at IS NULL
  GROUP BY COALESCE(u.department, 'Sem Departamento')
  ORDER BY view_count DESC;
END;
$$ LANGUAGE plpgsql;

-- RPC ANALYTICS: Top Buscas
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
    lower(metadata->>'query') as query,
    count(*) as count
  FROM analytics_events
  WHERE event_type = 'SEARCH'
  GROUP BY lower(metadata->>'query')
  ORDER BY count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 9. Seed Inicial (Admin Persistente) - Mantém caso não exista
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
