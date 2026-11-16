/**
 * Recorre TODAS las ramas de TODOS los diálogos con el motor real (no con un mock):
 * cada camino de elecciones se reproduce desde cero y se comprueba que no hay callejones sin
 * salida, que siempre se sabe quién habla, que una decisión cierra sus alternativas y que la
 * memoria narrativa (`set` / `requires` / `if`) es coherente: todo lo que se lee se puede fijar
 * antes, y todo lo que se fija alguien lo lee.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { dialogueEngine, isExclusive } from '../src/systems/DialogueEngine.js';
import { narrativeFlags } from '../src/systems/NarrativeFlags.js';

const dir = join(process.cwd(), 'src', 'data', 'dialogues');
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
const dialogues = manifest.files.flatMap(f => JSON.parse(readFileSync(join(dir, f), 'utf8')).dialogues);
const declared = manifest.flags || {};

const allOptions = (opts, out = []) => { for (const o of opts || []) { out.push(o); allOptions(o.next, out); } return out; };
const visible = (opts, flags) => (opts || []).filter(o => Object.entries(o.if || {}).every(([k, v]) => flags[k] === v));

/** Caminos de elección (índices sobre opciones visibles) hasta una opción sin `next`. */
function paths(opts, flags, prefix = []) {
    const out = [];
    visible(opts, flags).forEach((o, i) => {
        const p = [...prefix, i];
        if (o.next) out.push(...paths(o.next, flags, p));
        else out.push(p);
    });
    return out;
}

/** Combinaciones de memoria que vale la pena probar: lo que exige el diálogo más cada `if`. */
function flagSets(d) {
    const base = { ...(d.requires || {}) };
    const sets = [base];
    for (const o of allOptions(d.options)) if (o.if) sets.push({ ...base, ...o.if });
    return sets;
}

function play(d, flags, path) {
    narrativeFlags.reset();
    narrativeFlags.set(flags);
    state.resetState();
    state.energy = 100;
    state.stability = 50;
    state.currentEntity = { id: 'SUJ-01', scannedData: { corruption: 0 } };
    const said = [];
    const onPick = (e) => said.push(e);
    bus.on('DIALOGUE_OPTION_SELECTED', onPick);
    const problems = [];
    try {
        dialogueEngine.startDialogue(d);
        if (!state.activeDialogue?.speaker) problems.push('sin hablante al abrir');
        for (const i of path) {
            const before = said.length;
            const picked = state.activeDialogue?.options?.[i] ?? null;
            dialogueEngine.selectOption(i);
            if (said.length !== before + 1) { problems.push(`opción ${i} no respondió`); break; }
            for (const [k, v] of Object.entries(picked?.set || {})) {
                if (narrativeFlags.get(k) !== v) problems.push(`"${picked.text}" no fijó ${k}=${v}`);
            }
        }
        for (const e of said) {
            if (!e.speaker) problems.push(`sin hablante tras "${e.option}"`);
            if (!e.consequence?.trim()) problems.push(`sin respuesta tras "${e.option}"`);
        }
        const opts = state.activeDialogue?.options || [];
        if (opts.length === 0) problems.push('callejón sin salida');
        if (isExclusive(d)) {
            if (opts.some(o => !o.used)) problems.push('decisión no cerró las alternativas');
            const before = said.length;
            opts.forEach((_, i) => dialogueEngine.selectOption(i));
            if (said.length !== before) problems.push('se pudo elegir otra alternativa tras decidir');
        }
        if (state.stability < 0 || state.stability > 100) problems.push(`estabilidad ${state.stability}`);
        if (state.energy < 0) problems.push(`energía ${state.energy}`);
    } finally {
        bus.off('DIALOGUE_OPTION_SELECTED', onPick);
        dialogueEngine.closeDialogue();
    }
    return problems;
}

