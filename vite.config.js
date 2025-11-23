import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para evitar problemas de CORS en desarrollo
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Reescribir la ruta para que /api vaya directamente al backend
        rewrite: (path) => path,
        // Configurar para preservar headers y body correctamente
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Asegurar que Content-Type se preserve correctamente
            if (req.headers['content-type']) {
              proxyReq.setHeader('Content-Type', req.headers['content-type']);
            }
            // No modificar el body - enviarlo tal cual
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
        },
      },
    },
  },
})
