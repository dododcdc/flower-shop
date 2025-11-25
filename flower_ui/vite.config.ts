import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    },
    allowedHosts: ['wenbin.dododcdc.com']
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material', 'framer-motion']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将MUI相关库打包为单独chunk
          'mui': ['@mui/material', '@mui/icons-material', '@mui/lab'],
          // 将路由相关打包为单独chunk
          'router': ['react-router-dom'],
          // 将工具库打包为单独chunk
          'utils': ['axios', 'zod', 'framer-motion'],
          // 将React相关打包为单独chunk
          'react': ['react', 'react-dom'],
        }
      }
    },
    // 提高chunk大小警告阈值
    chunkSizeWarningLimit: 1000
  }
});
