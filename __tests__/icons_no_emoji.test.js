/**
 * Sin emojis ni dingbats en el juego (cada SO los pinta distinto): iconos de pixelarticons.
 * Y todo nombre de icono usado debe existir en la fuente.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ICON_CODES } from '../src/ui/iconMap.js';

const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(js|json)$/.test(f) && files.push(p); } })('src');

const EMOJI = /[←-⇿⌀-⏿①-⓿■-➿⤀-⥿⬀-⯿\u{1F000}-\u{1FAFF}️]/u;

describe('Iconografía', () => {
    it('no hay emojis/dingbats fuera de comentarios', () => {
        const bad = [];
        for (const f of files) {
            readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
                const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
                if (EMOJI.test(code)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 60)}`);
            });
        }
        expect(bad).toEqual([]);
    });

    it('todos los iconos usados existen en pixelarticons', () => {
        const used = new Set();
        for (const f of files) {
            const t = readFileSync(f, 'utf8');
            for (const m of t.matchAll(/<\$\{Icon\} name="([a-z0-9-]+)"/g)) used.add(m[1]);
            for (const m of t.matchAll(/name=\$\{[^}]*\}/g)) for (const q of m[0].matchAll(/[?:]\s*'([a-z0-9-]+)'/g)) used.add(q[1]);
        }
        for (const m of readFileSync('src/ui/components/EmergencyConsole.js', 'utf8').matchAll(/return '(arrow-[a-z]+)'|Module, '([a-z-]+)'\]/g)) used.add(m[1] || m[2]);
        const missing = [...used].filter((n) => !(n in ICON_CODES));
        expect(missing).toEqual([]);
        expect(used.size).toBeGreaterThan(20);
    });
});
