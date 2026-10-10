// The container's pre-installed Chromium headless shell (no download).
import { existsSync } from 'node:fs';
const shell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
export const BROWSER = process.env.REMOTION_BROWSER || (existsSync(shell) ? shell : null);
export const CHROMIUM = { gl: 'swangle' };