describe('Diálogos · recorrido de todas las ramas', () => {
    beforeAll(async () => {
        await dialogueEngine.loadDialogues();
    });

    it('cada camino termina bien con hablante, respuesta y alternativas cerradas', () => {
        const bad = [];
        let walked = 0;
        for (const d of dialogues) {
            for (const flags of flagSets(d)) {
                for (const p of paths(d.options, flags)) {
                    walked++;
                    for (const prob of play(d, flags, p)) bad.push(`${d.id} [${p}] ${JSON.stringify(flags)}: ${prob}`);
                }
            }
        }
        expect(walked).toBeGreaterThan(dialogues.length);
        expect(bad).toEqual([]);
    });

    it('las charlas abiertas permiten preguntar todo sin repetir pregunta', () => {
        for (const d of dialogues.filter(x => !isExclusive(x))) {
            const flags = d.requires || {};
            play(d, flags, []); // limpia
            narrativeFlags.set(flags);
            dialogueEngine.startDialogue(d);
            const n = state.activeDialogue.options.length;
            const onlyLeaves = d.options.every(o => !o.next);
            if (!onlyLeaves) { dialogueEngine.closeDialogue(); continue; }
            for (let i = 0; i < n; i++) dialogueEngine.selectOption(i);
            expect(state.activeDialogue.options.every(o => o.used), d.id).toBe(true);
            dialogueEngine.closeDialogue();
        }
    });

    it('memoria narrativa: todo declarado, todo lo leído se fija antes y todo lo fijado se lee', () => {
        const problems = [];
        const setters = []; // { flag, value, minStep }
        const readers = []; // { flag, value, minStep, id }
        for (const d of dialogues) {
            const minStep = d.minStep || 1;
            for (const [flag, value] of Object.entries(d.requires || {})) readers.push({ flag, value, minStep, id: d.id });
            for (const o of allOptions(d.options)) {
                for (const [flag, value] of Object.entries(o.set || {})) setters.push({ flag, value, minStep, id: d.id });
                for (const [flag, value] of Object.entries(o.if || {})) readers.push({ flag, value, minStep, id: d.id });
            }
        }
        for (const r of [...setters, ...readers]) {
            if (!(declared[r.flag] || []).includes(r.value)) problems.push(`${r.id}: ${r.flag}=${r.value} sin declarar`);
        }
        for (const r of readers) {
            // Quien lo fija tiene que poder aparecer antes que quien lo lee.
            if (!setters.some(s => s.flag === r.flag && s.value === r.value && s.minStep < r.minStep)) {
                problems.push(`${r.id}: lee ${r.flag}=${r.value} pero nada lo fija antes del paso ${r.minStep}`);
            }
        }
        for (const [flag, values] of Object.entries(declared)) {
            for (const value of values) {
                if (!setters.some(s => s.flag === flag && s.value === value)) problems.push(`${flag}=${value} nunca se fija`);
                if (!readers.some(r => r.flag === flag && r.value === value)) problems.push(`${flag}=${value} nadie lo lee`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('el pool sólo ofrece diálogos cuyos requisitos se cumplen y la memoria sobrevive a resetState', () => {
        narrativeFlags.reset();
        state.resetState();
        state.currentStep = 7;
        state.currentEntity = { id: 'SUJ-01', scannedData: {} };
        const seen = new Set();
        for (let i = 0; i < 300; i++) {
            dialogueEngine.triggerRandomDialogue();
            seen.add(state.activeDialogue.id);
            dialogueEngine.closeDialogue();
        }
        const gated = dialogues.filter(d => d.requires).map(d => d.id);
        expect(gated.filter(id => seen.has(id))).toEqual([]);

        narrativeFlags.set({ agua_norte: 'forzada' });
        state.resetState(); // "Continuar Partida" pasa por aquí
        expect(narrativeFlags.get('agua_norte')).toBe('forzada');
        bus.emit('GAME_START'); // partida nueva: memoria vacía
        expect(narrativeFlags.get('agua_norte')).toBe(null);
    });
});
