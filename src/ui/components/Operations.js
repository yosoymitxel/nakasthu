/**
 * OPERATIONS.JS
 * Bloque 6: MOD-04 OPERATIONS.
 * Espacio masivo dividido en COMS_LOG, ACTION_MATRIX y SENTENCE buttons.
 */
import { html } from '../utils/html.js';
import { interrogate } from '../../systems/DialogueEngine.js';
import { handleSacrifice, handleAuthorize } from '../../systems/MechanicsEngine.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';
import { useGameState } from '../hooks/useGameState.js';
import { PortalScene } from './PortalScene.js';
import { SubjectVisual } from './SubjectVisual.js';

const { useState, useEffect, useRef } = React;

export const Operations = () => {
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isBiometricComplete, setIsBiometricComplete] = useState(false);
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

        const onNewSubject = () => {
            setMessages([{ sender: 'SISTEMA', text: 'NUEVO SUJETO DETECTADO EN CÁMARA.', type: 'SYSTEM' }]);
            setIsBiometricComplete(false); // Reset para nuevo sujeto
        };

        const onBiometricComplete = () => {
            setIsBiometricComplete(true);
            setMessages(prev => [...prev, {
                sender: 'SISTEMA',
                text: 'ENLACE BIOMÉTRICO ESTABLECIDO. PROTOCOLO DE SENTENCIA HABILITADO.',
                type: 'SYSTEM'
            }]);
        };

        const onScanComplete = (data) => {
            setMessages(prev => [...prev, {
                sender: 'SISTEMA',
                text: `[REPORTE BIOSCAN] ${data.type.name} FINALIZADO. DATOS ENVIADOS A ANALYTICS.`,
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
        bus.on('BIOMETRICO_COMPLETO', onBiometricComplete);

        return () => {
            bus.off('DIALOGUE_EMITTED', onDialogue);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('BIOMETRICO_COMPLETO', onBiometricComplete);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleDialogueAction = (actionName) => {
        if (isTyping) return;
        
        // Coste de energía: 5
        if (state.energy < 5) {
            bus.emit('DIALOGUE_EMITTED', {
                sender: 'SISTEMA',
                text: `[CRÍTICO] Energía insuficiente para ${actionName}.`,
                type: 'SYSTEM'
            });
            return;
        }

        state.energy -= 5;
        
        if (actionName === 'INTERROGAR') {
            interrogate();
        } else {
            bus.emit('TERMINAL_PRINT', { text: `PROTOCOLO DE ${actionName} NO DISPONIBLE.` });
            // Aunque no esté disponible, consumimos la energía como castigo/coste de intento
            setMessages(prev => [...prev, {
                sender: 'SISTEMA',
                text: `[INTENTO] PROTOCOLO DE ${actionName} INICIADO. FALLO EN ENLACE.`,
                type: 'SYSTEM'
            }]);
        }
    };

    const handleAction = (type) => {
        if (isTyping || !isBiometricComplete) return;
        if (type === 'SACRIFICE') handleSacrifice();
        if (type === 'AUTHORIZE') handleAuthorize();
    };

    return html`
        <div className="flex flex-col h-full w-full bg-transparent font-mono overflow-hidden">
            <div className="h-[40%] w-full flex border-b border-zinc-900/50">
                <div className="w-1/3 h-full border-r-[0.5px] border-zinc-900/50 relative overflow-hidden flex flex-col">
                    <${PortalScene} />
                    <div className="absolute bottom-1 left-2 text-[6px] text-zinc-600 tracking-widest uppercase font-bold pointer-events-none">ORBITAL</div>
                </div>

                <div className="w-1/3 h-full border-r-[0.5px] border-zinc-900/50 relative overflow-hidden flex flex-col">
                    <${SubjectVisual} />
                    <div className="absolute bottom-1 left-2 text-[6px] text-zinc-600 tracking-widest uppercase font-bold pointer-events-none">FEED</div>
                </div>

                <div className="w-1/3 h-full flex flex-col justify-around px-3 py-2 bg-black/10">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold mb-1">QUOTA_RECOVERY</span>
                        <span className="text-2xl font-black text-emerald-600/70 font-mono">
                            ${processedCount} / ${quota}
                        </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-3 relative overflow-hidden border border-zinc-900/30">
                        <div 
                            className="h-full bg-emerald-600/40 transition-all duration-1000"
                            style=${{ width: `${Math.min((processedCount / quota) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-center">
                        <span className="text-[8px] text-red-900/60 font-bold font-mono uppercase">
                            ERR: ${judgmentErrors}
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-[40%] flex border-b border-zinc-900/50 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/5">
                    ${messages.map((msg, i) => html`
                        <div key=${i} className=${`flex flex-col animate-fade-in ${msg.type === 'SYSTEM' ? 'border-l-2 border-zinc-800 pl-3' : ''}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className=${`text-[8px] font-bold tracking-widest uppercase ${
                                    msg.type === 'SYSTEM' ? 'text-zinc-600' : 
                                    msg.type === 'SUBJECT' ? 'text-cyan-600/60' : 
                                    'text-emerald-600/60'
                                }`}>
                                    ${msg.sender}
                                </span>
                                <span className="text-[7px] text-zinc-800 font-mono">${msg.timestamp || ''}</span>
                            </div>
                            <p className=${`text-[11px] leading-relaxed ${
                                msg.type === 'SYSTEM' ? 'text-zinc-500 italic' : 
                                msg.type === 'SUBJECT' ? 'text-zinc-300' : 
                                'text-emerald-500/80'
                            }`}>
                                ${msg.text}
                            </p>
                        </div>
                    `)}
                    <div ref=${messagesEndRef} />
                </div>

                <div className="w-24 border-l border-zinc-900/50 bg-black/40 flex flex-col p-1 gap-1">
                    <button 
                        onClick=${() => handleDialogueAction('INTERROGAR')}
                        disabled=${isTyping}
                        className="flex-1 border border-cyan-900/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-600 text-[8px] transition-all uppercase tracking-tighter font-bold"
                    >
                        INTERROGAR
                    </button>
                    <button 
                        onClick=${() => handleDialogueAction('SONDEAR')}
                        disabled=${isTyping}
                        className="flex-1 border border-zinc-900/30 bg-black/20 text-zinc-700 text-[8px] transition-all uppercase tracking-tighter font-bold"
                    >
                        SONDEAR
                    </button>
                    <button 
                        onClick=${() => handleDialogueAction('PRESIONAR')}
                        disabled=${isTyping}
                        className="flex-1 border border-zinc-900/30 bg-black/20 text-zinc-700 text-[8px] transition-all uppercase tracking-tighter font-bold"
                    >
                        PRESIONAR
                    </button>
                    <button 
                        onClick=${() => handleDialogueAction('CALIBRAR')}
                        disabled=${isTyping}
                        className="flex-1 border border-zinc-900/30 bg-black/20 text-zinc-700 text-[8px] transition-all uppercase tracking-tighter font-bold"
                    >
                        CALIBRAR
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[80px] p-4 bg-black/60 flex items-center justify-center gap-6">
                <button 
                    onClick=${() => handleAction('SACRIFICE')}
                    disabled=${isTyping || !isBiometricComplete}
                    className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[11px] ${isBiometricComplete ? 'border-red-900/30 bg-red-950/5 hover:bg-red-900/10 text-red-700/80' : 'border-zinc-900/20 bg-black/10 text-zinc-800 cursor-not-allowed'}`}
                >
                    SACRIFICAR
                </button>
                
                <div className="w-[0.5px] h-6 bg-zinc-900/30"></div>

                <button 
                    onClick=${() => handleAction('AUTHORIZE')}
                    disabled=${isTyping || !isBiometricComplete}
                    className=${`flex-1 max-w-[180px] h-full relative group border-[0.5px] transition-all uppercase tracking-[0.3em] font-black text-[11px] ${isBiometricComplete ? 'border-emerald-900/30 bg-emerald-950/5 hover:bg-emerald-900/10 text-emerald-700/80' : 'border-zinc-900/20 bg-black/10 text-zinc-800 cursor-not-allowed'}`}
                >
                    AUTORIZAR
                </button>
            </div>
        </div>
    `;
};
