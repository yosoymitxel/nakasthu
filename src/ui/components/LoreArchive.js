/**
 * LOREARCHIVE.JS
 * Bloque 9.1: Archivo de Lore.
 * Lista de información recolectada.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

export const LoreArchive = () => {
    const loreArchive = useGameState('loreArchive') || [];

    // Datos de ejemplo si el archivo está vacío
    const displayLore = loreArchive.length > 0 ? loreArchive : [
        { id: 'SYS-01', text: 'Protocolo de gestión de biomasa activo.', date: '2026-01-20' },
        { id: 'ZHYR-04', text: 'Señal detectada en el Sector Delta.', date: '2026-01-20' }
    ];

    return html`
        <div className="flex flex-col h-full w-full bg-[#0a0a0b] font-mono p-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                ${displayLore.length === 0 ? html`
                    <div className="text-[11px] text-zinc-800 animate-pulse uppercase tracking-widest text-center mt-4">
                        Archive empty...
                    </div>
                ` : displayLore.map((entry, i) => html`
                    <div key=${i} className="p-3 border-l border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/10 transition-colors group">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest group-hover:text-cyan-900 transition-colors">${entry.id}</span>
                            <span className="text-[8px] text-zinc-800 font-bold">${entry.date}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                            ${entry.text}
                        </p>
                    </div>
                `)}
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                <span className="text-[8px] text-zinc-700 uppercase tracking-[0.3em] font-black">Archive_Link</span>
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-zinc-800"></div>
                    <div className="w-1.5 h-1 bg-zinc-800"></div>
                </div>
            </div>
        </div>
    `;
};
