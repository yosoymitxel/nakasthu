/**
 * PORTALFLUX.JS (MOD_PORTAL)
 * Monitor de estabilidad dimensional.
 * Desbloqueado en Paso 11: "El Juicio Final" (o antes en paso 10/11).
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class PortalFlux {
    constructor() {
        this.stability = 100; // 0-100%
        this.isActive = false;
        this.decayRate = 2; // % por tick/action
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => this.reset());

        bus.on('MODULE_UNLOCKED', (data) => {
            if (data.id === 'MOD_PORTAL') {
                this.isActive = true;
            }
        });

        // Decay natural con cada sujeto procesado o tick
        bus.on('SUBJECT_PROCESSED', () => {
            if (this.isActive) {
                this.decay(this.decayRate);
            }
        });

        // Acción manual de estabilizar (Command or Button)
        bus.on('PORTAL_STABILIZE', (amount) => {
            this.stabilize(amount || 10);
        });
    }

    reset() {
        this.stability = 100;
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
        if (this.stability < 30) {
            // Alta probabilidad de anomalía
            if (Math.random() < 0.3) {
                this.triggerAnomaly();
            }
        }
    }

    triggerAnomaly() {
        bus.emit('PORTAL_ANOMALY', {
            type: 'VOID_LEAK',
            damage: 15
        });

        bus.emit('TERMINAL_PRINT', {
            text: '>>> WARNING: DIMENSIONAL LEAK DETECTED. STABILITY COMPROMISED.',
            type: 'CRITICAL'
        });

        state.stability = Math.max(0, state.stability - 15);
    }

    emitUpdate() {
        bus.emit('PORTAL_UPDATE', {
            stability: this.stability,
            status: this.stability > 50 ? 'STABLE' : 'UNSTABLE'
        });
    }
}

export const portalFlux = new PortalFlux();
