/**
 * QUOTATRACKER.JS (MOD_QUOTA)
 * Sistema de seguimiento de objetivos de producción.
 * Desbloqueado en Paso 3: "Reasignaciones".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class QuotaTracker {
    constructor() {
        this.current = 0;
        this.target = 0;
        this.isActive = false;
        this.init();
    }

    init() {
        // Escuchar cuando se procesa un sujeto exitosamente
        bus.on('SUBJECT_PROCESSED', (data) => {
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

        if (this.current >= this.target) {
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
        if (this.target === 0) return 0;
        return Math.min(100, Math.floor((this.current / this.target) * 100));
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
