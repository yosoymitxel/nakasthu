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
import { state } from '../../core/State.js';

const { useRef, useEffect } = React;

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

    // Atajos 1-5 para los escaneos, en el orden de la lista
    const scanKeys = useRef(null);
    scanKeys.current = (n) => { const t = Object.values(SCAN_TYPES)[n - 1]; if (t) startScan(t); };
    useEffect(() => {
        const onKey = (e) => {
            if (e.repeat || /INPUT|TEXTAREA/.test(e.target.tagName) || !/^[1-5]$/.test(e.key)) return;
            if (state.isModalOpen || state.isPaused || document.querySelector('.modal-overlay, .game-modal-overlay')) return;
            scanKeys.current(Number(e.key));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

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
                ${isSectarian && html`
                    <div className="absolute inset-0 bg-purple-500/5 animate-pulse-slow"></div>
                `}
                <div className="text-xl mb-2">${isSectarian ? '✝' : '⚠️'}</div>
                <div className="text-[12px] font-bold tracking-widest uppercase mb-1">
                    ${isSectarian ? 'CANALIZACIÓN BLOQUEADA' : labels.offline}
                </div>
                <div className="text-[12px] opacity-70">
                    ${isSectarian ? 'PURIFICANDO ESENCIA...' : 'REBOOTING SYSTEMS...'}
                </div>
            </div>
        `;
    }

    return html`
        <div className="flex flex-col h-full p-2 gap-2 bg-transparent relative">
            ${isSectarian && html`
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.02)_0%,_transparent_70%)] pointer-events-none"></div>
            `}
            <header className="border-b-[0.5px] border-zinc-800 pb-1 relative z-10">
                <div className="flex justify-between items-center">
                    <h2 className=${`text-[12px] font-black uppercase tracking-[0.3em] ${isSectarian ? 'text-purple-400' : 'text-zinc-400'}`}>
                        ${labels.title}
                    </h2>
                    <div className="flex gap-1">
                        <div className=${`w-1 h-1 animate-pulse ${isSectarian ? 'bg-purple-600 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-cyan-600'}`}></div>
                        <div className=${`w-1 h-1 ${isSectarian ? 'bg-purple-900' : 'bg-zinc-900'}`}></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
                ${Object.values(SCAN_TYPES).map((type, idx) => {
                    const isActive = activeScan && activeScan.id === type.id;
                    const isRequired = requiredScan === type.id;
                    const scanCount = currentEntity?.scanHistory?.[type.id] || 0;
                    const finalCost = calculateScanCost(type, scanCount, CONFIG.SCANNER.REPETITION_PENALTY);
                    
                    const canAfford = energy >= finalCost;
                    const progress = isActive ? activeScan.progress : 0;

                    // Colores de borde desde CONFIG
                    const borderColorClass = isSectarian 
                        ? (isActive ? 'border-purple-500/50' : 'border-purple-900/20')
                        : CONFIG.UI.SCAN_BORDER_COLORS[Math.min(scanCount, CONFIG.UI.SCAN_BORDER_COLORS.length - 1)];

                    return html`
                        <button 
                            key=${`scan-${type.id}`}
                            onClick=${() => startScan(type)}
                            disabled=${activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')}
                            className=${`
                                relative shrink-0 overflow-hidden border-[0.5px] px-2 py-1 text-left transition-all duration-300 group
                                ${isActive ? (isSectarian ? 'bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-cyan-600/50 bg-cyan-950/10') : 
                                  isRequired ? (isSectarian ? 'border-purple-500/50 bg-purple-950/5 animate-pulse-slow' : 'border-amber-500/50 bg-amber-950/5 animate-pulse-slow') : `${borderColorClass} bg-black/20 hover:border-zinc-700/50`}
                                ${(activeScan || !canAfford || (isTutorialActive && tutorialStep === 2 && type.id !== 'THERMAL')) && !isActive ? 'border-red-900/20 opacity-40 cursor-not-allowed' : (activeScan && !isActive ? 'opacity-40' : 'cursor-pointer')}
                                ${isSectarian ? 'rounded-tl-2xl rounded-br-2xl' : ''}
                            `}
                        >
                            <!-- Visual Background for Sectarian -->
                            ${isSectarian && html`
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-purple-500/20 via-transparent to-transparent pointer-events-none"></div>
                            `}

                            


                            <!-- Required Indicator Tag -->
                            ${isRequired ? html`
                                <div className=${`absolute top-0 right-0 ${isSectarian ? 'bg-purple-600/20 text-purple-500 border-purple-900/30' : 'bg-amber-600/20 text-amber-500 border-amber-900/30'} text-[8px] px-1 font-bold tracking-tighter uppercase border-b border-l`}>
                                    ${labels.required}
                                </div>
                            ` : null}

                            <!-- Progress Bar Background -->
                            ${isActive ? html`
                                <div key="progress-container" className="absolute inset-0 pointer-events-none">
                                    <div key="progress-bg" className=${`absolute inset-0 ${isSectarian ? 'bg-purple-500/10 animate-pulse' : 'bg-cyan-500/5'}`}></div>
                                    ${isSectarian ? html`
                                        <div 
                                            key="progress-bar-sectarian"
                                            className="absolute bottom-0 left-0 h-full bg-purple-500/20 transition-all duration-100 blur-[2px]"
                                            style=${{ width: `${progress}%` }}
                                        ></div>
                                    ` : html`
                                        <div 
                                            key="progress-bar"
                                            className="absolute bottom-0 left-0 h-[1px] bg-cyan-500 transition-all duration-100"
                                            style=${{ width: `${progress}%` }}
                                        ></div>
                                    `}
                                </div>
                            ` : null}

                            <div key="content-container" className=${`flex justify-between items-baseline gap-2 relative z-10 ${isRequired ? 'pr-16' : ''}`}>
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span className=${`text-[11px] font-bold uppercase tracking-wider truncate ${isActive ? (isSectarian ? 'text-purple-500' : 'text-cyan-500') : 'text-zinc-400 group-hover:text-amber-600/70'}`}>
                                        ${isSectarian && html`<span className="mr-1.5 opacity-40 group-hover:opacity-100 transition-opacity">✧</span>`}
                                        <kbd className="key-hint">${idx + 1}</kbd>${labels.scans[type.id]}
                                    </span>
                                    ${scanCount > 0 && html`<span className="text-[9px] font-bold text-zinc-500 whitespace-nowrap">×${scanCount}</span>`}
                                    <span className=${`text-[9px] font-mono uppercase whitespace-nowrap ${isSectarian ? 'text-purple-400/50' : 'text-zinc-400'}`}>
                                        ${isActive ? labels.scanning : (canAfford ? labels.ready : labels.insufficient)}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 flex-row-reverse whitespace-nowrap">
                                    <span className=${`text-[12px] font-mono font-bold ${canAfford ? (isSectarian ? 'text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)]' : 'text-zinc-400') : 'text-red-900/50'}`}>
                                        ${isSectarian ? '✧'.repeat(Math.ceil(finalCost / 10)) : Math.floor(finalCost)}
                                    </span>
                                    ${!isRequired && html`<span className="text-[8px] text-zinc-600 uppercase tracking-tighter font-black">${isSectarian ? 'DOGMA' : 'ENERGY_COST'}</span>`}
                                </div>
                            </div>
                        </button>
                    `;
    })}
            </div>

            <footer className="mt-auto pt-1 border-t-[0.5px] border-zinc-800 flex justify-between items-center text-[10px] whitespace-nowrap font-mono text-zinc-400 uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-2">
                    <div className=${`w-1 h-1 ${isSectarian ? 'bg-purple-900' : 'bg-zinc-900'}`}></div>
                    <span>${isSectarian ? 'ALTAR-EXAM-01' : 'NAK-BIOS-01'}</span>
                </div>
                <span>${isSectarian ? 'SINTONÍA' : 'SYNC'}: ${Math.floor(resonanceSync)}%</span>
            </footer>
        </div>
    `;
};
