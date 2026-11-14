/**
 * UNRESTMETER.JS (MOD_UNREST)
 * Sistema de medición de disturbios civiles.
 * Desbloqueado en Paso 5: "La Grieta Social".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { CONFIG } from '../data/gameConfig.js';
import { moduleRegistry } from './ModuleRegistry.js';
import { getUnrestStatus, shouldTriggerRiot, calculateRiotImpact } from '../utils/unrestUtils.js';

class UnrestMeter {
    constructor() {
        this.isActive = false;
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => this.reset());

        // Escuchar eventos que aumentan/disminuyen el descontento
        bus.on('DECISION_MADE', ({ subject, action }) => {
            if (!this.isActive && moduleRegistry.isModuleActive('MOD-10')) this.activate();
            if (!this.isActive) return;

            // Lógica de agitación: las malas decisiones aumentan el descontento
            if (action === 'sacrifice' && !subject.isCorrupt) {
                this.increase(CONFIG.UNREST.SACRIFICE_INOCENT_INCREASE); // Sacrificar inocente indigna a la población
            } else if (action === 'authorize' && subject.isCorrupt) {
                this.increase(CONFIG.UNREST.AUTHORIZE_CORRUPT_INCREASE); // Autorizar corrupto genera inseguridad
            } else if (action === 'authorize' && !subject.isCorrupt) {
                this.decrease(CONFIG.UNREST.AUTHORIZE_INOCENT_DECREASE);  // Autorizar inocente calma a la población
            }
        });

        bus.on('SABOTAGE_TRIGGERED', () => {
            this.increase(CONFIG.UNREST.SABOTAGE_INCREASE);
        });

        bus.on('MODULE_UNLOCKED', (data) => {
            // El registro usa 'MOD-10'; con el id viejo el medidor no se activaba nunca
            if (data.id === 'MOD-10' || data.id === 'MOD_UNREST') {
                this.activate();
            }
        });
    }

    reset() {
        state.unrest = CONFIG.UNREST.INITIAL;
        this.isActive = false;
        this.emitUpdate();
    }

    activate() {
        this.isActive = true;
        this.emitUpdate();
    }

    increase(amount) {
        if (!this.isActive) return;
        state.unrest = Math.min(CONFIG.UNREST.MAX, state.unrest + amount);
        this.checkStatus();
        this.emitUpdate();
    }

    decrease(amount) {
        if (!this.isActive) return;
        state.unrest = Math.max(0, state.unrest - amount);
        this.checkStatus();
        this.emitUpdate();
    }

    getStatus() {
        return getUnrestStatus(state.unrest, CONFIG.UNREST.LEVELS);
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
        
        if (shouldTriggerRiot(state.unrest, CONFIG.UNREST.RIOT_THRESHOLD, CONFIG.UNREST.RIOT_CHANCE)) {
            bus.emit('RIOT_EVENT', { damage: CONFIG.UNREST.RIOT_DAMAGE });
            bus.emit('TERMINAL_PRINT', {
                text: '[ALERT] RIOT DETECTED IN SECTOR 4. STABILITY AFFECTED.',
                type: 'ERROR'
            });
            state.stability = calculateRiotImpact(state.stability, CONFIG.UNREST.RIOT_DAMAGE);
        }
    }

    emitUpdate() {
        bus.emit('UNREST_UPDATE', {
            level: state.unrest,
            status: this.getStatus(),
            label: CONFIG.UNREST.LEVELS[this.getStatus()].label
        });
    }
}

export const unrestMeter = new UnrestMeter();
