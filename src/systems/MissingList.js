/**
 * MISSINGLIST.JS
 * LA LISTA de la partida: capas del libro por paso y la gente que pasa por la consola del operador.
 * Regla 2.A: Vanilla JS. La UI la lee de `state.missingList` (useGameState).
 *
 * POR QUÉ un almacén propio, como NarrativeFlags: "Continuar Partida" pasa por resetState() y la lista
 * es de la partida, no del nivel. Sólo GAME_START la vacía.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { narrativeFlags } from './NarrativeFlags.js';
import { LIST_LAYERS, LIST_FATES, LIST_NAMES, LIST_TURN_LINES } from '../data/missingList.js';
import { storageGetJSON, storageSet, storageRemove } from '../utils/storage.js';

const KEY = 'nakasthu_lista';
const GENERIC_ID = /^[A-Z]{2,4}-\d+$/;
const isEntry = (e) => e && typeof e === 'object' && typeof e.name === 'string' && Number.isFinite(e.step);
const NUMBERS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const SMALL = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en']);
const titleCase = (s) => String(s).toLowerCase().split(' ').map((w, i) => (i && SMALL.has(w) ? w : w.replace(/\p{L}/u, c => c.toUpperCase()))).join(' ');

class MissingList {
    constructor() {
        const saved = storageGetJSON(KEY, [], (v) => Array.isArray(v) && v.every(isEntry));
        state.missingList = saved;
        bus.on('GAME_START', () => this.reset());
        bus.on('STEP_CHANGE', ({ step, config } = {}) => { if (config?.type === 'gameplay') this.openLayer(step); });
        bus.on('LEVEL_RESET', ({ step } = {}) => this.commit(this.entries.filter(e => !(e.mine && e.step === step))));
        bus.on('GAME_ENDING', ({ faction } = {}) => this.applyStrikes(faction));
    }

    get entries() {
        return state.missingList || [];
    }

    commit(list) {
        state.missingList = list;
        storageSet(KEY, JSON.stringify(list));
    }

    reset() {
        state.missingList = [];
        storageRemove(KEY);
    }

    /** Pega las capas del libro hasta este paso. Rejugar un paso borra lo que el operador procesó en él y después. */
    openLayer(step) {
        const list = this.entries.filter(e => !(e.mine && e.step >= step));
        for (const [layerStep, layer] of Object.entries(LIST_LAYERS)) {
            if (Number(layerStep) > step) continue;
            for (const e of layer.entries) {
                if (!list.some(x => x.id === e.id)) list.push({ id: e.id, step: Number(layerStep), name: e.name, who: e.who, note: e.note || '' });
            }
        }
        this.commit(list);
        this.applyStrikes(step);
    }

    /** Tacha o apaga las líneas del libro cuyo momento ha llegado (`at`: paso o final). */
    applyStrikes(at) {
        const reached = (when) => (typeof when === 'number' ? typeof at === 'number' && at >= when : when === at);
        const book = Object.values(LIST_LAYERS).flatMap(l => l.entries);
        const list = this.entries.map(e => {
            const src = book.find(b => b.id === e.id);
            if (!src) return e;
            let next = e;
            if (src.later && reached(src.later.at)) next = { ...next, gone: true, note: src.later.note };
            const s = src.strike;
            if (s && reached(s.at) && !(s.unless && narrativeFlags.matches(s.unless))) next = { ...next, struck: true, strikeNote: s.note };
            return next;
        });
        this.commit(list);
    }

    /** El sujeto deja la consola (lo llama GameSequencer antes del parte): memoria de los recurrentes y, si su destino lo pide, una línea con nombre. */
    record(subject, action) {
        if (!subject) return;
        const flags = subject.cameo?.onDecision?.[action];
        if (flags) narrativeFlags.set(flags);
        const step = state.currentStep;
        const fate = LIST_FATES[step]?.[action];
        if (!fate || subject.isLoreCore) return;
        const named = subject.name || (!GENERIC_ID.test(subject.id || '') ? titleCase(subject.id) : null);
        const taken = new Set(this.entries.map(e => e.name.split(',')[0]));
        let name = named;
        if (!name) {
            for (let i = 0; i < 20 && (!name || taken.has(name)); i++) name = `${pick(LIST_NAMES.first)} ${pick(LIST_NAMES.last)}`;
            const [lo, hi] = LIST_NAMES.age;
            name = `${name}, ${lo + Math.floor(Math.random() * (hi - lo + 1))}`;
        }
        const entry = {
            id: `MINE_${step}_${this.entries.length}`, step, mine: true, tag: named ? '' : subject.id,
            name, who: named ? '' : `De ${pick(LIST_NAMES.from)}.`, note: fate.note,
            struck: !!fate.struck
        };
        this.commit([...this.entries, entry]);
        bus.emit('TERMINAL_PRINT', { text: `[LA LISTA] ${entry.tag ? `${entry.tag}: ` : ''}${name}. ${fate.note}`, type: 'SYSTEM' });
    }

    /** Línea del parte de cierre de turno, o null si el paso no la tiene. */
    turnLine(step) {
        const line = LIST_TURN_LINES[step];
        if (!line) return null;
        const n = this.entries.filter(e => e.mine && e.step === step).length;
        return `${line.replace('{n}', n)} La lista: ${this.entries.length} nombres.`;
    }

    /** Lo que lee Idrís por la emisora: primero los de tu consola, después los del libro. */
    readout(max = 7) {
        const mine = this.entries.filter(e => e.mine).reverse();
        const book = this.entries.filter(e => !e.mine);
        // Por la radio se leen nombres, no edades
        const names = [...mine, ...book].map(e => e.name.replace(/, \d+$/, ''));
        const shown = names.slice(0, max).join('. ');
        const rest = names.length - max;
        return rest > 0 ? `${shown}. Y ${NUMBERS[rest] || rest} más.` : (shown ? `${shown}.` : '');
    }
}

export const missingList = new MissingList();
