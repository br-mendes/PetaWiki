-- ========================================
-- SCRIPT DE CORREÇÃO DO BANCO DE DADOS
-- ========================================
-- Execute em ambiente de desenvolvimento/teste primeiro!

-- ========================================
-- 1. CORREÇÃO DE TIPOS E CONEXÕES
-- ========================================

-- Adicionar conexão users <-> profiles (muitos para um)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_email_fkey 
FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE;

-- Corrigir users.department para UUID (se houver dados existentes)
-- ATENÇÃO: Isso pode quebrar referências existentes!
DO $$
BEGIN
    -- Verificar se há dados para migrar
    IF EXISTS (SELECT 1 FROM users WHERE department IS NOT NULL) THEN
        RAISE NOTICE '⚠️  Há dados em users.department que precisam de migração manual';
    END IF;
END $$;

-- Adicionar coluna UUID para department em users
ALTER TABLE users 
ADD COLUMN department_id uuid;

-- Criar constraint FK
ALTER TABLE users 
ADD CONSTRAINT users_department_id_fkey 
FOREIGN KEY (department_id) REFERENCES departments(id);

-- Corrigir document_templates.department_id para UUID
ALTER TABLE document_templates
ADD COLUMN department_id_uuid uuid;

-- Migrar dados se existirem
UPDATE document_templates 
SET department_id_uuid = (id::uuid)::uuid 
FROM departments 
WHERE departments.slug = document_templates.department_id AND document_templates.department_id IS NOT NULL;

-- Adicionar constraint
ALTER TABLE document_templates
ADD CONSTRAINT document_templates_department_id_fkey 
FOREIGN KEY (department_id_uuid) REFERENCES departments(id);

-- ========================================
-- 2. MELHORIAS NAS CONEXÕES DE DOCUMENTOS
-- ========================================

-- Conectar documents com document_categories
ALTER TABLE documents
ADD COLUMN document_category_id uuid;

ALTER TABLE documents
ADD CONSTRAINT documents_document_category_id_fkey 
FOREIGN KEY (document_category_id) REFERENCES document_categories(id);

-- Conectar document_versions com profiles
ALTER TABLE document_versions
ADD COLUMN saved_by_uuid uuid;

ALTER TABLE document_versions
ADD CONSTRAINT document_versions_saved_by_fkey 
FOREIGN KEY (saved_by_uuid) REFERENCES profiles(id);

-- ========================================
-- 3. ÍNDICES DE PERFORMANCE
-- ========================================

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON documents USING GIN(search_vector);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para document_favorites
CREATE INDEX IF NOT EXISTS idx_document_favorites_user_id ON document_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_document_favorites_document_id ON document_favorites(document_id);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_to_user_id ON notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índices para document_comments
CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_created_by ON document_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_document_comments_status ON document_comments(status);

-- Índices para document_exports
CREATE INDEX IF NOT EXISTS idx_document_exports_document_id ON document_exports(document_id);
CREATE INDEX IF NOT EXISTS idx_document_exports_requested_by ON document_exports(requested_by);
CREATE INDEX IF NOT EXISTS idx_document_exports_status ON document_exports(status);

-- Índices para analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_document_id ON analytics_events(document_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ========================================
-- 4. TRIGGERS PARA CONSISTÊNCIA
-- ========================================

-- Trigger para atualizar document_count em categories
CREATE OR REPLACE FUNCTION update_category_doc_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE categories 
        SET doc_count = (
            SELECT COUNT(*)::integer 
            FROM documents 
            WHERE documents.category_id = categories.id 
            AND documents.deleted_at IS NULL
        )
        WHERE categories.id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET doc_count = (
            SELECT COUNT(*)::integer 
            FROM documents 
            WHERE documents.category_id = OLD.category_id 
            AND documents.deleted_at IS NULL
        )
        WHERE categories.id = OLD.category_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_update_category_doc_count ON documents;
CREATE TRIGGER trigger_update_category_doc_count
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_category_doc_count();

-- ========================================
-- 5. VIEWS ÚTEIS
-- ========================================

-- View para documentos com informações completas
CREATE OR REPLACE VIEW document_details AS
SELECT 
    d.id,
    d.title,
    d.content,
    d.status,
    d.views,
    d.tags,
    d.created_at,
    d.updated_at,
    u.name as author_name,
    u.email as author_email,
    c.name as category_name,
    c.slug as category_slug
FROM documents d
LEFT JOIN users u ON d.author_id = u.id
LEFT JOIN categories c ON d.category_id = c.id
WHERE d.deleted_at IS NULL;

-- View para notificações não lidas
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
    n.id,
    n.title,
    n.body,
    n.type,
    n.created_at,
    u.name as user_name,
    d.title as document_title
FROM notifications n
LEFT JOIN users u ON n.to_user_id = u.id
LEFT JOIN documents d ON n.document_id = d.id
WHERE n.is_read = false;

-- ========================================
-- 6. MIGRAÇÃO DE DADOS (OPCIONAL)
-- ========================================

-- Comente as seções abaixo se não precisar migrar dados existentes

-- Migrar usuários para profiles se não existirem
-- INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
-- SELECT 
--     gen_random_uuid() as id,
--     u.name as full_name,
--     u.email,
--     u.role::user_role as role,
--     u.created_at,
--     NOW() as updated_at
-- FROM users u
-- WHERE NOT EXISTS (
--     SELECT 1 FROM profiles p WHERE p.email = u.email
-- );

-- ========================================
-- 7. VALIDAÇÕES FINAIS
-- ========================================

-- Verificar constraints
DO $$
DECLARE
    constraint_count integer;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE '✅ Total de Foreign Keys: %', constraint_count;
END $$;

-- Verificar índices
DO $$
DECLARE
    index_count integer;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ Total de Índices: %', index_count;
END $$;

RAISE NOTICE '🎉 Script de correção executado com sucesso!';
RAISE NOTICE '📝 Revise as migrações de dados antes de executar em produção';