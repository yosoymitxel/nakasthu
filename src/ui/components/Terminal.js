/**
 * TERMINAL.JS (MOD-09)
 * Consola de comandos ZHYR_OS para intervención directa.
 */
import { html } from '../utils/html.js';
import { processCommand } from '../../systems/CommandEngine.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

import { useGameState } from '../hooks/useGameState.js';

const { useState, useRef, useEffect, memo } = React;

export const Terminal = memo(() => {
    const isPaused = useGameState('isPaused');
    const isTutorialActive = useGameState('isTutorialActive');
    const storyPath = useGameState('storyPath') || 0;
    const isSectarian = storyPath === 1;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.terminal;

    const [history, setHistory] = useState([
        { type: 'sys', text: labels.welcome }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Exponer el inputRef y el setter para MOD-10
    useEffect(() => {
        window.__TERMINAL_INPUT__ = {
            setInput: setCurrentInput,
            focus: () => inputRef.current?.focus()
        };
        return () => delete window.__TERMINAL_INPUT__;
    }, []);

    // Auto-scroll al final del historial
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    // Limpiar terminal al terminar sesión
    useEffect(() => {
        const onSessionTerminated = () => {
            setHistory([{ type: 'sys', text: labels.reset }]);
        };

        const onTerminalPrint = (data) => {
            setHistory(prev => [...prev, { 
                type: data.type || 'sys', 
                text: data.text,
                color: data.color,
                links: data.links // Array de { label, event, data }
            }]);
        };

        const onTerminalInput = (text) => {
            setCurrentInput(text);
            inputRef.current?.focus();
        };

        bus.on('SESSION_TERMINATED', onSessionTerminated);
        bus.on('TERMINAL_PRINT', onTerminalPrint);
        bus.on('TERMINAL_INPUT', onTerminalInput);

        return () => {
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('TERMINAL_PRINT', onTerminalPrint);
            bus.off('TERMINAL_INPUT', onTerminalInput);
        };
    }, []);

    const handleLinkClick = (link) => {
        if (link.event) {
            bus.emit(link.event, link.data);
        }
        if (link.highlight) {
            bus.emit('HIGHLIGHT_MODULE', { 
                areas: link.highlight, 
                color: '#06b6d4', 
                duration: 2000 
            });
        }
    };

    const renderTextWithLinks = (line) => {
        if (!line.links || line.links.length === 0) {
            return line.text;
        }

        // Si hay links, buscamos los placeholders en el texto o los añadimos al final
        let parts = [line.text];
        
        return html`
            <div className="flex flex-wrap gap-2 items-center">
                <span>${line.text}</span>
                <div className="flex gap-2">
                    ${line.links.map(link => html`
                        <button 
                            key=${link.label}
                            onClick=${() => handleLinkClick(link)}
                            className=${`px-1.5 py-0.5 border text-[10px] transition-colors uppercase font-bold ${isSectarian ? 'bg-purple-900/30 border-purple-700/50 text-purple-400 hover:bg-purple-500 hover:text-black' : 'bg-cyan-900/30 border-cyan-700/50 text-cyan-400 hover:bg-cyan-500 hover:text-black'}`}
                        >
                            [${link.label}]
                        </button>
                    `)}
                </div>
            </div>
        `;
    };

    const getLineStyle = (line) => {
        let base = "text-[12px] leading-tight break-all font-mono ";
        if (line.type === 'user') return base + (isSectarian ? "text-purple-600" : "text-cyan-600");
        if (line.type === 'error' || line.type === 'CRITICAL') return base + "text-red-500 font-bold animate-pulse";
        if (line.type === 'success' || line.type === 'SYSTEM') return base + (isSectarian ? "text-purple-500" : "text-emerald-500");
        if (line.type === 'warning' || line.type === 'INFO') return base + "text-amber-500";
        return base + (isSectarian ? "text-purple-400/70" : "text-zinc-400");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmdInput = currentInput.trim();
            if (!cmdInput) return;

            // Vínculo Terminal -> Grid (Fase 18)
            if (cmdInput.toLowerCase().includes('/scan') || cmdInput.toLowerCase().includes('/revelacion')) {
                bus.emit('HIGHLIGHT_MODULE', { areas: ['L_UPPER'], color: isSectarian ? '#a855f7' : '#06b6d4', duration: 1000 });
            }
            if (cmdInput.toLowerCase().includes('/repair') || cmdInput.toLowerCase().includes('/purificar')) {
                bus.emit('HIGHLIGHT_MODULE', { areas: ['R_MIDDLE', 'C_FOOTER'], color: isSectarian ? '#a855f7' : '#06b6d4', duration: 1000 });
            }

            if (cmdInput.toLowerCase() === '/clear' || cmdInput.toLowerCase() === '/limpiar') {
                setHistory([{ type: 'sys', text: labels.clear }]);
                setCurrentInput('');
                return;
            }

            const response = processCommand(cmdInput);
            
            setHistory(prev => [
                ...prev, 
                { type: 'user', text: `${isSectarian ? 'ψ' : '>'} ${cmdInput}` },
                typeof response === 'string' 
                    ? { type: 'sys', text: response }
                    : { ...response, type: response.type || 'sys' }
            ]);
            
            // Emitir para que el sistema de audio capte el sonido de terminal,
            // pero no añadirlo de nuevo al historial local
            bus.emit('TERMINAL_AUDIO_ONLY', { text: typeof response === 'string' ? response : response.text });
            
            setCurrentInput('');
        }
    };

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return html`
        <div 
            onClick=${handleContainerClick}
            className=${`flex flex-col h-full cursor-text overflow-hidden relative ${isSectarian ? 'bg-[#0a0812] shadow-[inset_0_0_40px_rgba(168,85,247,0.1)]' : 'bg-[#0a0a0b]'}`}
        >
            ${isSectarian && html`
                <!-- Efecto Onírico: Bruma Terminal -->
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,28,135,0.05)_0%,transparent_100%)]"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-900/10 blur-[40px] animate-pulse"></div>
                </div>
            `}
            <!-- Header Interno Sticky -->
            <div className=${`flex justify-between items-center border-b p-3 sticky top-0 z-20 ${isSectarian ? 'border-purple-900/30 bg-purple-950/30' : 'border-zinc-800 bg-black/40'}`}>
                <div className="flex items-center gap-2">
                    <div className=${`w-2 h-2 animate-pulse ${isSectarian ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'}`}></div>
                    <span className=${`text-[12px] font-bold tracking-[0.2em] uppercase ${isSectarian ? 'text-purple-400' : 'text-zinc-300'}`}>
                        ${isSectarian ? '† ALTAR DE SUSURROS †' : labels.header}
                    </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest">${labels.version}</span>
            </div>

            <!-- Área de Scroll -->
            <div 
                id="terminal-log"
                ref=${scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar pr-2"
            >
                ${history.map((line, i) => html`
                    <div 
                        key=${i} 
                        className=${getLineStyle(line)}
                        style=${line.color ? { color: line.color } : {}}
                    >
                        ${renderTextWithLinks(line)}
                    </div>
                `)}
                <div ref=${messagesEndRef} />
            </div>

            <!-- Línea de Input Fija al Final -->
            <div className=${`flex items-center gap-2 border-t p-3 transition-colors ${isSectarian ? 'border-purple-900/30 bg-purple-950/10' : 'border-zinc-800 bg-black/20'}`}>
                <span className=${`text-[12px] font-black animate-pulse ${isSectarian ? 'text-purple-500' : 'text-cyan-500'}`}>
                    ${isSectarian ? 'ψ' : '>'}
                </span>
                <input 
                    ref=${inputRef}
                    type="text"
                    value=${currentInput}
                    onChange=${(e) => setCurrentInput(e.target.value)}
                    onKeyDown=${handleKeyDown}
                    disabled=${isPaused || isTutorialActive}
                    className=${`flex-1 bg-transparent border-none outline-none text-[12px] placeholder-zinc-700 tracking-wider uppercase ${isSectarian ? 'text-purple-400' : 'text-cyan-400'}`}
                    placeholder=${isPaused ? labels.paused : isTutorialActive ? labels.tutorial : (isSectarian ? 'Entona tu plegaria...' : labels.placeholder)}
                    autoFocus
                />
            </div>
        </div>
    `;
});
