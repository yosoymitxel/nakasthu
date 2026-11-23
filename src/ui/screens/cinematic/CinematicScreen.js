/**
 * CINEMATICSCREEN.JS
 * Pasos narrativos tipo 'cinematic' y preludios de las mecánicas: plano 3D a pantalla completa
 * (lo mueve Backdrop3D según la página), franjas de cine y el texto como subtítulo.
 * El formato de las páginas está en la cabecera de stepsConfig.js.
 */
import { html } from '../../utils/html.js';
import { useGameState } from '../../hooks/useGameState.js';
import { state } from '../../../core/State.js';
import { bus } from '../../../core/Bus.js';
import { audio } from '../../../core/Audio.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { factionSystem } from '../../../systems/FactionSystem.js';
import { narrativeFlags } from '../../../systems/NarrativeFlags.js';
import { PixelPortrait } from '../../components/PixelPortrait.js';
import { pagesFor, corruptText } from '../../../utils/cinematicUtils.js';
import { PLAYS } from './plays.js';

import { Icon } from '../../shared/Icon.js';
const { useState, useEffect, useLayoutEffect, useRef, memo } = React;

const PAUSE = '¦';
// Lo que dura el fundido a negro de Backdrop3D: la frase entra sobre la imagen nueva, no sobre la vieja.
const CUT_MS = 650;
const LEAVE_MS = 450;

export const CinematicScreen = memo(({ config, pages: introPages = null, onDone = null }) => {
    const currentStep = useGameState('currentStep');
    const endingFaction = useGameState('endingFaction');
    // Página y caracteres visibles cambian juntos: nunca se pinta la página nueva con el texto de la anterior
    const [cursor, setCursor] = useState({ page: 0, shown: 0 });
    const [leaving, setLeaving] = useState(false);
    // Páginas con `play`: escena jugable antes de su texto; se juega una vez por página
    const [played, setPlayed] = useState(() => new Set());
    const typing = useRef(null);

    const faction = endingFaction || factionSystem.getDominance();
    const pages = introPages
        ? introPages.filter(p => narrativeFlags.matches(p.if)).map(p => ({ title: config.name, ...p }))
        : pagesFor(config, faction);
    const tone = config.meta?.endings ? (config.meta.endings[faction] ? `cine-${faction}` : 'cine-orden') : '';
    const page = Math.min(cursor.page, pages.length - 1);
    const current = pages[page];
    const raw = current.corrupt ? corruptText(current.text) : current.text;
    const content = raw.split(PAUSE).join('');
    const shown = cursor.shown;
    const done = shown >= content.length;
    const Play = current.play && !played.has(page) ? PLAYS[current.play] : null;
    const last = page >= pages.length - 1;
    const prevShot = useRef(undefined);

    useLayoutEffect(() => { setCursor({ page: 0, shown: 0 }); setPlayed(new Set()); }, [config.name, endingFaction]);
    // Antes de pintar: el plano de la página sale a la vez que su texto
    useLayoutEffect(() => { state.cineShot = current.shot || null; }, [current.shot]);
    useEffect(() => () => { state.cineShot = null; audio.cue(null, 1); }, []);
    useEffect(() => { audio.cue(current.sound || null, current.music ?? 1); }, [page, current.sound, current.music]);

    // Tecleo. Si el plano cambia, espera al fundido; `¦` es una pausa de un segundo que no se pinta
    useEffect(() => {
        if (Play) return;
        const cut = prevShot.current !== undefined && (current.shot || null) !== prevShot.current;
        prevShot.current = current.shot || null;
        const speed = current.speed || 32;
        let n = 0;
        const step = () => {
            if (n >= raw.length) return;
            const ch = raw[n++];
            if (ch === PAUSE) { typing.current = setTimeout(step, 1000); return; }
            setCursor(c => (c.page === page ? { page, shown: Math.min(content.length, c.shown + 1) } : c));
            typing.current = setTimeout(step, speed);
        };
        typing.current = setTimeout(step, cut ? CUT_MS : 150);
        return () => clearTimeout(typing.current);
    }, [page, raw, !!Play]);

    const finish = () => {
        // Tras el FIN del epílogo se vuelve al inicio, sin pantalla de balance
        if (current.black && !current.clock && last && config.meta?.endings) { bus.emit('SYSTEM_FORCE_RESET'); return state.resetState(); }
        if (onDone) return onDone();
        gameSequencer.nextStep();
    };

    // Un toque completa el texto; el siguiente pasa de página o, al final, funde a negro y avanza
    const advance = () => {
        if (leaving || Play) return;
        if (!done) { clearTimeout(typing.current); return setCursor({ page, shown: content.length }); }
        if (!last) return setCursor({ page: page + 1, shown: 0 });
        setLeaving(true);
        state.cineShot = null;
        setTimeout(finish, LEAVE_MS);
    };

    // Páginas sin botón: pasan solas
    useEffect(() => {
        if (!done || !current.auto) return;
        const t = setTimeout(advance, current.auto);
        return () => clearTimeout(t);
    }, [done, page]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [done, content, last, page, leaving, !!Play]);

    if (Play) return html`<${Play} onDone=${() => setPlayed(p => new Set(p).add(page))} />`;

    const black = current.black || current.doc || current.photo || current.clock;
    // La pradera se ve limpia: sin la viñeta violeta del final
    const clear = !black && String(current.shot || '').startsWith('meadow');
    return html`
        <div className=${`cinematic-screen ${tone} ${black ? 'cine-black' : ''} ${clear ? 'cine-clear' : ''} ${leaving ? 'cine-leaving' : ''}`} onClick=${advance}>
            <div className="cine-bar cine-top">
                <span className="cine-seq">SECUENCIA ${String(currentStep).padStart(2, '0')}</span>
                <span className="cine-rec"><i></i>ARCHIVO ZHYR</span>
            </div>

            ${current.title ? html`<h2 key=${current.title} className="cine-title">${current.title}</h2>` : html`<span></span>`}

            ${black && html`
                <div key=${page} className="cine-doc">
                    ${current.clock && html`<div className="cine-clock">03:17</div>`}
                    ${current.doc && html`<div className="cine-doc-head">${current.doc}</div>`}
                    ${current.photo && html`
                        <div className="cine-photo">
                            <figure><${PixelPortrait} seed=${current.photo} /><figcaption>31 años · Dispay</figcaption></figure>
                            <figure><${PixelPortrait} seed=${current.photo} /><figcaption>10 años · Talok</figcaption></figure>
                        </div>
                    `}
                </div>
            `}

            <div className="cine-bar cine-bottom">
                <p className=${`cine-text ${current.corrupt ? 'cine-corrupt' : ''}`}>
                    ${content.slice(0, shown)}${!done && html`<span className="cine-caret"></span>`}
                </p>
                ${current.echo && done && html`<p className="cine-echo">${current.echo}</p>`}
                ${current.auto ? html`<span className="cine-next-gap"></span>` : html`
                    <button className=${`cine-next ${done ? 'on' : ''}`}>
                        ${done ? html`<span>${last ? 'Continuar' : 'Siguiente'} <${Icon} name="chevron-right" /></span>` : html`<span>Saltar <${Icon} name="next" /></span>`}
                    </button>
                `}
            </div>
        </div>
    `;
});

CinematicScreen.displayName = 'CinematicScreen';
