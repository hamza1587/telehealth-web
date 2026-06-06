import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const aliases = {
  '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
  '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
  '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { alias: aliases },
  build: {
    rollupOptions: {
      output: {
        // 6.2 — Vendor chunks: isolate heavy third-party libs so app code changes
        // don't bust the vendor cache and vice-versa.
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/lab'],
          'vendor-charts': ['recharts'],
          'vendor-livekit': ['livekit-client'],
        },
      },
    },
    // Warn when any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    alias: aliases,
  },
})
