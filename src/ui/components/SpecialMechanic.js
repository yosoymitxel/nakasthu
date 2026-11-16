/**
 * SPECIALMECHANIC.JS
 * Interacción con el Monolito para pasos 2 y 11.
 * Regla 2.C: React + htm, estilo glitchy sci-fi oscuro.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

const { useState, useEffect, useRef, useCallback, memo } = React;

/**
 * Componente del Monolito - Sincronización neural / Comunión Onírica
 * El jugador debe mantener presionada una tecla para sincronizar/comulgar.
 */
export const SpecialMechanic = memo(({ onComplete, syncKey = ' ' }) => {
    const storyPath = state.storyPath || 0;
    const isSectarian = storyPath === 1;
    const pathConfig = PATH_CONFIGS[storyPath];
    const labels = pathConfig.specialMechanic;

    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [glitchIntensity, setGlitchIntensity] = useState(0);

    const animationRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Velocidades de subida/bajada del progreso
    const PROGRESS_SPEED_UP = 0.7;   // ~5 s de pulsación: a 0.4 eran ~9 s antes de la primera decisión
    const PROGRESS_SPEED_DOWN = 1.2;  // Baja rápido si sueltas

    // Loop de animación con requestAnimationFrame
    const animate = useCallback((timestamp) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const delta = (timestamp - lastTimeRef.current) / 16.67; // Normalizar a ~60fps
        lastTimeRef.current = timestamp;

        setProgress(prev => {
            if (isHolding) {
                return Math.min(100, prev + PROGRESS_SPEED_UP * delta);
            } else {
                return Math.max(0, prev - PROGRESS_SPEED_DOWN * delta);
            }
        });

        if (!isComplete) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [isHolding, isComplete]);

    // Gestión de efectos secundarios del progreso (glitch e hitos)
    useEffect(() => {
        // Actualizar intensidad del glitch
        setGlitchIntensity(progress / (isHolding ? 100 : 200));

        // Emitir progreso para telemetría
        bus.emit('MONOLITH_SYNC', { progress, complete: progress >= 100 });

        // Verificar completado
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            bus.emit('TRIGGER_FLASH', { color: isSectarian ? '#9333ea' : '#06b6d4', duration: 300 });

            if (onComplete) {
                setTimeout(onComplete, 500);
            }
        }
    }, [progress, isHolding, isComplete, onComplete, isSectarian]);

    // Iniciar/detener animación
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    // Manejadores de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isComplete) return;
            if (e.key === syncKey || e.code === 'Space') {
                e.preventDefault();
                setIsHolding(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === syncKey || e.code === 'Space') {
                setIsHolding(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [syncKey, isComplete]);

    // Estilo dinámico del monolito
    const monolithStyle = {
        transform: `
            scale(${1 + glitchIntensity * 0.05}) 
            translateX(${isHolding ? (Math.random() - 0.5) * 4 * glitchIntensity : 0}px)
            translateY(${isHolding ? (Math.random() - 0.5) * 2 * glitchIntensity : 0}px)
        `,
        filter: `
            brightness(${1 + glitchIntensity * 0.3})
            ${isSectarian ? `hue-rotate(${glitchIntensity * 40}deg) blur(${glitchIntensity * 2}px)` : `hue-rotate(${glitchIntensity * 20}deg)`}
        `,
        boxShadow: isSectarian 
            ? `
                0 0 ${30 + glitchIntensity * 50}px rgba(147, 51, 234, ${0.3 + glitchIntensity * 0.4}),
                0 0 ${60 + glitchIntensity * 80}px rgba(88, 28, 235, ${glitchIntensity * 0.3}),
                inset 0 0 30px rgba(0, 0, 0, 0.9)
            `
            : `
                0 0 ${30 + glitchIntensity * 50}px rgba(6, 182, 212, ${0.3 + glitchIntensity * 0.4}),
                0 0 ${60 + glitchIntensity * 80}px rgba(147, 51, 234, ${glitchIntensity * 0.3}),
                inset 0 0 30px rgba(0, 0, 0, 0.9)
            `
    };

    // Estilo de la barra de progreso
    const progressBarStyle = {
        width: `${progress}%`,
        transition: isHolding ? 'none' : 'width 0.1s ease-out',
        boxShadow: isSectarian 
            ? `0 0 ${10 + progress * 0.3}px rgba(147, 51, 234, 0.8)`
            : `0 0 ${10 + progress * 0.3}px rgba(6, 182, 212, 0.8)`
    };

    return html`
        <div className="special-mechanic-container fixed inset-0 z-[600] bg-black/60 flex flex-col items-center justify-center">
            
            <!-- Fondo con ruido estático o niebla onírica -->
            ${isSectarian ? html`
                <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-indigo-950/40" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent animate-slow-spin" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.005\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E')] animate-whisper-flow" />
                </div>
            ` : html`
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style=${{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                        animation: isHolding ? 'noise-shift 0.1s steps(2) infinite' : 'none'
                    }}
                />
            `}

            <!-- Instrucciones -->
            <div className="absolute top-12 text-center space-y-2 z-10">
                <h2 className=${`text-xl tracking-[0.5em] uppercase font-bold animate-pulse ${isSectarian ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'text-cyan-400'}`}>
                    ${labels.header}
                </h2>
                <p className=${`text-sm tracking-widest ${isSectarian ? 'text-purple-300/60 italic' : 'text-zinc-500'}`}>
                    ${isComplete ? labels.complete : labels.instruction}
                </p>
            </div>

            <!-- El Monolito -->
            <div className="relative group">
                ${isSectarian && html`
                    <!-- Círculo Ritualístico (Sectario) -->
                    <div className=${`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-purple-500/10 rounded-full transition-all duration-1000 ${isHolding ? 'scale-110 opacity-100 rotate-180 border-purple-500/50' : 'scale-100 opacity-30 rotate-0'}`}
                        style=${{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                        <!-- Heptagrama ritual complejo -->
                        <div className="absolute inset-0 opacity-40 animate-pulse" style=${{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 2 L61 35 L95 35 L67 55 L78 88 L50 68 L22 88 L33 55 L5 35 L39 35 Z' fill='none' stroke='rgba(168,85,247,0.8)' stroke-width='0.3'/%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='rgba(168,85,247,0.2)' stroke-width='0.1'/%3E%3Cpath d='M50 2 L50 98 M2 50 L98 50' stroke='rgba(168,85,247,0.1)' stroke-width='0.1'/%3E%3C/svg%3E")`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}></div>
                        
                        <div className="absolute inset-0 border-2 border-purple-500/10 rounded-full scale-95 animate-spin-slow shadow-[0_0_30px_rgba(168,85,247,0.1)]"></div>
                        <div className="absolute inset-0 border border-indigo-500/20 rounded-full scale-105 animate-slow-spin direction-reverse"></div>
                        
                        <!-- Glifos flotantes circulares -->
                        <div className="absolute inset-0 animate-pulse">
                             ${[...Array(8)].map((_, i) => html`
                                <div 
                                    key=${i}
                                    className="absolute text-[10px] text-purple-400/40 font-mono"
                                    style=${{
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${i * 45}deg) translateY(-240px) rotate(-${i * 45}deg)`,
                                    }}
                                >
                                    ${['᚛', 'ᚆ', 'ᚃ', 'ᚄ', 'ᚌ', 'ᚈ', 'ᚏ', 'ᚋ'][i]}
                                </div>
                             `)}
                        </div>

                        <!-- Ojo Central del Vacío (Sectario) -->
                <div className=${`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all duration-700 ${isHolding ? 'scale-125 opacity-100 rotate-45' : 'scale-100 opacity-40 rotate-0'}`}>
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 animate-ping"></div>
                    <div className="absolute w-1.5 h-10 bg-purple-400/60 blur-[1px] rotate-45 animate-pulse"></div>
                    <div className="absolute w-1.5 h-10 bg-purple-400/60 blur-[1px] -rotate-45 animate-pulse"></div>
                    <div className="absolute inset-0 border border-purple-500/20 rounded-full animate-spin-slow"></div>
                </div>
            </div>
                `}
                
                <div 
                    className="monolith relative w-32 h-64 cursor-pointer transition-transform z-10"
                    style=${monolithStyle}
                    onMouseDown=${() => !isComplete && setIsHolding(true)}
                    onMouseUp=${() => setIsHolding(false)}
                    onMouseLeave=${() => setIsHolding(false)}
                    onTouchStart=${() => !isComplete && setIsHolding(true)}
                    onTouchEnd=${() => setIsHolding(false)}
                >
                <!-- Superficie del monolito -->
                <div className=${`absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border ${isSectarian ? 'border-purple-500/40 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.3)]' : 'border-cyan-900/30'}`}>
                    <!-- Símbolos / Runas -->
                    <div 
                        className="absolute inset-0 opacity-60"
                        style=${{
                            backgroundImage: isSectarian 
                                ? `
                                    radial-gradient(circle, rgba(147, 51, 234, ${0.3 + glitchIntensity * 0.5}) 1px, transparent 1px),
                                    linear-gradient(rgba(147, 51, 234, ${0.15 + glitchIntensity * 0.3}) 1px, transparent 1px),
                                    url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L90 50 L50 90 L10 50 Z' fill='none' stroke='rgba(168,85,247,0.5)' stroke-width='0.6'/%3E%3Cpath d='M30 30 L70 70 M70 30 L30 70' fill='none' stroke='rgba(168,85,247,0.3)' stroke-width='0.3'/%3E%3C/svg%3E")
                                `
                                : `
                                    linear-gradient(90deg, transparent 49%, rgba(6, 182, 212, ${0.1 + glitchIntensity * 0.3}) 50%, transparent 51%),
                                    linear-gradient(0deg, transparent 49%, rgba(6, 182, 212, ${0.1 + glitchIntensity * 0.2}) 50%, transparent 51%)
                                `,
                            backgroundSize: isSectarian ? '12px 12px, 24px 24px, 48px 48px' : '20px 20px',
                            animation: isHolding ? (isSectarian ? 'ritual-glow 0.8s ease-in-out infinite' : 'symbol-pulse 0.5s ease-in-out infinite') : 'none'
                        }}
                    />
                    
                    <!-- Líneas de energía / Susurros -->
                    ${[...Array(isSectarian ? 8 : 5)].map((_, i) => html`
                        <div 
                            key=${i}
                            className=${`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-${isSectarian ? 'purple-400/60' : 'cyan-500/40'} to-transparent`}
                            style=${{
                                top: `${10 + i * (isSectarian ? 12 : 15)}%`,
                                opacity: 0.3 + (glitchIntensity * 0.6),
                                animation: isHolding ? (isSectarian ? `whisper-flow ${2 + i * 0.4}s ease-in-out infinite` : `line-scan ${1 + i * 0.2}s linear infinite`) : 'none'
                            }}
                        />
                    `)}

                    <!-- Aura interna (Solo Sectario) -->
                    ${isSectarian && html`
                        <div className=${`absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-purple-900/30 transition-opacity duration-1000 ${isHolding ? 'opacity-100' : 'opacity-40'}`} />
                        <!-- Glifos centrales -->
                        <div className=${`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${isHolding ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
                            <span className="text-purple-400/40 text-4xl font-mono">🕈</span>
                        </div>
                    `}
                </div>

                <!-- Efecto de glitch / distorsión en los bordes -->
                ${isHolding && glitchIntensity > 0.3 && html`
                    <div className="absolute inset-0 pointer-events-none">
                        <div 
                            className=${`absolute top-0 left-0 w-full h-1 ${isSectarian ? 'bg-purple-500' : 'bg-cyan-500'}`}
                            style=${{
                                transform: `translateX(${(Math.random() - 0.5) * 10}px)`,
                                opacity: Math.random() * 0.8
                            }}
                        />
                        <div 
                            className=${`absolute bottom-0 left-0 w-full h-1 ${isSectarian ? 'bg-indigo-500' : 'bg-purple-500'}`}
                            style=${{
                                transform: `translateX(${(Math.random() - 0.5) * 10}px)`,
                                opacity: Math.random() * 0.8
                            }}
                        />
                    </div>
                `}
                </div>
            </div>

            <!-- Barra de Progreso -->
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80">
                <div className=${`relative h-2 bg-zinc-900 border overflow-hidden ${isSectarian ? 'border-purple-900/50' : 'border-zinc-800'}`}>
                    <div 
                        className=${`absolute inset-y-0 left-0 bg-gradient-to-r ${isSectarian ? 'from-purple-800 to-indigo-500' : 'from-cyan-600 to-cyan-400'}`}
                        style=${progressBarStyle}
                    />
                    <!-- Scanline animado sobre la barra -->
                    <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style=${{ animation: 'scanline-h 2s linear infinite' }}
                    />
                </div>
                
                <!-- Indicador de porcentaje -->
                <div className="flex justify-between mt-2 text-xs font-mono">
                    <span className="text-zinc-600">0%</span>
                    <span className=${`${progress >= 100 ? (isSectarian ? 'text-purple-400' : 'text-cyan-400') : 'text-zinc-400'} transition-colors`}>
                        ${Math.floor(progress)}%
                    </span>
                    <span className="text-zinc-600">100%</span>
                </div>
            </div>

            <!-- Indicador de estado -->
            <div className="absolute bottom-8 text-center">
                <div className=${`
                    px-6 py-2 border text-xs tracking-[0.3em] uppercase transition-colors
                    ${isComplete
                        ? (isSectarian ? 'border-purple-500 text-purple-400 bg-purple-950/30' : 'border-cyan-500 text-cyan-400 bg-cyan-950/30')
                        : isHolding
                            ? (isSectarian ? 'border-indigo-500 text-indigo-400 bg-indigo-950/30 animate-pulse' : 'border-amber-500 text-amber-400 bg-amber-950/30 animate-pulse')
                            : 'border-zinc-700 text-zinc-500'}
                `}>
                    ${isComplete
                        ? labels.statusComplete
                        : isHolding
                            ? labels.statusSyncing
                            : labels.statusWaiting}
                </div>
            </div>

            <!-- Efectos de completado -->
            ${isComplete && html`
                <div className="absolute inset-0 pointer-events-none">
                    <div className=${`absolute inset-0 animate-pulse ${isSectarian ? 'bg-purple-500/10' : 'bg-cyan-500/10'}`} />
                    <div 
                        className="absolute inset-0"
                        style=${{
                            background: isSectarian 
                                ? 'radial-gradient(circle at center, transparent 0%, rgba(147, 51, 234, 0.1) 50%, transparent 100%)'
                                : 'radial-gradient(circle at center, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
                            animation: 'pulse-expand 2s ease-out infinite'
                        }}
                    />
                </div>
            `}

            <!-- Estilos CSS inline para animaciones -->
            <style>
                @keyframes noise-shift {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-2px, 1px); }
                    50% { transform: translate(1px, -2px); }
                    75% { transform: translate(-1px, 2px); }
                }
                
                @keyframes symbol-pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                @keyframes ritual-glow {
                    0%, 100% { opacity: 0.2; filter: blur(1px); }
                    50% { opacity: 0.5; filter: blur(3px); }
                }
                
                @keyframes line-scan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(500%); opacity: 0; }
                }

                @keyframes whisper-flow {
                    0% { transform: scaleX(0.8) translateY(0); opacity: 0; }
                    50% { transform: scaleX(1.2) translateY(-2px); opacity: 0.4; }
                    100% { transform: scaleX(0.8) translateY(0); opacity: 0; }
                }
                
                @keyframes pulse-expand {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                @keyframes slow-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        </div>
    `;
});

SpecialMechanic.displayName = 'SpecialMechanic';
