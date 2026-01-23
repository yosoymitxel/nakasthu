/**
 * SUBJECTVISUAL.JS (MOD-04)
 * Visualización del sujeto en la cámara de contención.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { bus } from '../../core/Bus.js';

const { useState, useEffect } = React;

export const SubjectVisual = () => {
    const subject = useGameState('currentEntity');
    const stability = useGameState('stability');
    const moduleLock = useGameState('moduleLock');

    const [authFlash, setAuthFlash] = useState(false);
    const [sacrificeFlash, setSacrificeFlash] = useState(false);
    const [localFlash, setLocalFlash] = useState(null);

    useEffect(() => {
        const onAuth = () => {
            setAuthFlash(true);
            setTimeout(() => setAuthFlash(false), 300);
        };

        const onSacrifice = () => {
            setSacrificeFlash(true);
            setTimeout(() => setSacrificeFlash(false), 300);
        };

        const onFlash = (data) => {
            if (data.target === 'MOD-04') {
                setLocalFlash({ color: data.color, duration: data.duration });
                setTimeout(() => setLocalFlash(null), data.duration || 300);
            }
        };

        bus.on('AUTHORIZE_EFFECT', onAuth);
        bus.on('SACRIFICE_PEAK', onSacrifice);
        bus.on('TRIGGER_FLASH', onFlash);
        return () => {
            bus.off('AUTHORIZE_EFFECT', onAuth);
            bus.off('SACRIFICE_PEAK', onSacrifice);
            bus.off('TRIGGER_FLASH', onFlash);
        };
    }, []);

    const isLocked = moduleLock && moduleLock.subject;
    const isPaused = useGameState('isPaused');
    const mode = useGameState('mode');
    const isEclipse = mode === 'ECLIPSE';

    if (isLocked) {
        return html`
            <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono p-4 text-center border border-red-900/50 bg-red-950/20 overflow-hidden relative">
                <div className="text-2xl mb-2">⚠</div>
                <div className="text-[12px] font-bold tracking-widest uppercase mb-1">VISUALIZER OFFLINE</div>
                <div className="text-[12px] opacity-70">NEURAL LINK SEVERED</div>
                <!-- Efecto de estática -->
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
            </div>
        `;
    }

    if (!subject) return html`
        <div className="flex items-center justify-center h-full italic text-zinc-400 text-[12px]">
            CÁMARA VACÍA
        </div>
    `;

    const { visual, type, id } = subject;
    
    // Regla 3: Si es EIDOLON y estabilidad < 40, aplicar filtro de corrupción
    const isCorrupted = type === 'EIDOLON' && stability < 40;

    return html`
        <div 
            className=${`relative h-full w-full overflow-hidden flex flex-col items-center justify-center transition-colors 
                ${authFlash ? 'bg-[#064e3b] duration-75' : sacrificeFlash ? 'bg-[#7f1d1d] duration-75' : 'bg-transparent duration-[2000ms]'} 
                ${isPaused ? 'filter grayscale blur-[1px]' : ''} 
                ${isEclipse ? 'shadow-[inset_0_0_50px_rgba(147,51,234,0.1)]' : ''}`}
            style=${{
                ...(localFlash ? { backgroundColor: localFlash.color, transitionDuration: '75ms' } : {}),
                filter: isEclipse ? 'hue-rotate(280deg) brightness(0.9) contrast(1.1)' : 'none'
            }}
        >
            <!-- Scanlines / Grid overlay -->
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
            
            <!-- Pause Overlay -->
            ${isPaused && html`
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                    <div className="border border-cyan-500/20 px-2 py-1 bg-black/60">
                        <span className="text-[12px] text-cyan-500 tracking-[0.4em] animate-pulse">PAUSA</span>
                    </div>
                </div>
            `}

            <!-- Silueta o Representación Visual (Maximizado 80%) -->
            <div className=${`
                relative w-[85%] h-[85%] border border-zinc-800 flex items-center justify-center overflow-hidden transition-all duration-500
                ${isCorrupted ? 'hue-rotate-90 border-red-500/50 scale-105' : ''}
                ${isPaused ? 'transition-none' : ''}
            `}>
                <!-- Glitch Effect Container -->
                <div className=${`
                    w-full h-full bg-zinc-950/40 flex items-center justify-center transition-all duration-1000
                    ${visual.glitch === 'CHROMATIC' || isCorrupted ? 'shadow-[inset_0_0_15px_rgba(255,0,0,0.2)]' : ''}
                    ${visual.glitch === 'VOID' ? 'grayscale opacity-50' : ''}
                `}>
                    <!-- Placeholder de silueta (Maximizado text-7xl) -->
                    <span className=${`text-7xl select-none transition-colors ${isCorrupted ? 'text-red-600' : 'text-zinc-400 opacity-30'}`}>
                        ${type === 'EIDOLON' ? '◈' : '👤'}
                    </span>
                    
                    <!-- Capas de glitch aleatorio -->
                    ${visual.glitch !== 'NONE' && html`
                        <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-repeat bg-[length:20px_20px] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                    `}
                </div>

                <!-- HUD del sujeto -->
                <div className="absolute top-0 left-0 p-1 bg-black/80 border-r border-b border-zinc-800">
                    <span className="text-[12px] font-mono text-cyan-500 font-bold">${id}</span>
                </div>
            </div>

            <!-- Etiquetas de Estado -->
            <div className="mt-2 flex flex-col items-center gap-1">
                <span className="text-[12px] tracking-[0.3em] text-zinc-400 uppercase">${type}</span>
                <div className="flex gap-1">
                    <div className=${`w-1 h-1 rounded-full ${visual.glitch === 'NONE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[12px] text-zinc-400 font-mono">SYNC: ${subject.scannedData.neuralSync}%</span>
                </div>
            </div>
        </div>
    `;
};
