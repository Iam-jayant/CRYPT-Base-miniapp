import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['wagmi/actions'],
    include: ['wagmi', '@rainbow-me/rainbowkit', 'viem'],
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
