/**
 * TERMINAL.JS (MOD-09)
 * Consola de comandos ZHYR_OS para intervención directa.
 */
import { html } from '../utils/html.js';
import { processCommand } from '../../systems/CommandEngine.js';
import { bus } from '../../core/Bus.js';

import { useGameState } from '../hooks/useGameState.js';

const { useState, useRef, useEffect } = React;

export const Terminal = () => {
    const isPaused = useGameState('isPaused');
    const [history, setHistory] = useState([
        { type: 'sys', text: 'ZHYR_OS v4.0.1 INITIALIZED...' }
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
            setHistory([{ type: 'sys', text: 'REINICIANDO TERMINAL... ESPERANDO NUEVA CONEXIÓN.' }]);
        };

        const onTerminalPrint = (data) => {
            setHistory(prev => [...prev, { type: 'sys', text: data.text }]);
        };

        bus.on('SESSION_TERMINATED', onSessionTerminated);
        bus.on('TERMINAL_PRINT', onTerminalPrint);

        return () => {
            bus.off('SESSION_TERMINATED', onSessionTerminated);
            bus.off('TERMINAL_PRINT', onTerminalPrint);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmdInput = currentInput.trim();
            if (!cmdInput) return;

            if (cmdInput.toLowerCase() === '/clear') {
                setHistory([{ type: 'sys', text: 'CONSOLE CLEARED.' }]);
                setCurrentInput('');
                return;
            }

            const response = processCommand(cmdInput);
            
            setHistory(prev => [
                ...prev, 
                { type: 'user', text: `> ${cmdInput}` },
                { type: 'sys', text: response }
            ]);
            
            // Emitir para que el sistema de audio capte el sonido de terminal,
            // pero no añadirlo de nuevo al historial local
            bus.emit('TERMINAL_AUDIO_ONLY', { text: response });
            
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
            className="flex flex-col h-full p-3 font-mono bg-[#0a0a0b] cursor-text overflow-hidden"
        >
            <!-- Header Interno -->
            <div className="flex justify-between items-center border-b border-zinc-900/50 pb-2 mb-3">
                <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">ZHYR_OS Terminal v4.0.1</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-900 animate-pulse"></div>
                </div>
            </div>

            <!-- Área de Scroll -->
            <div 
                id="terminal-log"
                ref=${scrollRef}
                className="flex-1 overflow-y-auto mb-3 space-y-1.5 custom-scrollbar pr-2"
            >
                ${history.map((line, i) => html`
                    <div 
                        key=${i} 
                        className=${`text-[11px] leading-relaxed break-all ${line.type === 'user' ? 'text-cyan-600' : 'text-zinc-400'}`}
                    >
                        ${line.text}
                    </div>
                `)}
                <div ref=${messagesEndRef} />
            </div>

            <!-- Línea de Input -->
            <div className="flex items-center gap-2 border-t border-zinc-900/50 pt-2">
                <span className="text-cyan-500 text-[11px] font-black animate-pulse">></span>
                <input 
                    ref=${inputRef}
                    type="text"
                    value=${currentInput}
                    onChange=${(e) => setCurrentInput(e.target.value)}
                    onKeyDown=${handleKeyDown}
                    disabled=${isPaused}
                    className="flex-1 bg-transparent border-none outline-none text-[11px] text-cyan-400 placeholder-zinc-800 uppercase tracking-widest"
                    placeholder=${isPaused ? "SISTEMA PAUSADO" : "INGRESAR COMANDO..."}
                    autoFocus
                />
            </div>
        </div>
    `;
};
