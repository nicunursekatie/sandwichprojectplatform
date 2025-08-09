import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Production configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  
  // IMPORTANT: Set base to your GitHub repository name
  base: '/Sandwich-Project-Platform/',  // Update this to match your repo name
  root: path.resolve(__dirname, 'client'),
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './client/src/assets'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot'],
        },
      },
    },
  },
  
  define: {
    // These will be replaced with GitHub Secrets in CI/CD
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://your-backend.onrender.com'),
  },
});