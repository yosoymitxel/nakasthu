import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getJsFiles(dir) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) return [];
    const entries = fs.readdirSync(fullPath, { withFileTypes: true, recursive: true });
    return entries
        .filter(e => e.isFile() && e.name.endsWith('.js'))
        .map(e => path.join(e.path || e.parentPath || fullPath, e.name));
}

describe('Automated Syntax & Template Literal Integrity Check', () => {
    const uiFiles = getJsFiles('src/ui');
    const coreFiles = getJsFiles('src/core');
    const systemsFiles = getJsFiles('src/systems');
    const servicesFiles = getJsFiles('src/services');

    it('todos los componentes y pantallas en src/ui deben tener sintaxis JavaScript/V8 válida', () => {
        expect(uiFiles.length).toBeGreaterThan(0);
        const syntaxErrors = [];

        for (const file of uiFiles) {
            const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
            if (result.status !== 0) {
                const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
                syntaxErrors.push({ file: relPath, error: result.stderr.trim() });
            }
        }

        if (syntaxErrors.length > 0) {
            console.error('Errores de sintaxis detectados en UI:', syntaxErrors);
        }

        expect(syntaxErrors).toEqual([]);
    });

    it('todos los módulos de motor (core, systems, services) deben tener sintaxis V8 válida', () => {
        const engineFiles = [...coreFiles, ...systemsFiles, ...servicesFiles];
        expect(engineFiles.length).toBeGreaterThan(0);
        const syntaxErrors = [];

        for (const file of engineFiles) {
            const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
            if (result.status !== 0) {
                const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
                syntaxErrors.push({ file: relPath, error: result.stderr.trim() });
            }
        }

        expect(syntaxErrors).toEqual([]);
    });

    it('Operations.js no debe contener expresiones de template sin cerrar', () => {
        const opsPath = path.join(rootDir, 'src/ui/components/Operations.js');
        const content = fs.readFileSync(opsPath, 'utf8');

        // Verificar que no haya `${` seguido de comillas sin cerrar `}` antes de comilla o backtick
        const result = spawnSync(process.execPath, ['--check', opsPath], { encoding: 'utf8' });
        expect(result.status).toBe(0);
        expect(content).not.toContain("bg-red-500/5'`}>");
        expect(content).not.toContain("bg-emerald-500/5'`}>");
        expect(content).not.toContain("bg-zinc-800/50'`}>");
    });
});
