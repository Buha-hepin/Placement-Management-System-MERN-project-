import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), react()],
    server: {
      host: true, // Expose to LAN (0.0.0.0)
      proxy: {
        '/api': env.VITE_API_BASE_URL,
      },
    },
  }
})


