/**
 * FACTIONTRACKER.JS (MOD_FACTION)
 * Visualización del alineamiento ideológico: ORDEN vs CAOS.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect } = React;

export const FactionTracker = () => {
    const [alignments, setAlignments] = useState({ orden: 0, caos: 0, dominant: 'NEUTRAL' });
    const storyPath = useGameState('storyPath');

    useEffect(() => {
        const onUpdate = (data) => {
            setAlignments(data);
        };
        bus.on('FACTION_UPDATE', onUpdate);
        return () => bus.off('FACTION_UPDATE', onUpdate);
    }, []);

    const total = alignments.orden + alignments.caos || 1;
    const ordenPerc = Math.floor((alignments.orden / total) * 100);
    const caosPerc = Math.floor((alignments.caos / total) * 100);

    const isSectarian = storyPath === 1;

    return html`
        <div className="flex flex-col h-full w-full bg-black/40 p-3 font-mono text-[10px]">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className=${`text-[9px] font-bold ${alignments.dominant === 'ORDEN' ? (isSectarian ? 'text-purple-300' : 'text-cyan-400') : 'text-zinc-500'}`}>
                        ${isSectarian ? '[DOGMA]' : '[ORDEN]'}
                    </span>
                    <span className=${`text-xl font-black leading-none ${isSectarian ? 'text-purple-400' : 'text-cyan-500'}`}>${alignments.orden}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className=${`text-[9px] font-bold ${alignments.dominant === 'CAOS' ? (isSectarian ? 'text-purple-600' : 'text-purple-400') : 'text-zinc-500'}`}>
                        ${isSectarian ? '[ÉXTASIS]' : '[CAOS]'}
                    </span>
                    <span className=${`text-xl font-black leading-none ${isSectarian ? 'text-purple-700' : 'text-purple-500'}`}>${alignments.caos}</span>
                </div>
            </div>

            <!-- BARRA DE EQUILIBRIO -->
            <div className="relative h-4 w-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
                <div 
                    className=${`h-full transition-all duration-1000 border-r border-white/10 ${isSectarian ? 'bg-purple-900/60' : 'bg-cyan-600/50'}`} 
                    style=${{ width: `${ordenPerc}%` }}
                ></div>
                <div 
                    className=${`h-full transition-all duration-1000 ${isSectarian ? 'bg-purple-600/60' : 'bg-purple-600/50'}`} 
                    style=${{ width: `${caosPerc}%` }}
                ></div>
                
                <!-- PUNTO DE EQUILIBRIO -->
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 z-10"></div>
            </div>

            <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-600 uppercase tracking-widest">
                    <span>${isSectarian ? 'Sintonía_del_Alma' : 'Dominancia_Actual'}</span>
                    <span className=${alignments.dominant === 'ORDEN' ? (isSectarian ? 'text-purple-300' : 'text-cyan-400') : alignments.dominant === 'CAOS' ? 'text-purple-500' : 'text-zinc-500'}>
                        ${alignments.dominant}
                    </span>
                </div>
                <div className="h-px bg-zinc-800/50 w-full"></div>
                <p className="text-[9px] leading-tight text-zinc-500 italic mt-2">
                    ${alignments.dominant === 'ORDEN' ? 
                        (isSectarian ? 'El Dogma prevalece. Las plegarias son unánimes y frías.' : 'Las máquinas rugen con precisión técnica. La eficiencia es ley.') : 
                        alignments.dominant === 'CAOS' ? 
                        (isSectarian ? 'El Éxtasis consume la razón. La carne se funde con el vacío.' : 'El incienso nubla los sensores. La fe consume la lógica del sistema.') : 
                        'El equilibrio se mantiene. Por ahora.'}
                </p>
            </div>

            <!-- DECORACIÓN GROTESCA -->
            <div className="absolute bottom-1 right-1 opacity-10">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>
        </div>
    `;
};
