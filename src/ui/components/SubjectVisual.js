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
    const storyPath = useGameState('storyPath') || 0;
    const isSectarian = storyPath === 1;

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
                <div className="text-2xl mb-2">${isSectarian ? '†' : '⚠'}</div>
                <div className="text-[12px] font-bold tracking-widest uppercase mb-1">
                    ${isSectarian ? 'VISIÓN OSCURECIDA' : 'VISUALIZER OFFLINE'}
                </div>
                <div className="text-[12px] opacity-70">
                    ${isSectarian ? 'VELO DESGARRADO' : 'NEURAL LINK SEVERED'}
                </div>
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
            className=${`relative h-full w-full overflow-hidden flex flex-col items-center justify-center transition-all duration-700
                ${authFlash ? (isSectarian ? 'bg-purple-900/40 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'bg-[#064e3b]') : 
                  sacrificeFlash ? (isSectarian ? 'bg-red-900/40 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-[#7f1d1d]') : 
                  (isSectarian ? 'bg-purple-950/5' : 'bg-transparent')} 
                ${isPaused ? 'filter grayscale blur-[1px]' : ''} 
                ${isEclipse || isSectarian ? 'shadow-[inset_0_0_50px_rgba(147,51,234,0.1)]' : ''}`}
            style=${{
                ...(localFlash ? { backgroundColor: localFlash.color, transitionDuration: '75ms' } : {}),
                filter: isEclipse || (isSectarian && stability < 50) ? 'hue-rotate(280deg) brightness(0.9) contrast(1.1)' : 'none'
            }}
        >
            <!-- Scanlines / Grid overlay -->
            <div className=${`absolute inset-0 pointer-events-none z-10 ${isSectarian ? 'bg-[radial-gradient(rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30' : 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20'}`}></div>
            
            <!-- Pause Overlay -->
            ${isPaused && html`
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                    <div className=${`border px-2 py-1 bg-black/60 ${isSectarian ? 'border-purple-500/20' : 'border-cyan-500/20'}`}>
                        <span className=${`text-[12px] tracking-[0.4em] animate-pulse ${isSectarian ? 'text-purple-500' : 'text-cyan-500'}`}>
                            ${isSectarian ? 'COMUNIÓN_SUSPENDIDA' : 'PAUSA'}
                        </span>
                    </div>
                </div>
            `}

            <!-- Silueta o Representación Visual (Maximizado 80%) -->
                <div className=${`
                    relative w-[85%] h-[85%] border flex items-center justify-center overflow-hidden transition-all duration-500
                    ${isSectarian ? 'border-purple-500/20 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.1)] bg-purple-950/10' : 'border-zinc-800'}
                    ${isCorrupted ? 'hue-rotate-90 border-red-500/50 scale-105' : ''}
                    ${isPaused ? 'transition-none' : ''}
                `}>
                    <!-- Efecto de aura giratoria (Sectario) -->
                    ${isSectarian && html`
                        <div className="absolute inset-0 border border-purple-500/5 rounded-full animate-spin-slow scale-110 pointer-events-none"></div>
                        <div className="absolute inset-0 border border-indigo-500/5 rounded-full animate-slow-spin direction-reverse scale-105 pointer-events-none"></div>
                    `}

                    <!-- Glitch Effect Container -->
                    <div className=${`
                        w-full h-full bg-zinc-950/40 flex items-center justify-center transition-all duration-1000
                        ${isSectarian ? 'bg-transparent' : ''}
                        ${visual.glitch === 'CHROMATIC' || isCorrupted ? 'shadow-[inset_0_0_15px_rgba(255,0,0,0.2)]' : ''}
                        ${visual.glitch === 'VOID' ? 'grayscale opacity-50' : ''}
                    `}>
                        <!-- Placeholder de silueta (Maximizado text-7xl) -->
                    <span className=${`text-7xl select-none transition-all duration-1000 ${isCorrupted ? 'text-red-600' : (isSectarian ? 'text-purple-400 opacity-30 blur-[2px] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-zinc-400 opacity-30')}`}>
                        ${type === 'EIDOLON' ? (isSectarian ? '🕈' : '◈') : (isSectarian ? '†' : '👤')}
                    </span>
                        
                        <!-- Capas de glitch aleatorio -->
                        ${visual.glitch !== 'NONE' && html`
                            <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-repeat bg-[length:20px_20px] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                        `}

                        <!-- Efecto místico para el sectario -->
                        ${isSectarian && html`
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] animate-slow-pulse"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_transparent_70%)] opacity-40"></div>
                            </div>
                        `}
                    </div>

                    <!-- HUD del sujeto (Sectario: Glifos) -->
                    <div className=${`absolute top-0 left-0 p-2 bg-black/60 backdrop-blur-sm border-r border-b ${isSectarian ? 'border-purple-900/50 rounded-br-lg' : 'border-zinc-800'}`}>
                        <span className=${`text-[10px] font-mono font-bold tracking-widest ${isSectarian ? 'text-purple-400' : 'text-cyan-400'}`}>
                            ${isSectarian ? `᚛ ${id} ᚜` : id}
                        </span>
                    </div>
                </div>

            <!-- Etiquetas de Estado -->
            <div className="mt-2 flex flex-col items-center gap-1">
                <span className=${`text-[12px] tracking-[0.3em] uppercase ${isSectarian ? 'text-purple-400 font-black' : 'text-zinc-400'}`}>
                    ${isSectarian && type === 'EIDOLON' ? 'CORRUPTO' : (isSectarian && type === 'HUMAN' ? 'DEVOTO' : type)}
                </span>
                <div className="flex gap-1">
                    <div className=${`w-1 h-1 rounded-full ${visual.glitch === 'NONE' ? 'bg-green-500' : 'bg-red-500'} ${isSectarian ? 'shadow-[0_0_5px_currentColor]' : ''}`}></div>
                    <span className=${`text-[12px] font-mono ${isSectarian ? 'text-purple-400' : 'text-zinc-400'}`}>
                        ${isSectarian ? 'SINTONÍA' : 'SYNC'}: ${subject.scannedData.neuralSync}%
                    </span>
                </div>
            </div>
        </div>
    `;
};
