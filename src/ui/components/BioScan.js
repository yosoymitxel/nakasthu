/**
 * BIOSCAN.JS (MOD-01)
 * Terminal de control para escaneos de sujetos.
 * Restauración Crítica - v4.02
 */
import { html } from '../utils/html.js';
import { executeScan, SCAN_TYPES } from '../../systems/Scanner.js';
import { useGameState } from '../hooks/useGameState.js';

export const BioScan = () => {
    const energy = useGameState('energy');
    const activeScan = useGameState('activeScan');
    const resonanceSync = useGameState('resonanceSync');
    const moduleLock = useGameState('moduleLock');

    const isLocked = moduleLock && moduleLock.bioscan;

    const startScan = async (type) => {
        const canAfford = energy >= type.cost;
        if (activeScan || !canAfford || isLocked) return;
        await executeScan(type.id);
    };

    if (isLocked) {
        return html`
            <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono p-4 text-center border border-red-900/50 bg-red-950/20 overflow-hidden relative">
                <div className="text-xl mb-2">⚠️</div>
                <div className="text-[12px] font-bold tracking-widest uppercase mb-1">MOD-01 OFFLINE</div>
                <div className="text-[12px] opacity-70">REBOOTING SYSTEMS...</div>
            </div>
        `;
    }

    return html`
        <div className="flex flex-col h-full p-3 gap-3 bg-transparent">
            <header className="border-b-[0.5px] border-zinc-800 pb-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                        BIO-SCANNER v4.02
                    </h2>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-cyan-600/50 animate-pulse"></div>
                        <div className="w-1 h-1 bg-zinc-900"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                ${Object.values(SCAN_TYPES).map((type, idx) => {
                    const isActive = activeScan && activeScan.id === type.id;
                    const canAfford = energy >= type.cost;
                    const progress = isActive ? activeScan.progress : 0;

                    return html`
                        <button 
                            key=${`scan-${type.id}`}
                            onClick=${() => startScan(type)}
                            disabled=${activeScan || !canAfford}
                            className=${`
                                relative overflow-hidden border-[0.5px] p-3 text-left transition-all duration-200 group
                                ${isActive ? 'border-cyan-600/50 bg-cyan-950/10' : 'border-zinc-800/30 hover:border-amber-900/40 bg-black/20'}
                                ${!canAfford && !activeScan ? 'border-red-900/20 opacity-40 cursor-not-allowed' : (activeScan && !isActive ? 'opacity-40' : 'cursor-pointer')}
                            `}
                        >
                            <!-- Progress Bar Background -->
                            ${isActive ? html`
                                <div key="progress-container" className="absolute inset-0 pointer-events-none">
                                    <div key="progress-bg" className="absolute inset-0 bg-cyan-500/5"></div>
                                    <div 
                                        key="progress-bar"
                                        className="absolute bottom-0 left-0 h-[1px] bg-cyan-500 transition-all duration-100"
                                        style=${{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            ` : null}

                            <div key="content-container" className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col">
                                    <span className=${`text-[12px] font-bold uppercase tracking-wider ${isActive ? 'text-cyan-500' : 'text-zinc-400 group-hover:text-amber-600/70'}`}>
                                        ${type.name}
                                    </span>
                                    <span className="text-[12px] text-zinc-400 mt-0.5 font-mono uppercase">
                                        ${isActive ? 'Procesando...' : (canAfford ? 'Ready' : 'Insufficient Power')}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className=${`text-[12px] font-mono font-bold ${canAfford ? 'text-zinc-400' : 'text-red-900/50'}`}>
                                        ${type.cost}
                                    </span>
                                    <span className="text-[12px] text-zinc-400 uppercase">Energy</span>
                                </div>
                            </div>
                        </button>
                    `;
                })}
            </div>

            <footer className="mt-auto pt-2 border-t-[0.5px] border-zinc-800 flex justify-between items-center text-[12px] font-mono text-zinc-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-900"></div>
                    <span>NAK-BIOS-01</span>
                </div>
                <span>SYNC: ${Math.floor(resonanceSync)}%</span>
            </footer>
        </div>
    `;
};
