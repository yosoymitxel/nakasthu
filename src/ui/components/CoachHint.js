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
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

import { Icon } from '../shared/Icon.js';
const { useState, useEffect, memo } = React;
const pct = (t) => `${Math.round((CONFIG.SCANNER.TYPES[t]?.precision || 0) * 100)}%`;

export const CoachHint = memo(({ hidden = false }) => {
    const currentStep = useGameState('currentStep');
    const entity = useGameState('currentEntity');
    const processed = useGameState('processedCount') || 0;
    const maxErrors = useGameState('maxErrors');
    const required = useGameState('requiredScan') || 'BIOMETRIC';
    const [done, setDone] = useState(false);

    const [emergency, setEmergency] = useState(false);
    const storyPath = useGameState('storyPath') || 0;

    useEffect(() => {
        const onDone = () => setDone(true);
        const onEmergency = () => setEmergency(true);
        bus.on('COACH_DONE', onDone);
        bus.on('COACH_EMERGENCY', onEmergency);
        return () => { bus.off('COACH_DONE', onDone); bus.off('COACH_EMERGENCY', onEmergency); };
    }, []);

    if (hidden || done || !isCoachActive() || currentStep == null) return null;

    const scanned = entity?.scannedTypes?.includes(required);
    const other = required === 'NEURAL' ? 'BIOMETRIC' : 'NEURAL';
    const est = entity?.corruptionEstimate;
    let text;
    if (emergency) text = `EMERGENCIA: ${PATH_CONFIGS[storyPath].emergencies.oxygen.name}. Abre la consola de emergencia y pulsa el botón que se ilumina, uno tras otro. Sin resolverla no se cierra el turno.`;
    else if (!entity) text = 'Espera al siguiente sujeto…';
    else if (!scanned) text = `Pulsa ESCANEAR > ${CONFIG.SCANNER.TYPES[required].name} (acierta el ${pct(required)}). Es el examen que exige este sujeto.`;
    else if (est > 65 || est < 35) text = `Corrupción ${est}%: por encima de 50 % SACRIFICA, por debajo AUTORIZA. Tolerancia: ${maxErrors} errores por turno.`;
    else text = `Corrupción ${est}%: dudoso. Pide otra lectura: escaneo ${CONFIG.SCANNER.TYPES[other].name} (acierta el ${pct(other)}) o INTERROGAR (análisis de voz).`;

    return html`
        <div className="coach-hint flex-none flex items-start gap-2 px-3 py-2 border-b border-amber-700/40 bg-amber-950/20 text-[11px] leading-snug text-amber-300" role="status" aria-live="polite">
            <span className="font-black tracking-widest text-amber-500 whitespace-nowrap">INDUCCIÓN ${emergency ? 3 : Math.min(processed + 1, 2)}/3</span>
            <span>${text}</span>
        </div>
    `;
});
