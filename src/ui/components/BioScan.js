/**
 * BIOSCAN.JS (MOD-01)
 * Bloque 2: Escaneo Biométrico.
 */
import { html } from '../utils/html.js';
import { executeScan, SCAN_TYPES } from '../../systems/Scanner.js';
import { useGameState } from '../hooks/useGameState.js';
import { CONFIG } from '../../data/gameConfig.js';
import { calculateScanCost } from '../../utils/scannerUtils.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

export const BioScan = () => {
    const energy = useGameState('energy');
    const activeScan = useGameState('activeScan');
    const resonanceSync = useGameState('resonanceSync');
    const moduleLock = useGameState('moduleLock');
    const tutorialStep = useGameState('tutorialStep');
    const isTutorialActive = useGameState('isTutorialActive');
    const requiredScan = useGameState('requiredScan');
    const currentEntity = useGameState('currentEntity');
    const storyPath = useGameState('storyPath') || 0;

    const isLocked = moduleLock && moduleLock.bioscan;
    const isSectarian = storyPath === 1;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.bioscan;

    const startScan = async (type) => {
        const scanCount = currentEntity?.scanHistory?.[type.id] || 0;
        const finalCost = calculateScanCost(type, scanCount, CONFIG.SCANNER.REPETITION_PENALTY);

        const canAfford = energy >= finalCost;
        if (activeScan || !canAfford || isLocked) return;
        await executeScan(type.id);
    };

    if (isLocked) {
        return html`
            <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono p-4 text-center border border-red-900/50 bg-red-950/20 overflow-hidden relative">
                <div className="text-xl mb-2">⚠️</div>
                <div className="text-[12px] font-bold tracking-widest uppercase mb-1">${labels.offline}</div>
                <div className="text-[12px] opacity-70">REBOOTING SYSTEMS...</div>
            </div>
        `;
    }

    return html`
        <div className="flex flex-col h-full p-3 gap-3 bg-transparent">
            <header className="border-b-[0.5px] border-zinc-800 pb-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                        ${labels.title}
                    </h2>
                    <div className="flex gap-1">
                        <div className=${`w-1 h-1 animate-pulse ${isSectarian ? 'bg-purple-600/50' : 'bg-cyan-600/50'}`}></div>
                        <div className="w-1 h-1 bg-zinc-900"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                ${Object.values(SCAN_TYPES).map((type, idx) => {
        const isActive = activeScan && activeScan.id === type.id;
        const isRequired = requiredScan === type.id;
        const scanCount = currentEntity?.scanHistory?.[type.id] || 0;
        const finalCost = calculateScanCost(type, scanCount, CONFIG.SCANNER.REPETITION_PENALTY);
        
        const canAfford = energy >= finalCost;
        const progress = isActive ? activeScan.progress : 0;

        // Colores de borde desde CONFIG
        const borderColorClass = CONFIG.UI.SCAN_BORDER_COLORS[Math.min(scanCount, CONFIG.UI.SCAN_BORDER_COLORS.length - 1)];

        return html`
                        <button 
                            key=${`scan-${type.id}`}
                            onClick=${() => startScan(type)}
                            disabled=${activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')}
                            className=${`
                                relative overflow-hidden border-[0.5px] p-3 text-left transition-all duration-200 group
                                ${isActive ? (isSectarian ? 'border-purple-600/50 bg-purple-950/10' : 'border-cyan-600/50 bg-cyan-950/10') : 
                                  isRequired ? (isSectarian ? 'border-purple-500/50 bg-purple-950/5 animate-pulse-slow' : 'border-amber-500/50 bg-amber-950/5 animate-pulse-slow') : `${borderColorClass} bg-black/20 hover:border-amber-900/40`}
                                ${(activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')) && !isActive ? 'border-red-900/20 opacity-40 cursor-not-allowed' : (activeScan && !isActive ? 'opacity-40' : 'cursor-pointer')}
                            `}
                        >
                            <!-- Scan Count Indicator -->
                            ${scanCount > 0 ? html`
                                <div className="absolute top-0 left-0 bg-zinc-900/80 px-1 border-r border-b border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-bold">${labels.repeats}: ${scanCount}</span>
                                </div>
                            ` : null}

                            <!-- Required Indicator Tag -->
                            ${isRequired ? html`
                                <div className=${`absolute top-0 right-0 ${isSectarian ? 'bg-purple-600/20 text-purple-500 border-purple-900/30' : 'bg-amber-600/20 text-amber-500 border-amber-900/30'} text-[8px] px-1 font-bold tracking-tighter uppercase border-b border-l`}>
                                    ${labels.required}
                                </div>
                            ` : null}

                            <!-- Progress Bar Background -->
                            ${isActive ? html`
                                <div key="progress-container" className="absolute inset-0 pointer-events-none">
                                    <div key="progress-bg" className=${`absolute inset-0 ${isSectarian ? 'bg-purple-500/5' : 'bg-cyan-500/5'}`}></div>
                                    <div 
                                        key="progress-bar"
                                        className=${`absolute bottom-0 left-0 h-[1px] ${isSectarian ? 'bg-purple-500' : 'bg-cyan-500'} transition-all duration-100`}
                                        style=${{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            ` : null}

                            <div key="content-container" className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col">
                                    <span className=${`text-[12px] font-bold uppercase tracking-wider ${isActive ? (isSectarian ? 'text-purple-500' : 'text-cyan-500') : 'text-zinc-400 group-hover:text-amber-600/70'}`}>
                                        ${labels.scans[type.id]}
                                    </span>
                                    <span className="text-[12px] text-zinc-400 mt-0.5 font-mono uppercase">
                                        ${isActive ? labels.scanning : (canAfford ? labels.ready : labels.insufficient)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className=${`text-[12px] font-mono font-bold ${canAfford ? 'text-zinc-400' : 'text-red-900/50'}`}>
                                        ${Math.floor(finalCost)}
                                    </span>
                                    <span className="text-[8px] text-zinc-600 uppercase tracking-tighter">${isSectarian ? 'Coste_Fe' : 'Energy_Cost'}</span>
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
