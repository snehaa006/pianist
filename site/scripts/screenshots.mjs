// Renders every page at 1440px (desktop, effects on) and 390px (phone, touch: effects off),
// checks for horizontal overflow (also at 360px) and console errors.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/screenshots.mjs [outDir]
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = process.argv[2] || 'screenshots';
const PAGES = ['/', '/watch', '/repertoire', '/about', '/contact', '/not-a-page'];
const BUNDLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const devices = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  narrow: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true }
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(existsSync(BUNDLED) ? { executablePath: BUNDLED } : {});
const problems = [];

const scrollThrough = async page => {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 250));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1200));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000);
};

for (const [name, opts] of Object.entries(devices)) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  page.on('console', m => m.type() === 'error' && problems.push(`[${name}] console: ${m.text()}`));
  page.on('pageerror', e => problems.push(`[${name}] pageerror: ${e.message}`));

  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // The hero name rises over Largo (1.4 s) plus the arpeggio stagger. Headless Chromium renders WebGL in
    // software, so the cursor's shader warm-up delays the start; give the desktop pass more time.
    await page.waitForTimeout(name === 'desktop' ? 6000 : 3000);
    const slug = path === '/' ? 'home' : path.slice(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problems.push(`[${name}] ${path}: horizontal overflow ${overflow}px`);
    if (name === 'narrow') continue;
    await page.screenshot({ path: `${OUT}/${name}-${slug}-first.png` });
    await scrollThrough(page);
    await page.screenshot({ path: `${OUT}/${name}-${slug}-full.png`, fullPage: true });
  }

  if (name !== 'narrow') {
    // Lightbox from the hero button
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Watch the performance' }).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-lightbox.png` });
    const playing = await page.evaluate(() => {
      const v = document.querySelector('.lightbox video');
      return v ? { paused: v.paused, src: v.currentSrc, ready: v.readyState } : null;
    });
    console.log(`[${name}] lightbox video:`, JSON.stringify(playing));
    await page.keyboard.press('Escape');
    // Mobile menu
    if (name === 'mobile') {
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}/${name}-menu.png` });
    }
  }
  await context.close();
}

await browser.close();
console.log(problems.length ? problems.join('\n') : 'no overflow, no console errors');
