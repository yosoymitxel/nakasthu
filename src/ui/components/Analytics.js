/**
 * ANALYTICS.JS (MOD-02)
 * Procesador de datos y visualización de trazas.
 * Rediseño industrial para Rows 4-5.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';
import { CONFIG } from '../../data/gameConfig.js';
import { analyzeSubjectProbability, formatScanDetail } from '../../utils/scannerUtils.js';

const { useState, useEffect, useMemo } = React;

export const Analytics = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lines, setLines] = useState([]); // Array de { text, color }
    const [corruptionProb, setCorruptionProb] = useState(null);
    const [prevProb, setPrevProb] = useState(null);

    const currentEntity = useGameState('currentEntity');
    const stability = useGameState('stability');
    const mode = useGameState('mode');
    const focusMode = useGameState('focusMode');
    const storyPath = useGameState('storyPath') || 0;

    const resonanceSync = useGameState('resonanceSync');
    const localFrequency = useGameState('localFrequency');

    const labels = useMemo(() => CONFIG.UI.LABELS[storyPath], [storyPath]);
    const anaLabels = labels.analytics;
    const anaConstants = anaLabels.CONSTANTS;

    const isUnstable = stability < anaConstants.UNSTABLE_THRESHOLD;
    const isSectarian = storyPath === 1;

    // Sincronizar el promedio de corrupción cada vez que cambia el historial
    useEffect(() => {
        if (currentEntity?.scannedData?.corruptionHistory) {
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

    useEffect(() => {
        const onScanStart = (data) => {
            setIsProcessing(true);
            const scanName = labels.scans[data.type.id] || data.type.name;
            setLines(prev => [{ text: `> ${anaLabels.invokingTrace}: ${scanName}`, color: 'text-zinc-500' }, ...prev]);
        };

        const onScanComplete = (data) => {
            setIsProcessing(false);
            if (currentEntity) {
                const { scannedData } = currentEntity;
                
                const valMap = {
                    BIOMETRIC: Math.floor(scannedData.temperature),
                    NEURAL: Math.floor(scannedData.neuralSync),
                    THERMAL: Math.floor(scannedData.heatSignature || 0),
                    NAKARA: Math.floor(scannedData.voidDepth || 0),
                    RESONANCE: Math.floor(localFrequency || 0)
                };

                const pattern = anaLabels.results[data.type.id] || anaLabels.results.DEFAULT;
                
                // Asegurar que formatScanDetail esté disponible (Fix ReferenceError)
                const detail = typeof formatScanDetail === 'function' 
                    ? formatScanDetail(pattern, valMap[data.type.id])
                    : pattern.replace('{val}', valMap[data.type.id]);
                
                const newProb = analyzeSubjectProbability(data.type.id, currentEntity, mode);

                let trendColor = "text-zinc-400";
                if (newProb !== null) {
                    if (newProb > anaConstants.PROB_CRITICAL) trendColor = "text-red-400";
                    else if (newProb > anaConstants.PROB_WARNING) trendColor = "text-orange-400";
                    else trendColor = isSectarian ? "text-purple-400" : "text-cyan-400";

                    // Actualizar el historial de indicios en el estado global
                    if (currentEntity.scannedData) {
                        if (!currentEntity.scannedData.corruptionHistory) {
                            currentEntity.scannedData.corruptionHistory = [];
                        }
                        currentEntity.scannedData.corruptionHistory.push(newProb);
                    }
                }

                const scanName = labels.scans[data.type.id] || data.type.name;
                const dataString = `> SCAN: ${scanName} | RESULT: [${detail}] | PROB: ${newProb || '??'}%`;
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

        const onNewSubject = (entity) => {
            setLines([
                { text: `> ${anaLabels.monitoring}: ENTIDAD_${entity.id}_DETECTADA`, color: isSectarian ? 'text-purple-400' : 'text-cyan-400' },
                { text: `> ANALISIS_INICIAL: [PROCESANDO...]`, color: 'text-zinc-500' }
            ]);
            setCorruptionProb(null);
            setPrevProb(null);
        };

        const onDialogueStarted = () => {
            setLines(prev => [
                { text: `> ${labels.operations.interrogateBtn.split('[')[0].trim()}: ${anaLabels.monitoring}`, color: isSectarian ? 'text-purple-600' : 'text-cyan-600' },
                { text: `> ${anaLabels.linkActive}`, color: isSectarian ? 'text-purple-500' : 'text-cyan-500' }, 
                ...prev
            ].slice(0, 50));
        };

        const onDialogueOptionSelected = (data) => {
            const { corruptionImpact, stabilityImpact } = data;
            
            let impactStr = '';
            if (corruptionImpact !== 0) impactStr += ` | CORR: ${corruptionImpact > 0 ? '+' : ''}${corruptionImpact}%`;
            if (stabilityImpact !== 0) impactStr += ` | STAB: ${stabilityImpact > 0 ? '+' : ''}${stabilityImpact}%`;

            setLines(prev => [
                { text: `> ${labels.operations.operatorSender}: ${data.option}`, color: 'text-zinc-400' },
                { text: `> ANALISIS_INTERACCION: [${impactStr.trim() || 'NOMINAL'}]`, color: impactStr.includes('+') ? 'text-red-400' : 'text-cyan-500' },
                ...prev
            ].slice(0, 50));
        };

        const onDialogueEnded = () => {
            setLines(prev => [
                { text: `> ${anaLabels.statusLabel}: ENLACE_CERRADO`, color: 'text-zinc-600' },
                ...prev
            ].slice(0, 50));
        };

        bus.on('SCAN_STARTED', onScanStart);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('DIALOGUE_STARTED', onDialogueStarted);
        bus.on('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
        bus.on('DIALOGUE_ENDED', onDialogueEnded);
        return () => {
            bus.off('SCAN_STARTED', onScanStart);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('DIALOGUE_STARTED', onDialogueStarted);
            bus.off('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
            bus.off('DIALOGUE_ENDED', onDialogueEnded);
        };
    }, [currentEntity, mode, localFrequency, isSectarian, anaLabels, labels]);

    return html`
        <div className="flex flex-col h-full bg-transparent font-mono overflow-hidden">
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <h2 className="text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase">
                    ${anaLabels.header}
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
                            ${anaLabels.probabilityLabel}
                        </span>
                        <div className="flex items-center gap-2">
                            ${prevProb !== null && corruptionProb !== null && html`
                                <span className=${`text-[10px] font-bold ${corruptionProb > prevProb ? 'text-red-500' : (corruptionProb < prevProb ? 'text-emerald-500' : 'text-zinc-500')}`}>
                                    ${corruptionProb > prevProb ? '▲' : (corruptionProb < prevProb ? '▼' : '=')}
                                </span>
                            `}
                            <span className=${`text-[24px] font-black leading-none ${
                                corruptionProb === null ? 'text-zinc-800' : 
                                corruptionProb > anaConstants.PROB_CRITICAL ? 'text-red-500' : 
                                corruptionProb > anaConstants.PROB_WARNING ? 'text-orange-400' : (isSectarian ? 'text-purple-400' : 'text-cyan-400')
                            }`}>
                                ${corruptionProb === null ? '--%' : `${corruptionProb}%`}
                            </span>
                        </div>
                    </div>
                    <div className="h-[4px] w-full bg-zinc-900 relative overflow-hidden">
                        <div 
                            className=${`h-full transition-all duration-[${anaConstants.TRANSITION_MS}ms] ${
                                corruptionProb > anaConstants.PROB_CRITICAL ? 'bg-red-500/60' : 
                                corruptionProb > anaConstants.PROB_WARNING ? 'bg-orange-400/60' : (isSectarian ? 'bg-purple-400/60' : 'bg-cyan-400/60')
                            }`}
                            style=${{ width: `${corruptionProb || 0}%` }}
                        ></div>
                    </div>
                </div>

                <!-- Log de Datos Recuperados -->
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="text-[12px] text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 font-bold flex justify-between">
                        <span>${anaLabels.logLabel}</span>
                        ${focusMode && html`<span className=${`${isSectarian ? 'text-purple-600' : 'text-cyan-600'} animate-pulse text-[10px]`}>${anaLabels.traceActive}</span>`}
                    </div>
                    ${lines.map((line, i) => html`
                        <div key=${i} className=${`text-[10px] leading-tight animate-in fade-in slide-in-from-left-1 duration-300 ${line.color}`}>
                            ${line.text}
                        </div>
                    `)}
                </div>
            </div>

            <!-- Status de Procesador -->
            <div className="mt-auto p-3 pt-2 border-t border-zinc-800 flex justify-between items-center bg-black/10">
                <div className="flex gap-2 items-center">
                    <div className=${`w-2 h-2 ${isProcessing ? (isSectarian ? 'bg-purple-500 animate-ping' : 'bg-cyan-500 animate-ping') : 'bg-zinc-800'}`}></div>
                    <span className="text-[12px] text-zinc-500 uppercase tracking-tighter">${anaLabels.statusLabel} ${isProcessing ? anaLabels.active : anaLabels.ready}</span>
                </div>
                <span className=${`text-[12px] font-bold ${isUnstable ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`}>
                    ${isUnstable ? anaLabels.warn : anaLabels.nominal}
                </span>
            </div>
        </div>
    `;
};
