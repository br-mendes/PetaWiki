
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
          // Avoid manual chunk cycles; let Rollup split app code naturally.
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
          }
        }
      }
    },
    server: {
      port: 3000,
    }
  };
});
