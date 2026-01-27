/**
 * LOGO.JS (MOD-00)
 * Bloque 1.1: Logo del Juego.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

export const Logo = () => {
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;

    return html`
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-black/40 relative overflow-hidden group/logo">
            <!-- Líneas de decoración industrial finas -->
            <div className=${`absolute top-2 left-2 w-4 h-[1px] ${isSectarian ? 'bg-purple-600/30' : 'bg-amber-600/30'}`}></div>
            <div className=${`absolute top-2 left-2 w-[1px] h-4 ${isSectarian ? 'bg-purple-600/30' : 'bg-amber-600/30'}`}></div>
            
            ${isSectarian && html`
                <!-- Símbolo Ritual Animado -->
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover/logo:opacity-40 transition-opacity">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 animate-slow-spin text-purple-500">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                </div>
            `}

            <div className="relative group">
                <h1 className=${`text-xl font-black tracking-[0.5em] text-zinc-200 opacity-90 text-center select-none transition-all duration-700 ${isSectarian ? 'group-hover:text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]' : 'group-hover:text-amber-500'}`}>
                    ${isSectarian ? 'NAKARA' : 'NAKASTHU'}
                </h1>
            </div>
            
            <div className="flex items-center gap-2 mt-2 relative z-10">
                <div className="h-[0.5px] w-6 bg-zinc-800"></div>
                <span className="text-[7px] tracking-[0.4em] text-zinc-600 font-bold uppercase whitespace-nowrap">
                    ${isSectarian ? 'SANTUARIO_ORDEN' : 'B_CORE_SISTEMA'}
                </span>
                <div className="h-[0.5px] w-6 bg-zinc-800"></div>
            </div>
            
            <div className="mt-3 flex gap-1.5 relative z-10">
                <div className=${`w-1 h-1 ${isSectarian ? 'bg-purple-600/40 animate-pulse' : 'bg-amber-600/40'}`}></div>
                <div className=${`w-1 h-1 ${isSectarian ? 'bg-purple-400/40 animate-pulse delay-75' : 'bg-cyan-600/40'}`}></div>
                <div className="w-1 h-1 bg-zinc-800"></div>
            </div>
        </div>
    `;
};
