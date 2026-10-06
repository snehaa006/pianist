import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preload the self-hosted Bebas Neue (hashed by Vite) so the wordmark doesn't flash a fallback face.
const preloadFont = () => ({
  name: 'preload-bebas',
  transformIndexHtml(html, ctx) {
    if (!ctx.bundle) return html;
    const font = Object.keys(ctx.bundle).find(f => /BebasNeue-Regular.*\.woff2$/.test(f));
    if (!font) return html;
    return html.replace(
      '</title>',
      `</title>\n    <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin>`
    );
  }
});

export default defineConfig({
  plugins: [react(), preloadFont()],
  build: {
    // keep the font a real file (it is preloaded), never inlined
    assetsInlineLimit: 0
  }
});
