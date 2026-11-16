/**
 * LORESCREEN.JS
 * Pantalla dedicada para el Archivo de Lore de NAKASTHU.
 * Permite leer documentos desbloqueados sin consumo de recursos.
 */
import { html } from '../../utils/html.js';
import { useGameState } from '../../hooks/useGameState.js';
import { state } from '../../../core/State.js';
import { bus } from '../../../core/Bus.js';

import { Icon } from '../../shared/Icon.js';
const { useState, useMemo } = React;

export const LoreScreen = () => {
    const loreArchive = useGameState('loreArchive') || [];
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, SYSTEM, SUBJECT, STORY

    // Orden lógico narrativo basado en lore_database.json
    const NARRATIVE_ORDER = [
        "--- FASE 1: LA EXPEDICIÓN ---",
        "LORE_ZHYR_CANYON", "LORE_ZHYR_ANATOMY", "LORE_KAEL_REPORT", "LORE_DRON_VOICE", "LORE_DEYAR_FEAR", "LORE_ALEXIA_TOUCH", "LORE_ALEXIA_PREMONITION", "LORE_MONOLITH_DESCRIPTION", "LORE_SILENCE_FREQ", "LORE_DEYAR_FAILURE", "LORE_ORDER_SECRETS", "LORE_THE_BEYOND", "LORE_ZHYR_INTENT", "LORE_FILTER_THREAT", "LORE_SENSOR_COLLAPSE", "LORE_ELARA_RUMORS",
        "--- FASE 2: EL CONTACTO ---",
        "LORE_MONOLITH_MIRROR", "LORE_SYMBOLS_SHAPE", "LORE_FLASH_SOUND", "LORE_HEART_SYNC", "LORE_ZHYR_TEMP", "LORE_FIRST_LINK", "LORE_TALOK_AMBITION", "LORE_ORVAL_SECRET", "LORE_NEURAL_RESONANCE", "LORE_ALEXIA_VISION", "LORE_PORTAL_FUTURE",
        "--- FASE 3: EL GRAN DESVÍO ---",
        "LORE_TECH_MODS", "LORE_VISOR_FAIL", "LORE_DISPAY_FALL", "LORE_PROTEST_RAGE", "LORE_EARTH_COLLAPSE", "LORE_GREAT_SHIFT", "LORE_SECTOR4_TRUTH", "LORE_KAMIN_ORIGIN", "LORE_ALEXIA_BRIDGE", "LORE_DEYAR_SKEPTICISM", "LORE_SECT_HACK", "LORE_REVERSE_SIGNAL", "LORE_OS_AWAKENING", "LORE_AITOR_FATE", "LORE_AITOR_NETWORK", "LORE_MESSENGER", "LORE_SACRIFICE_TRUTH", "LORE_VOID_FRAGMENT", "LORE_SOUL_SHAPE", "LORE_VOID_DESCRIPTION",
        "--- FASE 4: EL SISTEMA NAKASTHU ---",
        "LORE_OS_ORIGIN_TWIST", "LORE_OS_AWARENESS", "LORE_EIDOLON_DETECT", "LORE_STALKER_IDENTITY", "LORE_REASSIGN_TRAP", "LORE_OPERATOR_PAST", "LORE_EARTH_SCREAM", "LORE_PROTOCOL_SLAVE", "LORE_FAILED_ABORT", "LORE_VOLUNTARY_MERGER", "LORE_LAST_OPERATOR", "LORE_ALEXIA_GHOST", "LORE_KAEL_LAST_PLEA", "LORE_DATA_PURGE", "LORE_TALOK_END", "LORE_NEBOT_VOID", "LORE_THE_CALL",
        "--- FASE 5: LA TRANSCENDENCIA ---",
        "LORE_PROTOCOL_14", "LORE_TWIN_SUNS", "LORE_ALEXIA_REUNION", "LORE_GLOBAL_SILENCE", "LORE_THE_END", "LORE_FINAL_SACRIFICE", "LORE_DRONE_DATA", "LORE_ALEXIA_TRANSLATION", "LORE_ASCENSION_COMPLETE", "LORE_ETERNAL_RESISTANCE"
    ];

    const filteredEntries = useMemo(() => {
        let entries = [...loreArchive];
        
        // Ordenar según NARRATIVE_ORDER
        entries.sort((a, b) => {
            const indexA = NARRATIVE_ORDER.indexOf(a.loreId);
            const indexB = NARRATIVE_ORDER.indexOf(b.loreId);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        if (filter === 'ALL') return entries;
        return entries.filter(entry => entry.type === filter);
    }, [loreArchive, filter]);

    const previousGameStatus = useGameState('previousGameStatus');

    const handleExit = () => {
        state.gameStatus = previousGameStatus || 'START_MENU';
    };

    return html`
        <div className="fixed inset-0 z-[600] bg-[#050506] flex flex-col font-mono text-zinc-400 overflow-hidden animate-fade-in">
            <!-- Header del Archivo -->
            <div className="h-20 border-b border-zinc-800/50 bg-zinc-950/80 flex items-center justify-between px-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/5 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 border border-cyan-500/40 flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 border-t-2 border-cyan-400"></div>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-[0.4em] text-zinc-100 uppercase">Archivo de Datos Zhyr</h1>
                        <p className="text-[10px] text-cyan-700 font-bold tracking-widest uppercase">Protocolo MOD-09 | Acceso Autorizado</p>
                    </div>
                </div>

                <button 
                    onClick=${handleExit}
                    className="group flex items-center gap-4 px-8 py-3 border border-zinc-800 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all"
                >
                    <span className="text-[12px] uppercase tracking-[0.3em] group-hover:text-cyan-400 transition-colors">Cerrar Terminal</span>
                    <span className="text-zinc-600 group-hover:text-cyan-600 transition-colors">ESC</span>
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <!-- Sidebar: Lista de Entradas -->
                <div className="w-96 border-r border-zinc-800/30 flex flex-col bg-zinc-950/20">
                    <div className="p-6 space-y-4">
                        <div className="flex gap-2">
                            ${['ALL', 'SYSTEM', 'SUBJECT'].map(f => html`
                                <button 
                                    key=${f}
                                    onClick=${() => setFilter(f)}
                                    className=${`flex-1 py-1.5 text-[10px] border transition-all uppercase tracking-widest ${filter === f ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-400' : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    ${f}
                                </button>
                            `)}
                        </div>
                        <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter flex justify-between">
                            <span>Registros Encontrados</span>
                            <span>${filteredEntries.length.toString().padStart(3, '0')}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-2 custom-scrollbar">
                        ${filteredEntries.length === 0 ? html`
                            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                                <div className="text-[10px] uppercase tracking-[0.2em]">Sin datos fragmentados</div>
                            </div>
                        ` : filteredEntries.map((entry, i) => html`
                            <div 
                                key=${entry.id || i}
                                onClick=${() => setSelectedEntry(entry)}
                                className=${`p-4 border transition-all cursor-pointer group relative overflow-hidden ${selectedEntry?.id === entry.id ? 'bg-cyan-950/10 border-cyan-500/30' : 'bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-700'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className=${`text-[10px] font-black uppercase tracking-widest ${selectedEntry?.id === entry.id ? 'text-cyan-400' : 'text-zinc-500'}`}>
                                        ${entry.loreId || 'DATA_FRAG'}
                                    </span>
                                    <span className="text-[9px] text-zinc-700 font-bold">${new Date(entry.timestamp || entry.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                    ${entry.text || 'Contenido cifrado...'}
                                </p>
                                ${selectedEntry?.id === entry.id && html`
                                    <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                `}
                            </div>
                        `)}
                    </div>
                </div>

                <!-- Main Content: Visualizador -->
                <div className="flex-1 bg-black/40 flex flex-col relative">
                    <div className="absolute inset-0 noise-texture opacity-5 pointer-events-none"></div>
                    
                    ${selectedEntry ? html`
                        <div className="p-20 max-w-4xl mx-auto w-full animate-fade-in">
                            <div className="flex items-center gap-4 mb-12 border-b border-zinc-800/50 pb-8">
                                <div className="w-16 h-16 border border-cyan-500/20 flex items-center justify-center">
                                    <span className="text-2xl text-cyan-500 font-black">?</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-[0.5em] mb-1">Entrada de Archivo</div>
                                    <h2 className="text-3xl font-black text-zinc-100 tracking-wider uppercase">${selectedEntry.loreId}</h2>
                                </div>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="absolute -left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-900/50 via-zinc-800/20 to-transparent"></div>
                                
                                <div className="text-xl text-zinc-300 leading-relaxed font-medium first-letter:text-4xl first-letter:font-black first-letter:text-cyan-500 first-letter:mr-1 first-letter:float-left">
                                    ${selectedEntry.text}
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-12 mt-12 border-t border-zinc-800/30">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest block">Fuente de Origen</span>
                                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">${selectedEntry.source || 'Sujeto Desconocido'}</span>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest block">Marca Temporal</span>
                                        <span className="text-xs text-zinc-400 font-bold tabular-nums tracking-widest">${new Date(selectedEntry.timestamp || entry.date).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : html`
                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                            <div className="w-24 h-24 border-2 border-dashed border-zinc-800 flex items-center justify-center animate-spin-slow">
                                <div className="w-12 h-12 border border-zinc-700"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-black tracking-[0.3em] uppercase mb-2 text-zinc-400">Seleccione un Registro</h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-600 italic">Esperando entrada de datos para visualización</p>
                            </div>
                        </div>
                    `}
                </div>
            </div>

            <!-- Footer: Status Bar -->
            <div className="h-10 bg-zinc-950 border-t border-zinc-800/50 flex items-center justify-between px-12 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
                <div className="flex gap-8">
                    <span className="text-cyan-900/60 animate-pulse"><${Icon} name="circle" tone="ok" /> System Live</span>
                    <span>Buffer: 100%</span>
                    <span>Enc: RSA-4096</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span>${new Date().getFullYear()} NAKASTHU OS</span>
                    <div className="w-20 h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-900/40 w-1/3 animate-loading-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
