/**
 * SYSTEMINFO.JS (MOD-07)
 * Panel de ayuda rápida y referencia de comandos.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';

export const SystemInfo = () => {
    const commands = [
        { cmd: '/status', desc: 'Estado de los sistemas' },
        { cmd: '/scan ', desc: 'Inicia análisis [tipo]' },
        { cmd: '/interrogate', desc: 'Enlace neural con sujeto' },
        { cmd: '/repair', desc: 'Gana estabilidad con energía' }
    ];

    const openManual = () => {
        bus.emit('OPEN_MODAL', {
            title: 'MANUAL DE USUARIO - BASTIÓN NAKASTHU',
            content: html`
                <div className="space-y-4">
                    <section>
                        <h3 className="text-zinc-300 font-bold underline">OBJETIVO OPERATIVO</h3>
                        <p>Mantener la integridad del Bastión procesando o autorizando a los sujetos que emergen del portal. La energía es vital para el funcionamiento; la estabilidad es vital para su cordura.</p>
                    </section>
                    <section>
                        <h3 className="text-zinc-300 font-bold underline">PROTOCOLOS</h3>
                        <ul className="list-disc list-inside">
                            <li><span className="text-emerald-500">AUTORIZAR:</span> Permite el paso. Consume energía pero puede aumentar la estabilidad si el sujeto es puro.</li>
                            <li><span className="text-red-500">SACRIFICAR:</span> Procesa al sujeto como biomasa. Genera energía. Sacrificar inocentes daña gravemente la estabilidad.</li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="text-zinc-300 font-bold underline">EVENTOS DE ECLIPSE</h3>
                        <p>Cuando el ciclo orbital alcanza el cenit, se produce un Eclipse. Los sensores fallan y la corrupción se acelera. Mantenga la calma y observe los patrones de resonancia.</p>
                    </section>
                </div>
            `
        });
    };

    const openLore = () => {
        state.gameStatus = 'LORE_ARCHIVE';
    };

    const handleClick = (cmd) => {
        if (window.__TERMINAL_INPUT__) {
            window.__TERMINAL_INPUT__.setInput(cmd);
            window.__TERMINAL_INPUT__.focus();
        }
    };

    return html`
        <div className="flex flex-col h-full p-3 bg-transparent font-mono overflow-hidden">
            <header className="border-b-[0.5px] border-zinc-800 pb-2 mb-3 flex justify-between items-center">
                <h2 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    QUICK_REF / v1.0
                </h2>
                <div className="w-2 h-2 bg-emerald-900/40"></div>
            </header>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                <div className="flex flex-col gap-2">
                    ${commands.map(item => html`
                        <button 
                            key=${item.cmd}
                            onClick=${() => handleClick(item.cmd)}
                            className="group flex flex-col items-start text-left transition-all duration-200 border-l-[1px] border-zinc-800 hover:border-emerald-500/50 pl-3 py-1 hover:bg-zinc-900/30"
                        >
                            <span className="text-[12px] text-emerald-500 group-hover:text-emerald-400 font-bold tracking-tight transition-colors">
                                ${item.cmd}
                            </span>
                            <span className="text-[12px] text-zinc-400 group-hover:text-zinc-300 uppercase leading-none mt-1 opacity-70">
                                ${item.desc}
                            </span>
                        </button>
                    `)}
                </div>

                <div className="pt-4 border-t-[0.5px] border-zinc-800/50 flex flex-col gap-3">
                    <h3 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Documentación</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <button 
                            onClick=${openManual}
                            className="flex items-center gap-3 px-3 py-2 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all text-left group"
                        >
                            <div className="w-1.5 h-1.5 bg-zinc-700 group-hover:bg-zinc-400"></div>
                            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider font-bold">Manual de Usuario</span>
                        </button>
                        <button 
                            onClick=${openLore}
                            className="flex items-center gap-3 px-3 py-2 bg-cyan-950/5 border border-cyan-900/20 hover:border-cyan-500/30 transition-all text-left group"
                        >
                            <div className="w-1.5 h-1.5 bg-cyan-900/40 group-hover:bg-cyan-500/60 animate-pulse"></div>
                            <span className="text-[11px] text-cyan-900/60 group-hover:text-cyan-400/80 uppercase tracking-wider font-bold">Archivo de Lore</span>
                        </button>
                    </div>
                </div>
               
            </div>

            <footer className="mt-auto pt-3 border-t-[0.5px] border-zinc-800 flex justify-between items-center opacity-40">
                <div className="flex gap-1">
                    <div className="w-1.5 h-3 bg-zinc-800"></div>
                    <div className="w-1.5 h-3 bg-zinc-800"></div>
                </div>
                <span className="text-[12px] uppercase tracking-widest font-bold text-zinc-500">Ref_Active</span>
            </footer>
        </div>
    `;
};
