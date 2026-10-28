import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One dev port for every app in this folder; fail instead of moving to another port.
  server: { port: 5173, strictPort: true },
});
