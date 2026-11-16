/**
 * BUILD-TAILWIND.MJS (globalSetup de Playwright)
 * El juego usa el "Play CDN" de Tailwind v3, que compila en el navegador.
 * Para que la suite sea hermética (sin depender de cdn.tailwindcss.com) compilamos
 * una vez el CSS con la MISMA configuración que vive inline en index.html.
 * Si la configuración cambia en index.html, este paso la recoge automáticamente.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const CACHE_DIR = resolve(ROOT, 'qa/.cache');
export const TAILWIND_CSS = resolve(CACHE_DIR, 'tailwind.css');

function extractInlineConfig(indexHtml) {
    const match = indexHtml.match(/<script>\s*(tailwind\.config\s*=[\s\S]*?)<\/script>/);
    if (!match) throw new Error('No se encontró `tailwind.config = {...}` inline en index.html');
    const sandbox = { tailwind: {} };
    vm.runInNewContext(match[1], sandbox);
    return sandbox.tailwind.config || {};
}

export default async function globalSetup() {
    if (process.env.QA_CDN === 'live') return; // Modo red real: el Play CDN compila en el navegador.

    const indexPath = resolve(ROOT, 'index.html');
    // Cache simple: recompilar sólo si index.html o src cambiaron después del último build.
    if (existsSync(TAILWIND_CSS) && !process.env.QA_REBUILD_CSS) {
        const builtAt = statSync(TAILWIND_CSS).mtimeMs;
        const newest = Math.max(statSync(indexPath).mtimeMs, newestMtime(resolve(ROOT, 'src')));
        if (builtAt > newest) return;
    }

    const config = extractInlineConfig(readFileSync(indexPath, 'utf8'));
    mkdirSync(CACHE_DIR, { recursive: true });
    const configPath = resolve(CACHE_DIR, 'tailwind.config.cjs');
    writeFileSync(configPath, `module.exports = ${JSON.stringify({
        ...config,
        content: [resolve(ROOT, 'index.html'), resolve(ROOT, 'src/**/*.{js,mjs,json}')],
    }, null, 2)};\n`);
    const inputPath = resolve(CACHE_DIR, 'input.css');
    writeFileSync(inputPath, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');

    execFileSync(process.execPath, [
        resolve(ROOT, 'node_modules/tailwindcss/lib/cli.js'),
        '-c', configPath, '-i', inputPath, '-o', TAILWIND_CSS,
    ], { stdio: 'pipe' });
}

function newestMtime(dir) {
    let newest = 0;
    for (const entry of execFileSync('find', [dir, '-type', 'f'], { encoding: 'utf8' }).split('\n').filter(Boolean)) {
        newest = Math.max(newest, statSync(entry).mtimeMs);
    }
    return newest;
}
