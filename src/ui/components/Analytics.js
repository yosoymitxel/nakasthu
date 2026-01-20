/**
 * ANALYTICS.JS (MOD-02)
 * Procesador de datos y visualización de trazas.
 * Rediseño industrial para Rows 4-5.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect } = React;

export const Analytics = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lines, setLines] = useState([]);
    const [corruptionProb, setCorruptionProb] = useState(null);
    
    const currentEntity = useGameState('currentEntity');
    const stability = useGameState('stability');
    const mode = useGameState('mode');

    const isUnstable = stability < 40;

    const analyzeSubject = (scanType, entity, currentMode) => {
        if (!entity) return null;
        let precision = scanType === 'NEURAL' ? 0.9 : 0.5;
        const eclipseInterference = currentMode === 'ECLIPSE' ? 0.2 : 0;
        precision = Math.max(0.1, precision - eclipseInterference);
        const showTruth = Math.random() < precision;
        const displayedIsCorrupt = showTruth ? entity.isCorrupt : !entity.isCorrupt;
        let prob = displayedIsCorrupt ? (precision * 100 + (Math.random() * (100 - precision * 100))) : ((1 - precision) * 100 * Math.random());
        return Math.floor(prob);
    };

    useEffect(() => {
        const onScanStart = (data) => {
            setIsProcessing(true);
            setLines(prev => [`> INICIANDO_ANALÍTICA: ${data.type.name}`, ...prev]);
        };

        const onScanComplete = (data) => {
            setIsProcessing(false);
            if (currentEntity) {
                const { scannedData } = currentEntity;
                let detail = "";
                let newProb = null;
                switch(data.type.id) {
                    case 'BIOMETRIC': 
                        detail = `TEMP: ${Math.floor(scannedData.temperature)}°C`; 
                        newProb = analyzeSubject('BIOMETRIC', currentEntity, mode);
                        break;
                    case 'NEURAL': 
                        detail = `SYNC: ${Math.floor(scannedData.neuralSync)}%`; 
                        newProb = analyzeSubject('NEURAL', currentEntity, mode);
                        break;
                    default: detail = `DATA_RECOVERY: SUCCESS`;
                }
                
                if (newProb !== null) setCorruptionProb(newProb);
                
                const dataString = `> SCAN: ${data.type.name} | RESULT: [${detail}] | PROB: ${newProb || '??'}%`;
                setLines(prev => [dataString, ...prev]);

                // ENVIAR A LORE (MOD-09)
                bus.emit('LORE_DATA_EMITTED', {
                    content: dataString,
                    entityId: currentEntity.id,
                    timestamp: Date.now()
                });
            } else {
                setLines(prev => [`> ERROR: ENTIDAD_NO_VALIDA`, ...prev]);
            }
        };

        const onNewSubject = () => {
            setLines([]);
            setCorruptionProb(null);
        };

        bus.on('SCAN_STARTED', onScanStart);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        return () => {
            bus.off('SCAN_STARTED', onScanStart);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
        };
    }, [currentEntity, mode]);

    return html`
        <div className="flex flex-col h-full p-3 bg-transparent font-mono overflow-hidden">
            <!-- Probabilidad de Corrupción (Main Display) -->
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-[0.2em] font-bold">Probabilidad_Corrupción</span>
                    <span className=${`text-[24px] font-black leading-none ${corruptionProb === null ? 'text-zinc-800' : (corruptionProb > 70 ? 'text-red-500' : 'text-cyan-400')}`}>
                        ${corruptionProb === null ? '--%' : `${corruptionProb}%`}
                    </span>
                </div>
                <div className="h-[4px] w-full bg-zinc-900 relative overflow-hidden">
                    <div 
                        className=${`h-full transition-all duration-[1500ms] ${corruptionProb > 70 ? 'bg-red-500/60' : 'bg-cyan-400/60'}`}
                        style=${{ width: `${corruptionProb || 0}%` }}
                    ></div>
                </div>
            </div>

            <!-- Log de Datos Recuperados -->
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="text-[12px] text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 font-bold">Análisis_Trazas_Log</div>
                ${lines.length === 0 ? html`
                    <div className="text-[12px] text-zinc-600 italic uppercase tracking-widest mt-2">
                        Esperando_Datos...
                    </div>
                ` : lines.map((line, i) => html`
                    <div key=${i} className="text-[12px] text-zinc-400 border-l border-zinc-800 pl-3 leading-tight py-1">
                        ${line}
                    </div>
                `)}
            </div>

            <!-- Status de Procesador -->
            <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <div className=${`w-2 h-2 ${isProcessing ? 'bg-cyan-500 animate-ping' : 'bg-zinc-800'}`}></div>
                    <span className="text-[12px] text-zinc-500 uppercase tracking-tighter">Estado: ${isProcessing ? 'ACTIVO' : 'LISTO'}</span>
                </div>
                <span className=${`text-[12px] font-bold ${isUnstable ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`}>
                    ${isUnstable ? 'WARN: ESTABILIDAD' : 'NOMINAL'}
                </span>
            </div>
        </div>
    `;
};
