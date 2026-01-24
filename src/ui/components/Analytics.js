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
    const storyPath = useGameState('storyPath');

    const resonanceSync = useGameState('resonanceSync');
    const localFrequency = useGameState('localFrequency');

    const isUnstable = stability < 40;
    const isSectarian = storyPath === 1;

    // Sincronizar el promedio de corrupción cada vez que cambia el historial
    useEffect(() => {
        if (currentEntity && currentEntity.scannedData && currentEntity.scannedData.corruptionHistory) {
            const history = currentEntity.scannedData.corruptionHistory;
            if (history.length > 0) {
                const average = Math.floor(history.reduce((a, b) => a + b, 0) / history.length);
                if (average !== corruptionProb) {
                    setPrevProb(corruptionProb);
                    setCorruptionProb(average);
                }
            }
        }
    }, [currentEntity?.scannedData?.corruptionHistory?.length]);

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
            const label = isSectarian ? 'INVOCANDO_TRAZA' : 'INICIANDO_ANALÍTICA';
            setLines(prev => [{ text: `> ${label}: ${data.type.name}`, color: 'text-zinc-500' }, ...prev]);
        };

        const onScanComplete = (data) => {
            setIsProcessing(false);
            if (currentEntity) {
                const { scannedData } = currentEntity;
                let detail = "";
                let newProb = null;
                switch (data.type.id) {
                    case 'BIOMETRIC':
                        detail = isSectarian ? `AURA: ${Math.floor(scannedData.temperature)}%` : `TEMP: ${Math.floor(scannedData.temperature)}°C`;
                        break;
                    case 'NEURAL':
                        detail = isSectarian ? `COMUNIÓN: ${Math.floor(scannedData.neuralSync)}%` : `SYNC: ${Math.floor(scannedData.neuralSync)}%`;
                        break;
                    case 'THERMAL':
                        detail = isSectarian ? `GRADO_HUMANO: ${Math.floor(scannedData.heatSignature || 0)}λ` : `HEAT_SIG: ${Math.floor(scannedData.heatSignature || 0)}λ`;
                        break;
                    case 'NAKARA':
                        detail = isSectarian ? `PROFUNDIDAD_ALMA: ${Math.floor(scannedData.voidDepth || 0)}m` : `VOID_DEPTH: ${Math.floor(scannedData.voidDepth || 0)}m`;
                        break;
                    case 'RESONANCE':
                        detail = isSectarian ? `SANTUARIO: ${Math.floor(localFrequency || 0)}Hz` : `FREQ: ${Math.floor(localFrequency || 0)}Hz`;
                        break;
                    default: detail = isSectarian ? `GRACIA_RECIBIDA: OK` : `DATA_RECOVERY: SUCCESS`;
                }
                
                newProb = analyzeSubject(data.type.id, currentEntity, mode);

                let trendColor = "text-zinc-400";
                if (newProb !== null) {
                    if (newProb > 70) trendColor = "text-red-400";
                    else if (newProb > 35) trendColor = "text-orange-400";
                    else trendColor = isSectarian ? "text-purple-400" : "text-cyan-400";

                    // Actualizar el historial de indicios en el estado global
                    if (currentEntity.scannedData) {
                        if (!currentEntity.scannedData.corruptionHistory) {
                            currentEntity.scannedData.corruptionHistory = [];
                        }
                        currentEntity.scannedData.corruptionHistory.push(newProb);
                    }
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
                { text: `> ${isSectarian ? 'COMUNIÓN' : 'INTERROGAR'}: ${isSectarian ? 'SINTONIZANDO_SUSURROS_ALMA' : 'MONITORIZANDO_RESPUESTAS_VOCALES'}`, color: isSectarian ? 'text-purple-600' : 'text-cyan-600' },
                { text: `> ${isSectarian ? 'VÍNCULO_ESPIRITUAL_ACTIVO' : 'ENLACE_NEURAL_ACTIVO'}`, color: isSectarian ? 'text-purple-500' : 'text-cyan-500' }, 
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
    }, [currentEntity, mode, localFrequency, isSectarian]);

    return html`
        <div className="flex flex-col h-full bg-transparent font-mono overflow-hidden">
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <h2 className="text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase">
                    ${isSectarian ? 'MOD-02: ANALÍTICA_DE_FE' : 'MOD-02: DATA_ANALYTICS'}
                </h2>
                <div className="flex gap-1">
                    <div className=${`w-2 h-0.5 ${isProcessing ? 'animate-pulse bg-amber-500' : 'bg-zinc-800'}`}></div>
                    <div className=${`w-2 h-0.5 ${isProcessing ? 'animate-pulse bg-amber-500' : 'bg-zinc-800'}`}></div>
                </div>
            </header>

            <div className="p-3 flex-1 flex flex-col min-h-0">
                <!-- Probabilidad de Corrupción (Main Display) -->
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[12px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
                            ${isSectarian ? 'Pureza_del_Alma' : 'Probabilidad_Corrupción'}
                        </span>
                        <div className="flex items-center gap-2">
                            ${prevProb !== null && corruptionProb !== null && html`
                                <span className=${`text-[10px] font-bold ${corruptionProb > prevProb ? 'text-red-500' : (corruptionProb < prevProb ? 'text-emerald-500' : 'text-zinc-500')}`}>
                                    ${corruptionProb > prevProb ? '▲' : (corruptionProb < prevProb ? '▼' : '=')}
                                </span>
                            `}
                            <span className=${`text-[24px] font-black leading-none ${
                                corruptionProb === null ? 'text-zinc-800' : 
                                corruptionProb > 70 ? 'text-red-500' : 
                                corruptionProb > 35 ? 'text-orange-400' : (isSectarian ? 'text-purple-400' : 'text-cyan-400')
                            }`}>
                                ${corruptionProb === null ? '--%' : `${corruptionProb}%`}
                            </span>
                        </div>
                    </div>
                    <div className="h-[4px] w-full bg-zinc-900 relative overflow-hidden">
                        <div 
                            className=${`h-full transition-all duration-[1500ms] ${
                                corruptionProb > 70 ? 'bg-red-500/60' : 
                                corruptionProb > 35 ? 'bg-orange-400/60' : (isSectarian ? 'bg-purple-400/60' : 'bg-cyan-400/60')
                            }`}
                            style=${{ width: `${corruptionProb || 0}%` }}
                        ></div>
                    </div>
                </div>

                <!-- Log de Datos Recuperados -->
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="text-[12px] text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 font-bold flex justify-between">
                        <span>${isSectarian ? 'Lectura_de_Emanaciones' : 'Análisis_Trazas_Log'}</span>
                        ${focusMode && html`<span className=${`${isSectarian ? 'text-purple-600' : 'text-cyan-600'} animate-pulse text-[10px]`}>${isSectarian ? 'COMUNIÓN_ACTIVA' : 'NEURAL_TRACE_ACTIVE'}</span>`}
                    </div>
                    ${focusMode && html`
                        <div className=${`text-[12px] ${isSectarian ? 'text-purple-500/80' : 'text-cyan-500/80'} italic uppercase tracking-widest mb-2 animate-pulse`}>
                            > ${isSectarian ? 'ESCUCHANDO_AL_ÍDOLO...' : 'ANALIZANDO_PATRON_VOCAL...'} [${Math.floor(Date.now() / 1000) % 2 === 0 ? '|||' : '... '}]
                        </div>
                    `}
                    ${lines.length === 0 && !focusMode ? html`
                        <div className="text-[12px] text-zinc-600 italic uppercase tracking-widest mt-2">
                            ${isSectarian ? 'Esperando_Señal...' : 'Esperando_Datos...'}
                        </div>
                    ` : lines.map((line, i) => html`
                        <div key=${i} className=${`text-[12px] border-l border-zinc-800 pl-3 leading-tight py-1 ${line.color || 'text-zinc-400'}`}>
                            ${line.text}
                        </div>
                    `)}
                </div>
            </div>

            <!-- Status de Procesador -->
            <div className="mt-auto p-3 pt-2 border-t border-zinc-800 flex justify-between items-center bg-black/10">
                <div className="flex gap-2 items-center">
                    <div className=${`w-2 h-2 ${isProcessing ? (isSectarian ? 'bg-purple-500 animate-ping' : 'bg-cyan-500 animate-ping') : 'bg-zinc-800'}`}></div>
                    <span className="text-[12px] text-zinc-500 uppercase tracking-tighter">${isSectarian ? 'Altar:' : 'Estado:'} ${isProcessing ? 'ACTIVO' : 'LISTO'}</span>
                </div>
                <span className=${`text-[12px] font-bold ${isUnstable ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`}>
                    ${isUnstable ? (isSectarian ? 'AVISO: AGITACIÓN' : 'WARN: ESTABILIDAD') : 'NOMINAL'}
                </span>
            </div>
        </div>
    `;
};
