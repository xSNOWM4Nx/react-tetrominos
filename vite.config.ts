import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub repo name
const repoName = 'react-tetrominos';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`
})
