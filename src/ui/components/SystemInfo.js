/**
 * SYSTEMINFO.JS (MOD-07)
 * Panel de ayuda rápida y referencia de comandos.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';

export const SystemInfo = () => {
    const storyPath = useGameState('storyPath') || 0;
    const isSectarian = storyPath === 1;

    const commands = isSectarian ? [
        { cmd: '/vision', desc: 'Observar la esencia del santuario' },
        { cmd: '/revelacion ', desc: 'Inicia rito de revelación [tipo]' },
        { cmd: '/comunion', desc: 'Comunión espiritual con el alma' },
        { cmd: '/purificar', desc: 'Restaura pureza con esencia' }
    ] : [
        { cmd: '/status', desc: 'Estado de los sistemas' },
        { cmd: '/scan ', desc: 'Inicia análisis [tipo]' },
        { cmd: '/interrogate', desc: 'Enlace neural con sujeto' },
        { cmd: '/repair', desc: 'Gana estabilidad con energía' }
    ];

    const openManual = () => {
        bus.emit('UI_MODAL_OPEN', {
            title: isSectarian ? 'CÓDICE DE LA VERDAD - SANTUARIO NAKASTHU' : 'MANUAL DE USUARIO - BASTIÓN NAKASTHU',
            content: html`
                <div className="space-y-4">
                    <section>
                        <h3 className=${`font-bold underline ${isSectarian ? 'text-purple-400' : 'text-zinc-300'}`}>
                            ${isSectarian ? 'PROPÓSITO DIVINO' : 'OBJETIVO OPERATIVO'}
                        </h3>
                        <p>${isSectarian 
                            ? 'Preservar la santidad del Templo guiando a las almas que emergen del Velo. La esencia es la moneda de la fe; la pureza es el estado de su devoción.' 
                            : 'Mantener la integridad del Bastión procesando o autorizando a los sujetos que emergen del portal. La energía es vital para el funcionamiento; la estabilidad es vital para su cordura.'}</p>
                    </section>
                    <section>
                        <h3 className=${`font-bold underline ${isSectarian ? 'text-purple-400' : 'text-zinc-300'}`}>
                            ${isSectarian ? 'RITUALES DE PASO' : 'PROTOCOLOS'}
                        </h3>
                        <ul className="list-disc list-inside">
                            <li>
                                <span className=${isSectarian ? 'text-purple-400' : 'text-emerald-500'}>
                                    ${isSectarian ? 'GUIAR ALMA:' : 'AUTORIZAR:'}
                                </span> 
                                ${isSectarian ? 'Permite el ascenso. Consume esencia pero fortalece la pureza si el alma es digna.' : 'Permite el paso. Consume energía pero puede aumentar la estabilidad si el sujeto es puro.'}
                            </li>
                            <li>
                                <span className="text-red-500">
                                    ${isSectarian ? 'ENTREGAR:' : 'REASIGNAR A PRISIAT:'}
                                </span> 
                                ${isSectarian ? 'Baja el alma a la cámara del hangar: paga la diferencia. Genera esencia. Entregar almas puras corrompe su devoción.' : 'Reasigna al sujeto a las galerías de Prisiat. Retorno previsto: ninguno. Genera energía. Reasignar a alguien sano daña la estabilidad.'}
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className=${`font-bold underline ${isSectarian ? 'text-purple-400' : 'text-zinc-300'}`}>
                            ${isSectarian ? 'EL GRAN ECLIPSE' : 'EVENTOS DE ECLIPSE'}
                        </h3>
                        <p>${isSectarian 
                            ? 'Cuando los soles se alinean, el Velo se desgarra. La visión se nubla y la corrupción acecha. Manténgase en oración y observe la resonancia de las almas.' 
                            : 'Cuando el ciclo orbital alcanza el cenit, se produce un Eclipse. Los sensores fallan y la corrupción se acelera. Mantenga la calma y observe los patrones de resonancia.'}</p>
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
        <div className=${`flex flex-col h-full p-3 font-mono overflow-hidden relative ${isSectarian ? 'bg-[#0a0812] shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]' : 'bg-transparent'}`}>
            ${isSectarian && html`
                <!-- Efecto Onírico: Aura Púrpura -->
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-transparent to-transparent" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-900/10 blur-[40px] animate-pulse" />
                </div>
            `}
            <header className=${`border-b-[0.5px] pb-2 mb-3 flex justify-between items-center relative z-10 ${isSectarian ? 'border-purple-900/30' : 'border-zinc-800'}`}>
                <h2 className=${`text-[12px] font-black uppercase tracking-[0.3em] ${isSectarian ? 'text-purple-500' : 'text-zinc-400'}`}>
                    ${isSectarian ? 'CÓDICE_DE_REVELACIONES' : 'QUICK_REF / v1.0'}
                </h2>
                <div className=${`w-2 h-2 ${isSectarian ? 'bg-purple-900/40 shadow-[0_0_5px_rgba(168,85,247,0.3)]' : 'bg-emerald-900/40'}`}></div>
            </header>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative z-10">
                <div className="flex flex-col gap-2">
                    ${commands.map(item => html`
                        <button 
                            key=${item.cmd}
                            onClick=${() => handleClick(item.cmd)}
                            className=${`group flex flex-col items-start text-left transition-all duration-200 border-l-[1px] pl-3 py-1 hover:bg-zinc-900/30 
                                ${isSectarian ? 'border-purple-900/50 hover:border-purple-500/50' : 'border-zinc-800 hover:border-emerald-500/50'}`}
                        >
                            <span className=${`text-[12px] font-bold tracking-tight transition-colors ${isSectarian ? 'text-purple-500 group-hover:text-purple-400' : 'text-emerald-500 group-hover:text-emerald-400'}`}>
                                ${item.cmd}
                            </span>
                            <span className="text-[12px] text-zinc-400 group-hover:text-zinc-300 uppercase leading-none mt-1 opacity-70">
                                ${item.desc}
                            </span>
                        </button>
                    `)}
                </div>

                <div className=${`pt-4 border-t-[0.5px] flex flex-col gap-3 ${isSectarian ? 'border-purple-900/30' : 'border-zinc-800/50'}`}>
                    <h3 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                        ${isSectarian ? 'Conocimiento' : 'Documentación'}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        <button 
                            onClick=${openManual}
                            className=${`flex items-center gap-3 px-3 py-2 border transition-all text-left group
                                ${isSectarian ? 'bg-purple-950/5 border-purple-900/30 hover:border-purple-500/30' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}
                        >
                            <div className=${`w-1.5 h-1.5 ${isSectarian ? 'bg-purple-900 group-hover:bg-purple-400' : 'bg-zinc-700 group-hover:bg-zinc-400'}`}></div>
                            <span className=${`text-[11px] uppercase tracking-wider font-bold ${isSectarian ? 'text-purple-900/60 group-hover:text-purple-400/80' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                ${isSectarian ? 'Códice de la Verdad' : 'Manual de Usuario'}
                            </span>
                        </button>
                        <button 
                            onClick=${openLore}
                            className=${`flex items-center gap-3 px-3 py-2 border transition-all text-left group
                                ${isSectarian ? 'bg-purple-900/10 border-purple-500/30 hover:border-purple-500/60' : 'bg-cyan-950/5 border-cyan-900/20 hover:border-cyan-500/30'}`}
                        >
                            <div className=${`w-1.5 h-1.5 animate-pulse ${isSectarian ? 'bg-purple-500/60 group-hover:bg-purple-400' : 'bg-cyan-900/40 group-hover:bg-cyan-500/60'}`}></div>
                            <span className=${`text-[11px] uppercase tracking-wider font-bold ${isSectarian ? 'text-purple-500 group-hover:text-purple-400' : 'text-cyan-900/60 group-hover:text-cyan-400/80'}`}>
                                ${isSectarian ? 'Códice Sagrado' : 'Archivo de Lore'}
                            </span>
                        </button>
                    </div>
                </div>
               
            </div>
        </div>
    `;
};
