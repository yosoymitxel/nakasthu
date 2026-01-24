/**
 * OPERATIONS.JS
 * Bloque 6: MOD-04 OPERATIONS.
 * Espacio masivo dividido en COMS_LOG, ACTION_MATRIX y SENTENCE buttons.
 */
import { html } from '../utils/html.js';
import { dialogueEngine } from '../../systems/DialogueEngine.js';
import { handleSacrifice, handleAuthorize } from '../../systems/MechanicsEngine.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';
import { useGameState } from '../hooks/useGameState.js';
import { useStoryLabels } from './MainLayout.js';
import { gameSequencer } from '../../systems/GameSequencer.js';
import { PortalScene } from './PortalScene.js';
import { SubjectVisual } from './SubjectVisual.js';
import { SCAN_TYPES } from '../../systems/Scanner.js';

const { useState, useEffect, useRef } = React;

export const Operations = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');
    const activeDialogue = useGameState('activeDialogue');
    const tutorialStep = useGameState('tutorialStep');
    const isTutorialActive = useGameState('isTutorialActive');
    const activeTutorialId = useGameState('activeTutorialId'); // New check

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [kaminOverride, setKaminOverride] = useState(false);
    const requiredScan = useGameState('requiredScan');
    const currentEntity = useGameState('currentEntity');
    const currentStep = useGameState('currentStep');
    const storyLabels = useStoryLabels();

    // Detectar si el sujeto actual es Kamin (Override en Paso 6)
    const isKaminSubject = currentEntity?.id === 'KAMIN' ||
        currentEntity?.name?.toLowerCase().includes('kamin');

    // Verificar si el escaneo requerido ha sido completado
    const isScanComplete = currentEntity?.scannedTypes?.includes(requiredScan);

    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);

    const [flash, setFlash] = useState(null);

    // Parser de Markdown para Diálogos
    const parseDialogue = (text) => {
        if (!text) return [];
        // Separar por bloques de acción (entre asteriscos)
        const parts = text.split(/(\*[^*]+\*)/g).filter(p => p.length > 0);
        return parts.map(part => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return { type: 'ACTION', text: part.replace(/\*/g, '').trim() };
            }
            return { type: 'SPEECH', text: part.trim() };
        });
    };

    // Función para añadir mensajes secuencialmente (Acción -> Tipeo de Habla)
    const appendParsedMessages = async (sender, text, baseType) => {
        const blocks = parseDialogue(text);

        for (const block of blocks) {
            if (block.type === 'ACTION') {
                // Las acciones aparecen instantáneamente
                setMessages(prev => [...prev, {
                    sender,
                    text: block.text,
                    type: 'ACTION',
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }]);
                // Pequeña pausa antes de lo siguiente
                await new Promise(r => setTimeout(r, 600));
            } else {
                // El habla se tipea
                setIsTyping(true);
                // Aquí se podría emitir un sonido de tipeo: bus.emit('PLAY_SOUND', 'TYPE');
                await new Promise(r => setTimeout(r, 1000)); // Simular tiempo de procesamiento

                setMessages(prev => [...prev, {
                    sender,
                    text: block.text,
                    type: baseType,
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }]);
                setIsTyping(false);
                await new Promise(r => setTimeout(r, 400));
            }
        }
    };

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
        const onDialogue = (data) => {
            if (data.type === 'SYSTEM') {
                setMessages(prev => [...prev, data]);
            } else {
                setIsTyping(true);
                setTimeout(() => {
                    setMessages(prev => [...prev, data]);
                    setIsTyping(false);
                }, 800);
            }
        };

        const onNewSubject = (entity) => {
            setMessages([{ sender: 'SISTEMA', text: 'NUEVO SUJETO DETECTADO EN CÁMARA.', type: 'SYSTEM' }]);

            // Detectar Override de Kamin (Paso 6)
            if (entity?.id === 'KAMIN' || entity?.name?.toLowerCase().includes('kamin')) {
                setKaminOverride(true);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        sender: 'SISTEMA',
                        text: '>>> ALERTA: ANOMALÍA EN PROTOCOLO DE DECISIÓN. OVERRIDE DETECTADO.',
                        type: 'SYSTEM'
                    }]);
                    bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 150, target: 'MOD04' });
                }, 500);
            }
        };

        const onScanComplete = (data) => {
            // Notificar al sistema que el escaneo ha terminado
        };

        const onDialogueStarted = (dialogue) => {
            appendParsedMessages('SUJETO', dialogue.text, 'SUBJECT');
        };

        const onDialogueOptionSelected = async (data) => {
            // Mostrar la elección del operador en COMMS
            setMessages(prev => [...prev, {
                sender: 'OPERADOR',
                text: `> ${data.option}`,
                type: 'OPERATOR',
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }]);

            // Mostrar la respuesta del sujeto en COMMS de forma secuencial
            await new Promise(r => setTimeout(r, 500));
            await appendParsedMessages('SUJETO', data.consequence, 'SUBJECT');

            bus.emit('TERMINAL_PRINT', {
                text: `[SISTEMA] Respuesta analizada y registrada.`,
                type: 'SYSTEM'
            });
        };

        const onDialogueEnded = () => {
            setMessages(prev => [...prev, {
                sender: 'SISTEMA',
                text: 'ENLACE NEURAL CERRADO.',
                type: 'SYSTEM'
            }]);
        };

        const onSessionTerminated = () => {
            setMessages([]);
        };

        bus.on('DIALOGUE_EMITTED', onDialogue);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('SESSION_TERMINATED', onSessionTerminated);
        bus.on('DIALOGUE_STARTED', onDialogueStarted);
        bus.on('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
        bus.on('DIALOGUE_ENDED', onDialogueEnded);

        return () => {
            bus.off('DIALOGUE_EMITTED', onDialogue);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('DIALOGUE_STARTED', onDialogueStarted);
            bus.off('DIALOGUE_OPTION_SELECTED', onDialogueOptionSelected);
            bus.off('DIALOGUE_ENDED', onDialogueEnded);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleDialogueAction = (actionName) => {
        if (isTyping || activeDialogue) return;

        // Coste base de iniciar interrogatorio: 5 (Omitir en tutorial)
        if (state.energy < 5 && !state.isTutorialActive) {
            bus.emit('DIALOGUE_EMITTED', {
                sender: 'SISTEMA',
                text: `[CRÍTICO] Energía insuficiente para iniciar enlace.`,
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
                sender: 'SISTEMA',
                text: 'ERROR: NO HAY SUJETO EN CÁMARA PARA PROCESAR.',
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
                sender: 'SISTEMA',
                text: 'CRITICAL_ERROR: OVERRIDE BY EIDOLON - ACCIÓN BLOQUEADA',
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 100, target: 'MOD04' });
            return;
        }

        if (type === 'SACRIFICE') handleSacrifice();
        if (type === 'AUTHORIZE') {
            // Si es Kamin, disparar efectos visuales y preparar transición
            if (kaminOverride) {
                bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 500, target: 'MOD04' });
                state.storyPath = 1; // Forzar ruta religiosa
                setKaminOverride(false);
            }
            handleAuthorize();
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
                            ${state.storyPath === 1 ? 'COSECHA_DE_ALMAS' : 'QUOTA_RECOVERY'}
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
                        <span className=${`text-[12px] font-bold font-mono uppercase ${state.storyPath === 1 ? 'text-purple-900/60' : 'text-red-900/60'}`}>
                            ${state.storyPath === 1 ? 'CISMA' : 'ERR'}: ${judgmentErrors}
                        </span>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN CENTRAL: CHAT / LOG -->
            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/5 min-h-0 max-h-[200px]">
                ${messages.map((msg, i) => html`
                    <div key=${i} className=${`flex flex-col animate-fade-in ${msg.type === 'SYSTEM' ? 'border-l-2 border-zinc-800 pl-3' :
            msg.type === 'ACTION' ? 'border-y border-zinc-900/30 bg-zinc-950/20 py-2 my-1 items-center' : ''
        }`}>
                        <div className=${`flex justify-between items-center mb-1 ${msg.type === 'ACTION' ? 'hidden' : ''}`}>
                            <span className=${`text-[10px] font-bold tracking-[0.2em] uppercase ${msg.type === 'SYSTEM' ? 'text-zinc-500' :
            msg.type === 'SUBJECT' ? 'text-cyan-600/80' :
                'text-emerald-600/80'
        }`}>
                                ${msg.sender}
                            </span>
                            <span className="text-[9px] text-zinc-700 font-mono tracking-tighter">${msg.timestamp || ''}</span>
                        </div>
                        <p className=${`text-[12px] leading-relaxed ${msg.type === 'SYSTEM' ? 'text-zinc-500 italic' :
            msg.type === 'ACTION' ? 'text-amber-500/60 text-[11px] italic tracking-widest' :
                msg.type === 'SUBJECT' ? 'text-zinc-300' :
                    'text-emerald-500/80 font-bold'
        }`}>
                            ${msg.type === 'ACTION' ? `◆ ${msg.text} ◆` : msg.text}
                        </p>
                    </div>
                `)}
                ${isTyping && html`
                    <div className="flex items-center gap-2 text-zinc-600 animate-pulse text-[10px] ml-3">
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
                        RECIBIENDO TRANSMISIÓN...
                    </div>
                `}
                <div ref=${messagesEndRef} />
            </div>

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
                                TERMINAR INTERROGATORIO
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
                                ${state.storyPath === 1 ? 'INICIAR COMUNIÓN [INTERROGAR]' : 'INICIAR ENLACE NEURAL [INTERROGAR]'}
                            </button>
                            <div className="flex-grow flex items-center justify-center p-2 text-center">
                                <span className="text-[12px] text-zinc-500 uppercase italic">Sujeto en espera de interacción...</span>
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
                                    AUTORIZACIÓN PENDIENTE DE VALIDACIÓN BIOMÉTRICA
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                                    [SE REQUIERE ESCANEO: ${SCAN_TYPES[requiredScan]?.name || requiredScan}]
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
