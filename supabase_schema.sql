
-- ... (Mantenha o conteúdo anterior das tabelas e functions) ...

-- 10. SEGURANÇA E PERMISSÕES (CRÍTICO PARA PERSISTÊNCIA)
-- Como o app usa autenticação própria (tabela users) e não o Supabase Auth,
-- precisamos permitir acesso público (anon key) para leitura/escrita nas tabelas.

-- Habilitar RLS (para garantir que políticas sejam aplicadas)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Access Users" ON public.users;
DROP POLICY IF EXISTS "Public Access Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Access Documents" ON public.documents;
DROP POLICY IF EXISTS "Public Access Reactions" ON public.document_reactions;
DROP POLICY IF EXISTS "Public Access Analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Public Access Settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public Access EmailLogs" ON public.email_logs;

-- Criar políticas permissivas (CRUD total para a chave anon)
CREATE POLICY "Public Access Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Access Categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Public Access Documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Public Access Reactions" ON public.document_reactions FOR ALL USING (true);
CREATE POLICY "Public Access Analytics" ON public.analytics_events FOR ALL USING (true);
CREATE POLICY "Public Access Settings" ON public.system_settings FOR ALL USING (true);
CREATE POLICY "Public Access EmailLogs" ON public.email_logs FOR ALL USING (true);

-- Grant explícito para garantir
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
