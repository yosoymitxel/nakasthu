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
    const storyPath = useGameState('storyPath');

    const isSectarian = storyPath === 1;

    // Lógica de objetivos dinámicos (MOD-08)
    const getObjective = () => {
        if (isSectarian) {
            if (processedCount >= quota) return "OFRENDA COMPLETADA: El vacío aguarda el reporte final.";
            if (energy < 30) return "ALERTA: Fe agonizante. Purgar almas para alimentar el fuego.";
            if (stability < 40) return "ADVERTENCIA: Disonancia espiritual. Consagrar devotos puros.";
            if (resonanceSync < 0.5) return "OBJETIVO: Armonizar la Resonancia para estabilizar la esencia.";
            return "RITUAL: Examinar almas y decidir su destino en el CANAL.";
        }
        if (processedCount >= quota) return "CUOTA ALCANZADA: Esperando reporte final.";
        if (energy < 30) return "ALERTA: Energía crítica. Sacrificar sujetos para restaurar núcleo.";
        if (stability < 40) return "ADVERTENCIA: Inestabilidad neural detectada. Autorizar sujetos puros.";
        if (resonanceSync < 0.5) return "OBJETIVO: Sincronizar Resonancia para estabilizar sujeto.";
        return "OPERACIÓN: Analizar sujetos y decidir su destino en COMMS.";
    };

    return html`
        <div className=${`flex flex-col h-full font-mono p-5 overflow-y-auto custom-scrollbar border transition-colors ${isSectarian ? 'bg-indigo-950/10 border-indigo-900/30' : 'bg-zinc-900/20 border-zinc-800'}`}>
            <div className="space-y-6">
                <div className="flex flex-col">
                    <span className=${`text-[12px] uppercase tracking-widest font-bold ${isSectarian ? 'text-indigo-400' : 'text-zinc-400'}`}>
                        ${isSectarian ? 'DOGMA_IDENT' : 'SYSTEM_IDENT'}
                    </span>
                    <div className="text-[14px] font-bold text-zinc-300">
                        ${isSectarian ? 'RITO_ID: 01-ZHYR' : 'SHIFT_ID: 01-ZHYR'}
                    </div>
                </div>

                <div className=${`flex flex-col p-3 border mb-4 transition-colors ${isSectarian ? 'bg-purple-950/30 border-purple-900/50' : 'bg-zinc-950/40 border-zinc-800/50'}`}>
                    <span className=${`text-[12px] uppercase tracking-widest font-bold mb-1 ${isSectarian ? 'text-purple-400' : 'text-amber-500'}`}>
                        ${isSectarian ? 'MANDATO_ACTUAL' : 'CURRENT_OBJECTIVE'}
                    </span>
                    <div className="text-[12px] text-zinc-300 leading-tight">
                        ${getObjective()}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className=${`text-[12px] uppercase tracking-widest font-bold ${isSectarian ? 'text-indigo-400' : 'text-zinc-400'}`}>
                        ${isSectarian ? 'COSECHA_TRACKER' : 'OBJECTIVE_TRACKER'}
                    </span>
                    <div className=${`text-[14px] font-bold ${isSectarian ? 'text-purple-400' : 'text-emerald-500'}`}>
                        ${isSectarian ? 'PROGRESO_RITUAL' : 'QUOTA_PROGRESS'}: ${processedCount} / ${quota}
                    </div>
                    <div className=${`w-full h-2 mt-2 relative overflow-hidden border ${isSectarian ? 'bg-indigo-950 border-indigo-900' : 'bg-zinc-950 border-zinc-800'}`}>
                        <div 
                            className=${`h-full transition-all duration-700 ease-out ${isSectarian ? 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className=${`text-[12px] uppercase tracking-widest font-bold ${isSectarian ? 'text-indigo-400' : 'text-zinc-400'}`}>
                        ${isSectarian ? 'REGISTRO_DE_CISMA' : 'INTEGRITY_LOG'}
                    </span>
                    <div className=${`text-[14px] font-bold ${judgmentErrors > 0 ? (judgmentErrors > 3 ? 'text-red-600' : (isSectarian ? 'text-purple-400' : 'text-amber-500')) : 'text-zinc-500'}`}>
                        ${isSectarian ? 'ERRORES_DE_FE' : 'ERROR_LOG'}: [${judgmentErrors.toString().padStart(2, '0')}]
                    </div>
                </div>
            </div>

            ${processedCount >= quota && html`
                <div className=${`mt-auto pt-4 border-t ${isSectarian ? 'border-purple-900/30' : 'border-emerald-900/30'}`}>
                    <div className=${`text-[12px] uppercase tracking-widest text-center font-bold animate-pulse ${isSectarian ? 'text-purple-400' : 'text-emerald-500'}`}>
                        ${isSectarian ? 'OFRENDA_ALCANZADA // ESPERANDO_ASCENSIÓN' : 'CUOTA_ALCANZADA // ESPERANDO_REPORTE'}
                    </div>
                </div>
            `}
        </div>
    `;
};
