
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

-- 4. Seed Inicial (Admin Persistente)
-- Insere o admin apenas se não existir ninguém com este email
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
