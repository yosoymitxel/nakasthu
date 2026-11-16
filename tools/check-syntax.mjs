import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const scanDirs = ['src', '__tests__', 'tools'];
const singleFiles = ['main.js', 'vitest.config.js'];

function getFiles(dir) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) return [];
    const entries = fs.readdirSync(fullPath, { withFileTypes: true, recursive: true });
    return entries
        .filter(e => e.isFile() && (e.name.endsWith('.js') || e.name.endsWith('.mjs')))
        .map(e => path.join(e.path || e.parentPath || fullPath, e.name));
}

let allFiles = [...singleFiles.map(f => path.join(rootDir, f))];
for (const dir of scanDirs) {
    allFiles.push(...getFiles(dir));
}

console.log(`[SYNTAX CHECKER] Verificando sintaxis V8 en ${allFiles.length} archivos JS/MJS...\n`);

let hasError = false;
let passedCount = 0;

for (const file of allFiles) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });

    if (result.status !== 0) {
        hasError = true;
        console.error(`❌ ERROR DE SINTAXIS en: ${relPath}`);
        if (result.stderr) {
            console.error(result.stderr.trim());
        }
        console.error('----------------------------------------------------');
    } else {
        passedCount++;
    }
}

if (hasError) {
    console.error(`\n[FALLO] Se detectaron errores de sintaxis en el proyecto.`);
    process.exit(1);
} else {
    console.log(`\n✅ ÉXITO: Los ${passedCount} archivos pasaron la verificación de sintaxis de V8 sin errores.`);
    process.exit(0);
}
