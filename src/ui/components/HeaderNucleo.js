/**
 * HEADERNUCLEO.JS
 * Bloque 5: SYS_STATUS CORE_HEADER.
 * Restauración de barras originales y alineación de sistema.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { InvisibleUtilityBar } from './MainLayout.js';

import { Icon } from '../shared/Icon.js';
export const HeaderNucleo = () => {
    const energy = useGameState('energy');
    const stability = useGameState('stability');
    const orbitalCycle = useGameState('orbitalCycle');
    const mode = useGameState('mode');
    const isPaused = useGameState('isPaused');
    const currentStep = useGameState('currentStep');
    const utilidadOculta = useGameState('utilidadOculta');

    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;

    const isEclipse = mode === 'ECLIPSE';

    // MENU INVISIBLE (Utilidad de Sujetos)
    const invisibleMenu = (currentStep >= 4) ? html`
        <div className="pr-36 max-[820px]:pr-1 pt-1 border-t border-zinc-800/30 relative z-10">
            <${InvisibleUtilityBar} value=${utilidadOculta || 0} max=${100} />
        </div>
    ` : null;

    const [activeHighlights, setActiveHighlights] = React.useState({
        energy: false,
        stability: false,
        orbital: false
    });

    const handleEnergyClick = () => {
        const newState = !activeHighlights.energy;
        setActiveHighlights(prev => ({ ...prev, energy: newState }));

        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['C_MAIN', 'R_TOP'], color: isSectarian ? '#a855f7' : '#f59e0b' });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['C_MAIN', 'R_TOP'] });
        }
    };

    const handleStabilityClick = () => {
        const newState = !activeHighlights.stability;
        setActiveHighlights(prev => ({ ...prev, stability: newState }));

        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['C_MAIN', 'C_FOOTER'], color: isSectarian ? '#9333ea' : '#dc2626' });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['C_MAIN', 'C_FOOTER'] });
        }
    };

    const handleOrbitalClick = () => {
        const newState = !activeHighlights.orbital;
        setActiveHighlights(prev => ({ ...prev, orbital: newState }));

        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['L_BOTTOM'], color: isSectarian ? '#9333ea' : (isEclipse ? '#9333ea' : '#06b6d4') });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['L_BOTTOM'] });
        }
    };

    return html`
        <div className="relative flex flex-col h-full w-full bg-transparent px-2 py-1 justify-center gap-1 overflow-hidden">
            ${isSectarian && html`
                <!-- Efecto Onírico: Aura de Fondo -->
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-purple-900/20 blur-[40px] animate-pulse"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-900/30 blur-[60px] animate-slow-spin"></div>
                </div>
            `}

            <!-- CONTADOR SOLAR (Top Right) -->
            <div className=${`absolute top-2 right-4 max-[820px]:hidden text-[12px] font-mono tracking-tighter ${isSectarian ? 'text-purple-400/60' : 'text-zinc-400'}`}>
                ${isSectarian ? 'CONJUNCIÓN' : (isEclipse ? 'ECLIPSE' : 'SOLAR')} ${Math.floor(orbitalCycle)}/100
            </div>

            <!-- Barra 1: ENERGÍA (Amarillo/Amber -> Púrpura en Secta) -->
            <div 
                className="flex items-center gap-3 pr-36 max-[820px]:pr-1 cursor-help group/energy relative z-10"
                onClick=${handleEnergyClick}
            >
                <div className="flex items-baseline justify-between gap-2 w-[164px] shrink-0">
                    <span className=${`text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${activeHighlights.energy ? (isSectarian ? 'text-purple-400' : 'text-amber-400') : (isSectarian ? 'text-purple-700' : 'text-amber-700')}`}>
                        ${isSectarian ? 'Esencia_Vital' : 'System_Power'}
                    </span>
                    <span data-stat="energy" className=${`text-[12px] font-mono font-bold leading-none whitespace-nowrap ${activeHighlights.energy ? (isSectarian ? 'text-purple-300' : 'text-amber-300') : (isSectarian ? 'text-purple-600' : 'text-amber-600')}`}>
                        <${Icon} name=${isSectarian ? 'moon-stars' : 'zap'} tone=${isSectarian ? 'sect' : 'energy'} /> ${Math.floor(energy)}%
                    </span>
                </div>
                
                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.energy ? (isSectarian ? 'border-purple-500/50 shadow-[0_0_10px_rgba(147,51,234,0.2)]' : 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]') : 'border-zinc-800/50'}`}>
                    <div 
                        className=${`absolute h-full overflow-hidden transition-all duration-1000 ${isSectarian ? 'bg-gradient-to-r from-purple-900 via-purple-600 to-indigo-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'}`}
                        style=${{ width: `${Math.floor(energy)}%` }}
                    >
                        ${isSectarian ? html`
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse-slow"></div>
                        ` : html`
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-scanline-h"></div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Barra 2: ESTABILIDAD (Rojo -> Púrpura Profundo en Secta) -->
            <div 
                className="flex items-center gap-3 pr-36 max-[820px]:pr-1 cursor-help group/stability relative z-10"
                onClick=${handleStabilityClick}
            >
                <div className="flex items-baseline justify-between gap-2 w-[164px] shrink-0">
                    <span className=${`text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${activeHighlights.stability ? (isSectarian ? 'text-purple-400' : 'text-red-500') : (isSectarian ? 'text-purple-800' : 'text-red-900')}`}>
                        ${isSectarian ? 'Paz_Espiritual' : 'Neural_Integrity'}
                    </span>
                    <span data-stat="stability" className=${`text-[12px] font-mono font-bold leading-none whitespace-nowrap ${activeHighlights.stability ? (isSectarian ? 'text-purple-300' : 'text-red-400') : (isSectarian ? 'text-purple-600' : 'text-red-600')}`}>
                        <${Icon} name=${isSectarian ? 'shield' : 'anchor'} tone=${isSectarian ? 'sect' : 'stability'} /> ${Math.floor(stability)}%
                    </span>
                </div>
                
                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.stability ? (isSectarian ? 'border-purple-600/50 shadow-[0_0_10px_rgba(147,51,234,0.2)]' : 'border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]') : 'border-zinc-800/50'}`}>
                    <div 
                        className=${`absolute h-full overflow-hidden transition-all duration-1000 ${isSectarian ? 'bg-gradient-to-r from-indigo-900 via-purple-800 to-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}
                        style=${{ width: `${Math.floor(stability)}%` }}
                    >
                        ${isSectarian ? html`
                             <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]"></div>
                        ` : html`
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] w-20 animate-scanline-h" style=${{ animationDelay: '1s' }}></div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Barra 3: CICLO ORBITAL (Cian / Lila en Eclipse) -->
            <div 
                className="flex items-center gap-3 pr-36 max-[820px]:pr-1 cursor-help group/orbital relative z-10"
                onClick=${handleOrbitalClick}
            >
                <div className="flex items-baseline justify-between gap-2 w-[164px] shrink-0">
                    <span className=${`text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${activeHighlights.orbital ? (isEclipse ? 'text-purple-400' : 'text-cyan-400') : (isEclipse ? 'text-purple-700' : 'text-cyan-700')}`}>
                        ${isSectarian ? 'Velo_Cósmico' : 'Orbital_Sync'}
                    </span>
                    <span className=${`text-[12px] font-mono font-bold leading-none whitespace-nowrap ${activeHighlights.orbital ? (isEclipse ? 'text-purple-300' : 'text-cyan-300') : (isEclipse ? 'text-purple-600' : 'text-cyan-600')}`}>
                        <${Icon} name="moon" tone=${isSectarian ? 'sect' : 'orbital'} /> ${Math.floor(orbitalCycle)}%
                    </span>
                </div>

                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.orbital ? (isEclipse ? 'border-purple-500/50 shadow-[0_0_10px_rgba(147,51,234,0.2)]' : 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]') : 'border-zinc-800/50'}`}>
                    <div 
                        className=${`absolute h-full overflow-hidden transition-all duration-1000 ${isSectarian || isEclipse ? 'bg-gradient-to-r from-purple-900 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
                        style=${{ width: `${Math.floor(orbitalCycle)}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-scanline-h" style=${{ animationDelay: '2s' }}></div>
                    </div>
                </div>
            </div>

            <!-- MENU INVISIBLE (Utilidad de Sujetos) -->
            ${invisibleMenu}
        </div>
    `;
};
