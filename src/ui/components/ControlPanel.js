/**
 * CONTROLPANEL.JS (MOD-07)
 * Bloque 7: Panel de Control.
 */
import { html } from '../utils/html.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { useGameState } from '../hooks/useGameState.js';

import { Icon } from '../shared/Icon.js';
export const ControlPanel = () => {
    const isPaused = useGameState('isPaused');
    const isTutorialActive = useGameState('isTutorialActive');
    const storyPath = useGameState('storyPath') || 0;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.controlPanel;
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');

    const isSectarian = storyPath === 1;

    const handleSkipTutorial = () => {
        state.startBatch();
        state.isTutorialActive = false;
        state.tutorialStep = 0;
        state.endBatch();

        bus.emit('TERMINAL_PRINT', {
            text: labels.skipTutorialMsg,
            type: 'SYSTEM'
        });
    };

    const handleManual = () => {
        bus.emit('UI_MODAL_OPEN', {
            title: labels.manualTitle,
            content: html`
                <div className="space-y-4 text-zinc-400 font-mono text-[11px] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <p><strong className=${isSectarian ? 'text-purple-400' : 'text-cyan-500'}>${labels.manual.objective.label}</strong> ${labels.manual.objective.text}</p>
                    <p><strong className=${isSectarian ? 'text-indigo-400' : 'text-emerald-500'}>${labels.manual.authorize.label}</strong> ${labels.manual.authorize.text}</p>
                    <p><strong className="text-red-500">${labels.manual.sacrifice.label}</strong> ${labels.manual.sacrifice.text}</p>
                    <p><strong className=${isSectarian ? 'text-purple-600' : 'text-amber-500'}>${labels.manual.resonance.label}</strong> ${labels.manual.resonance.text}</p>
                    <p><strong className=${isSectarian ? 'text-indigo-500' : 'text-blue-500'}>${labels.manual.scanning.label}</strong> ${labels.manual.scanning.text}</p>
                    <p><strong className="text-zinc-500">${labels.manual.resources.label}</strong> ${labels.manual.resources.text}</p>
                    <p><strong className=${isSectarian ? 'text-purple-900' : 'text-emerald-700'}>${labels.manual.economy.label}</strong> ${labels.manual.economy.text}</p>
                    
                    <div className="mt-6 pt-4 border-t border-zinc-800/50">
                        <p className="text-[9px] text-zinc-600 italic">
                            ${labels.manualQuote}
                        </p>
                    </div>
                </div>
            `
        });
    };

    return html`
        <div className=${`relative flex flex-col h-full w-full p-3 justify-center items-center gap-2 transition-all duration-1000 overflow-hidden ${isSectarian ? 'bg-purple-950/10 shadow-[inset_0_0_40px_rgba(147,51,234,0.1)] border border-purple-900/30' : 'bg-black/20'}`}>
            
            <!-- Elementos oníricos para el sectario -->
            ${isSectarian && html`
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)]"></div>
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] animate-slow-spin opacity-20"></div>
                </div>
            `}
            
            <!-- QUOTA TRACKER (MOD-07 logic) -->
            <div className="absolute top-2 right-3 flex flex-col items-end opacity-60">
                <span className="text-[8px] font-bold text-zinc-500 tracking-tighter">${isSectarian ? 'ALMAS_RECLAMADAS' : labels.quotaLabel}</span>
                <span className=${`text-[12px] font-black ${processedCount >= quota ? (isSectarian ? 'text-purple-400' : 'text-emerald-500') : 'text-zinc-400'}`}>
                    ${processedCount}/${Number.isFinite(quota) ? quota : "∞"}
                </span>
            </div>

            <!-- BOTONES DE CONTROL (Strict Block 7) -->
            <div className="flex gap-4 mb-2 relative z-10">
                <button 
                    onClick=${handleManual}
                    className=${`w-12 h-12 border flex items-center justify-center text-[16px] font-black transition-all ${isSectarian ? 'border-purple-500/40 bg-purple-950/30 text-purple-400 hover:bg-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-amber-900/50 bg-amber-950/20 text-amber-500 hover:bg-amber-500/20'}`}
                    title=${isSectarian ? 'DOGMA' : 'MANUAL'}
                >
                    ${isSectarian ? '†' : 'M'}
                </button>
                <button 
                    onClick=${() => state.isPaused = !state.isPaused}
                    className=${`w-12 h-12 border flex items-center justify-center text-[16px] font-black transition-all ${isPaused ? (isSectarian ? 'border-purple-400 bg-purple-900/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-cyan-500 bg-cyan-950/40 text-cyan-400') : (isSectarian ? 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-purple-400' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-cyan-500')}`}
                    title=${isPaused ? 'REANUDAR' : 'PAUSA'}
                >
                    <${Icon} name=${isPaused ? 'play' : 'pause'} />
                </button>

                ${isTutorialActive && html`
                    <button 
                        onClick=${handleSkipTutorial}
                        className=${`w-12 h-12 border flex items-center justify-center text-[10px] font-bold transition-all animate-pulse ${isSectarian ? 'border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-600/30' : 'border-red-900/50 bg-red-950/20 text-red-600 hover:bg-red-600/20'}`}
                        title=${isSectarian ? 'ABORTAR RITUAL' : 'SALTAR INDUCCIÓN'}
                    >
                        ${isSectarian ? 'FIN' : 'SKIP'}
                    </button>
                `}
            </div>

            <div className=${`text-[12px] font-bold uppercase tracking-[0.3em] ${isSectarian ? 'text-purple-400/80' : 'text-zinc-500'}`}>
                ${isSectarian ? 'Foco del Velo' : labels.title}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className=${`text-[8px] font-bold uppercase tracking-widest animate-pulse ${isSectarian ? 'text-purple-500' : 'text-emerald-500'}`}>
                    ${isSectarian ? 'CONEXIÓN_ALMICA_ESTABLE' : labels.status}
                </span>
                <div className=${`w-1.5 h-1.5 rounded-full ${isSectarian ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 'bg-emerald-500'}`}></div>
            </div>
        </div>
    `;
};
