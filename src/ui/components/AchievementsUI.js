/**
 * ACHIEVEMENTSUI.JS
 * Aviso al desbloquear un logro y panel "Expediente" con todos, agrupados.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { achievements } from '../../systems/Achievements.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from '../../data/achievements.js';

import { Icon } from '../shared/Icon.js';
const { useState, useEffect, useRef } = React;

export const AchievementToast = () => {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const onUnlock = (def) => {
            setQueue(q => [...q, def]);
            setTimeout(() => setQueue(q => q.filter(d => d !== def)), 4200);
        };
        bus.on('ACHIEVEMENT_UNLOCKED', onUnlock);
        return () => bus.off('ACHIEVEMENT_UNLOCKED', onUnlock);
    }, []);

    if (!queue.length) return null;
    return html`
        <div className="ach-toasts" role="status">
            ${queue.slice(0, 3).map(def => html`
                <div key=${def.id} className="ach-toast">
                    <span className="ach-mark"><${Icon} name="trophy" tone="warn" /></span>
                    <span className="ach-body">
                        <span className="ach-kicker">Logro desbloqueado</span>
                        <span className="ach-name">${def.name}</span>
                        <span className="ach-desc">${def.desc}</span>
                    </span>
                </div>
            `)}
        </div>
    `;
};

export const AchievementsPanel = ({ isOpen, onClose }) => {
    const closeRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [isOpen]);

    if (!isOpen) return null;
    const done = ACHIEVEMENTS.filter(a => achievements.has(a.id)).length;

    return html`
        <div className="modal-overlay z-[1000]" onClick=${onClose}>
            <div className="ach-panel" role="dialog" aria-modal="true" aria-label="Expediente del operador" onClick=${e => e.stopPropagation()}>
                <header className="ach-head">
                    <div>
                        <p className="ach-kicker">Expediente del operador</p>
                        <h2 className="ach-title">Logros ${done} / ${ACHIEVEMENTS.length}</h2>
                    </div>
                    <button ref=${closeRef} onClick=${onClose} className="ach-close" aria-label="Cerrar"><${Icon} name="close" /></button>
                </header>
                <div className="ach-bar"><i style=${{ width: `${(done / ACHIEVEMENTS.length) * 100}%` }}></i></div>

                <div className="ach-scroll custom-scrollbar">
                    ${ACHIEVEMENT_GROUPS.map(g => html`
                        <section key=${g.id}>
                            <h3 className="ach-group">${g.name}</h3>
                            <div className="ach-grid">
                                ${ACHIEVEMENTS.filter(a => a.group === g.id).map(a => {
                                    const got = achievements.has(a.id);
                                    const hidden = a.secret && !got;
                                    const prog = achievements.progress(a);
                                    return html`
                                        <div key=${a.id} className=${`ach-card ${got ? 'got' : ''}`}>
                                            <span className="ach-mark">${got ? html`<${Icon} name="trophy" tone="warn" />` : html`<${Icon} name="lock" tone="muted" />`}</span>
                                            <span className="ach-body">
                                                <span className="ach-name">${hidden ? '???' : a.name}</span>
                                                <span className="ach-desc">${hidden ? 'Clasificado hasta que ocurra.' : a.desc}</span>
                                                ${prog !== null && !got && html`<span className="ach-prog">${prog} / ${a.goal}</span>`}
                                            </span>
                                        </div>
                                    `;
                                })}
                            </div>
                        </section>
                    `)}
                </div>
            </div>
        </div>
    `;
};
