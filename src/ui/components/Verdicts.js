/**
 * VERDICTS.JS
 * Paneles alrededor del sujeto y sus sentencias: tira de veredictos del turno, registro completo
 * y ficha del sujeto. Los modales van en un portal: los módulos llevan transform y descolocan los fixed.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { verdictLog } from '../../systems/VerdictLog.js';
import { SCAN_TYPES } from '../../systems/Scanner.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { STEPS_CONFIG } from '../../data/stepsConfig.js';
import { useGameState } from '../hooks/useGameState.js';
import { PixelPortrait, morphFor } from './PixelPortrait.js';
import { findLoreCharacter } from '../../data/loreCharactersConfig.js';

const { useState, useEffect, useRef } = React;

const MORPH_NAME = { humano: 'Humano', clon: 'Clon', zhyriano: 'Zhyriano', nakari: 'Nakari', quitinoso: 'Quitinoso', cristalino: 'Cristalino' };

const useVerdicts = () => {
    const [, tick] = useState(0);
    useEffect(() => {
        const on = () => tick(n => n + 1);
        bus.on('VERDICT_LOGGED', on);
        return () => bus.off('VERDICT_LOGGED', on);
    }, []);
    return verdictLog.entries;
};

const Modal = ({ label, onClose, children }) => {
    const closeRef = useRef(null);
    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, []);
    return ReactDOM.createPortal(html`
        <div className="modal-overlay z-[1000]" onClick=${onClose}>
            <div className="ach-panel" role="dialog" aria-modal="true" aria-label=${label} onClick=${e => e.stopPropagation()}>
                <header className="ach-head">
                    <h2 className="ach-title">${label}</h2>
                    <button ref=${closeRef} onClick=${onClose} className="ach-close" aria-label="Cerrar">✕</button>
                </header>
                <div className="ach-scroll custom-scrollbar">${children}</div>
            </div>
        </div>
    `, document.body);
};

/** Un veredicto como cuadrito: verde pasó, rojo no pasó, con aspa si fue un error. */
const Pip = ({ entry }) => html`
    <span className=${`vd-pip ${entry.action === 'authorize' ? 'pass' : 'kill'} ${entry.error ? 'error' : ''}`} title=${entry.id}>${entry.error ? '✕' : ''}</span>
`;

export const VerdictPips = ({ step, max = 14 }) => {
    const all = useVerdicts();
    const entries = all.filter(e => e.step === step);
    return html`
        <span className="vd-pips">
            ${entries.slice(-max).map((e, i) => html`<${Pip} key=${i} entry=${e} />`)}
        </span>
    `;
};

const VerdictRow = ({ entry, labels, hooded }) => html`
    <div className=${`vd-row ${entry.error ? 'error' : ''}`}>
        <${PixelPortrait} seed=${entry.id} morph=${morphFor(entry.species, entry.id)} hooded=${hooded} className="vd-face" />
        <span className="vd-who">
            <span className="vd-id">${entry.id}</span>
            <span className="vd-role">${entry.role}</span>
        </span>
        <span className="vd-scans">${entry.scans.map(s => html`<i key=${s}>${labels.scans[s] || SCAN_TYPES[s]?.name || s}</i>`)}</span>
        <span className=${`vd-verdict ${entry.action === 'authorize' ? 'pass' : 'kill'}`}>
            ${entry.action === 'authorize' ? '✓' : '✕'} ${entry.error ? '· error' : ''}
        </span>
    </div>
`;

/** Botón de la cuota: tira del turno y, al pulsar, el registro entero. */
export const VerdictLogButton = ({ step }) => {
    const [open, setOpen] = useState(false);
    const all = useVerdicts();
    const storyPath = useGameState('storyPath') || 0;
    const labels = PATH_CONFIGS[storyPath].bioscan;
    const steps = [...new Set(all.map(e => e.step))].reverse();

    return html`
        <button className="vd-button" onClick=${() => setOpen(true)} aria-label="Abrir registro de sentencias">
            <${VerdictPips} step=${step} />
            <span className="vd-more">registro ▸</span>
        </button>
        ${open && html`
            <${Modal} label="Registro de sentencias" onClose=${() => setOpen(false)}>
                ${all.length === 0 && html`<p className="ach-desc">Todavía no dictaste ninguna sentencia.</p>`}
                ${steps.map(s => html`
                    <section key=${s}>
                        <h3 className="ach-group">${STEPS_CONFIG[s]?.name || `Paso ${s}`}</h3>
                        ${all.filter(e => e.step === s).reverse().map((e, i) => html`<${VerdictRow} key=${i} entry=${e} labels=${labels} hooded=${storyPath === 1} />`)}
                    </section>
                `)}
            <//>
        `}
    `;
};

/** Ficha del sujeto: lo que ya se sabe de él, sin revelar lo que no se escaneó. */
export const SubjectCard = ({ subject, onClose }) => {
    const storyPath = useGameState('storyPath') || 0;
    const requiredScan = useGameState('requiredScan');
    const labels = PATH_CONFIGS[storyPath].bioscan;
    const morph = morphFor(subject.species, subject.id);
    const done = subject.scannedTypes || [];
    const loreChar = (subject.isLoreCore ? subject.loreCore : findLoreCharacter(subject.id, subject.name)) || null;

    return html`
        <${Modal} label=${`Ficha · ${subject.id}`} onClose=${onClose}>
            <div className="sc-card">
                <${PixelPortrait} seed=${subject.id} morph=${morph} hooded=${storyPath === 1} className="sc-face" />
                <div className="sc-data">
                    ${loreChar && html`
                        <div className="sc-line"><span>Estatus</span><b className="text-cyan-400">★ ${loreChar.name} ★</b></div>
                        <div className="sc-line"><span>Canon</span><b className="text-zinc-300 text-[10px] leading-tight">${loreChar.title}</b></div>
                    `}
                    <div className="sc-line"><span>Forma aparente</span><b>${MORPH_NAME[morph]}</b></div>
                    <div className="sc-line"><span>Rol declarado</span><b>${subject.type}</b></div>
                    <div className="sc-line"><span>Interrogado</span><b>${subject.hasBeenInterrogated ? 'sí' : 'no'}</b></div>
                    <div className="sc-meter" aria-label="Sincronía neural">
                        <span>Sincronía</span>
                        <i><em style=${{ width: `${subject.scannedData.neuralSync}%` }}></em></i>
                        <b>${subject.scannedData.neuralSync}%</b>
                    </div>
                </div>
            </div>
            <h3 className="ach-group">Escaneos</h3>
            <div className="sc-scans">
                ${Object.values(SCAN_TYPES).map(t => {
                    const count = subject.scanHistory?.[t.id] || 0;
                    return html`
                        <span key=${t.id} className=${`sc-scan ${done.includes(t.id) ? 'done' : ''} ${requiredScan === t.id ? 'required' : ''}`}>
                            <b>${done.includes(t.id) ? '✓' : '·'}</b>
                            ${labels.scans[t.id] || t.name}
                            ${count > 1 && html`<small>×${count}</small>`}
                        </span>
                    `;
                })}
            </div>
        <//>
    `;
};
