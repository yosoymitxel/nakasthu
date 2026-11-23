/**
 * REPORTSINTERLUDE.JS
 * Cinemática 7: doce informes con el mensajero en camino. Sellar o leer; el séptimo es la galería siete.
 */
import { html } from '../../utils/html.js';
import { REPORTS } from '../../../data/interludes.js';
import { createReportsRun, readReport, sealReport, timeoutReports, reportsVerdict } from '../../../systems/Interludes.js';

const { memo, useState, useEffect } = React;
const pad = (n) => String(n).padStart(2, '0');

export const ReportsInterlude = memo(({ onDone }) => {
    const [run, setRun] = useState(() => createReportsRun(REPORTS));
    const [left, setLeft] = useState(REPORTS.seconds);

    useEffect(() => {
        if (run.done) return;
        if (left <= 0) { setRun(timeoutReports); return; }
        const t = setTimeout(() => setLeft(l => l - 1), 1000);
        return () => clearTimeout(t);
    }, [left, run.done]);

    const item = REPORTS.items[run.index];
    const isRead = run.read.includes(run.index);

    return html`
        <div className="reports-interlude fixed inset-0 z-[700] bg-black overflow-y-auto font-mono" onClick=${(e) => e.stopPropagation()}>
            <div className="w-full max-w-xl mx-auto p-4 sm:p-8 flex flex-col gap-4 min-h-full justify-center">
                <div className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase">${REPORTS.head}</div>
                <p className="text-sm text-zinc-300 leading-relaxed">${REPORTS.intro}</p>
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                    <span className="text-zinc-500">Sellados <span data-sealed className="text-zinc-200">${run.sealed}</span>/${run.total}</span>
                    <span className=${left <= 5 && !run.done ? 'text-red-400' : 'text-zinc-500'}>${REPORTS.clock} 0:${pad(Math.max(0, left))}</span>
                </div>
                <div className="h-1 bg-zinc-900 overflow-hidden">
                    <div className="h-full bg-zinc-500 transition-all duration-1000 ease-linear" style=${{ width: `${(Math.max(0, left) / REPORTS.seconds) * 100}%` }}></div>
                </div>

                ${!run.done ? html`
                    <div key=${run.index} className="border border-zinc-700 bg-zinc-950 p-4 space-y-2" style=${{ animation: 'fade-in 0.25s ease-out' }}>
                        <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
                            <span>Informe estructural ${pad(run.index + 1)}/${run.total}</span><span>${item.day}</span>
                        </div>
                        <div data-report className="text-base text-zinc-100 uppercase tracking-wider">${item.where}</div>
                        ${isRead && html`<p className="text-[12px] text-zinc-400 leading-relaxed">${REPORTS.body}</p>`}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button data-act="leer" disabled=${isRead} onClick=${() => setRun(readReport)}
                                className="min-h-[48px] border border-zinc-700 text-zinc-400 text-[11px] uppercase tracking-widest disabled:opacity-30 hover:bg-zinc-900">Leer</button>
                            <button data-act="sellar" onClick=${() => setRun(sealReport)}
                                className="min-h-[48px] border border-zinc-400 text-zinc-100 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 active:bg-zinc-700">Sellar y firmar</button>
                        </div>
                    </div>
                ` : html`
                    <div className="space-y-4" style=${{ animation: 'fade-in 0.6s ease-out' }}>
                        <p data-verdict className="text-sm text-zinc-300 leading-relaxed">${reportsVerdict(REPORTS, run)}</p>
                        <button data-act="seguir" onClick=${onDone} className="cine-next on">Continuar</button>
                    </div>
                `}
            </div>
        </div>
    `;
});

ReportsInterlude.displayName = 'ReportsInterlude';
