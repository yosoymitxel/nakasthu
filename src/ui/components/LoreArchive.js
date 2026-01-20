/**
 * LOREARCHIVE.JS
 * Bloque 9.1: Archivo de Lore.
 * Lista de información recolectada.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

export const LoreArchive = () => {
    const loreArchive = useGameState('loreArchive') || [];

    return html`
        <div className="flex flex-col h-full w-full bg-[#0a0a0b] font-mono p-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                ${loreArchive.length === 0 ? html`
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="w-8 h-8 border-2 border-zinc-900 mb-4 flex items-center justify-center">
                            <div className="w-4 h-0.5 bg-zinc-900 animate-pulse"></div>
                        </div>
                        <div className="text-[12px] text-zinc-400 uppercase tracking-[0.4em] font-black text-center leading-loose">
                            SISTEMA DE ARCHIVO<br/>VACÍO
                        </div>
                    </div>
                ` : loreArchive.map((entry, i) => html`
                    <div key=${entry.id || i} className="p-3 border-l-2 border-cyan-900/30 bg-zinc-950/40 hover:bg-cyan-950/10 transition-all group relative overflow-hidden">
                        <!-- Glitch background effect -->
                        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-center mb-1.5 relative z-10">
                            <span className="text-[12px] text-cyan-700/60 font-black uppercase tracking-widest group-hover:text-cyan-500 transition-colors">
                                ${entry.loreId || entry.id || 'DATA_FRAG'}
                            </span>
                            <span className="text-[12px] text-zinc-400 font-bold tabular-nums">
                                ${new Date(entry.timestamp || entry.date).toLocaleTimeString([], { hour12: false })}
                            </span>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-[12px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors font-medium">
                                ${entry.text || `ENTRADA DE LORE DESBLOQUEADA. ORIGEN: ${entry.source || 'UNKNOWN'}. TIPO: ${entry.type || 'SYSTEM'}.`}
                            </p>
                        </div>

                        <!-- Status bar indicator -->
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-[2px] flex-1 bg-zinc-900">
                                <div className="h-full bg-cyan-900/40 w-full animate-loading-bar"></div>
                            </div>
                            <span className="text-[12px] text-zinc-400 font-bold uppercase tracking-tighter">SECURED</span>
                        </div>
                    </div>
                `)}
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between items-center bg-black/20 px-2 py-1">
                <div className="flex flex-col">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-[0.2em] font-bold">REGISTROS_ACTIVOS</span>
                    <span className="text-[12px] text-cyan-900/60 font-black font-mono">${loreArchive.length.toString().padStart(3, '0')}</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-900/20 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-900"></div>
                </div>
            </div>
        </div>
    `;
};
