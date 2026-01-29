
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
            ui: ['./components/Button.tsx', './components/Modal.tsx', './components/Toast.tsx'],
            
            // Heavy components
            admin: ['./components/AdminSettings.tsx'],
            review: ['./components/ReviewCenter.tsx'],
            drafts: ['./components/DraftManager.tsx'],
            analytics: ['./components/AnalyticsDashboard.tsx'],
            templates: ['./components/TemplateSelector.tsx'],
            profile: ['./components/UserProfile.tsx'],
            
            // Utils
            utils: ['./lib/supabase.ts', './lib/export.ts'],
          }
        }
      }
    },
    server: {
      port: 3000,
    }
  };
});
