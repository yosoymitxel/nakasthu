/**
 * CORESTATUS.JS
 * Monitor de vitales para el MOD-03 (Core System).
 * Layout de triple barra: Energía, Estabilidad y Ciclo Orbital.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { CONFIG } from '../../data/gameConfig.js';

const { useState, useEffect, useRef } = React;

const StatusBar = ({ label, value, colorClass, suffix = "%", extraLabel = "", flash = "", isSectarian = false }) => html`
    <div className="flex-1">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest mb-0.5">
            <span className=${`${isSectarian ? 'text-purple-400/80' : 'text-zinc-400'} uppercase`}>${label}</span>
            <div className="flex gap-2 items-baseline">
                ${extraLabel && html`<span className=${`text-[9px] text-${colorClass}-500 opacity-60`}>${extraLabel}</span>`}
                <span className=${`text-${colorClass}-500 text-[14px] font-mono`}>${Math.floor(value)}${suffix}</span>
            </div>
        </div>
        <div className=${`h-1 w-full ${isSectarian ? 'bg-indigo-950/40' : 'bg-zinc-900'} border ${isSectarian ? 'border-indigo-900/50' : 'border-zinc-800'} rounded-sm overflow-hidden ${flash === 'red' ? 'animate-flash-red' : flash === 'green' ? 'animate-flash-green' : ''}`}>
            <div 
                className=${`h-full bg-${colorClass}-500 transition-all duration-1000 ${isSectarian ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''}`}
                style=${{ width: `${value}%` }}
            ></div>
        </div>
    </div>
`;

export const CoreStatus = () => {
    const globalState = useGameState();
    const { energy, stability, phase, worldTime, mode, eclipseTimer, storyPath } = globalState;
    const [flash, setFlash] = useState(null); // 'red' | 'green' | null
    const prevValues = useRef({ energy, stability });
    
    const isSectarian = storyPath === 1;

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
        <div className="flex flex-col h-full p-1 gap-1">
            <!-- Triple Barra Layout + Control Panel -->
            <div className="flex gap-4 items-center h-full">
                <div className="grid grid-cols-3 gap-6 flex-1">
                    <!-- BARRA 1: ENERGÍA / FE -->
                    <${StatusBar} 
                        label=${isSectarian ? 'Fe' : 'Energía'} 
                        value=${energy} 
                        colorClass=${isSectarian ? 'purple' : 'amber'} 
                        flash=${flash}
                        isSectarian=${isSectarian}
                    />

                    <!-- BARRA 2: ESTABILIDAD / PAZ -->
                    <${StatusBar} 
                        label=${isSectarian ? 'Paz' : 'Estabilidad'} 
                        value=${stability} 
                        colorClass=${isSectarian ? 'indigo' : 'red'} 
                        flash=${flash}
                        isSectarian=${isSectarian}
                    />

                    <!-- BARRA 3: CICLO ORBITAL / ASCENSIÓN -->
                    <${StatusBar} 
                        label=${isSectarian ? 'Ascensión' : 'Ciclo Orbital'} 
                        value=${displayWorldTime} 
                        colorClass=${mode === 'ECLIPSE' ? 'red' : (isSectarian ? 'purple' : 'cyan')} 
                        suffix="/100"
                        extraLabel=${phase}
                        isSectarian=${isSectarian}
                    />
                </div>

                <!-- PANEL DE CONTROL (MOD-03) -->
                <div className="flex gap-1 h-8">
                    <button 
                        onClick=${() => state.isPaused = !state.isPaused}
                        className=${`px-2 border text-[10px] font-mono tracking-widest uppercase transition-all 
                            ${isSectarian 
                                ? 'border-purple-900/50 bg-purple-950/10 text-purple-400 hover:bg-purple-500/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]' 
                                : 'border-cyan-900/50 bg-cyan-950/10 text-cyan-500 hover:bg-cyan-500/10'}`}
                    >
                        ${globalState.isPaused ? (isSectarian ? 'REANUDAR' : 'PLAY') : (isSectarian ? 'PAUSAR' : 'PAUSE')}
                    </button>
                    <button 
                        onClick=${() => state.gameStatus = 'START_MENU'}
                        className=${`px-2 border text-[10px] font-mono tracking-widest uppercase transition-all 
                            ${isSectarian 
                                ? 'border-indigo-900/50 bg-indigo-950/10 text-indigo-400 hover:text-indigo-200' 
                                : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'}`}
                    >
                        ${isSectarian ? 'SALIR' : 'EXIT'}
                    </button>
                </div>
            </div>

            <!-- Footer con info técnica -->
            <div className="mt-auto flex justify-between items-center border-t border-zinc-800/30 pt-1">
                <span className="text-[12px] text-zinc-400 font-mono tracking-widest uppercase">
                    ${isSectarian ? 'CONEXIÓN_ALMA: ESTABLE' : 'Core_Latch: Verified'}
                </span>
                <span className="text-[12px] text-zinc-500 font-mono">
                    ${isSectarian ? 'RITO_TIEMPO' : 'System_Time'}: ${new Date().toLocaleTimeString()}
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
