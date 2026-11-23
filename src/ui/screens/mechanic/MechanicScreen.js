/**
 * MECHANICSCREEN.JS
 * Pantalla para pasos de mecánicas especiales (Monolito, Juicio Final).
 */
import { html } from '../../utils/html.js';
import { SpecialMechanic } from '../../components/SpecialMechanic.js';
import { useGameState } from '../../hooks/useGameState.js';
import { bus } from '../../../core/Bus.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { LeinaConsole } from './LeinaConsole.js';
import { CinematicScreen } from '../cinematic/CinematicScreen.js';

const { memo, useState, useEffect } = React;

export const MechanicScreen = memo(({ config }) => {
    const currentStep = useGameState('currentStep');
    // Preludio (`intro`): páginas de cinemática antes de la mecánica; es el briefing de los pasos 2 y 11
    const [introDone, setIntroDone] = useState(!config.intro?.length);
    useEffect(() => setIntroDone(!config.intro?.length), [config.name]);

    const handleMonolithComplete = () => {
        gameSequencer.nextStep();
    };

    if (!introDone) return html`<${CinematicScreen} config=${config} pages=${config.intro} onDone=${() => setIntroDone(true)} />`;

    // Paso 11: la consola de Leina
    if (config.meta?.console) return html`<${LeinaConsole} config=${config} />`;

    // Por defecto: Casos 2 y 11 (Monolito)
    return html`
        <div className="mechanic-screen-monolith">
            <${SpecialMechanic} onComplete=${handleMonolithComplete} />
        </div>
    `;
});

MechanicScreen.displayName = 'MechanicScreen';
