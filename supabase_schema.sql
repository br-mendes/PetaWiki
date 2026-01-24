
-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  username text,
  email text UNIQUE NOT NULL,
  password text NOT NULL, -- Em produção, use hash/auth provider real
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
  deleted_at timestamp with time zone, -- Suporte a Soft Delete (Lixeira)
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

-- 6. Tabela de Configurações Globais (NOVO)
-- Armazena um único registro com ID 1 contendo o JSON de configurações
CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 7. Função de Busca de Documentos (RPC)
-- Permite busca por título, conteúdo ou tags
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
      -- Busca simples em array de tags (converte array para string)
      OR array_to_string(tags, ',') ILIKE '%' || query_text || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Seed Inicial (Admin Persistente)
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
