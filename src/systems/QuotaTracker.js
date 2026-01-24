/**
 * QUOTATRACKER.JS (MOD_QUOTA)
 * Sistema de seguimiento de objetivos de producción.
 * Desbloqueado en Paso 3: "Reasignaciones".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { calculateQuotaPercentage, isQuotaReached } from '../utils/quotaUtils.js';

class QuotaTracker {
    constructor() {
        this.current = 0;
        this.target = 0;
        this.isActive = false;
        this.init();
    }

    init() {
        // Escuchar cuando se procesa un sujeto exitosamente
        bus.on('DECISION_MADE', (data) => {
            // Solo contar si la acción fue positiva (autorizar o reclutar)
            // En este sistema simplificado, asumimos que cualquier proceso cuenta si no fue un error
            this.registerSuccess();
        });

        bus.on('LEVEL_RESET', () => {
            this.reset();
        });
    }

    setQuota(target) {
        this.target = target;
        this.current = 0;
        this.isActive = true;
        this.emitUpdate();
    }

    reset() {
        this.current = 0;
        this.target = 0;
        this.isActive = false;
    }

    registerSuccess() {
        if (!this.isActive) return;

        this.current++;
        this.emitUpdate();

        if (isQuotaReached(this.current, this.target)) {
            bus.emit('QUOTA_MET', { target: this.target });

            // Efecto visual de éxito
            bus.emit('TERMINAL_PRINT', {
                text: `>>> PRODUCTION QUOTA REACHED (${this.target}/${this.target}). SECTOR STABILIZED.`,
                type: 'SUCCESS'
            });
        }
    }

    emitUpdate() {
        bus.emit('QUOTA_UPDATE', {
            current: this.current,
            target: this.target,
            percentage: this.getPercentage()
        });
    }

    getPercentage() {
        return calculateQuotaPercentage(this.current, this.target);
    }

    checkStatus() {
        return {
            complete: this.current >= this.target,
            current: this.current,
            target: this.target,
            percentage: this.getPercentage()
        };
    }
}

export const quotaTracker = new QuotaTracker();
