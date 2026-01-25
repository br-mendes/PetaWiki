
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

-- ... (Mantenha todo o resto do arquivo igual, apenas alterando a definição da tabela categories acima) ...
