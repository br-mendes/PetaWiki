
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Optimize build for production
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          // Improved chunk splitting strategy
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('react')) return 'react-vendor';
              if (id.includes('lucide')) return 'icons';
              return 'vendor';
            }
            
            // Split large app components
            if (id.includes('App')) return 'app';
            if (id.includes('components')) return 'components';
          }
        }
      },
      // Improve build performance
      treeshake: mode === 'production',
      target: 'es2020'
    },
    server: {
      port: 3000,
      // Improve HMR performance
      hmr: {
        overlay: false
      }
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js']
    }
  };
});
