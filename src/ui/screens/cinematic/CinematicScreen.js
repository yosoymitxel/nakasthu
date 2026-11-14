/**
 * CINEMATICSCREEN.JS
 * Pasos narrativos tipo 'cinematic': plano 3D del Bastión a pantalla completa (lo mueve Backdrop3D
 * según `config.shot`), franjas de cine, rótulo de secuencia y el texto como subtítulo.
 */
import { html } from '../../utils/html.js';
import { useGameState } from '../../hooks/useGameState.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { STEPS_CONFIG } from '../../../data/stepsConfig.js';
import { factionSystem } from '../../../systems/FactionSystem.js';

const { useState, useEffect, memo } = React;

export const CinematicScreen = memo(({ config }) => {
    const currentStep = useGameState('currentStep');
    const [shown, setShown] = useState(0);

    // El epílogo no trae texto: depende de la facción dominante
    let content = config.briefingText;
    if (config.name === 'Epílogo' && !content) {
        const endings = STEPS_CONFIG[12]?.meta?.endings;
        content = endings[factionSystem.getDominance()] || endings.orden;
    }
    content = content || '';
    const done = shown >= content.length;

    useEffect(() => {
        setShown(0);
        const timer = setInterval(() => setShown(n => {
            if (n >= content.length) { clearInterval(timer); return n; }
            return n + 1;
        }), 32);
        return () => clearInterval(timer);
    }, [content]);

    // Un toque completa el texto; el siguiente avanza
    const advance = () => (done ? gameSequencer.nextStep() : setShown(content.length));

    useEffect(() => {
        const onKey = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [done, content]);

    return html`
        <div className="cinematic-screen" onClick=${advance}>
            <div className="cine-bar cine-top">
                <span className="cine-seq">SECUENCIA ${String(currentStep).padStart(2, '0')}</span>
                <span className="cine-rec"><i></i>ARCHIVO ZHYR</span>
            </div>

            <h2 key=${config.name} className="cine-title">${config.name}</h2>

            <div className="cine-bar cine-bottom">
                <p className="cine-text">
                    ${content.slice(0, shown)}${!done && html`<span className="cine-caret"></span>`}
                </p>
                <button className=${`cine-next ${done ? 'on' : ''}`}>
                    ${done ? 'Continuar ▸' : 'Saltar ▸▸'}
                </button>
            </div>
        </div>
    `;
});

CinematicScreen.displayName = 'CinematicScreen';
