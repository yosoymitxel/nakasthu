/**
 * CONTROLPANEL.JS
 * Bloque 8: Panel de Control.
 * Botones de Manual y Pausa.
 */
import { html } from '../utils/html.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

export const ControlPanel = () => {
    const isPaused = useGameState('isPaused');
    const isTutorialActive = useGameState('isTutorialActive');

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
        bus.emit('OPEN_MODAL', {
            title: 'OPERATIONAL_MANUAL',
            content: html`
                <div className="space-y-4 text-zinc-400 font-mono text-[11px]">
                    <p><strong className="text-cyan-500">OBJETIVO:</strong> Procesar biomasa según criterios de pureza.</p>
                    <p><strong className="text-red-500">SACRIFICAR:</strong> Elimina sujetos corruptos (+30 Energía). Error si es puro (-25 Estabilidad).</p>
                    <p><strong className="text-emerald-500">AUTORIZAR:</strong> Permite el paso de sujetos puros (-10 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).</p>
                    <p><strong className="text-amber-500">RESONANCIA:</strong> Sincroniza frecuencia y fase para evitar degradación de estabilidad.</p>
                </div>
            `
        });
    };

    return html`
        <div className="relative flex flex-col h-full w-full bg-black/20 p-2 justify-center items-center gap-1">
            <!-- BOTONES DE CONTROL (Strict Block 8) -->
            <div className="flex gap-2 mb-2">
                <button 
                    onClick=${handleManual}
                    className="w-8 h-8 border border-amber-900/50 bg-amber-950/20 text-amber-500 flex items-center justify-center text-[10px] font-bold hover:bg-amber-500/20 transition-all"
                    title="MANUAL"
                >
                    M
                </button>
                <button 
                    onClick=${() => state.isPaused = !state.isPaused}
                    className=${`w-8 h-8 border flex items-center justify-center text-[10px] font-bold transition-all ${isPaused ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-cyan-500'}`}
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

            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Centro de Control</div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[6px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Link_Active</span>
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            </div>
        </div>
    `;
};
