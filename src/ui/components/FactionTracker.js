/**
 * FACTIONTRACKER.JS (MOD-08)
 * Visualización del alineamiento ideológico: ORDEN vs CAOS.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect, memo } = React;

export const FactionTracker = memo(() => {
    const [alignments, setAlignments] = useState({ orden: 0, caos: 0, dominant: 'NEUTRAL' });
    const storyPath = useGameState('storyPath') || 0;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.factions;

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
        <div className="flex flex-col h-full w-full bg-black/40 p-3 font-mono text-[10px] relative overflow-hidden">
            ${isSectarian && html`
                <!-- Efecto Onírico: Símbolos Flotantes -->
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-slow-spin text-purple-500">
                        <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M20 20 L80 80 M20 80 L80 20" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
                    </svg>
                </div>
            `}

            <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="flex flex-col">
                    <span className=${`text-[9px] font-bold tracking-widest ${alignments.dominant === 'ORDEN' ? (isSectarian ? 'text-purple-300 animate-pulse' : 'text-cyan-400') : 'text-zinc-500'}`}>
                        ${labels.order}
                    </span>
                    <span className=${`text-xl font-black leading-none ${isSectarian ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]' : 'text-cyan-500'}`}>${alignments.orden}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className=${`text-[9px] font-bold tracking-widest ${alignments.dominant === 'CAOS' ? (isSectarian ? 'text-purple-400 animate-pulse' : 'text-purple-400') : 'text-zinc-500'}`}>
                        ${labels.chaos}
                    </span>
                    <span className=${`text-xl font-black leading-none ${isSectarian ? 'text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'text-purple-500'}`}>${alignments.caos}</span>
                </div>
            </div>

            <!-- BARRA DE EQUILIBRIO -->
            <div className=${`relative h-4 w-full bg-zinc-950 border overflow-hidden flex ${isSectarian ? 'border-purple-900/30' : 'border-zinc-800'}`}>
                <div 
                    className=${`h-full transition-all duration-[2000ms] border-r border-white/5 ${isSectarian ? 'bg-gradient-to-r from-purple-900/80 to-purple-600/60' : 'bg-cyan-600/50'}`} 
                    style=${{ width: `${ordenPerc}%` }}
                >
                    ${isSectarian && ordenPerc > 10 && html`<div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] animate-pulse"></div>`}
                </div>
                <div 
                    className=${`h-full transition-all duration-[2000ms] ${isSectarian ? 'bg-gradient-to-l from-indigo-900/80 to-indigo-600/60' : 'bg-purple-600/50'}`} 
                    style=${{ width: `${caosPerc}%` }}
                >
                    ${isSectarian && caosPerc > 10 && html`<div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] animate-pulse" style=${{ animationDelay: '1s' }}></div>`}
                </div>
                
                <!-- PUNTO DE EQUILIBRIO -->
                <div className=${`absolute top-0 bottom-0 left-1/2 w-px z-10 ${isSectarian ? 'bg-purple-500/20' : 'bg-white/20'}`}></div>
            </div>

            <div className="mt-3 space-y-1 relative z-10">
                <div className="flex justify-between text-[8px] text-zinc-600 uppercase tracking-[0.3em]">
                    <span className=${`text-[8px] text-zinc-600 uppercase tracking-[0.3em]`}>${labels.statusLabel}</span>
                    <span className=${alignments.dominant === 'ORDEN' ? (isSectarian ? 'text-purple-300' : 'text-cyan-400') : alignments.dominant === 'CAOS' ? (isSectarian ? 'text-indigo-400' : 'text-purple-500') : 'text-zinc-500'}>
                        ${alignments.dominant === 'NEUTRAL' ? labels.descriptions.neutral_status || 'EN_EQUILIBRIO' : (alignments.dominant === 'ORDEN' ? labels.order : labels.chaos)}
                    </span>
                </div>
                <div className=${`h-[0.5px] w-full ${isSectarian ? 'bg-purple-900/30' : 'bg-zinc-800/50'}`}></div>
                <p className=${`text-[9px] leading-relaxed italic mt-2 ${isSectarian ? 'text-zinc-400 font-serif' : 'text-zinc-500'}`}>
                    ${alignments.dominant === 'ORDEN' ? labels.descriptions.order : 
                      alignments.dominant === 'CAOS' ? labels.descriptions.chaos : 
                      labels.descriptions.neutral}
                </p>
            </div>

            <!-- DECORACIÓN TEMÁTICA -->
            <div className=${`absolute bottom-1 right-1 transition-opacity duration-1000 ${isSectarian ? 'opacity-30' : 'opacity-10'}`}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                    ${isSectarian ? html`
                        <path d="M20 5 L35 30 L5 30 Z" fill="none" stroke="#a855f7" strokeWidth="0.5" />
                        <circle cx="20" cy="22" r="8" fill="none" stroke="#a855f7" strokeWidth="0.5" />
                    ` : html`
                        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    `}
                </svg>
            </div>
        </div>
    `;
});
