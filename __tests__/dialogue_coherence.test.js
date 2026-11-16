/**
 * Coherencia de los pools de diálogo: el operador HABLA (o hace una acción entre *asteriscos*)
 * y el sujeto responde con habla entre comillas o acciones narradas. Nada de comandos sueltos
 * tipo "Analizar Testimonio" ni narración fuera de los asteriscos, que en COMMS se leía como habla.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isExclusive } from '../src/systems/DialogueEngine.js';

const dir = join(process.cwd(), 'src', 'data', 'dialogues');
const files = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')).files;
const dialogues = files.flatMap(f => JSON.parse(readFileSync(join(dir, f), 'utf8')).dialogues);

const walk = (opts, fn, path) => opts.forEach((o, i) => { fn(o, `${path}[${i}]`); if (o.next) walk(o.next, fn, `${path}[${i}]`); });
// Quita acciones *…* y habla '…' / "…"; lo que quede debe ser puntuación.
const leftover = (t) => t.replace(/\*[^*]+\*/g, '').replace(/'[^']*'[.,!?]*/g, '').replace(/"[^"]*"/g, '').replace(/[\s.,;:!?¡¿…—-]/g, '');

describe('Diálogos', () => {
    it('el texto y las respuestas del sujeto son habla entre comillas o acción entre asteriscos', () => {
        const bad = [];
        for (const d of dialogues) {
            if (leftover(d.text)) bad.push(`${d.id}.text`);
            walk(d.options, (o, p) => { if (o.consequence && leftover(o.consequence)) bad.push(`${d.id}${p}`); }, '');
        }
        expect(bad).toEqual([]);
    });

    it('las opciones del operador son una frase o una acción completa, no un comando', () => {
        const bad = [];
        for (const d of dialogues) walk(d.options, (o, p) => {
            const t = o.text.trim();
            const action = /^\*[^*]+\*$/.test(t);
            const mixed = !action && t.includes('*');
            // "Analizar Testimonio": 1-3 palabras en mayúscula inicial sin puntuación final.
            const command = !action && !/[.?!»]$/.test(t);
            if (mixed || command || /^\[.*\]$/.test(t)) bad.push(`${d.id}${p}: ${t}`);
        }, '');
        expect(bad).toEqual([]);
    });

    it('con varias decisiones, elegir una cierra las otras salvo en charlas marcadas como abiertas', () => {
        const open = dialogues.filter(d => !isExclusive(d)).map(d => d.id);
        expect(open.length).toBeGreaterThan(0);
        expect(isExclusive({})).toBe(true);
        // Las abiertas sólo tienen preguntas o comentarios, no órdenes que se contradigan.
        for (const d of dialogues.filter(x => !isExclusive(x))) {
            for (const o of d.options) expect(o.text, d.id).not.toMatch(/autoriz|denegad|ordene|haga lo que sea/i);
        }
    });
});
