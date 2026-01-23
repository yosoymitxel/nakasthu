/**
 * UNRESTMETER.JS (MOD_UNREST)
 * Sistema de medición de disturbios civiles.
 * Desbloqueado en Paso 5: "La Grieta Social".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

const STATUS_LEVELS = {
    CALM: { threshold: 0, label: 'CALMA', color: '#10b981' },
    TENSION: { threshold: 40, label: 'TENSIÓN', color: '#f59e0b' },
    CRITICAL: { threshold: 80, label: 'DISTURBIOS', color: '#ef4444' }
};

class UnrestMeter {
    constructor() {
        this.level = 0; // 0-100
        this.isActive = false;
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => this.reset());

        // Escuchar eventos que aumentan/disminuyen el descontento
        bus.on('SUBJECT_PROCESSED', (data) => {
            if (!this.isActive) return;

            // Ejemplo: Si rechazamos a muchos ciudadanos (no implementado en detalle aún), sube el unrest
            // Por ahora, integración manual o via eventos específicos
        });

        bus.on('SABOTAGE_TRIGGERED', () => {
            this.increase(20);
        });

        bus.on('MODULE_UNLOCKED', (data) => {
            if (data.id === 'MOD_UNREST') {
                this.activate();
            }
        });
    }

    reset() {
        this.level = 0;
        this.isActive = false;
        this.emitUpdate();
    }

    activate() {
        this.isActive = true;
        this.emitUpdate();
    }

    increase(amount) {
        if (!this.isActive) return;
        this.level = Math.min(100, this.level + amount);
        this.checkStatus();
        this.emitUpdate();
    }

    decrease(amount) {
        if (!this.isActive) return;
        this.level = Math.max(0, this.level - amount);
        this.checkStatus();
        this.emitUpdate();
    }

    getStatus() {
        if (this.level >= STATUS_LEVELS.CRITICAL.threshold) return 'CRITICAL';
        if (this.level >= STATUS_LEVELS.TENSION.threshold) return 'TENSION';
        return 'CALM';
    }

    checkStatus() {
        const status = this.getStatus();
        if (status === 'CRITICAL') {
            bus.emit('TERMINAL_PRINT', {
                text: '[WARNING] CIVIL UNREST LEVELS CRITICAL. RIOT IMMINENT.',
                type: 'WARNING'
            });
        }
    }

    checkRiotChance() {
        if (!this.isActive) return;
        if (this.level > 80) {
            if (Math.random() > 0.7) { // 30% chance por chequeo
                bus.emit('RIOT_EVENT', { damage: 10 });
                bus.emit('TERMINAL_PRINT', {
                    text: '[ALERT] RIOT DETECTED IN SECTOR 4. STABILITY AFFECTED.',
                    type: 'ERROR'
                });
                state.stability = Math.max(0, state.stability - 10);
            }
        }
    }

    emitUpdate() {
        bus.emit('UNREST_UPDATE', {
            level: this.level,
            status: this.getStatus(),
            label: STATUS_LEVELS[this.getStatus()].label
        });
    }
}

export const unrestMeter = new UnrestMeter();
