/**
 * LOREARCHIVE.JS (MOD-03)
 * Bloque 9.1: Archivo de Lore.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';

export const LoreArchive = () => {
    const loreArchive = useGameState('loreArchive') || [];
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;

    // Orden lógico narrativo basado en lore_database.json
    const NARRATIVE_ORDER = [
        isSectarian ? "--- REVELACIÓN 1: EL DESPERTAR ---" : "--- FASE 1: LA EXPEDICIÓN ---",
        "LORE_KAEL_REPORT", "LORE_DRON_VOICE", "LORE_ALEXIA_TOUCH", "LORE_DEYAR_PIEDAD", "LORE_LIBRETA_ALEXIA", "LORE_ORDER_SECRETS", "LORE_TXACUL", "LORE_TRATADOS", "LORE_THE_BEYOND", "LORE_ELARA_RUMORS",
        isSectarian ? "--- REVELACIÓN 2: EL CONTACTO ---" : "--- FASE 2: EL CONTACTO ---",
        "LORE_KAMIN_ESPEJO", "LORE_SYMBOLS_SHAPE", "LORE_HEART_SYNC", "LORE_ZHYR_TEMP", "LORE_FIRST_LINK", "LORE_TALOK_AMBITION", "LORE_ALEXIA_VISION", isSectarian ? "--- REVELACIÓN 3: LA COMUNIÓN ---" : "--- FASE 3: EL GRAN DESVÍO ---",
        "LORE_TECH_MODS", "LORE_PROTEST_RAGE", "LORE_GREAT_SHIFT", "LORE_SECTOR4_TRUTH", "LORE_KAMIN_ORIGIN", "LORE_AITOR_EIDOLON", "LORE_GALERIA_SIETE", "LORE_ALEXIA_BRIDGE", "LORE_DEYAR_SKEPTICISM", "LORE_SECT_HACK", "LORE_REVERSE_SIGNAL", "LORE_OS_AWAKENING", "LORE_AITOR_FATE", "LORE_AITOR_NETWORK", "LORE_MESSENGER", "LORE_SACRIFICE_TRUTH", "LORE_VOID_FRAGMENT", isSectarian ? "--- REVELACIÓN 4: EL ASCENSO ---" : "--- FASE 4: EL SISTEMA NAKASTHU ---",
        "LORE_OS_ORIGIN_TWIST", "LORE_EIDOLON_DETECT", "LORE_PUREZA", "LORE_KAMIN_EXPEDIENTE", "LORE_LOS_46", "LORE_STALKER_IDENTITY", "LORE_REASSIGN_TRAP", "LORE_EARTH_SCREAM", "LORE_PROTOCOL_SLAVE", "LORE_NEBOT_VOID", "LORE_THE_CALL",
        isSectarian ? "--- REVELACIÓN 5: EL FIN DE LA CARNE ---" : "--- FASE 5: LA TRANSCENDENCIA ---",
        "LORE_PROTOCOL_14", "LORE_ASCENSION_COMPLETE"
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
            className=${`flex flex-col h-full w-full font-mono p-3 overflow-hidden cursor-pointer group/archive relative transition-colors duration-1000 ${isSectarian ? 'bg-[#0c0a12]' : 'bg-[#0a0a0b]'}`}
            onClick=${openLoreScreen}
        >
            ${isSectarian && html`
                <!-- Efecto Onírico: Textura de Pergamino/Sombra -->
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.1)_0%,transparent_100%)]"></div>
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
                </div>
            `}

            <!-- Overlay interactivo visual -->
            <div className=${`absolute inset-0 ${isSectarian ? 'bg-purple-500/0 group-hover/archive:bg-purple-500/5' : 'bg-cyan-500/0 group-hover/archive:bg-cyan-500/5'} transition-colors z-20 flex items-center justify-center pointer-events-none`}>
                <span className=${`text-[10px] ${isSectarian ? 'text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-cyan-400 border-cyan-500/30'} opacity-0 group-hover/archive:opacity-100 transition-opacity tracking-[0.3em] uppercase font-black bg-black/80 px-4 py-2 border`}>
                    ${isSectarian ? 'Escudriñar_el_Velo' : 'Expandir Archivo'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 relative z-10">
                ${sortedArchive.length === 0 ? html`
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className=${`w-8 h-8 border-2 mb-4 flex items-center justify-center ${isSectarian ? 'border-purple-900/40' : 'border-zinc-900'}`}>
                            <div className=${`w-4 h-0.5 animate-pulse ${isSectarian ? 'bg-purple-500' : 'bg-zinc-900'}`}></div>
                        </div>
                        <div className=${`text-[12px] uppercase tracking-[0.4em] font-black text-center leading-loose ${isSectarian ? 'text-purple-400/60' : 'text-zinc-400'}`}>
                            ${isSectarian ? 'SANTUARIO SIN ILUMINACIÓN' : 'ARCHIVO VACÍO'}
                        </div>
                    </div>
                ` : sortedArchive.map((entry, i) => html`
                    <div key=${entry.id || i} className=${`p-3 border-l-2 transition-all group relative overflow-hidden ${isSectarian ? 'bg-indigo-950/5 border-purple-800/40 hover:bg-indigo-950/20' : 'bg-zinc-950/40 border-cyan-900/30 hover:bg-cyan-950/10'}`}>
                        <!-- Decoración Sectaria -->
                        ${isSectarian && html`
                            <div className="absolute top-0 right-0 w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg viewBox="0 0 40 40" className="w-full h-full text-purple-500">
                                    <path d="M0 0 L40 0 L40 40 Z" fill="currentColor" />
                                </svg>
                            </div>
                        `}
                        
                        <!-- Glitch background effect -->
                        <div className=${`absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-transparent opacity-0 group-hover:opacity-100 transition-opacity ${isSectarian ? 'from-purple-500/5' : 'from-cyan-500/5'}`}></div>
                        
                        <div className="flex justify-between items-center mb-1.5 relative z-10">
                            <span className=${`text-[12px] font-black uppercase tracking-widest transition-colors ${isSectarian ? 'text-purple-400/60 group-hover:text-purple-400' : 'text-cyan-700/60 group-hover:text-cyan-500'}`}>
                                ${entry.loreId || entry.id || (isSectarian ? 'FRAGMENTO_FE' : 'DATA_FRAG')}
                            </span>
                            <span className=${`text-[12px] font-bold tabular-nums ${isSectarian ? 'text-purple-900/60' : 'text-zinc-400'}`}>
                                ${new Date(entry.timestamp || entry.date).toLocaleTimeString([], { hour12: false })}
                            </span>
                        </div>
                        
                        <div className="relative z-10">
                            <p className=${`text-[12px] leading-relaxed transition-colors ${isSectarian ? 'text-zinc-400 group-hover:text-purple-200 font-serif' : 'text-zinc-400 group-hover:text-zinc-300 font-medium'}`}>
                                ${entry.text || (isSectarian ? `SUSURRO_RECIBIDO. ORIGEN: ${entry.source || 'EL PROFETA'}.` : `ENTRADA DE LORE DESBLOQUEADA. ORIGEN: ${entry.source || 'UNKNOWN'}.`)}
                            </p>
                        </div>

                        <!-- Status bar indicator -->
                        <div className="mt-2 flex items-center gap-2">
                            <div className=${`h-[2px] flex-1 ${isSectarian ? 'bg-purple-950' : 'bg-zinc-900'}`}>
                                <div className=${`h-full w-full animate-loading-bar ${isSectarian ? 'bg-purple-500/20' : 'bg-cyan-900/40'}`}></div>
                            </div>
                            <span className=${`text-[12px] font-bold uppercase tracking-tighter ${isSectarian ? 'text-purple-500/40' : 'text-zinc-400'}`}>
                                ${isSectarian ? 'CONSAGRADO' : 'SECURED'}
                            </span>
                        </div>
                    </div>
                `)}
            </div>
            <div className=${`mt-3 pt-2 border-t flex justify-between items-center px-2 py-1 ${isSectarian ? 'border-purple-900/30 bg-purple-950/10' : 'border-zinc-800 bg-black/20'}`}>
                <div className="flex flex-col">
                    <span className=${`text-[12px] uppercase tracking-[0.2em] font-bold ${isSectarian ? 'text-purple-500/60' : 'text-zinc-400'}`}>
                        ${isSectarian ? 'REVELACIONES_SANTAS' : 'REGISTROS_ACTIVOS'}
                    </span>
                    <span className=${`text-[12px] font-black font-mono ${isSectarian ? 'text-purple-400' : 'text-cyan-900/60'}`}>
                        ${loreArchive.length.toString().padStart(3, '0')}
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className=${`w-1.5 h-1.5 animate-pulse ${isSectarian ? 'bg-purple-500/40' : 'bg-cyan-900/20'}`}></div>
                    <div className=${`w-1.5 h-1.5 ${isSectarian ? 'bg-purple-900/40' : 'bg-zinc-900'}`}></div>
                </div>
            </div>
        </div>
    `;
};
