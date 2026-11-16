/**
 * NARRATIVEFLAGS.JS
 * Memoria de lo que el operador decidió en las conversaciones (negar fuerza letal a Vargas,
 * sellar los pozos...) para que diálogos posteriores lo recuerden.
 * Regla 2.A: Vanilla JS, sin DOM.
 *
 * POR QUÉ un almacén propio y no State: "Continuar Partida" pasa por resetState(), que borraría
 * la memoria de la partida en curso. Sólo una partida nueva (GAME_START) la vacía.
 * Las condiciones son igualdades sobre datos ({ flag: valor }, null = sin fijar): nada de eval().
 */
import { bus } from '../core/Bus.js';
import { storageGetJSON, storageSet, storageRemove } from '../utils/storage.js';

const KEY = 'nakasthu_flags';
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

class NarrativeFlags {
    constructor() {
        this.values = storageGetJSON(KEY, {}, isPlainObject);
        // Declaración: { flag: [valores permitidos] }. La llena DialogueEngine desde el manifest.
        this.declared = null;
        bus.on('GAME_START', () => this.reset());
    }

    declare(flags) {
        this.declared = isPlainObject(flags) ? flags : {};
    }

    get(flag) {
        return this.values[flag] ?? null;
    }

    /** true si todas las igualdades se cumplen. Sin condición, siempre true. */
    matches(cond) {
        if (!isPlainObject(cond)) return true;
        return Object.entries(cond).every(([flag, value]) => this.get(flag) === value);
    }

    set(changes) {
        if (!isPlainObject(changes)) return;
        for (const [flag, value] of Object.entries(changes)) {
            // Un error de autoría (marca o valor sin declarar) no debe corromper la partida.
            if (this.declared && !(this.declared[flag] || []).includes(value)) {
                console.warn(`[FLAGS] Marca no declarada ignorada: ${flag}=${value}`);
                continue;
            }
            this.values[flag] = value;
            console.log(`%c[FLAGS] ${flag} = ${value}`, 'color: #a78bfa;');
        }
        storageSet(KEY, JSON.stringify(this.values));
    }

    reset() {
        this.values = {};
        storageRemove(KEY);
    }
}

export const narrativeFlags = new NarrativeFlags();
