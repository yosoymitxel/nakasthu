/**
 * LOGO.JS
 * Bloque 1.1: Logo del Juego.
 */
import { html } from '../utils/html.js';

export const Logo = () => {
    return html`
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-black/40 relative overflow-hidden">
            <!-- Líneas de decoración industrial finas -->
            <div className="absolute top-2 left-2 w-4 h-[1px] bg-amber-600/30"></div>
            <div className="absolute top-2 left-2 w-[1px] h-4 bg-amber-600/30"></div>
            
            <div className="relative group">
                <h1 className="text-xl font-black tracking-[0.5em] text-zinc-200 opacity-90 text-center select-none transition-all duration-700 group-hover:text-amber-500">
                    NAKASTHU
                </h1>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
                <div className="h-[0.5px] w-6 bg-zinc-800"></div>
                <span className="text-[7px] tracking-[0.4em] text-zinc-600 font-bold uppercase whitespace-nowrap">
                    B_CORE_SISTEMA
                </span>
                <div className="h-[0.5px] w-6 bg-zinc-800"></div>
            </div>
            
            <div className="mt-3 flex gap-1.5">
                <div className="w-1 h-1 bg-amber-600/40"></div>
                <div className="w-1 h-1 bg-cyan-600/40"></div>
                <div className="w-1 h-1 bg-zinc-800"></div>
            </div>
        </div>
    `;
};
