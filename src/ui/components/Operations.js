/**
 * OPERATIONS.JS
 * Bloque 6: MOD-04 OPERATIONS.
 * Espacio masivo dividido en COMS_LOG, ACTION_MATRIX y SENTENCE buttons.
 */
import { html } from '../utils/html.js';
import { dialogueEngine } from '../../systems/DialogueEngine.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { useGameState } from '../hooks/useGameState.js';
import { gameSequencer } from '../../systems/GameSequencer.js';
import { PortalScene } from './PortalScene.js';
import { SubjectVisual } from './SubjectVisual.js';
import { Coms } from './Coms.js';
import { SCAN_TYPES } from '../../systems/Scanner.js';

const { useState, useEffect, useRef } = React;

export const Operations = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');
    const maxErrors = useGameState('maxErrors');
    const activeDialogue = useGameState('activeDialogue');
    const tutorialStep = useGameState('tutorialStep');
    const isTutorialActive = useGameState('isTutorialActive');
    const activeTutorialId = useGameState('activeTutorialId'); // New check

    const [isTyping, setIsTyping] = useState(false);
    const [kaminOverride, setKaminOverride] = useState(false);
    const requiredScan = useGameState('requiredScan');
    const currentEntity = useGameState('currentEntity');
    const currentStep = useGameState('currentStep');
    const storyPath = useGameState('storyPath') || 0;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.operations;

    // Verificar si el escaneo requerido ha sido completado
    const isScanComplete = currentEntity?.scannedTypes?.includes(requiredScan);

    const [flash, setFlash] = useState(null);

    useEffect(() => {
        const onDialogue = (data) => {
            // Sincronizar estado de escritura con Coms si es necesario
            if (data.target && data.target !== 'MOD04' && data.target !== 'GLOBAL') return;
            setIsTyping(true);
            // El tiempo aquí debe ser aproximado al de Coms para deshabilitar botones
            setTimeout(() => setIsTyping(false), 2000); 
        };
        bus.on('DIALOGUE_EMITTED', onDialogue);
        return () => bus.off('DIALOGUE_EMITTED', onDialogue);
    }, []);

    useEffect(() => {
        const onFlash = (data) => {
            if (data.target === 'MOD04') {
                setFlash(data);
                setTimeout(() => setFlash(null), data.duration || 300);
            }
        };
        bus.on('TRIGGER_FLASH', onFlash);
        return () => bus.off('TRIGGER_FLASH', onFlash);
    }, []);

    useEffect(() => {
        const onNewSubject = (entity) => {
            // Detectar Override de Kamin (Paso 6)
            if (entity?.id === 'KAMIN' || entity?.name?.toLowerCase().includes('kamin')) {
                setKaminOverride(true);
                setTimeout(() => {
                    bus.emit('DIALOGUE_EMITTED', {
                        sender: labels.systemSender,
                        text: labels.anomalyMsg,
                        type: 'SYSTEM'
                    });
                    bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 150, target: 'MOD04' });
                }, 500);
            }
        };

        const onScanComplete = (data) => {
            // Notificar al sistema que el escaneo ha terminado
        };

        const onDialogueStarted = (dialogue) => {
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.subjectSender,
                text: dialogue.text,
                type: 'SUBJECT'
            });
        };

        const onDialogueOptionSelected = async (data) => {
            // Emitir elección del operador
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.operatorSender,
                text: `> ${data.option}`,
                type: 'OPERATOR'
            });

            // La respuesta del sujeto ya debería venir por DIALOGUE_EMITTED desde el motor
            if (data.consequence) {
                setTimeout(() => {
                    bus.emit('DIALOGUE_EMITTED', {
                        sender: labels.subjectSender,
                        text: data.consequence,
                        type: 'SUBJECT'
                    });
                }, 1000);
            }

            bus.emit('TERMINAL_PRINT', {
                text: `[${labels.systemSender}] Respuesta analizada y registrada.`,
                type: 'SYSTEM'
            });
        };

        const onDialogueEnded = () => {
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.systemSender,
                text: labels.linkClosedMsg,
                type: 'SYSTEM'
            });
        };

        const onSessionTerminated = () => {
            // Coms ya escucha SESSION_TERMINATED
        };

        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('SESSION_TERMINATED', onSessionTerminated);
        bus.on('DIALOGUE_STARTED', onDialogueStarted);
        bus.on('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
        bus.on('DIALOGUE_ENDED', onDialogueEnded);

        return () => {
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('DIALOGUE_STARTED', onDialogueStarted);
            bus.off('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
            bus.off('DIALOGUE_ENDED', onDialogueEnded);
        };
    }, [labels]);

    const handleDialogueAction = (actionName) => {
        if (isTyping || activeDialogue) return;

        // Coste base de iniciar interrogatorio: 5 (Omitir en tutorial)
        if (state.energy < 5 && !state.isTutorialActive) {
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.systemSender,
                text: labels.energyErrorMsg,
                type: 'SYSTEM'
            });
            return;
        }

        dialogueEngine.triggerRandomDialogue();
    };

    const handleEndDialogue = () => {
        dialogueEngine.closeDialogue();
    };

    const handleOptionSelect = (index) => {
        if (isTyping) return;
        const option = activeDialogue?.options[index];
        if (option?.used) return; // No permitir repetir la misma pregunta
        dialogueEngine.selectOption(index);
    };

    const handleAction = (type) => {
        const isTutorialOverride = isTutorialActive && tutorialStep === 5;

        // Protección: No actuar si no hay sujeto
        if (!currentEntity) {
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.systemSender,
                text: labels.noSubjectMsg,
                type: 'SYSTEM'
            });
            return;
        }

        if (isTutorialActive) {
            console.log(`[OPERATIONS] handleAction - tutorialStep: ${tutorialStep}, isScanComplete: ${isScanComplete}, override: ${isTutorialOverride}`);
        }

        if (isTyping || (!isScanComplete && !isTutorialOverride)) {
            if (isTutorialActive && !isTutorialOverride) {
                console.warn(`[OPERATIONS] Action blocked by tutorial step: ${tutorialStep} (expected 5)`);
            }
            return;
        }

        // Override de Kamin: Solo permitir AUTHORIZE
        if (kaminOverride && type === 'SACRIFICE') {
            bus.emit('DIALOGUE_EMITTED', {
                sender: labels.systemSender,
                text: labels.overrideBlockedMsg,
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 100, target: 'MOD04' });
            return;
        }

        if (type === 'SACRIFICE') bus.emit('SACRIFICE_REQUEST');
        if (type === 'AUTHORIZE') {
            // Si es Kamin, disparar efectos visuales y preparar transición
            if (kaminOverride) {
                bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 500, target: 'MOD04' });
                state.storyPath = 1; // Forzar ruta religiosa
                setKaminOverride(false);
            }
            bus.emit('AUTHORIZE_REQUEST');
        }
    };

    return html`
        <div className=${`flex flex-col h-full w-full bg-black/20 font-mono overflow-hidden relative transition-all duration-300 border border-zinc-800/50 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]`}>
            
            <!-- Local Flash Overlay -->
            ${flash && html`
                <div 
                    className="absolute inset-0 z-50 pointer-events-none animate-pulse-fast"
                    style=${{ backgroundColor: flash.color, opacity: 0.3 }}
                ></div>
            `}

            <!-- Scanline Overlay Decorativo -->
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

            <!-- SECCIÓN SUPERIOR: VISUALIZADORES -->
            <div className="flex-none h-[140px] w-full flex border-b border-zinc-800/80">
                <div className="w-1/3 h-full border-r border-zinc-800/80 relative overflow-hidden flex flex-col group bg-black/40">
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <${PortalScene} />
                    <div className="absolute bottom-1 left-2 text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-bold pointer-events-none z-20">ORBITAL</div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/20 pointer-events-none"></div>
                </div>

                <div className="w-1/3 h-full border-r border-zinc-800/80 relative overflow-hidden flex flex-col group bg-black/40">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <${SubjectVisual} />
                    <div className="absolute bottom-1 left-2 text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-bold pointer-events-none z-20">LIVE_FEED</div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-amber-500/20 pointer-events-none"></div>
                </div>

                <div className="w-1/3 h-full flex flex-col justify-around px-3 py-2 bg-black/60 relative">
                    <!-- Detalle de fondo para cuota -->
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-bold mb-1">
                            ${labels.quotaLabel}
                        </span>
                        <span className=${`text-2xl font-black font-mono ${state.storyPath === 1 ? 'text-purple-600/70' : 'text-emerald-600/70'}`}>
                            ${processedCount} / ${quota}
                        </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-3 relative overflow-hidden border border-zinc-800/30">
                        <div 
                            className=${`h-full transition-all duration-1000 ${state.storyPath === 1 ? 'bg-purple-600/40' : 'bg-emerald-600/40'}`}
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-center">
                        <span className=${`text-[12px] font-bold font-mono uppercase ${judgmentErrors >= (maxErrors || 3) - 1 ? 'text-red-500 animate-pulse' : (state.storyPath === 1 ? 'text-purple-900/60' : 'text-zinc-600')}`}>
                            ${labels.errorLabel}: ${judgmentErrors} / ${maxErrors || 3}
                        </span>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN CENTRAL: CHAT / LOG (MOD-05) -->
            <${Coms} />

            <!-- SECCIÓN INFERIOR: ACTION MATRIX -->
            <div className="flex-none border-t border-zinc-800/80 bg-black/40 relative">
                <!-- DIALOGUE OPTIONS -->
                <div className="h-24 flex p-1 gap-1 border-b border-zinc-800/30 bg-zinc-950/20">
                    ${activeDialogue ? html`
                        <div className="flex w-full gap-1">
                            <div className="flex-[4] flex gap-1">
                                ${activeDialogue.options.map((opt, idx) => html`
                                    <button 
                                        key=${idx}
                                        onClick=${() => handleOptionSelect(idx)}
                                        disabled=${isTyping || opt.used}
                                        className=${`flex-1 border text-[11px] transition-all uppercase tracking-tighter font-bold p-1 leading-tight flex flex-col justify-center items-center text-center relative group overflow-hidden
                                            ${opt.used
                                                ? 'border-zinc-800 bg-zinc-900/10 text-zinc-700 cursor-not-allowed opacity-50 shadow-none'
                                                : 'border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-500/20 text-cyan-500/80 hover:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.05)]'}`}
                                    >
                                        <span className="line-clamp-2 relative z-10">${opt.text}</span>
                                        <div className="text-[9px] text-zinc-500 mt-1 relative z-10">
                                            E: ${opt.energyCost} | S: ${opt.stabilityImpact}
                                        </div>
                                        ${!opt.used && html`<div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>`}
                                    </button>
                                `)}
                            </div>
                            <button 
                                onClick=${handleEndDialogue}
                                disabled=${isTyping}
                                className="flex-1 border border-red-500/30 bg-red-950/10 hover:bg-red-500/20 text-red-500/70 hover:text-red-400 text-[10px] transition-all uppercase tracking-tighter font-black p-1 leading-tight shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                            >
                                ${labels.interrogateEnd}
                            </button>
                        </div>
                    ` : html`
                        <${React.Fragment}>
                            <button 
                                onClick=${() => handleDialogueAction('INTERROGAR')}
                                disabled=${isTyping}
                                className=${`flex-1 border text-[12px] transition-all uppercase tracking-tighter font-bold relative group overflow-hidden
                                    ${state.storyPath === 1 
                                        ? 'border-purple-500/30 bg-purple-950/10 hover:bg-purple-500/20 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                                        : 'border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]'}`}
                            >
                                <span className="relative z-10">${labels.interrogateBtn}</span>
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            <div className="flex-grow flex items-center justify-center p-2 text-center">
                                <span className="text-[12px] text-zinc-600 uppercase italic tracking-widest font-bold">${labels.waitingSubject}</span>
                            </div>
                        <//>
                    `}
                </div>

                <!-- SENTENCE BUTTONS -->
                <div className="h-20 p-4 flex flex-col items-center justify-center bg-black/60 relative">
                    ${(isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') ? null : (isTutorialActive || !isScanComplete) ? html`
                         ${(!isTutorialActive && !isScanComplete) ? html`
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 border-y border-red-500/20">
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
                                <span className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase animate-pulse text-center px-4 mb-1 z-10">
                                    ${labels.pendingValidation}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest z-10">
                                    [${labels.scanRequired}: ${SCAN_TYPES[requiredScan]?.name || requiredScan}]
                                </span>
                            </div>
                        `: null}
                    `: null}
                    
                    <div className="flex items-center justify-center gap-6 w-full h-full px-4">
                        <button 
                            onClick=${() => handleAction('SACRIFICE')}
                            disabled=${isTyping || kaminOverride || (!isTutorialActive && !isScanComplete)}
                            className=${`flex-1 max-w-[200px] h-full relative group border transition-all uppercase tracking-[0.3em] font-black text-[11px] 
                                ${kaminOverride
                                    ? 'border-purple-500/30 text-purple-500/40 animate-pulse cursor-not-allowed bg-purple-950/10'
                                    : ((isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') || (!isTutorialActive && isScanComplete))
                                        ? 'border-red-500/40 text-red-500/70 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-red-950/5'
                                        : 'border-zinc-800 text-zinc-800 pointer-events-none'}`}
                        >
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            ${kaminOverride
                                ? 'ERR: OVERRIDE'
                                : labels.rejectLabel.toUpperCase()}
                        </button>
                        
                        <div className="w-px h-6 bg-zinc-800/50"></div>

                        <button 
                            onClick=${() => handleAction('AUTHORIZE')}
                            disabled=${isTyping || (!isTutorialActive && !isScanComplete)}
                            className=${`flex-1 max-w-[200px] h-full relative group border transition-all uppercase tracking-[0.3em] font-black text-[11px] 
                                ${kaminOverride
                                    ? 'border-purple-500 text-purple-400 bg-purple-900/30 hover:bg-purple-900/50 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                    : ((isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') || (!isTutorialActive && isScanComplete))
                                        ? 'border-emerald-500/40 text-emerald-500/70 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/5'
                                        : 'border-zinc-800 text-zinc-800 pointer-events-none'}`}
                        >
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            ${labels.authorizeLabel.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
