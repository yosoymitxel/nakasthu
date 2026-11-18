/**
 * Cada nodo de diálogo muestra como mucho 3 opciones a la vez (más el botón de terminar):
 * opciones que dependen de la misma marca con valores distintos nunca coinciden y cuentan como una.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'data', 'dialogues');
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));

const maxVisible = (opts) => {
    const always = opts.filter(o => !o.if).length;
    const keys = new Set(opts.filter(o => o.if).map(o => Object.keys(o.if).sort().join('+')));
    return always + keys.size;
};

describe('anchura de los diálogos', () => {
    it('ningún nodo enseña más de 3 opciones', () => {
        const wide = [];
        const walk = (id, opts, path) => {
            if (!opts?.length) return;
            if (maxVisible(opts) > 3) wide.push(`${id} ${path.join('.') || 'raíz'}: ${maxVisible(opts)}`);
            opts.forEach((o, i) => walk(id, o.next, [...path, i]));
        };
        for (const f of manifest.files) for (const d of JSON.parse(readFileSync(join(dir, f), 'utf8')).dialogues) walk(d.id, d.options, []);
        expect(wide).toEqual([]);
    });
});
