/**
 * CHECK-BUILD.MJS
 * El sitio no tiene paso de build en el despliegue, así que lo generado va en el repo.
 * Esto comprueba que siga al día: el CSS de Tailwind compilado y el hash del importmap en la CSP.
 * `--write` (npm run build:css) los regenera.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const CSS = resolve(ROOT, 'src/ui/styles/tailwind.css');
const INDEX = resolve(ROOT, 'index.html');
let stale = false;

const tmp = mkdtempSync(join(tmpdir(), 'nk-css-'));
writeFileSync(join(tmp, 'in.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
execFileSync(process.execPath, [resolve(ROOT, 'node_modules/tailwindcss/lib/cli.js'),
    '-c', resolve(ROOT, 'tailwind.config.cjs'), '-i', join(tmp, 'in.css'), '-o', join(tmp, 'out.css'), '--minify'], { cwd: ROOT, stdio: 'pipe' });
const css = readFileSync(join(tmp, 'out.css'), 'utf8');
let current = '';
try { current = readFileSync(CSS, 'utf8'); } catch { /* aún no existe */ }
if (css !== current) {
    if (write) writeFileSync(CSS, css);
    else { stale = true; console.error('src/ui/styles/tailwind.css no está al día.'); }
}

// vendor/ es copia literal de node_modules: si sube una versión, la copia tiene que subir con ella.
const VENDOR = {
    'react.production.min.js': 'react/umd/react.production.min.js',
    'react-dom.production.min.js': 'react-dom/umd/react-dom.production.min.js',
    'motion.js': 'motion/dist/motion.js',
    'htm.module.js': 'htm/dist/htm.module.js',
    'ZzFX.js': 'zzfx/ZzFX.js',
    'three.module.min.js': 'three/build/three.module.min.js',
    'three.core.min.js': 'three/build/three.core.min.js',
};
for (const [file, from] of Object.entries(VENDOR)) {
    const src = readFileSync(resolve(ROOT, 'node_modules', from));
    let dst = null;
    try { dst = readFileSync(resolve(ROOT, 'vendor', file)); } catch { /* falta */ }
    if (dst && src.equals(dst)) continue;
    if (write) writeFileSync(resolve(ROOT, 'vendor', file), src);
    else { stale = true; console.error(`vendor/${file} no coincide con node_modules/${from}.`); }
}

let html = readFileSync(INDEX, 'utf8');
const hash = 'sha256-' + createHash('sha256').update(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).digest('base64');
if (!html.includes(`'${hash}'`)) {
    if (write) writeFileSync(INDEX, html = html.replace(/'sha256-[^']*'/, `'${hash}'`));
    else { stale = true; console.error('La CSP de index.html no lleva el hash del importmap: ' + hash); }
}
if (/<script(?![^>]*type="importmap")(?![^>]*\bsrc=)[^>]*>/.test(html) || /script-src[^;]*unsafe/.test(html)) {
    stale = true; console.error('index.html: nada de scripts en línea ni unsafe-* en script-src (la CSP los bloquea).');
}
if (/<(script|link)[^>]*(src|href)="https?:/.test(html)) { stale = true; console.error('index.html: las dependencias van en vendor/, no en un CDN.'); }

if (stale) { console.error('Ejecuta `npm run build:css`.'); process.exit(1); }
console.log(write ? "CSS, vendor y CSP regenerados." : "CSS de Tailwind, vendor y CSP al día.");
