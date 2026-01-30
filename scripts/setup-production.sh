# Configuração de Monitoramento para PetaWiki Production
# Este arquivo define as variáveis de ambiente e configurações necessárias

echo "🚀 Iniciando setup de produção PetaWiki..."

# Variáveis de ambiente necessárias
read -p "SUPABASE_URL (URL do Supabase): " DB_URL
read -p "SUPABASE_ANON_KEY (Chave anon do Supabase): " ANON_KEY
read -p "VERCEL_TOKEN (Token do Vercel): " VERCEL_TOKEN
read -p "VERCEL_ORG_ID (ID do Vercel): " VERCEL_ORG_ID
read -p "VERCEL_PROJECT_ID (ID do projeto Vercel): " VERCEL_PROJECT_ID

# Verificar se todas as variáveis foram fornecidas
if [ -z "$DB_URL" ] || [ -z "$ANON_KEY" ] || [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ Erro: Todas as variáveis acima são obrigatórias!"
    exit 1
fi

# Atualizar .env.local com as variáveis
cat > .env.local << EOF
# Production Environment Variables - AUTO-GENERATED
DO NOT COMMIT THIS FILE TO VERSION CONTROL

# Database
DATABASE_URL=$DB_URL
SUPABASE_URL=$DB_URL
SUPABASE_ANON_KEY=$ANON_KEY

# Deploy Configuration
VERCEL_TOKEN=$VERCEL_TOKEN
VERCEL_ORG_ID=$VERCEL_ORG_ID
VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID

# Application Configuration
NODE_ENV=production
VITE_AUTH_MODE=db

# Security
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ACTIVITY_LOG=true
VITE_ENABLE_CSRF_PROTECTION=true
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_SESSION_TIMEOUT_MINUTES=60

# Performance
VITE_ENABLE_CODE_SPLITTING=true
VITE_ENABLE_SERVICE_WORKER=true

# Health Monitoring
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=300000
ENABLE_PERFORMANCE_MONITORING=true

# Feature Flags
ENABLE_DRAFTS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_VIRTUAL_SCROLL=true
EOF

echo "✅ Arquivo .env.local criado com sucesso!"

# Instalar dependências se necessário
if [ ! -f "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build para produção
echo "🏗 Buildando para produção..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Falha no build. Verifique os erros acima."
    exit 1
fi

# Deploy para Vercel
echo "🚀 Fazendo deploy para Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deploy concluído com sucesso!"
    echo "📊 URL da aplicação: https://petawiki.vercel.app"
else
    echo "❌ Falha no deploy. Verifique os logs acima."
    exit 1
fi

echo "📋 Configuração de monitoramento:" 
echo "- Health checks ativos: $ENABLE_HEALTH_CHECK" 
echo "- Analytics ativado: $VITE_ENABLE_ANALYTICS"
echo "- Activity logging: $VITE_ENABLE_ACTIVITY_LOG"
echo "- CSRF Protection: $VITE_ENABLE_CSRF_PROTECTION"
echo "- Code Splitting: $VITE_ENABLE_CODE_SPLITTING"
echo "- Service Worker: $VITE_ENABLE_SERVICE_WORKER"
echo "- Drafts: $ENABLE_DRAFTS"
echo "- Advanced Search: $VITE_ENABLE_ADVANCED_SEARCH"
echo "- Virtual Scroll: $ENABLE_VIRTUAL_SCROLL"