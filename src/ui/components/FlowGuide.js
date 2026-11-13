/**
 * FLOWGUIDE.JS
 * Tira de tres pasos que une los paneles: escanear -> interrogar -> sentenciar.
 * Marca qué toca ahora y lleva al panel correspondiente al pulsar.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';

export const FlowGuide = ({ isSectarian, hasSubject, scanDone, scanName, talking }) => {
    const color = isSectarian ? '#a855f7' : '#f59e0b';
    const words = isSectarian
        ? { scan: 'Revelar', talk: 'Comulgar', judge: 'Dictamen', scanDone: 'Esencia leída', talkHint: 'Opcional · gasta dogma', judgeWait: 'Falta la revelación', judgeGo: 'Purgar o consagrar', empty: 'Sin alma en el altar' }
        : { scan: 'Escanear', talk: 'Interrogar', judge: 'Sentencia', scanDone: 'Validado', talkHint: 'Opcional · gasta energía', judgeWait: 'Falta el escaneo', judgeGo: 'Sacrificar o autorizar', empty: 'Cámara vacía' };

    const steps = [
        {
            name: words.scan,
            hint: !hasSubject ? words.empty : scanDone ? words.scanDone : scanName,
            state: scanDone ? 'done' : hasSubject ? 'now' : '',
            go: () => bus.emit('UI_FOCUS_AREA', { area: 'L_UPPER', color })
        },
        {
            name: words.talk,
            hint: words.talkHint,
            state: talking ? 'now' : '',
            go: () => bus.emit('UI_FOCUS_AREA', { area: 'C_MAIN', color })
        },
        {
            name: words.judge,
            hint: scanDone ? words.judgeGo : words.judgeWait,
            state: scanDone && !talking ? 'now' : '',
            go: () => bus.emit('UI_FOCUS_AREA', { area: scanDone ? 'C_MAIN' : 'L_UPPER', color })
        }
    ];

    return html`
        <div className="flow-guide flex-none border-b border-zinc-800/80 bg-black/40" style=${{ '--flow-color': color }}>
            ${steps.map((s, i) => html`
                <button key=${i} className=${`flow-step ${s.state}`} onClick=${s.go}>
                    <span className="flow-num">${s.state === 'done' ? '✓' : i + 1}</span>
                    <span className="flow-text">
                        <span className="flow-name">${s.name}</span>
                        <span className="flow-hint">${s.hint}</span>
                    </span>
                </button>
            `)}
        </div>
    `;
};
