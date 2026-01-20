/**
 * RESOURCEB.JS (MOD-08)
 * Visualización de cuota de sujetos.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

export const ResourceB = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');
    const energy = useGameState('energy');
    const stability = useGameState('stability');
    const resonanceSync = useGameState('resonanceSync');

    // Lógica de objetivos dinámicos (MOD-08)
    const getObjective = () => {
        if (processedCount >= quota) return "CUOTA ALCANZADA: Esperando reporte final.";
        if (energy < 30) return "ALERTA: Energía crítica. Sacrificar sujetos para restaurar núcleo.";
        if (stability < 40) return "ADVERTENCIA: Inestabilidad neural detectada. Autorizar sujetos puros.";
        if (resonanceSync < 0.5) return "OBJETIVO: Sincronizar Resonancia para estabilizar sujeto.";
        return "OPERACIÓN: Analizar sujetos y decidir su destino en COMMS.";
    };

    return html`
        <div className="flex flex-col h-full font-mono p-5 bg-zinc-900/20 overflow-y-auto custom-scrollbar border border-zinc-800">
            <div className="space-y-6">
                <div className="flex flex-col">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-bold">SYSTEM_IDENT</span>
                    <div className="text-[14px] font-bold text-zinc-300">SHIFT_ID: 01-ZHYR</div>
                </div>

                <div className="flex flex-col p-3 bg-zinc-950/40 border border-zinc-800/50 mb-4">
                    <span className="text-[12px] text-amber-500 uppercase tracking-widest font-bold mb-1">CURRENT_OBJECTIVE</span>
                    <div className="text-[12px] text-zinc-300 leading-tight">
                        ${getObjective()}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-bold">OBJECTIVE_TRACKER</span>
                    <div className="text-[14px] font-bold text-emerald-500">
                        QUOTA_PROGRESS: ${processedCount} / ${quota}
                    </div>
                    <div className="w-full bg-zinc-950 h-2 mt-2 relative overflow-hidden border border-zinc-800">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-bold">INTEGRITY_LOG</span>
                    <div className=${`text-[14px] font-bold ${judgmentErrors > 0 ? (judgmentErrors > 3 ? 'text-red-600' : 'text-amber-500') : 'text-zinc-500'}`}>
                        ERROR_LOG: [${judgmentErrors.toString().padStart(2, '0')}]
                    </div>
                </div>
            </div>

            ${processedCount >= quota && html`
                <div className="mt-auto pt-4 border-t border-emerald-900/30">
                    <div className="text-[12px] text-emerald-500 uppercase tracking-widest text-center font-bold animate-pulse">
                        CUOTA_ALCANZADA // ESPERANDO_REPORTE
                    </div>
                </div>
            `}
        </div>
    `;
};
