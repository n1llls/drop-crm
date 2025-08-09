import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ IMPORTANT: set 'base' to your repo name when deploying to GitHub Pages, e.g. '/dropshipping-crm/'
export default defineConfig({
  plugins: [react()],
  base: '/REPLACE_WITH_REPO_NAME/'
})
