/**
 * BIOSCAN.JS (MOD-01)
 * Bloque 2: Escaneo Biométrico.
 */
import { html } from '../utils/html.js';
import { executeScan, SCAN_TYPES } from '../../systems/Scanner.js';
import { useGameState } from '../hooks/useGameState.js';

export const BioScan = () => {
    const energy = useGameState('energy');
    const activeScan = useGameState('activeScan');
    const resonanceSync = useGameState('resonanceSync');
    const moduleLock = useGameState('moduleLock');
    const tutorialStep = useGameState('tutorialStep');
    const isTutorialActive = useGameState('isTutorialActive');
    const requiredScan = useGameState('requiredScan');
    const currentEntity = useGameState('currentEntity');

    const isLocked = moduleLock && moduleLock.bioscan;

    const startScan = async (type) => {
        const scanCount = currentEntity?.scanHistory?.[type.id] || 0;
        const repetitionPenalty = 1 + (scanCount * 0.5);
        const finalCost = type.cost * repetitionPenalty;

        const canAfford = energy >= finalCost;
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
        const isRequired = requiredScan === type.id;
        const scanCount = currentEntity?.scanHistory?.[type.id] || 0;
        const repetitionPenalty = 1 + (scanCount * 0.5);
        const finalCost = type.cost * repetitionPenalty;
        
        const canAfford = energy >= finalCost;
        const progress = isActive ? activeScan.progress : 0;

        // Colores de borde según repetición
        const borderColors = [
            'border-zinc-800/30',      // 0: Neutral
            'border-emerald-500/40',   // 1: Una vez
            'border-cyan-500/50',      // 2: Dos veces
            'border-amber-500/60',     // 3: Tres veces
            'border-red-500/70',       // 4: Cuatro veces
            'border-purple-500/80'     // 5+: Crítico
        ];
        const borderColorClass = borderColors[Math.min(scanCount, borderColors.length - 1)];

        return html`
                        <button 
                            key=${`scan-${type.id}`}
                            onClick=${() => startScan(type)}
                            disabled=${activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')}
                            className=${`
                                relative overflow-hidden border-[0.5px] p-3 text-left transition-all duration-200 group
                                ${isActive ? 'border-cyan-600/50 bg-cyan-950/10' : 
                                  isRequired ? 'border-amber-500/50 bg-amber-950/5 animate-pulse-slow' : `${borderColorClass} bg-black/20 hover:border-amber-900/40`}
                                ${(activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')) && !isActive ? 'border-red-900/20 opacity-40 cursor-not-allowed' : (activeScan && !isActive ? 'opacity-40' : 'cursor-pointer')}
                            `}
                        >
                            <!-- Scan Count Indicator -->
                            ${scanCount > 0 ? html`
                                <div className="absolute top-0 left-0 bg-zinc-900/80 px-1 border-r border-b border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-bold">REPEATS: ${scanCount}</span>
                                </div>
                            ` : null}

                            <!-- Required Indicator Tag -->
                            ${isRequired ? html`
                                <div className="absolute top-0 right-0 bg-amber-600/20 text-amber-500 text-[8px] px-1 font-bold tracking-tighter uppercase border-b border-l border-amber-900/30">
                                    Required
                                </div>
                            ` : null}

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
                                        ${finalCost.toFixed(1)}
                                    </span>
                                    <span className="text-[8px] text-zinc-600 uppercase tracking-tighter">Energy_Cost</span>
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
