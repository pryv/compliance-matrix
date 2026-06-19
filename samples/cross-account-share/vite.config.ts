import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import backloop from 'vite-plugin-backloop.dev';

// Served over HTTPS via backloop.dev — bare localhost breaks mixed-content /
// CORS preflight against remote HTTPS Pryv APIs.
export default defineConfig({
  plugins: [react(), tailwindcss(), backloop()]
});
