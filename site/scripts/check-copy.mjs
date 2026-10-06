// Copy self-check (references/copy-rules.md §F–G): scans every source file for banned vocabulary,
// banned button labels and exclamation marks in user-facing strings.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const banned = [
  'passionate', 'passion', 'journey', 'embark', 'elevate', 'unleash', 'unlock', 'delve', 'dive into', 'immerse',
  'immersive', 'tapestry', 'symphony of', 'harmony of', 'resonate', 'evoke', 'captivat', 'mesmeri', 'breathtaking',
  'soulful', 'enchanting', 'magical', 'stunning', 'vibrant', 'dynamic', 'world-class', 'renowned', 'virtuoso',
  'seamless', 'curated', 'timeless', 'transcend', 'testament to', 'realm', 'landscape', 'beacon', 'navigate',
  'boasts', 'showcas', 'nestled', "in today's world", 'more than just', 'look no further', "it's no secret",
  'a true', 'truly', 'deeply', 'incredibly', 'a celebration of', 'brings to life', 'takes you on', 'welcome to'
];
const bannedButtons = ['learn more', 'click here', 'read more', 'discover', 'explore', 'submit', 'get started',
  'check it out', 'find out more'];

const files = [];
const walk = dir => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f !== 'fx') walk(p); // fx/ = client components, copied verbatim; they hold no site copy
    } else if (/\.(jsx?|html)$/.test(f)) files.push(p);
  }
};
walk(new URL('../src', import.meta.url).pathname);
files.push(new URL('../index.html', import.meta.url).pathname);

// Only look at text a visitor can read: JSX text, string literals and attributes. Skip comments.
const visible = src =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(l => !/^\s*\/\//.test(l))
    .map(l => l.replace(/\s\/\/.*$/, '').replace(/hint: '.*',?$/, ''))
    .join('\n');

let failures = 0;
for (const file of files) {
  const src = visible(readFileSync(file, 'utf8'));
  // JSX text nodes (what renders) and quoted strings (data, alt text, labels, meta)
  const textNodes = [...src.matchAll(/(?<!=)>([^<>{}]*[a-z][^<>{}]*)</gi)].map(m => m[1]);
  const strings = [...src.matchAll(/(['"`])((?:(?!\1).){4,}?)\1/g)].map(m => m[2]).filter(t => / /.test(t));
  const copy = [...textNodes, ...strings].join('\n').toLowerCase();
  const nodes = textNodes.join('\n').toLowerCase();
  const hit = (hay, word) => new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay);
  for (const word of banned) if (hit(copy, word)) { failures += 1; console.log(`✗ ${file.split('/site/').pop()}: "${word}"`); }
  for (const label of bannedButtons) if (hit(nodes, label)) { failures += 1; console.log(`✗ ${file.split('/site/').pop()}: button "${label}"`); }
  if (/!/.test(nodes)) { failures += 1; console.log(`✗ ${file.split('/site/').pop()}: exclamation mark in copy`); }
}
console.log(failures ? `${failures} copy problem(s)` : `copy check passed: ${files.length} files, 0 banned words`);
process.exit(failures ? 1 : 0);
