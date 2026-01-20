/**
 * RESOURCEB.JS (MOD-08)
 * Visualización de cuota de sujetos.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

export const ResourceB = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const currentTurn = useGameState('currentTurn');
    const judgmentErrors = useGameState('judgmentErrors');

    return html`
        <div className="flex flex-col h-full font-mono p-5 bg-zinc-950/50 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">SYSTEM_IDENT</span>
                    <div className="text-sm font-bold text-zinc-300">SHIFT_ID: 01-ZHYR</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">OBJECTIVE_TRACKER</span>
                    <div className="text-sm font-bold text-emerald-500">
                        QUOTA_PROGRESS: ${processedCount} / ${quota}
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 mt-1 relative overflow-hidden border border-zinc-800">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">INTEGRITY_LOG</span>
                    <div className=${`text-sm font-bold ${judgmentErrors > 0 ? (judgmentErrors > 3 ? 'text-red-600' : 'text-amber-500') : 'text-zinc-600'}`}>
                        ERROR_LOG: [${judgmentErrors.toString().padStart(2, '0')}]
                    </div>
                </div>
            </div>

            ${processedCount >= quota && html`
                <div className="mt-auto pt-2 border-t border-emerald-900/30">
                    <div className="text-[8px] text-emerald-500 uppercase tracking-widest text-center">
                        CUOTA_ALCANZADA // ESPERANDO_REPORTE
                    </div>
                </div>
            `}
        </div>
    `;
};
