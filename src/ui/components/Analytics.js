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
    const [lines, setLines] = useState([]); // Array de { text, color }
    const [corruptionProb, setCorruptionProb] = useState(null);
    const [prevProb, setPrevProb] = useState(null);

    const currentEntity = useGameState('currentEntity');
    const stability = useGameState('stability');
    const mode = useGameState('mode');
    const focusMode = useGameState('focusMode');

    const isUnstable = stability < 40;

    const analyzeSubject = (scanType, entity, currentMode) => {
        if (!entity) return null;
        let precision = 0.5;
        switch (scanType) {
            case 'NEURAL': precision = 0.9; break;
            case 'NAKARA': precision = 0.95; break;
            case 'RESONANCE': precision = 0.7; break;
            case 'THERMAL': precision = 0.6; break;
            case 'BIOMETRIC': precision = 0.5; break;
        }
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
            setLines(prev => [{ text: `> INICIANDO_ANALÍTICA: ${data.type.name}`, color: 'text-zinc-500' }, ...prev]);
        };

        const onScanComplete = (data) => {
            setIsProcessing(false);
            if (currentEntity) {
                const { scannedData } = currentEntity;
                let detail = "";
                let newProb = null;
                switch (data.type.id) {
                    case 'BIOMETRIC':
                        detail = `TEMP: ${Math.floor(scannedData.temperature)}°C`;
                        break;
                    case 'NEURAL':
                        detail = `SYNC: ${Math.floor(scannedData.neuralSync)}%`;
                        break;
                    case 'THERMAL':
                        detail = `HEAT_SIG: ${Math.floor(scannedData.heatSignature || 0)}λ`;
                        break;
                    case 'NAKARA':
                        detail = `VOID_DEPTH: ${Math.floor(scannedData.voidDepth || 0)}m`;
                        break;
                    case 'RESONANCE':
                        detail = `FREQ: ${state.localFrequency.toFixed(2)}Hz`;
                        break;
                    default: detail = `DATA_RECOVERY: SUCCESS`;
                }
                
                newProb = analyzeSubject(data.type.id, currentEntity, mode);

                let trendColor = "text-zinc-400";
                if (newProb !== null) {
                    if (newProb > 70) trendColor = "text-red-400";
                    else if (newProb > 35) trendColor = "text-orange-400";
                    else trendColor = "text-cyan-400";
                    
                    setPrevProb(corruptionProb);
                    setCorruptionProb(newProb);
                }

                const dataString = `> SCAN: ${data.type.name} | RESULT: [${detail}] | PROB: ${newProb || '??'}%`;
                setLines(prev => [{ text: dataString, color: trendColor }, ...prev]);

                // ENVIAR A LORE (MOD-09)
                bus.emit('LORE_DATA_EMITTED', {
                    content: dataString,
                    entityId: currentEntity.id,
                    timestamp: Date.now()
                });
            } else {
                setLines(prev => [{ text: `> ERROR: ENTIDAD_NO_VALIDA`, color: 'text-red-500' }, ...prev]);
            }
        };

        const onNewSubject = () => {
            setLines([]);
            setCorruptionProb(null);
            setPrevProb(null);
        };

        const onDialogueStarted = () => {
            setLines(prev => [
                { text: `> INTERROGAR: MONITORIZANDO_RESPUESTAS_VOCALES`, color: 'text-cyan-600' },
                { text: `> ENLACE_NEURAL_ACTIVO`, color: 'text-cyan-500' }, 
                ...prev
            ]);
        };

        bus.on('SCAN_STARTED', onScanStart);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('DIALOGUE_STARTED', onDialogueStarted);
        return () => {
            bus.off('SCAN_STARTED', onScanStart);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('DIALOGUE_STARTED', onDialogueStarted);
        };
    }, [currentEntity, mode]);

    return html`
        <div className="flex flex-col h-full p-3 bg-transparent font-mono overflow-hidden">
            <!-- Probabilidad de Corrupción (Main Display) -->
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[12px] text-zinc-400 uppercase tracking-[0.2em] font-bold">Probabilidad_Corrupción</span>
                    <div className="flex items-center gap-2">
                        ${prevProb !== null && corruptionProb !== null && html`
                            <span className=${`text-[10px] font-bold ${corruptionProb > prevProb ? 'text-red-500' : (corruptionProb < prevProb ? 'text-emerald-500' : 'text-zinc-500')}`}>
                                ${corruptionProb > prevProb ? '▲' : (corruptionProb < prevProb ? '▼' : '=')}
                            </span>
                        `}
                        <span className=${`text-[24px] font-black leading-none ${
                            corruptionProb === null ? 'text-zinc-800' : 
                            corruptionProb > 70 ? 'text-red-500' : 
                            corruptionProb > 35 ? 'text-orange-400' : 'text-cyan-400'
                        }`}>
                            ${corruptionProb === null ? '--%' : `${corruptionProb}%`}
                        </span>
                    </div>
                </div>
                <div className="h-[4px] w-full bg-zinc-900 relative overflow-hidden">
                    <div 
                        className=${`h-full transition-all duration-[1500ms] ${
                            corruptionProb > 70 ? 'bg-red-500/60' : 
                            corruptionProb > 35 ? 'bg-orange-400/60' : 'bg-cyan-400/60'
                        }`}
                        style=${{ width: `${corruptionProb || 0}%` }}
                    ></div>
                </div>
            </div>

            <!-- Log de Datos Recuperados -->
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="text-[12px] text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 font-bold flex justify-between">
                    <span>Análisis_Trazas_Log</span>
                    ${focusMode && html`<span className="text-cyan-600 animate-pulse text-[10px]">NEURAL_TRACE_ACTIVE</span>`}
                </div>
                ${focusMode && html`
                    <div className="text-[12px] text-cyan-500/80 italic uppercase tracking-widest mb-2 animate-pulse">
                        > ANALIZANDO_PATRON_VOCAL... [${Math.floor(Date.now() / 1000) % 2 === 0 ? '|||' : '... '}]
                    </div>
                `}
                ${lines.length === 0 && !focusMode ? html`
                    <div className="text-[12px] text-zinc-600 italic uppercase tracking-widest mt-2">
                        Esperando_Datos...
                    </div>
                ` : lines.map((line, i) => html`
                    <div key=${i} className=${`text-[12px] border-l border-zinc-800 pl-3 leading-tight py-1 ${line.color || 'text-zinc-400'}`}>
                        ${line.text}
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
