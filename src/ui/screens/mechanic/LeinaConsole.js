/**
 * LEINACONSOLE.JS
 * Paso 11 jugable: la consola del hangar (cap. 15). El jugador teclea o pulsa los cuatro comandos;
 * Kamin pide verlo; al terminar, la mano en la espalda y lo que Leina pensó (páginas `console.push`).
 * La lógica está en systems/LeinaConsole.js; aquí sólo se pinta y se despacha.
 */
import { html } from '../../utils/html.js';
import { state } from '../../../core/State.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { narrativeFlags } from '../../../systems/NarrativeFlags.js';
import { createConsoleRun, pressCommand, matchCommand } from '../../../systems/LeinaConsole.js';
import { CinematicScreen } from '../cinematic/CinematicScreen.js';

const { memo, useState, useEffect, useRef } = React;

const LINE_GAP = 0.9; // s entre las réplicas de la apertura
const WHO_CLASS = { KAMIN: 'text-purple-300', LEINA: 'text-cyan-300' };

export const LeinaConsole = memo(({ config }) => {
    const cfg = config.meta.console;
    const { leftOption, rightOption } = config.meta;
    const [run, setRun] = useState(() => createConsoleRun(cfg));
    const [typed, setTyped] = useState('');
    const [ready, setReady] = useState(false);
    const [pushing, setPushing] = useState(false);
    const [fine] = useState(() => !!window.matchMedia?.('(pointer: fine)').matches);
    const inputRef = useRef(null);

    const opening = cfg.kamin.filter(l => l.at === 0).length;
    useEffect(() => {
        const t = setTimeout(() => setReady(true), opening * LINE_GAP * 1000);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => { if (ready && fine) inputRef.current?.focus(); }, [ready]);
    // El portal de fondo sigue a la secuencia: se pliega si va al revés
    useEffect(() => { if (!pushing) state.cineShot = run.faction === 'orden' && run.entered.length ? 'portalClose' : 'portal'; }, [run.faction, run.entered.length, pushing]);
    useEffect(() => {
        if (!run.done) return;
        const t = setTimeout(() => setPushing(true), 1400);
        return () => clearTimeout(t);
    }, [run.done]);

    const press = (id) => { if (ready) setRun(r => pressCommand(cfg, r, id)); };
    const submit = (e) => {
        e.preventDefault();
        const cmd = matchCommand(cfg, typed);
        setTyped('');
        if (cmd) press(cmd.id);
        else if (typed.trim()) setRun(r => ({ ...r, error: 'COMANDO DESCONOCIDO.' }));
    };

    if (pushing) {
        return html`<${CinematicScreen} config=${config} pages=${cfg.push} onDone=${() => {
            gameSequencer.setEnding(run.faction);
            gameSequencer.nextStep();
        }} />`;
    }

    const stage = run.entered.length;
    const lines = cfg.kamin.filter(l => l.at <= stage);
    const width = Math.max(0, Math.min(100, (run.vortex / 11) * 100));
    const status = run.error
        ? html`<span className="text-red-400">${run.error}</span>`
        : run.armed
            ? html`<span className="text-amber-400 animate-pulse">CONFIRMAR: PULSA OTRA VEZ</span>`
            : run.done
                ? html`<span className="text-zinc-300">SECUENCIA COMPLETA. VÓRTICE ${run.vortex} M.</span>`
                : html`<span className="text-zinc-500">Cuatro comandos. Uno pide doble pulsación.</span>`;
    const echoes = (opt) => (opt.echoes || []).filter(e => narrativeFlags.matches(e.if));
    const cheat = (opt, order, tone) => html`
        <div className=${`border p-3 space-y-1 ${tone === 'purple' ? 'border-purple-900/50' : 'border-cyan-900/50'}`}>
            <div className=${`text-[10px] font-bold tracking-widest uppercase ${tone === 'purple' ? 'text-purple-400' : 'text-cyan-400'}`}>${order} · ${opt.action}</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">${opt.quote}</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed uppercase">${opt.price}</p>
            ${echoes(opt).map(e => html`<p key=${e.text} className="text-[11px] text-zinc-600 leading-relaxed">${e.text}</p>`)}
        </div>
    `;

    return html`
        <div className="leina-console fixed inset-0 bg-black/80 z-[450] overflow-y-auto font-mono">
            <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800 pb-2">
                    <h2 className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase">Hangar · consola de operación</h2>
                    <div className="text-[11px] text-zinc-300 tracking-widest uppercase">
                        Vórtice <span data-vortex className=${run.faction === 'orden' ? 'text-cyan-300' : 'text-purple-300'}>${String(run.vortex).replace('.', ',')}</span> m · Fila ${cfg.queue}
                    </div>
                </div>
                <div className="h-1 bg-zinc-900 overflow-hidden">
                    <div className=${`h-full transition-all duration-700 ${run.faction === 'orden' ? 'bg-cyan-500' : 'bg-purple-500'}`} style=${{ width: `${width}%` }}></div>
                </div>
                <p className="text-[11px] text-zinc-500 italic">${cfg.note.replace(' estable.', '')} <span className="underline decoration-double">estable</span>.</p>

                <div className="space-y-2 min-h-[9rem]">
                    ${lines.map((l, i) => html`
                        <p key=${i} className=${`text-sm leading-relaxed ${l.who ? WHO_CLASS[l.who] : 'text-zinc-400 italic'}`}
                           style=${{ animation: `fade-in 0.6s ease-out ${l.at === 0 ? i * LINE_GAP : 0}s both` }}>
                            ${l.who && html`<span className="text-[10px] text-zinc-600 tracking-widest uppercase mr-2">${l.who}</span>`}${l.who ? `—${l.text}` : l.text}
                        </p>
                    `)}
                </div>

                <div className="border border-zinc-800 bg-zinc-950/80 p-3 sm:p-4 space-y-3">
                    <div className="flex gap-2" aria-label="Secuencia">
                        ${cfg.commands.map((_, i) => html`
                            <div key=${i} className=${`flex-1 h-7 border text-[10px] flex items-center justify-center uppercase tracking-widest ${run.entered[i] ? 'border-zinc-400 text-zinc-200' : 'border-zinc-800 text-zinc-700'}`}>
                                ${run.entered[i] || i + 1}
                            </div>
                        `)}
                    </div>
                    <div className="text-[11px] tracking-widest uppercase min-h-[1.2rem]">${status}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        ${cfg.commands.map((c, i) => html`
                            <button key=${c.id} data-cmd=${c.id} disabled=${!ready || run.done}
                                onClick=${() => press(c.id)}
                                className=${`min-h-[52px] px-2 py-3 border text-[11px] font-bold tracking-widest uppercase transition-colors disabled:opacity-40 ${run.armed && c.double ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-200 hover:bg-zinc-800 active:bg-zinc-700'}`}>
                                <span className="text-zinc-600 mr-1">${i + 1}</span>${c.label}
                            </button>
                        `)}
                    </div>
                    ${fine && html`
                        <form onSubmit=${submit} className="flex items-center gap-2 border-t border-zinc-800 pt-3">
                            <span className="text-zinc-500">></span>
                            <input ref=${inputRef} value=${typed} disabled=${!ready || run.done}
                                onInput=${(e) => setTyped(e.target.value)}
                                placeholder="escribe un comando y pulsa Intro"
                                className="flex-1 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-700" />
                        </form>
                    `}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${cheat(rightOption, 'En orden · 1 2 3 4', 'purple')}
                    ${cheat(leftOption, 'Al revés · 4 3 2 1', 'cyan')}
                </div>
            </div>
        </div>
    `;
});

LeinaConsole.displayName = 'LeinaConsole';
