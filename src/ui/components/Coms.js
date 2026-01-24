/**
 * COMS.JS (MOD-05)
 * Sub-módulo de comunicaciones para el log de diálogos y eventos.
 * Integrado en MOD-04 Operations.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect, useRef } = React;

export const Coms = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const storyPath = useGameState('storyPath') || 0;
    const labels = CONFIG.UI.LABELS[storyPath].operations;

    // Parser de Markdown para Diálogos (Consistente con Operations)
    const parseDialogue = (text) => {
        if (!text) return [];
        const parts = text.split(/(\*[^*]+\*)/g).filter(p => p.length > 0);
        return parts.map(part => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return { type: 'ACTION', text: part.replace(/\*/g, '').trim() };
            }
            return { type: 'SPEECH', text: part.trim() };
        });
    };

    const appendParsedMessages = async (sender, text, baseType) => {
        const blocks = parseDialogue(text);
        for (const block of blocks) {
            if (block.type === 'ACTION') {
                setMessages(prev => [...prev, {
                    sender,
                    text: block.text,
                    type: 'ACTION',
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }]);
                await new Promise(r => setTimeout(r, 600));
            } else {
                setIsTyping(true);
                await new Promise(r => setTimeout(r, 1000));
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
        const onDialogue = (data) => {
            if (data.target && data.target !== 'MOD04' && data.target !== 'GLOBAL') return;
            appendParsedMessages(data.sender, data.text, data.type || 'SUBJECT');
        };

        const onNewSubject = () => {
            setMessages([{ 
                sender: labels.systemSender, 
                text: labels.newSubjectMsg, 
                type: 'SYSTEM',
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }]);
        };

        const onSessionTerminated = () => setMessages([]);

        bus.on('DIALOGUE_EMITTED', onDialogue);
        bus.on('NEW_SUBJECT_DETECTED', onNewSubject);
        bus.on('SESSION_TERMINATED', onSessionTerminated);

        return () => {
            bus.off('DIALOGUE_EMITTED', onDialogue);
            bus.off('NEW_SUBJECT_DETECTED', onNewSubject);
            bus.off('SESSION_TERMINATED', onSessionTerminated);
        };
    }, [labels]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return html`
        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/5 min-h-0 relative">
            <!-- MOD-05 TAG -->
            <div className="absolute top-1 right-2 text-[8px] font-bold text-zinc-700 pointer-events-none z-10">MOD-05: COMMS</div>
            
            ${messages.map((msg, i) => html`
                <div key=${i} className=${`flex flex-col animate-fade-in ${msg.type === 'SYSTEM' ? 'border-l-2 border-zinc-800 pl-3' :
                    msg.type === 'ACTION' ? 'border-y border-zinc-900/30 bg-zinc-950/20 py-2 my-1 items-center' : ''
                }`}>
                    <div className=${`flex justify-between items-center mb-1 ${msg.type === 'ACTION' ? 'hidden' : ''}`}>
                        <span className=${`text-[10px] font-bold tracking-[0.2em] uppercase ${msg.type === 'SYSTEM' ? 'text-zinc-500' :
                            msg.type === 'SUBJECT' ? 'text-cyan-600/80' : 'text-emerald-600/80'
                        }`}>
                            ${msg.sender}
                        </span>
                        <span className="text-[9px] text-zinc-700 font-mono tracking-tighter">${msg.timestamp || ''}</span>
                    </div>
                    <p className=${`text-[12px] leading-relaxed ${msg.type === 'SYSTEM' ? 'text-zinc-500 italic' :
                        msg.type === 'ACTION' ? 'text-amber-500/60 text-[11px] italic tracking-widest' :
                        msg.type === 'SUBJECT' ? 'text-zinc-300' : 'text-emerald-500/80 font-bold'
                    }`}>
                        ${msg.type === 'ACTION' ? `◆ ${msg.text} ◆` : msg.text}
                    </p>
                </div>
            `)}
            ${isTyping && html`
                <div className="flex items-center gap-2 text-zinc-600 animate-pulse text-[10px] ml-3">
                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
                    ${labels.receivingMsg}
                </div>
            `}
            <div ref=${messagesEndRef} />
        </div>
    `;
};
