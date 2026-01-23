/**
 * RITUALENGINE.JS (MOD_RITUAL)
 * Sistema de sacrificios y rituales.
 * Desbloqueado en Paso 9: "La Fe Ciega".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { factionSystem } from './FactionSystem.js';

const RITUALS = {
    PURIFICATION: { cost: 3, stability: 30, energy: -10, faction: 'ORDEN' },
    ASCENSION: { cost: 5, stability: -20, energy: 50, faction: 'CAOS' }
};

class RitualEngine {
    constructor() {
        this.charges = 0;
        this.maxCharges = 5;
        this.isActive = false;
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => this.reset());

        bus.on('MODULE_UNLOCKED', (data) => {
            if (data.id === 'MOD_RITUAL') {
                this.isActive = true;
            }
        });

        // Ganar cargas al sacrificar sujetos (Action SACRIFICE en Operations)
        bus.on('SUBJECT_PROCESSED', (data) => {
            // Nota: GameSequencer emite esto, necesitamos saber la acción específica
            // Si la acción fue 'sacrificio', ganamos carga.
            // Actualmente SUBJECT_PROCESSED solo trae stats.
            // Necesitamos escuchar el evento de acción directo o modificar el evento.
            // Asumiremos que escuchamos un evento específico ACTION_TAKEN
        });

        bus.on('ACTION_TAKEN', (data) => {
            if (!this.isActive) return;
            if (data.action === 'SACRIFICE') {
                this.addCharge(1);
            }
        });
    }

    reset() {
        this.charges = 0;
        this.isActive = false;
        this.emitUpdate();
    }

    addCharge(amount) {
        if (!this.isActive) return;
        this.charges = Math.min(this.maxCharges, this.charges + amount);
        this.emitUpdate();

        bus.emit('TERMINAL_PRINT', {
            text: `RITUAL CHARGE ACCUMULATED: ${this.charges}/${this.maxCharges}`,
            type: 'SYSTEM'
        });
    }

    performRitual(type) {
        if (!this.isActive) return { success: false, reason: 'MODULE_OFFLINE' };

        const ritual = RITUALS[type];
        if (!ritual) return { success: false, reason: 'INVALID_RITUAL' };

        if (this.charges < ritual.cost) {
            bus.emit('TERMINAL_PRINT', {
                text: `INSUFFICIENT CHARGES. REQUIRED: ${ritual.cost}`,
                type: 'ERROR'
            });
            return { success: false, reason: 'NO_CHARGES' };
        }

        // Ejecutar ritual
        this.charges -= ritual.cost;

        state.startBatch();
        state.stability = Math.min(100, Math.max(0, state.stability + ritual.stability));
        state.energy = Math.min(100, Math.max(0, state.energy + ritual.energy));
        state.endBatch();

        // Efecto de facción
        if (factionSystem && factionSystem.isActive) {
            factionSystem.registerAction(ritual.faction, 5); // Gran impacto
        }

        bus.emit('RITUAL_COMPLETED', { type, ritual });
        bus.emit('TERMINAL_PRINT', {
            text: `>>> RITUAL [${type}] COMPLETED.`,
            type: 'SUCCESS'
        });

        this.emitUpdate();
        return { success: true };
    }

    emitUpdate() {
        bus.emit('RITUAL_UPDATE', {
            charges: this.charges,
            max: this.maxCharges,
            available: this.getAvailableRituals()
        });
    }

    getAvailableRituals() {
        return Object.entries(RITUALS)
            .filter(([key, r]) => this.charges >= r.cost)
            .map(([key]) => key);
    }
}

export const ritualEngine = new RitualEngine();
