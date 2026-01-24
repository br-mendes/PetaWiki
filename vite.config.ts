import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (incluindo as do sistema/Vercel)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Define process.env.API_KEY globalmente para o código do cliente
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Previne erro 'process is not defined' no navegador
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 3000,
    }
  };
});