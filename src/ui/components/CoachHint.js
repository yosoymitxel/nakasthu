/**
 * COACHHINT.JS
 * Guía en vivo del primer turno: una sola instrucción, la que toca ahora, sin ventanas.
 * Se deriva del State (vista tonta); el fin lo marca TutorialController (COACH_DONE).
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { bus } from '../../core/Bus.js';
import { isCoachActive } from '../../systems/TutorialController.js';
import { CONFIG } from '../../data/gameConfig.js';

const { useState, useEffect, memo } = React;
const pct = (t) => `${Math.round((CONFIG.SCANNER.TYPES[t]?.precision || 0) * 100)}%`;

export const CoachHint = memo(() => {
    const currentStep = useGameState('currentStep');
    const entity = useGameState('currentEntity');
    const processed = useGameState('processedCount') || 0;
    const maxErrors = useGameState('maxErrors');
    const [done, setDone] = useState(false);

    useEffect(() => {
        const onDone = () => setDone(true);
        bus.on('COACH_DONE', onDone);
        return () => bus.off('COACH_DONE', onDone);
    }, []);

    if (done || !isCoachActive() || currentStep == null) return null;

    const scanned = entity?.scannedTypes?.includes('BIOMETRIC');
    const est = entity?.corruptionEstimate;
    let text;
    if (!entity) text = 'Espera al siguiente sujeto…';
    else if (!scanned) text = `Pulsa ESCANEAR → BIOMÉTRICO (acierta el ${pct('BIOMETRIC')}). Fiebre de 38 °C o más es mala señal.`;
    else if (est > 65 || est < 35) text = `Corrupción ${est}%: por encima de 50 % SACRIFICA, por debajo AUTORIZA. Tolerancia: ${maxErrors} errores por turno.`;
    else text = `Corrupción ${est}%: dudoso. Pide otra lectura: escaneo NEURAL (acierta el ${pct('NEURAL')}) o INTERROGAR (análisis de voz).`;

    return html`
        <div className="coach-hint flex-none flex items-start gap-2 px-3 py-2 border-b border-amber-700/40 bg-amber-950/20 text-[11px] leading-snug text-amber-300" role="status" aria-live="polite">
            <span className="font-black tracking-widest text-amber-500 whitespace-nowrap">INDUCCIÓN ${Math.min(processed + 1, 2)}/2</span>
            <span>${text}</span>
        </div>
    `;
});
