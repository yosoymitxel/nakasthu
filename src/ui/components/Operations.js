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
import { useGameState } from '../hooks/useGameState.js';
import { useStoryLabels } from './MainLayout.js';
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
    const labels = CONFIG.UI.LABELS[storyPath].operations;
    const storyLabels = useStoryLabels();

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
        <div className=${`flex flex-col h-full w-full bg-transparent font-mono overflow-hidden relative transition-all duration-300`}>
            
            <!-- Local Flash Overlay -->
            ${flash && html`
                <div 
                    className="absolute inset-0 z-50 pointer-events-none animate-pulse-fast"
                    style=${{ backgroundColor: flash.color, opacity: 0.3 }}
                ></div>
            `}

            <!-- SECCIÓN SUPERIOR: VISUALIZADORES -->
            <div className="flex-none h-[140px] w-full flex border-b border-zinc-800">
                <div className="w-1/3 h-full border-r-[0.5px] border-zinc-800 relative overflow-hidden flex flex-col">
                    <${PortalScene} />
                    <div className="absolute bottom-1 left-2 text-[12px] text-zinc-400 tracking-widest uppercase font-bold pointer-events-none">ORBITAL</div>
                </div>

                <div className="w-1/3 h-full border-r-[0.5px] border-zinc-800 relative overflow-hidden flex flex-col">
                    <${SubjectVisual} />
                    <div className="absolute bottom-1 left-2 text-[12px] text-zinc-400 tracking-widest uppercase font-bold pointer-events-none">LIVE_FEED</div>
                </div>

                <div className="w-1/3 h-full flex flex-col justify-around px-3 py-2 bg-black/10">
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
            <div className="flex-none border-t border-zinc-800 bg-black/40">
                <!-- DIALOGUE OPTIONS -->
                <div className="h-24 flex p-1 gap-1 border-b border-zinc-800/30">
                    ${activeDialogue ? html`
                        <div className="flex w-full gap-1">
                            <div className="flex-[4] flex gap-1">
                                ${activeDialogue.options.map((opt, idx) => html`
                                    <button 
                                        key=${idx}
                                        onClick=${() => handleOptionSelect(idx)}
                                        disabled=${isTyping || opt.used}
                                        className=${`flex-1 border text-[11px] transition-all uppercase tracking-tighter font-bold p-1 leading-tight flex flex-col justify-center items-center text-center
                                            ${opt.used
                ? 'border-zinc-800 bg-zinc-900/10 text-zinc-700 cursor-not-allowed opacity-50'
                : 'border-cyan-900/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-600'}`}
                                    >
                                        <span className="line-clamp-2">${opt.text}</span>
                                        <div className="text-[9px] text-zinc-500 mt-1">
                                            E: ${opt.energyCost} | S: ${opt.stabilityImpact}
                                        </div>
                                    </button>
                                `)}
                            </div>
                            <button 
                                onClick=${handleEndDialogue}
                                disabled=${isTyping}
                                className="flex-1 border border-red-900/30 bg-red-950/10 hover:bg-red-900/20 text-red-700 text-[10px] transition-all uppercase tracking-tighter font-black p-1 leading-tight"
                            >
                                ${labels.interrogateEnd}
                            </button>
                        </div>
                    ` : html`
                        <${React.Fragment}>
                            <button 
                                onClick=${() => handleDialogueAction('INTERROGAR')}
                                disabled=${isTyping}
                                className=${`flex-1 border text-[12px] transition-all uppercase tracking-tighter font-bold
                                    ${state.storyPath === 1 ? 'border-purple-900/30 bg-purple-950/10 hover:bg-purple-900/20 text-purple-600' : 'border-cyan-900/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-600'}`}
                            >
                                ${labels.interrogateBtn}
                            </button>
                            <div className="flex-grow flex items-center justify-center p-2 text-center">
                                <span className="text-[12px] text-zinc-500 uppercase italic">${labels.waitingSubject}</span>
                            </div>
                        <//>
                    `}
                </div>

                <!-- SENTENCE BUTTONS -->
                <div className="h-20 p-4 flex flex-col items-center justify-center bg-black/60 relative">
                    ${(isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') ? null : (isTutorialActive || !isScanComplete) ? html`
                         <!-- Bloquear si NO estamos en tutorial de operaciones Y (estamos en otro tutorial O no hay scan completo) -->
                         <!-- Espera, si estamos en TUTO_OPERATIONS queremos ver los botones. Si estamos en OTRO tutorial, Layout.js ya lo bloquea visualmente. -->
                         <!-- Pero aqui bloqueamos interaction lógica si no hay scan. -->
                         ${(!isTutorialActive && !isScanComplete) ? html`
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 group/lock border-y border-red-900/20">
                                <span className="text-[10px] text-red-500/80 font-mono tracking-[0.2em] uppercase animate-pulse text-center px-4 mb-1">
                                    ${labels.pendingValidation}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                                    [${labels.scanRequired}: ${SCAN_TYPES[requiredScan]?.name || requiredScan}]
                                </span>
                            </div>
                        `: null}
                    `: null}
                    
                    <div className="flex items-center justify-center gap-6 w-full h-full">
                        <button 
                            onClick=${() => handleAction('SACRIFICE')}
                            disabled=${isTyping || kaminOverride || (!isTutorialActive && !isScanComplete)}
                            className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[12px] 
                                ${kaminOverride
            ? 'border-purple-900/50 text-purple-500/60 animate-pulse cursor-not-allowed'
            : ((isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') || (!isTutorialActive && isScanComplete))
                ? 'border-red-900/50 text-red-700/80 hover:bg-red-900/20 hover:border-red-600/50'
                : 'border-zinc-800 text-zinc-800 pointer-events-none'}`}
                        >
                            ${kaminOverride
            ? 'CRITICAL_ERROR: OVERRIDE BY EIDOLON'
            : storyLabels.rejectLabel.toUpperCase()}
                        </button>
                        
                        <div className="w-[0.5px] h-6 bg-zinc-900/30"></div>

                        <button 
                            onClick=${() => handleAction('AUTHORIZE')}
                            disabled=${isTyping || (!isTutorialActive && !isScanComplete)}
                            className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[12px] 
                                ${kaminOverride
            ? 'border-purple-500/70 text-purple-400 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse'
            : ((isTutorialActive && activeTutorialId === 'TUTO_OPERATIONS') || (!isTutorialActive && isScanComplete))
                ? 'border-emerald-900/50 text-emerald-700/80 hover:bg-emerald-900/20 hover:border-emerald-600/50'
                : 'border-zinc-800 text-zinc-800 pointer-events-none'}`}
                        >
                            ${storyLabels.action3.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
