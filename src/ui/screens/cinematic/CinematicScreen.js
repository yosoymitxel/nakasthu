/**
 * CINEMATICSCREEN.JS
 * Pasos narrativos tipo 'cinematic': plano 3D del Bastión a pantalla completa (lo mueve Backdrop3D
 * según `config.shot`), franjas de cine, rótulo de secuencia y el texto como subtítulo.
 */
import { html } from '../../utils/html.js';
import { useGameState } from '../../hooks/useGameState.js';
import { state } from '../../../core/State.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { STEPS_CONFIG } from '../../../data/stepsConfig.js';
import { factionSystem } from '../../../systems/FactionSystem.js';

import { Icon } from '../../shared/Icon.js';
const { useState, useEffect, memo } = React;

export const CinematicScreen = memo(({ config }) => {
    const currentStep = useGameState('currentStep');
    const endingFaction = useGameState('endingFaction');
    const [shown, setShown] = useState(0);
    const [page, setPage] = useState(0);

    // El epílogo no trae texto: sigue la elección final, no la facción dominante
    let pages = [{ title: config.name, text: config.briefingText || '' }];
    let tone = '';
    if (config.name === 'Epílogo' && !config.briefingText) {
        const endings = STEPS_CONFIG[12]?.meta?.endings;
        const faction = endingFaction || factionSystem.getDominance();
        tone = endings[faction] ? `cine-${faction}` : 'cine-orden';
        pages = (endings[faction] || endings.orden).pages;
    }
    const current = pages[Math.min(page, pages.length - 1)];
    const content = current.text;
    const done = shown >= content.length;
    const last = page >= pages.length - 1;

    useEffect(() => setPage(0), [config.name, endingFaction]);
    useEffect(() => { state.cineShot = current.shot || null; }, [current.shot]);
    useEffect(() => () => { state.cineShot = null; }, []);

    useEffect(() => {
        setShown(0);
        const timer = setInterval(() => setShown(n => {
            if (n >= content.length) { clearInterval(timer); return n; }
            return n + 1;
        }), 32);
        return () => clearInterval(timer);
    }, [content]);

    // Un toque completa el texto; el siguiente pasa de página o avanza
    const advance = () => {
        if (!done) return setShown(content.length);
        if (last) return gameSequencer.nextStep();
        setPage(page + 1);
    };

    useEffect(() => {
        const onKey = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [done, content, last, page]);

    return html`
        <div className=${`cinematic-screen ${tone} ${current.black ? 'cine-black' : ''}`} onClick=${advance}>
            <div className="cine-bar cine-top">
                <span className="cine-seq">SECUENCIA ${String(currentStep).padStart(2, '0')}</span>
                <span className="cine-rec"><i></i>ARCHIVO ZHYR</span>
            </div>

            <h2 key=${current.title} className="cine-title">${current.title}</h2>

            <div className="cine-bar cine-bottom">
                <p className="cine-text">
                    ${content.slice(0, shown)}${!done && html`<span className="cine-caret"></span>`}
                </p>
                <button className=${`cine-next ${done ? 'on' : ''}`}>
                    ${done ? html`<span>${last ? 'Continuar' : 'Siguiente'} <${Icon} name="chevron-right" /></span>` : html`<span>Saltar <${Icon} name="next" /></span>`}
                </button>
            </div>
        </div>
    `;
});

CinematicScreen.displayName = 'CinematicScreen';
