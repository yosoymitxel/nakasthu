/**
 * En móvil 100vh = alto con la barra del navegador OCULTA; si un contenedor usa vh sin dvh,
 * sobra una franja bajo las pestañas y la página scrollea (bug visto en Brave/Chrome Android).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(js|css)$/.test(f) && files.push(p); } })('src/ui');
files.push('index.html');

describe('Unidades de alto de pantalla', () => {
    it('todo uso de vh / *-screen tiene su equivalente dvh al lado', () => {
        const bad = [];
        for (const f of files) {
            readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
                const usesVh = /\b(min-h-screen|max-h-screen|h-screen)\b|height:\s*100vh/.test(line);
                if (!usesVh) return;
                const next = readFileSync(f, 'utf8').split('\n').slice(i + 1, i + 3).join(' ');
                if (!/100dvh/.test(line) && !/100dvh/.test(next)) bad.push(`${f}:${i + 1}`);
            });
        }
        expect(bad).toEqual([]);
    });
});
