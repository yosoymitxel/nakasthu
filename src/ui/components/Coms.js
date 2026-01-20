/**
 * COMS.JS (MOD-05)
 * Interfaz de comunicación y motor de diálogo.
 */
import { html } from '../utils/html.js';
import { interrogate } from '../../systems/DialogueEngine.js';
import { handleSacrifice, handleAuthorize } from '../../systems/MechanicsEngine.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';

const { useState, useEffect, useRef } = React;

export const Coms = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const onDialogue = (data) => {
            // Prioridad: Si es de sistema, renderizado inmediato. Si es diálogo, pequeño retraso para efecto.
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
        };

        const onScanComplete = (data) => {
            setMessages(prev => [...prev, {
                sender: 'SISTEMA',
                text: `[REPORTE BIOSCAN] ${data.type.name} FINALIZADO. DATOS ENVIADOS A ANALYTICS.`,
                type: 'SYSTEM'
            }]);
        };

        const onSessionTerminated = () => {
            // Limpieza total del historial de COMS
            setMessages([]);
        };

        bus.on('DIALOGUE_EMITTED', onDialogue);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('SCAN_COMPLETED', onScanComplete);
        bus.on('SESSION_TERMINATED', onSessionTerminated);

        return () => {
            bus.off('DIALOGUE_EMITTED', onDialogue);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SCAN_COMPLETED', onScanComplete);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleInterrogate = () => {
        if (isTyping) return;
        interrogate();
    };

    const handleAction = (type) => {
        if (isTyping) return;
        if (type === 'SACRIFICE') handleSacrifice();
        if (type === 'AUTHORIZE') handleAuthorize();
    };

    return html`
        <div className="absolute inset-0 flex flex-col p-3 overflow-hidden font-mono bg-zinc-950/50">
            <!-- Área de Mensajes -->
            <div 
                ref=${scrollRef}
                className="flex-1 overflow-y-auto space-y-3 mb-2 custom-scrollbar pr-2"
            >
                ${messages.map((msg, i) => html`
                    <div key=${i} className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className=${`text-[10px] uppercase tracking-widest mb-1 ${msg.type === 'SYSTEM' ? 'text-zinc-500' : 'text-cyan-600 font-bold'}`}>
                            [${msg.sender}]
                        </div>
                        <div className=${`text-[15px] leading-relaxed [text-shadow:0_0_5px_rgba(255,255,255,0.2)] ${msg.type === 'SYSTEM' ? 'text-zinc-400 italic' : 'text-zinc-100'}`}>
                            ${msg.text}
                        </div>
                    </div>
                `)}
                
                ${isTyping && html`
                    <div className="text-[10px] text-cyan-600 uppercase tracking-widest">
                        ESTABLECIENDO CONEXIÓN NEURAL...
                    </div>
                `}
                <div ref=${messagesEndRef} />
            </div>

            <!-- Controles de Interrogatorio y Decisión -->
            <div className="mt-auto flex flex-col gap-2 bg-black/40">
                <button 
                    onClick=${handleInterrogate}
                    disabled=${isTyping}
                    className="border border-cyan-900/50 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-500 text-[10px] py-1 font-bold transition-all uppercase tracking-tighter"
                >
                    INTERROGAR
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick=${() => handleAction('SACRIFICE')}
                        disabled=${isTyping}
                        className="border border-red-900/50 bg-red-950/20 hover:bg-red-900/40 text-red-500 text-[9px] py-1 font-bold transition-all uppercase"
                    >
                        SACRIFICAR
                    </button>
                    <button 
                        onClick=${() => handleAction('AUTHORIZE')}
                        disabled=${isTyping}
                        className="border border-green-900/50 bg-green-950/20 hover:bg-green-900/40 text-green-500 text-[9px] py-1 font-bold transition-all uppercase"
                    >
                        AUTORIZAR
                    </button>
                </div>
            </div>
        </div>
    `;
};
