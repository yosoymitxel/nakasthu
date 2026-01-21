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

const { useState, useEffect, useRef } = React;

export const Operations = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');
    const activeDialogue = useGameState('activeDialogue');
    const tutorialStep = useGameState('tutorialStep');

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
                    bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 150 });
                }, 500);
            }
        };

        const onScanComplete = (data) => {
            // Redirigir a Terminal
            bus.emit('TERMINAL_PRINT', {
                text: `[REPORTE BIOSCAN] ${data.type.name} FINALIZADO. DATOS ENVIADOS A ANALYTICS.`,
                type: 'SYSTEM'
            });
        };

        const onDialogueStarted = (dialogue) => {
            setMessages(prev => [...prev, {
                sender: 'SUJETO',
                text: dialogue.text,
                type: 'SUBJECT'
            }]);
        };

        const onDialogueConsequence = (data) => {
            // Solo mostrar la elección del operador en COMMS
            setMessages(prev => [...prev, {
                sender: 'OPERADOR',
                text: `> ${data.originalOption}`,
                type: 'OPERATOR'
            }]);

            // La respuesta del sistema va a la TERMINAL
            bus.emit('TERMINAL_PRINT', {
                text: data.text,
                type: 'SYSTEM'
            });
        };

        const onSessionTerminated = () => {
            setMessages([]);
        };

        bus.on('DIALOGUE_EMITTED', onDialogue);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('SESSION_TERMINATED', onSessionTerminated);
        bus.on('DIALOGUE_STARTED', onDialogueStarted);
        bus.on('DIALOGUE_CONSEQUENCE', onDialogueConsequence);

        return () => {
            bus.off('DIALOGUE_EMITTED', onDialogue);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('DIALOGUE_STARTED', onDialogueStarted);
            bus.off('DIALOGUE_CONSEQUENCE', onDialogueConsequence);
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

    const handleOptionSelect = (index) => {
        if (isTyping) return;
        dialogueEngine.selectOption(index);
    };

    const handleAction = (type) => {
        const isTutorialOverride = tutorialStep === 3;

        // Protección: No actuar si no hay sujeto
        if (!currentEntity) {
            bus.emit('DIALOGUE_EMITTED', {
                sender: 'SISTEMA',
                text: 'ERROR: NO HAY SUJETO EN CÁMARA PARA PROCESAR.',
                type: 'SYSTEM'
            });
            return;
        }

        if (isTyping || (!isScanComplete && !isTutorialOverride)) return;

        // Override de Kamin: Solo permitir AUTHORIZE
        if (kaminOverride && type === 'SACRIFICE') {
            bus.emit('DIALOGUE_EMITTED', {
                sender: 'SISTEMA',
                text: 'CRITICAL_ERROR: OVERRIDE BY EIDOLON - ACCIÓN BLOQUEADA',
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 100 });
            return;
        }

        if (type === 'SACRIFICE') handleSacrifice();
        if (type === 'AUTHORIZE') {
            // Si es Kamin, disparar cambio de acto
            if (kaminOverride) {
                bus.emit('TRIGGER_FLASH', { color: '#9333ea', duration: 500 });
                bus.emit('ACT_CHANGE', { newAct: 1 });
                state.storyPath = 1;
                setKaminOverride(false);
                gameSequencer.nextStep(); // Avanzar al paso 7 (Cambio de Acto)
            }
            handleAuthorize();
        }
    };

    return html`
        <div className="flex flex-col h-full w-full bg-transparent font-mono overflow-hidden">
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
                        <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-bold mb-1">QUOTA_RECOVERY</span>
                        <span className="text-2xl font-black text-emerald-600/70 font-mono">
                            ${processedCount} / ${quota}
                        </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-3 relative overflow-hidden border border-zinc-800/30">
                        <div 
                            className="h-full bg-emerald-600/40 transition-all duration-1000"
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-center">
                        <span className="text-[12px] text-red-900/60 font-bold font-mono uppercase">
                            ERR: ${judgmentErrors}
                        </span>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN CENTRAL: CHAT / LOG -->
            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/5 min-h-0 max-h-[200px]">
                ${messages.map((msg, i) => html`
                    <div key=${i} className=${`flex flex-col animate-fade-in ${msg.type === 'SYSTEM' ? 'border-l-2 border-zinc-800 pl-3' : ''}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className=${`text-[12px] font-bold tracking-widest uppercase ${msg.type === 'SYSTEM' ? 'text-zinc-400' :
            msg.type === 'SUBJECT' ? 'text-cyan-600/60' :
                'text-emerald-600/60'
        }`}>
                                ${msg.sender}
                            </span>
                            <span className="text-[12px] text-zinc-500 font-mono">${msg.timestamp || ''}</span>
                        </div>
                        <p className=${`text-[12px] leading-relaxed ${msg.type === 'SYSTEM' ? 'text-zinc-400 italic' :
            msg.type === 'SUBJECT' ? 'text-zinc-300' :
                'text-emerald-500/80'
        }`}>
                            ${msg.text}
                        </p>
                    </div>
                `)}
                <div ref=${messagesEndRef} />
            </div>

            <!-- SECCIÓN INFERIOR: ACTION MATRIX -->
            <div className="flex-none border-t border-zinc-800 bg-black/40">
                <!-- DIALOGUE OPTIONS -->
                <div className="h-20 flex p-1 gap-1 border-b border-zinc-800/30">
                    ${activeDialogue ? activeDialogue.options.map((opt, idx) => html`
                        <button 
                            key=${idx}
                            onClick=${() => handleOptionSelect(idx)}
                            disabled=${isTyping}
                            className="flex-1 border border-cyan-900/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-600 text-[12px] transition-all uppercase tracking-tighter font-bold p-1 leading-tight"
                        >
                            ${opt.text}
                            <div className="text-[12px] text-zinc-400 mt-1">
                                COST: ${opt.energyCost} | STB: ${opt.stabilityImpact}
                            </div>
                        </button>
                    `) : html`
                        <${React.Fragment}>
                            <button 
                                onClick=${() => handleDialogueAction('INTERROGAR')}
                                disabled=${isTyping}
                                className="flex-1 border border-cyan-900/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-600 text-[12px] transition-all uppercase tracking-tighter font-bold"
                            >
                                INICIAR ENLACE NEURAL [INTERROGAR]
                            </button>
                            <div className="flex-grow flex items-center justify-center p-2 text-center">
                                <span className="text-[12px] text-zinc-500 uppercase italic">Sujeto en espera de interacción...</span>
                            </div>
                        <//>
                    `}
                </div>

                <!-- SENTENCE BUTTONS -->
                <div className="h-20 p-4 flex flex-col items-center justify-center bg-black/60 relative">
                    ${(!isScanComplete && tutorialStep !== 3) && html`
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30 group/lock">
                            <span className="text-[10px] text-red-500/60 font-mono tracking-[0.2em] uppercase animate-pulse">
                                [PROTOCOLO DE SENTENCIA BLOQUEADO: REQUIERE ESCANEO ${requiredScan}]
                            </span>
                        </div>
                    `}
                    
                    <div className="flex items-center justify-center gap-6 w-full h-full">
                        <button 
                            onClick=${() => handleAction('SACRIFICE')}
                            disabled=${isTyping || (!isScanComplete && tutorialStep !== 3) || kaminOverride}
                            className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[12px] 
                                ${kaminOverride
            ? 'border-purple-900/50 text-purple-500/60 animate-pulse cursor-not-allowed'
            : (isScanComplete || tutorialStep === 3)
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
                            disabled=${isTyping || (!isScanComplete && tutorialStep !== 3)}
                            className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[12px] 
                                ${kaminOverride
            ? 'border-purple-500/70 text-purple-400 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse'
            : (isScanComplete || tutorialStep === 3)
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
