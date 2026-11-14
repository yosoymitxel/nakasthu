/**
 * VERDICTLOG.JS
 * Registro de sentencias de la partida: quién pasó, quién no y si fue un error.
 * Motor puro; la UI lo lee para la tira de la cuota, el registro y el resumen de turno.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

const MAX_ENTRIES = 200;

class VerdictLog {
    constructor() {
        this.entries = [];
        this.lastErrors = 0;
        this.init();
    }

    init() {
        bus.on('DECISION_MADE', ({ subject, action }) => {
            // El motor suma el error antes de emitir: se compara con el último valor visto
            const error = state.judgmentErrors > this.lastErrors;
            this.lastErrors = state.judgmentErrors;
            this.entries.push({
                id: subject?.id || '???',
                species: subject?.species,
                role: subject?.type,
                action,
                error,
                scans: [...(subject?.scannedTypes || [])],
                interrogated: !!subject?.hasBeenInterrogated,
                step: state.currentStep
            });
            if (this.entries.length > MAX_ENTRIES) this.entries.shift();
            bus.emit('VERDICT_LOGGED', this.entries[this.entries.length - 1]);
        });

        bus.on('STEP_CHANGE', () => { this.lastErrors = 0; });
        // Reiniciar el día borra sus sentencias: no cuentan dos veces
        bus.on('LEVEL_RESET', ({ step } = {}) => {
            this.lastErrors = 0;
            this.entries = this.entries.filter(e => e.step !== (step ?? state.currentStep));
            bus.emit('VERDICT_LOGGED', null);
        });
    }

    reset() {
        this.entries = [];
        this.lastErrors = 0;
    }

    forStep(step) {
        return this.entries.filter(e => e.step === step);
    }
}

export const verdictLog = new VerdictLog();
