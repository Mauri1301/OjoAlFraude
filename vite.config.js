import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  envDir: '..', // .env.local está en la raíz del proyecto, no en src/
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true   // abre el navegador automáticamente con npm run dev
  }
})
