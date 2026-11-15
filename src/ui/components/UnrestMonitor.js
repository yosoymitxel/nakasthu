/**
 * UNRESTMONITOR.JS (MOD-10)
 * Monitor de tensión social y riesgo de sabotaje.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect } = React;

export const UnrestMonitor = () => {
    const unrestLevel = useGameState('unrest');
    const storyPath = useGameState('faith'); // Usar fe si estamos en ruta religiosa
    const path = useGameState('storyPath');
    
    const isSectarian = path === 1;

    const getStatus = (level) => {
        if (level >= 80) return 'CRITICAL';
        if (level >= 40) return 'TENSION';
        return 'CALM';
    };

    const status = getStatus(unrestLevel);
    const label = isSectarian 
        ? (status === 'CRITICAL' ? 'CISMA' : (status === 'TENSION' ? 'HEREJÍA' : 'DOGMA'))
        : (status === 'CRITICAL' ? 'DISTURBIOS' : (status === 'TENSION' ? 'TENSIÓN' : 'CALMA'));

    const getColor = () => {
        if (isSectarian) {
            switch (status) {
                case 'CRITICAL': return 'text-red-500';
                case 'TENSION': return 'text-purple-400';
                default: return 'text-indigo-400';
            }
        }
        switch (status) {
            case 'CRITICAL': return 'text-red-500';
            case 'TENSION': return 'text-yellow-500';
            default: return 'text-zinc-400';
        }
    };

    const getBgColor = () => {
        if (isSectarian) {
            switch (status) {
                case 'CRITICAL': return 'bg-red-600';
                case 'TENSION': return 'bg-purple-600';
                default: return 'bg-indigo-900';
            }
        }
        switch (status) {
            case 'CRITICAL': return 'bg-red-500';
            case 'TENSION': return 'bg-yellow-600';
            default: return 'bg-zinc-700';
        }
    };

    return html`
        <div className=${`flex flex-col h-full w-full p-3 font-mono relative overflow-hidden ${isSectarian ? 'bg-indigo-950/10' : 'bg-black/40'}`}>
            ${isSectarian && html`
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                    <svg viewBox="0 0 100 100" className=${`w-40 h-40 ${status === 'CRITICAL' ? 'animate-pulse text-red-500' : 'text-indigo-500'}`}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                        <!-- Heptagrama Ritual -->
                        <path d="M50 5 L61 36 L93 36 L67 55 L77 86 L50 67 L23 86 L33 55 L7 36 L39 36 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" />
                    </svg>
                </div>
            `}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                        ${isSectarian ? 'Voluntad_del_Velo' : 'Agitación_Social'}
                    </span>
                    <span className=${`text-lg font-black tracking-tighter ${getColor()}`}>
                        ${label}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                        ${isSectarian ? 'Sombra_de_Kamin' : 'Riesgo_Sabotaje'}
                    </span>
                    <div className=${`text-lg font-black ${getColor()}`}>${Math.floor(unrestLevel || 0)}%</div>
                </div>
            </div>

            <!-- MEDIDOR CIRCULAR O DE BARRAS -->
            <div className="flex-1 flex items-center justify-center relative py-2 z-10">
                <div className=${isSectarian ? "grid grid-cols-10 gap-2 w-full place-items-center" : "grid grid-cols-10 gap-1 w-full h-full"}>
                    ${Array.from({ length: 10 }).map((_, i) => {
                        const level = Math.floor(unrestLevel || 0);
                        const active = i < Math.floor(level / 10);
                        
                        if (isSectarian) {
                            return html`
                                <div 
                                    key=${i}
                                    className=${`w-4 h-4 rotate-45 border transition-all duration-700 ${active 
                                        ? `${getBgColor()} border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]` 
                                        : 'bg-indigo-950/40 border-indigo-900/50'}`}
                                ></div>
                            `;
                        }

                        return html`
                            <div 
                                key=${i}
                                className=${`h-full min-h-8 border border-zinc-800 transition-all duration-300 ${active ? getBgColor() + ' opacity-80' : 'bg-zinc-900/50'} ${active && i === Math.floor(level / 10) - 1 && status !== 'CALM' ? 'unrest-tip' : ''}`}
                            ></div>
                        `;
                    })}
                </div>
                
                ${status === 'CRITICAL' && html`
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className=${`text-[40px] font-black animate-ping ${isSectarian ? 'text-red-500/30' : 'text-red-600/20'}`}>
                            ${isSectarian ? '†' : '⚠'}
                        </span>
                    </div>
                `}
            </div>

            <div className=${`mt-4 p-2 border ${isSectarian ? 'bg-indigo-950/30 border-indigo-900/30' : 'bg-black/40 border-zinc-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <div className=${`w-1.5 h-1.5 rounded-full animate-pulse ${getBgColor()}`}></div>
                    <span className="text-[8px] text-zinc-400 uppercase font-bold">
                        ${isSectarian ? 'Rito_de_Purificación' : 'Protocolo_de_Contención'}
                    </span>
                </div>
                <p className="text-[9px] text-zinc-600 leading-tight italic">
                    ${status === 'CRITICAL' ?
                        (isSectarian ? 'LA HEREJÍA SE EXPANDE. El velo se rasga bajo el peso de la duda.' : 'ADVERTENCIA: Los sectores están en llamas. Sabotaje inminente.') :
                        status === 'TENSION' ?
                            (isSectarian ? 'Murmullos de desafección en el coro. El altar exige sacrificios.' : 'Se detectan grupos organizados en las sombras.') :
                            (isSectarian ? 'La fe es absoluta. El vacío sonríe ante la devoción.' : 'Los sectores permanecen en silencio.')}
                </p>
            </div>
        </div>
    `;
};
