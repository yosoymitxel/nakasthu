/**
 * PANEL.JS
 * Componente base para los módulos de la interfaz.
 * Estética: Industrial, Dark Sci-Fi.
 */
import { html } from '../utils/html.js';

import { useGameState } from '../hooks/useGameState.js';

export const Panel = ({ title, children, className = "", contentClassName = "" }) => {
    const phase = useGameState('phase');
    const isEclipse = phase === 'ECLIPSE';
    const isInteractive = className.includes('interactive-panel');

    return html`
        <div className=${`
            relative bg-[#050506] border-[0.5px] transition-all duration-300
            flex flex-col overflow-hidden group
            ${isInteractive ? 'hover:bg-[#2b2b4d05] cursor-pointer' : ''}
            ${isEclipse ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.02)]' : 'border-amber-600/20 shadow-[0_0_15px_rgba(217,119,6,0.02)]'}
            ${className}
        `}>
            <div className=${`px-2 py-0.5 flex justify-between items-center border-b-[0.5px] transition-colors duration-700 ${isEclipse ? 'border-cyan-500/20 bg-cyan-950/5' : 'border-amber-600/10 bg-black/40'}`}>
                <span className=${`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-700 ${isEclipse ? 'text-cyan-500' : 'text-amber-600/70'}`}>
                    ${title}
                </span>
                <div className=${`w-1 h-1 ${isEclipse ? 'bg-cyan-500/60 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-amber-600/30'}`}></div>
            </div>

            <div className=${`flex-1 p-2 relative ${contentClassName}`}>
                ${children}
                
                <!-- Esquinas decorativas finas -->
                <div className=${`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l ${isEclipse ? 'border-cyan-500/40' : 'border-amber-600/20'}`}></div>
                <div className=${`absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r ${isEclipse ? 'border-cyan-500/40' : 'border-amber-600/20'}`}></div>
            </div>
        </div>
    `;
};
