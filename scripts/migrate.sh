#!/bin/bash

# Migration script para PetaWiki Production Database
# Uso: ./migrate.sh [version-from] [version-to]

set -e
BACKUP_DIR="backups/$(date +%Y-%m-%d_%H-%M-%S)"
DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/petawiki"}
LOG_FILE="migration_$(date +%Y-%m-%d_%H-%M-%S).log"

# Cria backup se não existir
echo "🔄 Iniciando migração do banco de dados..."
echo "📁 Logs: $LOG_FILE"

# Função de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# Backup da estrutura atual
log "📋 Criando backup da estrutura atual..."
pg_dump "$DB_URL" --schema-only --no-owner --no-privileges > "$BACKUP_DIR/schema_$(date +%Y-%m-%d_%H-%M-%S).sql"
pg_dump "$DB_URL" --data-only --no-owner --no-privileges > "$BACKUP_DIR/data_$(date +%Y-%m-%d_%H-%M-%S).sql"

# Verificar se a migration está disponível
if [ ! -f "migrations/migrate_${2}.sql" ]; then
    log "❌ Arquivo de migration migrate_${2}.sql não encontrado!"
    exit 1
fi

# Executar migration
log "🚀 Executando migração para v2..."
if PGPASSWORD="$DATABASE_PASSWORD" psql "$DB_URL" < "migrations/migrate_${2}.sql" 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Migração concluída com sucesso!"
else
    log "❌ Falha na migração. Verifique os logs acima."
    exit 1
fi

# Atualizar versão no sistema
log "📝 Atualizando versão do sistema..."
if PGPASSWORD="$DATABASE_PASSWORD" psql "$DB_URL" -c "UPDATE system_settings SET setting_value = '2.0.0' WHERE setting_key = 'db_version';" 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Versão atualizada para 2.0.0"
else
    log "❌ Falha ao atualizar versão."
    exit 1
fi

# Verificar integridade
log "🔍 Verificando integridade dos dados..."
if PGPASSWORD="$DATABASE_PASSWORD" psql "$DB_URL" -c "
    SELECT COUNT(*) as orphaned_docs 
    FROM documents d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE c.id IS NULL;
" 2>&1 | tee -a "$LOG_FILE"; then
    ORPHANED=$(psql "$DB_URL" -tA -c "
    SELECT COUNT(*) as orphaned_docs 
    FROM documents d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE c.id IS NULL;
    " | tail -n +2 | awk '{print $3}')
    
    if [ "$ORPHANED" -gt 0 ]; then
        log "⚠️ Encontrados $ORPHANED documentos sem categoria!"
    else
        log "✅ Nenhum documento órfão encontrado."
    fi
else
    log "❌ Falha na verificação de integridade."
    exit 1
fi

# Estatísticas finais
log "📊 Estatísticas finais:"
PGPASSWORD="$DATABASE_PASSWORD" psql "$DB_URL" -c "
    SELECT 
      (SELECT COUNT(*) as total_documents FROM documents) as doc_stats,
      (SELECT COUNT(*) as total_categories FROM categories) as cat_stats,
      (SELECT COUNT(*) as total_users FROM users) as user_stats
    " 2>&1 | tee -a "$LOG_FILE"

log "📋 Backup salvo em: $BACKUP_DIR"
log "✅ Migração concluída!"

echo "🔗 Relatório completo: $LOG_FILE"
echo "📁 Backup completo: $BACKUP_DIR"