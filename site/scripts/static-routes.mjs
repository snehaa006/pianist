// After `vite build`: give every client route its own index.html so the site works on any
// static host (no rewrite rules needed), and add a 404.html for unknown paths.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const routes = ['watch', 'repertoire', 'about', 'contact'];

for (const route of routes) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(dist, route, 'index.html'));
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`static routes: /${routes.join(', /')}, 404.html`);
