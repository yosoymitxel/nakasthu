/**
 * LOREARCHIVE.JS (MOD-09)
 * Bloque 9.1: Archivo de Lore.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';

export const LoreArchive = () => {
    const loreArchive = useGameState('loreArchive') || [];

    // Orden lógico narrativo basado en lore_database.json
    const NARRATIVE_ORDER = [
        "--- FASE 1: LA EXPEDICIÓN ---",
        "LORE_ZHYR_CANYON", "LORE_KAEL_REPORT", "LORE_DRON_VOICE", "LORE_DEYAR_FEAR", "LORE_ALEXIA_TOUCH",
        "--- FASE 2: EL CONTACTO ---",
        "LORE_MONOLITH_MIRROR", "LORE_SYMBOLS_SHAPE", "LORE_FLASH_SOUND", "LORE_HEART_SYNC", "LORE_ZHYR_TEMP", "LORE_FIRST_LINK",
        "--- FASE 3: EL GRAN DESVÍO ---",
        "LORE_TECH_MODS", "LORE_VISOR_FAIL", "LORE_DISPAY_FALL", "LORE_PROTEST_RAGE", "LORE_EARTH_COLLAPSE",
        "--- FASE 4: EL SISTEMA NAKASTHU ---",
        "LORE_OS_ORIGIN_TWIST", "LORE_OS_AWARENESS", "LORE_EIDOLON_DETECT", "LORE_STALKER_IDENTITY", "LORE_REASSIGN_TRAP", "LORE_OPERATOR_PAST",
        "--- FASE 5: LA TRANSCENDENCIA ---",
        "LORE_PROTOCOL_14", "LORE_TWIN_SUNS", "LORE_ALEXIA_REUNION", "LORE_GLOBAL_SILENCE", "LORE_THE_END", "LORE_FINAL_SACRIFICE"
    ];

    const sortedArchive = [...loreArchive].sort((a, b) => {
        const indexA = NARRATIVE_ORDER.indexOf(a.loreId);
        const indexB = NARRATIVE_ORDER.indexOf(b.loreId);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const openLoreScreen = () => {
        state.gameStatus = 'LORE_ARCHIVE';
    };

    return html`
        <div 
            className="flex flex-col h-full w-full bg-[#0a0a0b] font-mono p-3 overflow-hidden cursor-pointer group/archive relative"
            onClick=${openLoreScreen}
        >
            <!-- Overlay interactivo visual -->
            <div className="absolute inset-0 bg-cyan-500/0 group-hover/archive:bg-cyan-500/5 transition-colors z-20 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover/archive:opacity-100 transition-opacity tracking-[0.3em] uppercase font-black bg-black/80 px-4 py-2 border border-cyan-500/30">
                    Expandir Archivo
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                ${sortedArchive.length === 0 ? html`
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="w-8 h-8 border-2 border-zinc-900 mb-4 flex items-center justify-center">
                            <div className="w-4 h-0.5 bg-zinc-900 animate-pulse"></div>
                        </div>
                        <div className="text-[12px] text-zinc-400 uppercase tracking-[0.4em] font-black text-center leading-loose">
                            SISTEMA DE ARCHIVO<br/>VACÍO
                        </div>
                    </div>
                ` : sortedArchive.map((entry, i) => html`
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
