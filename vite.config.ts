
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Removed 'define: { process.env: {} }' to prevent blocking access to real env vars in Node context
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Dividir o bundle em chunks menores para melhor performance
          manualChunks: {
            // Core libraries
            vendor: ['react', 'react-dom', 'lucide-react'],
            
            // UI components
            ui: ['./src/components/Button.tsx', './src/components/Modal.tsx', './src/components/Toast.tsx'],
            
            // Heavy components
            admin: ['./src/components/AdminSettings.tsx'],
            review: ['./src/components/ReviewCenter.tsx'],
            drafts: ['./src/components/DraftManager.tsx'],
            analytics: ['./src/components/AnalyticsDashboard.tsx'],
            templates: ['./src/components/TemplateSelector.tsx'],
            profile: ['./src/components/UserProfile.tsx'],
            
            // Utils
            utils: ['./src/lib/supabase.ts', './src/lib/export.ts'],
          }
        }
      }
    },
    server: {
      port: 3000,
    }
  };
});
