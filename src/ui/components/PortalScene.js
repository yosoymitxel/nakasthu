/**
 * PORTALSCENE.JS (MOD-07)
 * Rediseño total: SVG reactivo al ciclo orbital.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

const { useRef, useEffect } = React;

export const PortalScene = () => {
    const mode = useGameState('mode');
    const orbitalCycle = useGameState('orbitalCycle');
    const isEclipse = mode === 'ECLIPSE';
    
    const prevCycleRef = useRef(orbitalCycle);
    const isJump = Math.abs(prevCycleRef.current - orbitalCycle) > 50;

    useEffect(() => {
        prevCycleRef.current = orbitalCycle;
    }, [orbitalCycle]);

    return html`
        <div className="relative w-full h-full bg-transparent overflow-hidden flex items-center justify-center">
            <!-- SVG dinámico vinculado al ciclo orbital -->
            <svg 
                viewBox="0 0 200 200" 
                className=${`absolute w-full h-full ${isJump ? '' : 'transition-all duration-[1000ms] ease-linear'}`}
                style=${{ 
                    top: `${orbitalCycle}%`,
                    transform: 'translateY(-50%)' 
                }}
            >
                <defs>
                    <!-- Resplandor Solar (Cian) -->
                    <filter id="solarGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#06b6d4" />
                    </filter>
                    
                    <!-- Corona de Eclipse (Rojo) -->
                    <filter id="eclipseCorona" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
                    </filter>
                </defs>

                <!-- El Sol / Portal (Maximizado r=60) -->
                <g transform="translate(100, 100)">
                    ${!isEclipse ? html`
                        <!-- MODO SOLAR -->
                        <circle 
                            r="60" 
                            fill="white" 
                            filter="url(#solarGlow)"
                        />
                    ` : html`
                        <!-- MODO ECLIPSE -->
                        <g>
                            <!-- Aura Roja -->
                            <circle 
                                r="65" 
                                fill="#ef4444" 
                                filter="url(#eclipseCorona)"
                                className="opacity-80"
                            />
                            <!-- Centro Negro -->
                            <circle 
                                r="58" 
                                fill="black" 
                            />
                            <!-- Anillo de Tensión -->
                            <circle 
                                r="60" 
                                fill="none" 
                                stroke="#ef4444" 
                                strokeWidth="0.5" 
                                strokeDasharray="2,4"
                            />
                        </g>
                    `}
                </g>
            </svg>

            <!-- Horizonte Estático (Opcional, para dar profundidad) -->
            <div className="absolute bottom-0 w-full h-px bg-zinc-900 shadow-[0_0_10px_rgba(0,0,0,1)]"></div>
            
            <!-- Scanlines / Ruido -->
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
    `;
};
