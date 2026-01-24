/**
 * UNRESTMONITOR.JS (MOD_UNREST)
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
    
    const getStatus = (level) => {
        if (level >= 80) return 'CRITICAL';
        if (level >= 40) return 'TENSION';
        return 'CALM';
    };

    const status = getStatus(unrestLevel);
    const label = status === 'CRITICAL' ? 'DISTURBIOS' : (status === 'TENSION' ? 'TENSIÓN' : 'CALMA');

    const getColor = () => {
        switch (status) {
            case 'CRITICAL': return 'text-red-500';
            case 'TENSION': return 'text-purple-400';
            default: return 'text-purple-600';
        }
    };

    const getBgColor = () => {
        switch (status) {
            case 'CRITICAL': return 'bg-red-500';
            case 'TENSION': return 'bg-purple-500';
            default: return 'bg-purple-700';
        }
    };

    return html`
        <div className="flex flex-col h-full w-full bg-black/40 p-3 font-mono">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                        ${path === 1 ? 'Herejía_Detectada' : 'Agitación_Social'}
                    </span>
                    <span className=${`text-lg font-black tracking-tighter ${getColor()}`}>
                        ${status === 'CALM' ? (path === 1 ? 'DEVOCIÓN' : 'CALMA') : label}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                        ${path === 1 ? 'Riesgo_Cisma' : 'Riesgo_Sabotaje'}
                    </span>
                    <div className=${`text-lg font-black ${getColor()}`}>${Math.floor(unrestLevel || 0)}%</div>
                </div>
            </div>

            <!-- MEDIDOR CIRCULAR O DE BARRAS -->
            <div className="flex-1 flex items-center justify-center relative py-2">
                <div className="grid grid-cols-10 gap-1 w-full">
                    ${Array.from({ length: 10 }).map((_, i) => {
        const level = Math.floor(unrestLevel || 0);
        return html`
                            <div 
                                key=${i}
                                className=${`h-8 border border-zinc-800 transition-all duration-300 ${i < Math.floor(level / 10) ? getBgColor() + ' opacity-80 shadow-[0_0_8px_rgba(147,51,234,0.3)]' : 'bg-zinc-900/50'}`}
                            ></div>
                        `;
    })}
                </div>
                
                ${status === 'CRITICAL' && html`
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[40px] font-black text-red-600/20 animate-ping">†</span>
                    </div>
                `}
            </div>

            <div className="mt-4 p-2 bg-black/40 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                    <div className=${`w-1.5 h-1.5 rounded-full animate-pulse ${getBgColor()}`}></div>
                    <span className="text-[8px] text-zinc-400 uppercase font-bold">
                        ${path === 1 ? 'Protocolo_de_Expiación' : 'Protocolo_de_Contención'}
                    </span>
                </div>
                <p className="text-[9px] text-zinc-600 leading-tight italic">
                    ${status === 'CRITICAL' ?
            (path === 1 ? 'ADVERTENCIA: El cisma es inminente. Los infieles sabotean los conductos de fe.' : 'ADVERTENCIA: Los sectores están en llamas. Sabotaje inminente.') :
            status === 'TENSION' ?
                (path === 1 ? 'Murmullos de duda detectados en el santuario. Se requiere purificación.' : 'Se detectan grupos organizados en las sombras.') :
                (path === 1 ? 'La congregación permanece fiel. La fe fluye sin obstrucciones.' : 'Los sectores permanecen en silencio.')}
                </p>
            </div>
        </div>
    `;
};
