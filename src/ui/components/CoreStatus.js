/**
 * CORESTATUS.JS
 * Monitor de vitales para el MOD-03 (Core System).
 * Layout de triple barra: Energía, Estabilidad y Ciclo Orbital.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';

const { useState, useEffect, useRef } = React;

const StatusBar = ({ label, value, colorClass, suffix = "%", extraLabel = "", flash = "" }) => html`
    <div className="flex-1">
        <div className="flex justify-between items-center text-[12px] font-bold tracking-widest mb-0.5">
            <span className="text-zinc-400 uppercase">${label}</span>
            <div className="flex gap-2">
                ${extraLabel && html`<span className=${`text-${colorClass}-500`}>${extraLabel}</span>`}
                <span className=${`text-${colorClass}-500 text-[18px]`}>${Math.floor(value)}${suffix}</span>
            </div>
        </div>
        <div className=${`h-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden ${flash === 'red' ? 'animate-flash-red' : flash === 'green' ? 'animate-flash-green' : ''}`}>
            <div 
                className=${`h-full bg-${colorClass}-500 transition-all duration-1000`}
                style=${{ width: `${value}%` }}
            ></div>
        </div>
    </div>
`;

export const CoreStatus = () => {
    const globalState = useGameState(); 
    const { energy, stability, phase, worldTime, mode, eclipseTimer } = globalState;
    const [flash, setFlash] = useState(null); // 'red' | 'green' | null
    const prevValues = useRef({ energy, stability });

    // Durante el eclipse, mostramos el progreso del temporizador en lugar del worldTime estancado
    const displayWorldTime = Math.floor(mode === 'ECLIPSE' ? (1 - (eclipseTimer / 60)) * 100 : worldTime);

    useEffect(() => {
        if (stability < prevValues.current.stability) {
            triggerFlash('red');
        } else if (energy > prevValues.current.energy) {
            triggerFlash('green');
        }
        prevValues.current = { energy, stability };
    }, [energy, stability]);

    const triggerFlash = (type) => {
        setFlash(type);
        setTimeout(() => setFlash(null), 1000);
    };

    return html`
        <div className="flex flex-col h-full p-1 gap-2">
            <!-- Triple Barra Layout + Control Panel -->
            <div className="flex gap-4 items-start">
                <div className="grid grid-cols-3 gap-4 flex-1">
                    <!-- BARRA 1: ENERGÍA -->
                    <${StatusBar} 
                        label="Energía" 
                        value=${energy} 
                        colorClass="amber" 
                        flash=${flash}
                    />

                    <!-- BARRA 2: ESTABILIDAD -->
                    <${StatusBar} 
                        label="Estabilidad" 
                        value=${stability} 
                        colorClass="red" 
                        flash=${flash}
                    />

                    <!-- BARRA 3: CICLO ORBITAL -->
                    <${StatusBar} 
                        label="Ciclo Orbital" 
                        value=${displayWorldTime} 
                        colorClass="cyan" 
                        suffix="/100"
                        extraLabel=${phase}
                    />
                </div>

                <!-- PANEL DE CONTROL (MOD-03) -->
                <div className="flex gap-1 pt-4">
                    <button 
                        onClick=${() => state.isPaused = !state.isPaused}
                        className="px-2 py-1 border border-cyan-900/50 bg-cyan-950/10 text-cyan-500 hover:bg-cyan-500/10 text-[12px] font-mono tracking-widest uppercase transition-all"
                    >
                        [${globalState.isPaused ? 'REANUDAR' : 'PAUSA'}]
                    </button>
                    <button 
                        onClick=${() => state.gameStatus = 'START_MENU'}
                        className="px-2 py-1 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 text-[12px] font-mono tracking-widest uppercase transition-all"
                    >
                        [INICIO]
                    </button>
                    <button 
                        onClick=${() => bus.emit('OPEN_MODAL', { title: 'CONFIGURACIÓN', content: 'ACCESO A NÚCLEO RESTRINGIDO.' })}
                        className="px-2 py-1 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 text-[12px] font-mono tracking-widest uppercase transition-all"
                    >
                        [CONFIG]
                    </button>
                </div>
            </div>

            <!-- Footer con info técnica -->
            <div className="mt-auto flex justify-between items-center border-t border-zinc-800/30 pt-1">
                <span className="text-[12px] text-zinc-400 font-mono tracking-widest uppercase">
                    Core_Latch: Verified
                </span>
                <span className="text-[12px] text-zinc-500 font-mono">
                    System_Time: ${new Date().toLocaleTimeString()}
                </span>
            </div>

            <style>
                @keyframes flash-red {
                    0%, 100% { border-color: rgb(39 39 42 / 0.5); background-color: rgb(24 24 27); }
                    50% { border-color: #ef4444; background-color: #7f1d1d; }
                }
                @keyframes flash-green {
                    0%, 100% { border-color: rgb(39 39 42 / 0.5); background-color: rgb(24 24 27); }
                    50% { border-color: #22c55e; background-color: #064e3b; }
                }
                .animate-flash-red {
                    animation: flash-red 0.5s ease-in-out 2;
                }
                .animate-flash-green {
                    animation: flash-green 0.5s ease-in-out 2;
                }
            </style>
        </div>
    `;
};
