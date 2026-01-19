import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'primereact/button',
      'primereact/inputnumber',
      'primereact/overlaypanel',
      'primereact/datatable',
      'primereact/column',
    ],
  },
})
