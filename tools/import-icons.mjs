/**
 * IMPORT-ICONS.MJS
 * Copia la fuente pixelarticons (MIT) desde node_modules a assets/ y genera src/ui/iconMap.js.
 * Uso: node tools/import-icons.mjs   (tras actualizar la versión de pixelarticons)
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = resolve(ROOT, 'node_modules/pixelarticons');
const OUT = resolve(ROOT, 'assets/fonts/pixelarticons');
mkdirSync(OUT, { recursive: true });
copyFileSync(resolve(PKG, 'fonts/pixelart-icons-font.woff2'), resolve(OUT, 'pixelart-icons-font.woff2'));
copyFileSync(resolve(PKG, 'LICENSE'), resolve(OUT, 'LICENSE'));

const css = readFileSync(resolve(PKG, 'fonts/pixelart-icons-font.css'), 'utf8');
const map = Object.fromEntries([...css.matchAll(/\.pixelart-icons-font-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([0-9a-f]+)"/g)].map((m) => [m[1], parseInt(m[2], 16)]));
const version = JSON.parse(readFileSync(resolve(PKG, 'package.json'), 'utf8')).version;
writeFileSync(resolve(ROOT, 'src/ui/iconMap.js'),
`// Generado por tools/import-icons.mjs desde pixelarticons@${version} (MIT): no editar a mano.
export const ICON_CODES = ${JSON.stringify(map)};
`);
console.log(`✅ import-icons: ${Object.keys(map).length} iconos (pixelarticons@${version})`);
