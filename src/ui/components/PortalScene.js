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
    const storyPath = useGameState('storyPath') || 0;
    const isSectarian = storyPath === 1;
    const isEclipse = mode === 'ECLIPSE' || isSectarian;
    
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
                    
                    <!-- Corona de Eclipse (Lila) -->
                    <filter id="eclipseCorona" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="0.6 0 0 0 0  0.2 0 0 0 0  0.9 0 0 0 0  0 0 0 1 0" />
                    </filter>

                    <!-- Altar Sagrado (Sectario) -->
                    <filter id="altarGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#7c3aed" floodOpacity="0.5" />
                    </filter>
                </defs>

                <!-- El Sol / Portal (Maximizado r=60) -->
                <g transform="translate(100, 100)">
                    ${isSectarian ? html`
                        <!-- MODO SECTARIO: EL ALTAR DEL VACÍO -->
                        <g className="animate-slow-spin origin-center">
                            <!-- Aura Exterior -->
                            <circle 
                                r="70" 
                                fill="none" 
                                stroke="#7c3aed" 
                                strokeWidth="0.5" 
                                strokeDasharray="1,10"
                                className="opacity-40"
                            />
                            <!-- El Vacío -->
                            <circle 
                                r="55" 
                                fill="black" 
                                filter="url(#altarGlow)"
                            />
                            <!-- Símbolos Sagrados (Heptagrama Ritual) -->
                            <g className="opacity-40" stroke="#7c3aed" strokeWidth="0.8" fill="none">
                                <path d="M0,-50 L11.5,-15 L47.5,-15 L18,8 L28,45 L0,22 L-28,45 L-18,8 L-47.5,-15 L-11.5,-15 Z" />
                                <circle r="50" strokeDasharray="2,2" />
                                <circle r="35" strokeDasharray="5,5" className="animate-pulse" />
                            </g>
                        </g>
                    ` : !isEclipse ? html`
                        <!-- MODO SOLAR -->
                        <circle 
                            r="60" 
                            fill="white" 
                            filter="url(#solarGlow)"
                        />
                    ` : html`
                        <!-- MODO ECLIPSE -->
                        <g>
                            <!-- Aura Lila -->
                            <circle 
                                r="65" 
                                fill="#9333ea" 
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
                                stroke="#9333ea" 
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
