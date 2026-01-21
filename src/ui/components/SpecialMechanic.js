/**
 * SPECIALMECHANIC.JS
 * Interacción con el Monolito para pasos 2 y 11.
 * Regla 2.C: React + htm, estilo glitchy sci-fi oscuro.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';

const { useState, useEffect, useRef, useCallback, memo } = React;

/**
 * Componente del Monolito - Sincronización neural
 * El jugador debe mantener presionada una tecla para sincronizar.
 */
export const SpecialMechanic = memo(({ onComplete, syncKey = ' ' }) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [glitchIntensity, setGlitchIntensity] = useState(0);

    const animationRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Velocidades de subida/bajada del progreso
    const PROGRESS_SPEED_UP = 0.4;   // Sube lento mientras mantienes
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
            bus.emit('TRIGGER_FLASH', { color: '#06b6d4', duration: 300 });

            if (onComplete) {
                setTimeout(onComplete, 500);
            }
        }
    }, [progress, isHolding, isComplete, onComplete]);

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
            hue-rotate(${glitchIntensity * 20}deg)
        `,
        boxShadow: `
            0 0 ${30 + glitchIntensity * 50}px rgba(6, 182, 212, ${0.3 + glitchIntensity * 0.4}),
            0 0 ${60 + glitchIntensity * 80}px rgba(147, 51, 234, ${glitchIntensity * 0.3}),
            inset 0 0 30px rgba(0, 0, 0, 0.9)
        `
    };

    // Estilo de la barra de progreso
    const progressBarStyle = {
        width: `${progress}%`,
        transition: isHolding ? 'none' : 'width 0.1s ease-out',
        boxShadow: `0 0 ${10 + progress * 0.3}px rgba(6, 182, 212, 0.8)`
    };

    return html`
        <div className="special-mechanic-container fixed inset-0 z-[600] bg-black/95 flex flex-col items-center justify-center">
            
            <!-- Fondo con ruido estático -->
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style=${{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            animation: isHolding ? 'noise-shift 0.1s steps(2) infinite' : 'none'
        }}
            />

            <!-- Instrucciones -->
            <div className="absolute top-12 text-center space-y-2 z-10">
                <h2 className="text-cyan-400 text-xl tracking-[0.5em] uppercase font-bold animate-pulse">
                    SINCRONIZACIÓN NEURAL
                </h2>
                <p className="text-zinc-500 text-sm tracking-widest">
                    ${isComplete
            ? '[ ENLACE ESTABLECIDO ]'
            : '[ MANTÉN ESPACIO PARA SINCRONIZAR ]'}
                </p>
            </div>

            <!-- El Monolito -->
            <div 
                className="monolith relative w-32 h-64 cursor-pointer transition-transform"
                style=${monolithStyle}
                onMouseDown=${() => !isComplete && setIsHolding(true)}
                onMouseUp=${() => setIsHolding(false)}
                onMouseLeave=${() => setIsHolding(false)}
                onTouchStart=${() => !isComplete && setIsHolding(true)}
                onTouchEnd=${() => setIsHolding(false)}
            >
                <!-- Superficie del monolito -->
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-cyan-900/30">
                    <!-- Símbolos alienígenas -->
                    <div 
                        className="absolute inset-0 opacity-40"
                        style=${{
            backgroundImage: `
                                linear-gradient(90deg, transparent 49%, rgba(6, 182, 212, ${0.1 + glitchIntensity * 0.3}) 50%, transparent 51%),
                                linear-gradient(0deg, transparent 49%, rgba(6, 182, 212, ${0.1 + glitchIntensity * 0.2}) 50%, transparent 51%)
                            `,
            backgroundSize: '20px 20px',
            animation: isHolding ? 'symbol-pulse 0.5s ease-in-out infinite' : 'none'
        }}
                    />
                    
                    <!-- Líneas de energía -->
                    ${[...Array(5)].map((_, i) => html`
                        <div 
                            key=${i}
                            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                            style=${{
                top: `${20 + i * 15}%`,
                opacity: 0.3 + (glitchIntensity * 0.5),
                animation: isHolding ? `line-scan ${1 + i * 0.2}s linear infinite` : 'none'
            }}
                        />
                    `)}
                </div>

                <!-- Efecto de glitch en los bordes -->
                ${isHolding && glitchIntensity > 0.3 && html`
                    <div className="absolute inset-0 pointer-events-none">
                        <div 
                            className="absolute top-0 left-0 w-full h-1 bg-cyan-500"
                            style=${{
                transform: `translateX(${(Math.random() - 0.5) * 10}px)`,
                opacity: Math.random() * 0.8
            }}
                        />
                        <div 
                            className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"
                            style=${{
                transform: `translateX(${(Math.random() - 0.5) * 10}px)`,
                opacity: Math.random() * 0.8
            }}
                        />
                    </div>
                `}
            </div>

            <!-- Barra de Progreso -->
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80">
                <div className="relative h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                        style=${progressBarStyle}
                    />
                    <!-- Scanline animado sobre la barra -->
                    <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style=${{ animation: 'scanline-h 2s linear infinite' }}
                    />
                </div>
                
                <!-- Indicador de porcentaje -->
                <div className="flex justify-between mt-2 text-xs font-mono">
                    <span className="text-zinc-600">0%</span>
                    <span className=${`${progress >= 100 ? 'text-cyan-400' : 'text-zinc-400'} transition-colors`}>
                        ${Math.floor(progress)}%
                    </span>
                    <span className="text-zinc-600">100%</span>
                </div>
            </div>

            <!-- Indicador de estado -->
            <div className="absolute bottom-8 text-center">
                <div className=${`
                    px-6 py-2 border text-xs tracking-[0.3em] uppercase
                    ${isComplete
            ? 'border-cyan-500 text-cyan-400 bg-cyan-950/30'
            : isHolding
                ? 'border-amber-500 text-amber-400 bg-amber-950/30 animate-pulse'
                : 'border-zinc-700 text-zinc-500'}
                `}>
                    ${isComplete
            ? '◆ SINCRONIZADO ◆'
            : isHolding
                ? '◆ SINCRONIZANDO... ◆'
                : '◇ EN ESPERA ◇'}
                </div>
            </div>

            <!-- Efectos de completado -->
            ${isComplete && html`
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                    <div 
                        className="absolute inset-0"
                        style=${{
                background: 'radial-gradient(circle at center, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
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
                
                @keyframes line-scan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(500%); opacity: 0; }
                }
                
                @keyframes pulse-expand {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            </style>
        </div>
    `;
});

SpecialMechanic.displayName = 'SpecialMechanic';
