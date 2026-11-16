/**
 * ANALYTICS.JS (MOD-02)
 * Procesador de datos y visualización de trazas.
 * Rediseño industrial para Rows 4-5.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { STEPS_CONFIG } from '../../data/stepsConfig.js';
import { formatScanDetail } from '../../utils/scannerUtils.js';

import { Icon } from '../shared/Icon.js';
const { useState, useEffect, useMemo, memo } = React;

export const Analytics = memo(() => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lines, setLines] = useState([]); // Array de { text, color }
    const [corruptionProb, setCorruptionProb] = useState(null);
    const [prevProb, setPrevProb] = useState(null);

    const currentEntity = useGameState('currentEntity');
    const stability = useGameState('stability');
    const mode = useGameState('mode');
    const focusMode = useGameState('focusMode');
    const storyPath = useGameState('storyPath') || 0;
    const currentStep = useGameState('currentStep') || 1;

    const resonanceSync = useGameState('resonanceSync');
    const localFrequency = useGameState('localFrequency');

    const pathConfig = PATH_CONFIGS[storyPath];
    const anaLabels = pathConfig.analytics;
    const anaConstants = anaLabels.CONSTANTS;
    const bioLabels = pathConfig.bioscan;
    const opsLabels = pathConfig.operations;

    const isUnstable = stability < anaConstants.UNSTABLE_THRESHOLD;
    const isSectarian = storyPath === 1;

    // Obtener color dinámico del paso actual
    const stepConfig = STEPS_CONFIG[currentStep] || {};
    const stepColor = stepConfig.meta?.coreColorOverride || (isSectarian ? 'purple' : 'cyan');

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
            const scanName = bioLabels.scans[data.type.id] || data.type.name;
            setLines(prev => [{ text: `> ${anaLabels.invokingTrace}: ${scanName}`, color: 'text-zinc-500' }, ...prev]);
        };

        const onScanComplete = (data) => {
            setIsProcessing(false);
            const entity = data.subject || currentEntity;
            if (entity) {
                const { scannedData } = entity;
                
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
                
                // El motor ya calculó y guardó la lectura (Scanner.js); la vista solo la pinta.
                const newProb = data.probability ?? null;

                let trendColor = "text-zinc-400";
                if (newProb !== null) {
                    if (newProb > anaConstants.PROB_CRITICAL) trendColor = "text-red-400";
                    else if (newProb > anaConstants.PROB_WARNING) trendColor = "text-orange-400";
                    else trendColor = isSectarian ? "text-purple-400" : "text-cyan-400";
                }

                const scanName = bioLabels.scans[data.type.id] || data.type.name;
                const dataString = isSectarian 
                    ? `† AUSPICIO: ${scanName} | MANIFESTACIÓN: [${detail}] | PUREZA: ${100 - (newProb || 0)}%`
                    : `> SCAN: ${scanName} | RESULT: [${detail}] | PROB: ${newProb || '??'}%`;

                // Añadir decoración ritual a las líneas del sectario
                const lineText = isSectarian ? `† ${dataString}` : dataString;
                
                setLines(prev => [{ text: lineText, color: trendColor }, ...prev]);

                // ENVIAR A LORE (MOD-09)
                bus.emit('LORE_DATA_EMITTED', {
                    content: dataString,
                    entityId: entity.id,
                    timestamp: Date.now()
                });
            } else {
                setLines(prev => [{ text: `> ERROR: ENTIDAD_NO_VALIDA`, color: 'text-red-500' }, ...prev]);
            }
        };

        const onNewSubject = (entity) => {
            setLines([
                { text: `> ${anaLabels.monitoring}: ENTIDAD_${entity.id}_DETECTADA`, color: isSectarian ? 'text-purple-400' : 'text-cyan-400' },
                { text: isSectarian ? `† ANALIZANDO ESENCIA...` : `> ANALISIS_INICIAL: [PROCESANDO...]`, color: 'text-zinc-500' }
            ]);
            setCorruptionProb(null);
            setPrevProb(null);
        };

        const onDialogueStarted = () => {
            setLines(prev => [
                { text: `> ${opsLabels.interrogateBtn.split('[')[0].trim()}: ${anaLabels.monitoring}`, color: isSectarian ? 'text-purple-600' : 'text-cyan-600' },
                { text: isSectarian ? `† COMUNIÓN ESTABLECIDA` : `> ${anaLabels.linkActive}`, color: isSectarian ? 'text-purple-500' : 'text-cyan-500' }, 
                ...prev
            ].slice(0, 50));
        };

        const onDialogueOptionSelected = (data) => {
            const { corruptionImpact, stabilityImpact } = data;
            
            let impactStr = '';
            if (corruptionImpact !== 0) impactStr += ` | ${isSectarian ? 'MANCHA' : 'CORR'}: ${corruptionImpact > 0 ? '+' : ''}${corruptionImpact}%`;
            if (stabilityImpact !== 0) impactStr += ` | ${isSectarian ? 'PAZ' : 'STAB'}: ${stabilityImpact > 0 ? '+' : ''}${stabilityImpact}%`;

            setLines(prev => [
                { text: `> ${opsLabels.operatorSender}: ${data.option}`, color: 'text-zinc-400' },
                { text: `${isSectarian ? '† IMPACTO EN EL VELO' : '> ANALISIS_INTERACCION'}: [${impactStr.trim() || 'NOMINAL'}]`, color: impactStr.includes('+') ? 'text-red-400' : 'text-cyan-500' },
                ...prev
            ].slice(0, 50));
        };

        const onDialogueEnded = () => {
            setLines(prev => [
                { text: isSectarian ? `† COMUNIÓN FINALIZADA` : `> ${anaLabels.statusLabel}: ENLACE_CERRADO`, color: 'text-zinc-600' },
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
    }, [currentEntity, mode, localFrequency, isSectarian, anaLabels, bioLabels, opsLabels]);

    return html`
        <div className=${`flex flex-col h-full w-full bg-[#0a0a0b] font-mono p-3 overflow-hidden relative ${isSectarian ? 'shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]' : ''}`}>
            ${isSectarian && html`
                <!-- Efecto Onírico: Bruma Púrpura -->
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
                    <div className="absolute -bottom-10 left-0 w-full h-32 bg-indigo-900/10 blur-[40px] animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(88,28,135,0.05)_0%,_transparent_100%)]"></div>
                </div>
            `}
            <!-- Header decorativo -->
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                    <div className=${`w-2 h-2 rounded-full animate-pulse ${isSectarian ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'}`}></div>
                    <span className="text-[12px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                        ${isSectarian ? 'Visión Trascendental' : 'Data Analytics'}
                    </span>
                </div>
                ${isProcessing && html`
                    <span className=${`text-[10px] animate-pulse font-bold uppercase ${isSectarian ? 'text-purple-400' : 'text-cyan-400'}`}>
                        ${isSectarian ? 'Canalizando...' : 'Processing...'}
                    </span>
                `}
            </div>

            <!-- Probabilidad Central -->
            <div className="flex-none mb-4 flex items-center justify-center h-16 bg-black/40 border border-zinc-900/50 relative overflow-hidden group">
                ${isSectarian && html`
                    <div className="absolute inset-0 bg-purple-500/5 animate-pulse pointer-events-none"></div>
                `}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">
                        ${isSectarian ? 'Nivel de Pureza' : 'Avg. Corruption Prob.'}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className=${`text-3xl font-black font-mono tracking-tighter transition-all duration-700 ${
                            isUnstable || (corruptionProb > anaConstants.PROB_CRITICAL) ? 'animate-glitch text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 
                            corruptionProb > anaConstants.PROB_WARNING ? 'text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
                            stepColor === 'purple' || stepColor === 'indigo' ? 'text-purple-500' :
                            stepColor === 'zinc' || stepColor === 'slate' ? 'text-zinc-400' :
                            'text-cyan-500'
                        }`}>
                            ${corruptionProb !== null ? (isSectarian ? (100 - corruptionProb) : corruptionProb) : '--'}%
                        </span>
                        ${prevProb !== null && html`
                            <span className=${`text-[10px] font-bold ${
                                (isSectarian ? (100 - corruptionProb) > (100 - prevProb) : corruptionProb > prevProb) 
                                ? 'text-red-500' : 'text-green-500'
                            }`}>
                                ${html`<${Icon} name=${(isSectarian ? (100 - corruptionProb) > (100 - prevProb) : corruptionProb > prevProb) ? 'trending-up' : 'trending-down'} />`}
                            </span>
                        `}
                    </div>
                </div>
            </div>

            <!-- Listado de trazas -->
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                ${lines.length === 0 ? html`
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <div className=${`w-12 h-0.5 mb-2 ${isSectarian ? 'bg-purple-900' : 'bg-cyan-900'}`}></div>
                        <span className="text-[10px] uppercase tracking-widest">${isSectarian ? 'Silencio Sagrado' : 'No Data Captured'}</span>
                    </div>
                ` : lines.map((line, i) => html`
                    <div 
                        key=${i} 
                        className=${`text-[11px] leading-tight break-all border-l-2 pl-2 py-1 transition-all ${line.color} 
                            ${isSectarian ? 'border-purple-900/30 bg-purple-950/5' : 'border-cyan-900/30 bg-cyan-950/5'} 
                            ${i === 0 ? 'animate-fade-in translate-x-1' : ''}`}
                    >
                        ${line.text}
                    </div>
                `)}
            </div>
        </div>
    `;
});
