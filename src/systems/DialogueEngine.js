/**
 * DIALOGUEENGINE.JS
 * Motor de procesamiento de diálogos.
 * Regla 2.A: Vanilla JS.
 */
import { DIALOGUE_POOLS } from '../data/dialoguePools.js';
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';

/**
 * Genera una frase de interrogatorio basada en el sujeto actual.
 */
export const interrogate = () => {
    const subject = state.currentEntity;
    
    if (!subject) {
        return "SISTEMA: No hay sujeto en la cámara de contención.";
    }

    const hasScanned = subject.scannedTypes && subject.scannedTypes.length > 0;
    
    if (!hasScanned) {
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[ERROR] Datos biométricos insuficientes para iniciar enlace neural.',
            type: 'SYSTEM'
        });
        return;
    }

    // Motor de Veracidad: Seleccionar diálogo según corrupción
    let phrase = "";
    
    if (subject.isCorrupt) {
        // Los corruptos son agresivos o dicen verdades perturbadoras
        phrase = Math.random() > 0.5 ? subject.dialogue.threat : subject.dialogue.truth;
    } else {
        // Los inocentes suplican por su vida
        phrase = subject.dialogue.plea;
    }

    // Interferencia de ECLIPSE
    if (state.mode === 'ECLIPSE') {
        const prefixes = ["0xERR:...", "S4LV4M3...", "N0_D4T4...", "V0ID..."];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        phrase = `${prefix} ${phrase.replace(/[aeiou]/gi, (m) => Math.random() > 0.7 ? '4' : m)}`;
    }

    console.log(`[DIALOGUE] ${subject.id} (Corrupto: ${subject.isCorrupt}): "${phrase}"`);
    
    // Notificar al sistema de logs y UI
    bus.emit('DIALOGUE_EMITTED', {
        sender: subject.id,
        text: phrase,
        type: subject.type
    });

    subject.hasBeenInterrogated = true;
    return phrase;
};
