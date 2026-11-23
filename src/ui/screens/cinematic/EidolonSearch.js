/**
 * EIDOLONSEARCH.JS
 * Paso 10, preludio: el buscador público del paquete de Eidolon. Se escribe un nombre (o se toca uno sugerido).
 */
import { html } from '../../utils/html.js';
import { state } from '../../../core/State.js';
import { EIDOLON } from '../../../data/interludes.js';
import { searchEidolon } from '../../../systems/Interludes.js';

const { memo, useState } = React;

export const EidolonSearch = memo(({ onDone }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const mine = (state.missingList || []).filter(e => e.mine).map(e => e.name.replace(/, \d+$/, ''));
    // Sugerencias: las del libro y, al final, alguien que pasó por tu mesa
    const suggestions = [...EIDOLON.suggestions, ...mine.slice(-1)];

    const run = (q) => {
        const r = searchEidolon(EIDOLON, q, mine);
        if (r) setResults(list => [r, ...list.filter(x => x.query.toLowerCase() !== r.query.toLowerCase())].slice(0, 4));
        setQuery('');
    };

    return html`
        <div className="eidolon-search fixed inset-0 z-[700] bg-black overflow-y-auto font-mono">
            <div className="w-full max-w-xl mx-auto p-4 sm:p-8 flex flex-col gap-4 min-h-full justify-center">
                <div className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase">${EIDOLON.head}</div>
                <p className="text-sm text-zinc-300 leading-relaxed">${EIDOLON.intro}</p>
                <form onSubmit=${(e) => { e.preventDefault(); run(query); }} className="flex gap-2">
                    <input value=${query} onInput=${(e) => setQuery(e.target.value)} placeholder="Nombre"
                        aria-label="Nombre" enterKeyHint="search"
                        className="flex-1 min-h-[48px] bg-zinc-950 border border-zinc-700 px-3 text-base text-zinc-100 outline-none focus:border-zinc-400 placeholder:text-zinc-700" />
                    <button type="submit" className="min-h-[48px] px-4 border border-zinc-400 text-zinc-100 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800">Buscar</button>
                </form>
                <div className="flex flex-wrap gap-2">
                    ${suggestions.map(s => html`
                        <button key=${s} data-suggest=${s} onClick=${() => run(s)}
                            className="min-h-[40px] px-3 border border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-widest hover:bg-zinc-900">${s}</button>
                    `)}
                </div>
                <div className="space-y-3 min-h-[8rem]">
                    ${results.map((r, i) => html`
                        <div key=${r.query} data-result className=${`border-l-2 pl-3 space-y-1 ${r.lot ? 'border-red-800' : 'border-zinc-700'} ${i ? 'opacity-50' : ''}`} style=${{ animation: i ? 'none' : 'fade-in 0.4s ease-out' }}>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">${r.query}</div>
                            ${r.lines.map(l => html`<p key=${l} className="text-[13px] text-zinc-200 leading-relaxed">${l}</p>`)}
                        </div>
                    `)}
                </div>
                <button data-act="cerrar" onClick=${onDone} className="cine-next on self-center">${EIDOLON.close}</button>
            </div>
        </div>
    `;
});

EidolonSearch.displayName = 'EidolonSearch';
