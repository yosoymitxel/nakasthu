/**
 * COMS.JS (MOD-05)
 * Sub-módulo de comunicaciones para el log de diálogos y eventos.
 * Integrado en MOD-04 Operations.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';
import { useGameState } from '../hooks/useGameState.js';

import { Icon } from '../shared/Icon.js';
const { useState, useEffect, useRef } = React;

export const Coms = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const storyPath = useGameState('storyPath') || 0;
    const isSectarian = storyPath === 1;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.operations;

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
        const el = messagesEndRef.current;
        el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    return html`
        <div className=${`flex-grow min-h-0 relative flex flex-col overflow-hidden ${isSectarian ? 'bg-indigo-950/10' : 'bg-black/5'}`}>
            <!-- MOD-05 TAG -->
            <div className=${`absolute top-1 right-2 text-[8px] font-bold pointer-events-none z-10 ${isSectarian ? 'text-purple-700/60' : 'text-zinc-700'}`}>
                ${isSectarian ? 'MOD-05: CANAL_DE_PLEGARIAS' : 'MOD-05: COMMS'}
            </div>
            
            ${isSectarian && html`
                <!-- Efecto Onírico: Humo/Niebla tenue y partículas -->
                <div className="absolute inset-0 pointer-events-none opacity-60 overflow-hidden z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-indigo-950/20 to-purple-950/60" />
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] animate-pulse"></div>
                    <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] animate-slow-spin"></div>
                    
                    <!-- Bruma en movimiento con múltiples capas -->
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.005\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E')] opacity-40 animate-whisper-flow" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise2\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.01\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise2)\' opacity=\'0.1\'/%3E%3C/svg%3E')] opacity-20 animate-whisper-flow direction-reverse scale-150" />
                    
                    <!-- Efecto de distorsión cromática suave -->
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 mix-blend-overlay animate-pulse" />
                    
                    <!-- Partículas flotantes (Sectario) - Más cantidad y variedad -->
                    <div className="absolute inset-0">
                        ${[...Array(50)].map((_, i) => html`
                            <div 
                                key=${`particle-${i}`}
                                className=${`absolute rounded-full animate-float ${i % 5 === 0 ? 'w-2 h-2 bg-purple-200/30' : i % 3 === 0 ? 'w-1.5 h-1.5 bg-indigo-300/40' : 'w-1 h-1 bg-purple-400/20'}`}
                                style=${{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${20 + Math.random() * 30}s`,
            filter: `blur(${Math.random() * 4}px)`,
            opacity: 0.2 + Math.random() * 0.5
        }}
                            />
                        `)}
                    </div>

                    <!-- Destellos ocasionales -->
                    <div className="absolute inset-0 bg-purple-500/5 animate-pulse-slow mix-blend-screen"></div>
                </div>
            `}

            <div ref=${messagesEndRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
            ${messages.map((msg, i) => html`
                <div key=${`msg-${msg.timestamp}-${i}`} className=${`flex flex-col animate-fade-in relative z-10 ${msg.type === 'SYSTEM'
                ? `border-l-2 ${isSectarian ? 'border-purple-600/40 bg-purple-900/5 backdrop-blur-[1px]' : 'border-zinc-800'} pl-3 py-1` :
                msg.type === 'ACTION'
                    ? `${isSectarian ? 'border-y border-purple-800/20 bg-purple-950/20 shadow-[inset_0_0_15px_rgba(147,51,234,0.1)]' : 'border-y border-zinc-900/30 bg-zinc-950/20'} py-2 my-1 items-center italic text-zinc-500 group`
                    : 'group'
            }`}>
                    ${isSectarian && msg.type !== 'ACTION' && html`<${React.Fragment}>
                        <!-- Resplandor sutil para mensajes en modo sectario -->
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                        ${i % 4 === 0 && html`
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-[8px] text-purple-500/20 pointer-events-none animate-pulse">†</div>
                        `}
                        ${i % 7 === 0 && html`
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-[8px] text-indigo-500/20 pointer-events-none animate-pulse delay-500">‡</div>
                        `}
                    <//>`}

                    <div className=${`flex justify-between items-center mb-1 ${msg.type === 'ACTION' ? 'hidden' : ''}`}>
                        <span className=${`text-[10px] font-bold tracking-[0.2em] uppercase ${msg.type === 'SYSTEM'
                ? (isSectarian ? 'text-purple-400/70' : 'text-zinc-500')
                : (isSectarian ? (msg.sender === labels.operatorSender ? 'text-indigo-300' : 'text-purple-300') : (msg.type === 'SUBJECT' ? 'text-cyan-600/80' : 'text-emerald-600/80'))
            } ${isSectarian ? 'drop-shadow-[0_0_2px_rgba(168,85,247,0.4)]' : ''}`}>
                            ${msg.sender}
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono opacity-50">${msg.timestamp}</span>
                    </div>
                    
                    <p className=${`text-[12px] leading-relaxed tracking-wide ${msg.type === 'SYSTEM'
                ? 'text-zinc-400 italic' :
                msg.type === 'ACTION'
                    ? (isSectarian ? 'text-purple-200/50' : 'text-zinc-500') :
                    (isSectarian ? 'text-zinc-300 group-hover:text-purple-100 transition-colors duration-700' : (msg.type === 'SUBJECT' ? 'text-zinc-300' : 'text-emerald-500/80 font-bold'))
            }`}>
                        ${msg.type === 'ACTION' ? html`<span><${Icon} name=${isSectarian ? 'moon-stars' : 'chevron-right'} tone=${isSectarian ? 'sect' : 'orbital'} /> ${msg.text}</span>` : msg.text}
                    </p>
                </div>
            `)}
            
            ${isTyping && html`
                <div className="flex gap-2 items-center animate-pulse pl-1 z-10">
                    ${isSectarian ? html`
                        <div key="typing-label" className="text-[10px] text-purple-400/70 font-mono tracking-[0.3em] italic animate-pulse">EL_VACÍO_SUSURRA...</div>
                        <div key="typing-dots" className="flex gap-2">
                            <div key="typing-dot-1" className="w-1.5 h-1.5 bg-purple-500/40 rounded-full animate-ping shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
                            <div key="typing-dot-2" className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-ping delay-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                        </div>
                    ` : html`
                        <div key="typing-dot-a" className="w-1 h-1 rounded-full bg-cyan-500"></div>
                        <div key="typing-dot-b" className="w-1 h-1 rounded-full bg-cyan-500 delay-100"></div>
                        <div key="typing-dot-c" className="w-1 h-1 rounded-full bg-cyan-500 delay-200"></div>
                    `}
                </div>
            `}
            </div>
        </div>
    `;
};
