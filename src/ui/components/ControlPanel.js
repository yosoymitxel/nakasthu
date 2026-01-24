/**
 * CONTROLPANEL.JS (MOD-08)
 * Bloque 8: Panel de Control.
 */
import { html } from '../utils/html.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

export const ControlPanel = () => {
    const isPaused = useGameState('isPaused');
    const isTutorialActive = useGameState('isTutorialActive');
    const storyPath = useGameState('storyPath');

    const isSectarian = storyPath === 1;

    const handleSkipTutorial = () => {
        state.startBatch();
        state.isTutorialActive = false;
        state.tutorialStep = 0;
        state.endBatch();

        bus.emit('TERMINAL_PRINT', {
            text: '>>> PROTOCOLO DE INDUCCIÓN ABORTADO. CONTROL MANUAL RESTABLECIDO.',
            type: 'SYSTEM'
        });
    };

    const handleManual = () => {
        bus.emit('UI_MODAL_OPEN', {
            title: isSectarian ? 'CODEX_SANTUARIO' : 'OPERATIONAL_MANUAL',
            content: html`
                <div className="space-y-4 text-zinc-400 font-mono text-[11px]">
                    <p><strong className=${isSectarian ? 'text-purple-500' : 'text-cyan-500'}>${isSectarian ? 'MISIÓN:' : 'OBJETIVO:'}</strong> ${isSectarian ? 'Recuperar almas para el Aitor.' : 'Procesar biomasa según criterios de pureza.'}</p>
                    <p><strong className="text-red-500">${isSectarian ? 'PURGAR:' : 'SACRIFICAR:'}</strong> ${isSectarian ? 'Elimina impuros (+30 Fe). Error si es devoto (-25 Agitación).' : 'Elimina sujetos corruptos (+30 Energía). Error si es puro (-25 Estabilidad).'}</p>
                    <p><strong className="text-emerald-500">${isSectarian ? 'CONSAGRAR:' : 'AUTORIZAR:'}</strong> ${isSectarian ? 'Acepta a los elegidos (-10 Fe, +10 Agitación). Error si es impuro (-30 Agitación).' : 'Permite el paso de sujetos puros (-10 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).'}</p>
                    <p><strong className="text-amber-500">${isSectarian ? 'COMUNIÓN:' : 'RESONANCIA:'}</strong> ${isSectarian ? 'Sincroniza la fe con el vacío para evitar el colapso del santuario.' : 'Sincroniza frecuencia y fase para evitar degradación de estabilidad.'}</p>
                </div>
            `
        });
    };

    return html`
        <div className=${`relative flex flex-col h-full w-full p-2 justify-center items-center gap-1 transition-colors duration-1000 ${isSectarian ? 'bg-purple-950/10 shadow-[inset_0_0_20px_rgba(147,51,234,0.1)]' : 'bg-black/20'}`}>
            <!-- BOTONES DE CONTROL (Strict Block 8) -->
            <div className="flex gap-2 mb-2">
                <button 
                    onClick=${handleManual}
                    className=${`w-8 h-8 border flex items-center justify-center text-[10px] font-bold transition-all ${isSectarian ? 'border-purple-900/50 bg-purple-950/20 text-purple-500 hover:bg-purple-500/20' : 'border-amber-900/50 bg-amber-950/20 text-amber-500 hover:bg-amber-500/20'}`}
                    title="MANUAL"
                >
                    M
                </button>
                <button 
                    onClick=${() => state.isPaused = !state.isPaused}
                    className=${`w-8 h-8 border flex items-center justify-center text-[10px] font-bold transition-all ${isPaused ? (isSectarian ? 'border-purple-500 bg-purple-950/40 text-purple-400' : 'border-cyan-500 bg-cyan-950/40 text-cyan-400') : (isSectarian ? 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-purple-500' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-cyan-500')}`}
                    title="PAUSA"
                >
                    ${isPaused ? '▶' : '||'}
                </button>

                ${isTutorialActive && html`
                    <button 
                        onClick=${handleSkipTutorial}
                        className="w-8 h-8 border border-red-900/50 bg-red-950/20 text-red-600 flex items-center justify-center text-[10px] font-bold hover:bg-red-600/20 transition-all animate-pulse"
                        title="SALTAR INDUCCIÓN"
                    >
                        SKIP
                    </button>
                `}
            </div>

            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                ${isSectarian ? 'Santuario de Mando' : 'Centro de Control'}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className=${`text-[6px] font-bold uppercase tracking-widest animate-pulse ${isSectarian ? 'text-purple-500' : 'text-emerald-500'}`}>
                    ${isSectarian ? 'Comunión_Estable' : 'Link_Active'}
                </span>
                <div className=${`w-1 h-1 rounded-full ${isSectarian ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
            </div>
        </div>
    `;
};
