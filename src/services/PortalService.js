/**
 * PORTALSERVICE.JS (MOD_PORTAL)
 * Monitor de estabilidad dimensional.
 * Desbloqueado en Paso 11: "El Juicio Final" (o antes en paso 10/11).
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { CONFIG } from '../data/gameConfig.js';
import { moduleRegistry } from '../systems/ModuleRegistry.js';

class PortalFlux {
    constructor() {
        this.stability = CONFIG.PORTAL.INITIAL_STABILITY; // 0-100%
        this.isActive = false;
        this.decayRate = CONFIG.PORTAL.DECAY_RATE; // % por tick/action
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => this.reset());

        bus.on('MODULE_UNLOCKED', (data) => {
            // El registro usa 'MOD-11'; con el id viejo el portal no se activaba nunca
            if (data.id === 'MOD-11' || data.id === 'MOD_PORTAL') {
                this.isActive = true;
            }
        });

        // Decay natural con cada sujeto procesado o tick
        bus.on('DECISION_MADE', () => {
            if (!this.isActive && moduleRegistry.isModuleActive('MOD-11')) this.isActive = true;
            if (this.isActive) {
                this.decay(this.decayRate);
            }
        });

        // Acción manual de estabilizar (Command or Button)
        bus.on('PORTAL_STABILIZE', (amount) => {
            // Estabilizar cuesta energía: es la decisión que da sentido al monitor
            if (state.energy < CONFIG.PORTAL.STABILIZE_COST) return;
            state.energy -= CONFIG.PORTAL.STABILIZE_COST;
            this.stabilize(amount || CONFIG.PORTAL.STABILIZE_AMOUNT);
        });
    }

    reset() {
        this.stability = CONFIG.PORTAL.INITIAL_STABILITY;
        this.isActive = false;
        this.emitUpdate();
    }

    decay(amount) {
        if (!this.isActive) return;
        this.stability = Math.max(0, this.stability - amount);
        this.checkAnomalies();
        this.emitUpdate();
    }

    stabilize(amount) {
        if (!this.isActive) return;
        this.stability = Math.min(100, this.stability + amount);
        this.emitUpdate();

        bus.emit('TERMINAL_PRINT', {
            text: `PORTAL STABILIZED. CURRENT INTEGRITY: ${this.stability}%`,
            type: 'SUCCESS'
        });
    }

    checkAnomalies() {
        if (this.stability < CONFIG.PORTAL.ANOMALY_THRESHOLD) {
            // Alta probabilidad de anomalía
            if (Math.random() < CONFIG.PORTAL.ANOMALY_CHANCE) {
                this.triggerAnomaly();
            }
        }
    }

    triggerAnomaly() {
        bus.emit('PORTAL_ANOMALY', {
            type: 'VOID_LEAK',
            damage: CONFIG.PORTAL.ANOMALY_DAMAGE
        });

        bus.emit('TERMINAL_PRINT', {
            text: '>>> WARNING: DIMENSIONAL LEAK DETECTED. STABILITY COMPROMISED.',
            type: 'CRITICAL'
        });

        state.stability = Math.max(0, state.stability - CONFIG.PORTAL.ANOMALY_DAMAGE);
    }

    emitUpdate() {
        bus.emit('PORTAL_UPDATE', {
            stability: this.stability,
            status: this.stability > 50 ? 'STABLE' : 'UNSTABLE'
        });
    }
}

export const portalFlux = new PortalFlux();
