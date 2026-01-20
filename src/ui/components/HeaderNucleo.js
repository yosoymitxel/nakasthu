/**
 * HEADERNUCLEO.JS
 * Bloque 5: MOD-03 CORE_HEADER.
 * Restauración de barras originales y alineación de sistema.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';

export const HeaderNucleo = () => {
    const energy = useGameState('energy');
    const stability = useGameState('stability');
    const orbitalCycle = useGameState('orbitalCycle');
    const isPaused = useGameState('isPaused');

    const [activeHighlights, setActiveHighlights] = React.useState({
        energy: false,
        stability: false,
        orbital: false
    });

    const handleEnergyClick = () => {
        const newState = !activeHighlights.energy;
        setActiveHighlights(prev => ({ ...prev, energy: newState }));
        
        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['L_UPPER', 'R_MIDDLE'], color: '#f59e0b' });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['L_UPPER', 'R_MIDDLE'] });
        }
    };

    const handleStabilityClick = () => {
        const newState = !activeHighlights.stability;
        setActiveHighlights(prev => ({ ...prev, stability: newState }));

        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['R_MIDDLE', 'C_FOOTER'], color: '#dc2626' });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['R_MIDDLE', 'C_FOOTER'] });
        }
    };

    const handleOrbitalClick = () => {
        const newState = !activeHighlights.orbital;
        setActiveHighlights(prev => ({ ...prev, orbital: newState }));

        if (newState) {
            bus.emit('HIGHLIGHT_MODULE', { areas: ['R_BOTTOM'], color: '#06b6d4' });
        } else {
            bus.emit('HIGHLIGHT_MODULE', { clear: ['R_BOTTOM'] });
        }
    };

    return html`
        <div className="relative flex flex-col h-full w-full bg-transparent p-2 justify-center gap-1">
            <!-- CONTADOR SOLAR (Top Right) -->
            <div className="absolute top-2 right-4 text-[12px] font-mono text-zinc-400 tracking-tighter">
                SOLAR ${Math.floor(orbitalCycle)}/100
            </div>

            <!-- Barra 1: ENERGÍA (Amarillo/Amber) -->
            <div 
                className="flex items-center gap-3 pr-16 cursor-help group/energy"
                onClick=${handleEnergyClick}
            >
                <div className="flex flex-col w-24">
                    <span className=${`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeHighlights.energy ? 'text-amber-400' : 'text-amber-700'}`}>System_Power</span>
                    <span className=${`text-[14px] font-mono font-bold leading-none ${activeHighlights.energy ? 'text-amber-300' : 'text-amber-600'}`}>⚡ ${Math.floor(energy)}%</span>
                </div>
                
                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.energy ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-zinc-800/50'}`}>
                    <div 
                        className="absolute h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        style=${{ width: `${Math.floor(energy)}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-scanline-h"></div>
                    </div>
                </div>
            </div>

            <!-- Barra 2: ESTABILIDAD (Rojo) -->
            <div 
                className="flex items-center gap-3 pr-16 cursor-help group/stability"
                onClick=${handleStabilityClick}
            >
                <div className="flex flex-col w-24">
                    <span className=${`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeHighlights.stability ? 'text-red-400' : 'text-red-700'}`}>Neural_Sync</span>
                    <span className=${`text-[14px] font-mono font-bold leading-none ${activeHighlights.stability ? 'text-red-300' : 'text-red-600'}`}>🧠 ${Math.floor(stability)}%</span>
                </div>

                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.stability ? 'border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'border-zinc-800/50'}`}>
                    <div 
                        className="absolute h-full bg-red-600 transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                        style=${{ width: `${Math.floor(stability)}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-scanline-h" style=${{ animationDelay: '1s' }}></div>
                    </div>
                </div>
            </div>

            <!-- Barra 3: CICLO ORBITAL (Cian) -->
            <div 
                className="flex items-center gap-3 pr-16 cursor-help group/orbital"
                onClick=${handleOrbitalClick}
            >
                <div className="flex flex-col w-24">
                    <span className=${`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeHighlights.orbital ? 'text-cyan-400' : 'text-cyan-700'}`}>Orbital_Sync</span>
                    <span className=${`text-[14px] font-mono font-bold leading-none ${activeHighlights.orbital ? 'text-cyan-300' : 'text-cyan-600'}`}>🌑 ${Math.floor(orbitalCycle)}%</span>
                </div>

                <div className=${`flex-1 h-3 bg-black/40 relative border transition-all duration-300 ${activeHighlights.orbital ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-zinc-800/50'}`}>
                    <div 
                        className="absolute h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        style=${{ width: `${Math.floor(orbitalCycle)}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-scanline-h" style=${{ animationDelay: '2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
