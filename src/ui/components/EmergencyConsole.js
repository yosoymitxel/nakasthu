/**
 * EMERGENCY_CONSOLE.JS (MOD-06, MOD-02, MOD-05)
 * Consola de emergencia tri-modular para gestión de crisis.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state as engineState } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { MechanicManager } from '../../services/MechanicManager.js';
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

const { useState, useEffect, useRef, useMemo } = React;

/**
 * MÓDULO DE RESONANCIA (MOD-06)
 * Basado en el osciloscopio original.
 */
const ResonanceModule = ({ isActive, storyPath }) => {
    const currentStep = useGameState('currentStep');
    const pathConfig = PATH_CONFIGS[storyPath || 0];
    const { primary, emergency } = pathConfig.theme;
    const config = pathConfig.emergencies.resonance;
    const isSectarian = storyPath === 1;
    
    // REGLA: En el nivel 6 ("La Urgencia"), el módulo debe ser interactuable siempre
    const isLevel6 = currentStep === 6;
    const forceActive = isLevel6 || isActive;
    
    const canvasRef = useRef(null);
    const targetFreq = useGameState('targetFrequency');
    const targetPhase = useGameState('targetPhase');
    const localFreq = useGameState('localFrequency');
    const localPhase = useGameState('localPhase');
    const resonanceSync = useGameState('resonanceSync');
    const stability = useGameState('stability');
    const isPaused = useGameState('isPaused');

    useEffect(() => {
        if (!forceActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const midY = height / 2;

            ctx.clearRect(0, 0, width, height);
            if (!isPaused) time += 0.05;

            if (isSectarian) {
                // Dibujar aura mística para el sectario
                ctx.globalCompositeOperation = 'screen';
                
                // Fondo pulsante
                const pulse = Math.sin(time * 2) * 0.05 + 0.1;
                ctx.fillStyle = `rgba(147, 51, 234, ${pulse})`;
                ctx.fillRect(0, 0, width, height);

                // Representación de almas (partículas o líneas fluidas)
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
                ctx.beginPath();
                for (let x = 0; x < width; x += 5) {
                    const offset = Math.sin(x * 0.05 + time) * 5;
                    ctx.moveTo(x, midY + offset - 10);
                    ctx.lineTo(x, midY + offset + 10);
                }
                ctx.stroke();

                // Línea de unión (Velo)
                ctx.beginPath();
                ctx.strokeStyle = resonanceSync > 85 ? '#10b981' : '#a855f7';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.strokeStyle;
                for (let x = 0; x < width; x++) {
                    const targetY = midY + Math.sin(x * (targetFreq * 0.02) + targetPhase + time) * 15;
                    const localY = midY + Math.sin(x * (localFreq * 0.02) + localPhase + time) * 15;
                    const y = localY + (targetY - localY) * (resonanceSync / 100);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Dibujar rejilla tenue (Operario)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                for (let i = 0; i < width; i += 20) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
                }

                // Onda Objetivo
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                for (let x = 0; x < width; x++) {
                    const y = midY + Math.sin(x * (targetFreq * 0.02) + targetPhase + time) * 15;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Onda Local
                ctx.beginPath();
                ctx.strokeStyle = resonanceSync > 85 ? '#10b981' : '#06b6d4';
                ctx.lineWidth = 2;
                for (let x = 0; x < width; x++) {
                    const y = midY + Math.sin(x * (localFreq * 0.02) + localPhase + time) * 15;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [forceActive, targetFreq, targetPhase, localFreq, localPhase, resonanceSync, isPaused, primary, isSectarian]);

    const adjust = (type, val) => {
        engineState[type] = val;
        MechanicManager.updateResonance();
    };

    const synchronize = () => {
        if (resonanceSync >= 90) {
            bus.emit('TERMINAL_PRINT', { text: config.success, type: 'SUCCESS' });
            engineState.stability = Math.min(100, engineState.stability + 10);
            bus.emit('EMERGENCY_END', { type: 'resonance' });
        }
    };

    const primaryColorClass = primary === 'purple' ? 'border-purple-500/20 bg-purple-950/5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]' : 'border-cyan-500/20 bg-cyan-950/5 shadow-[inset_0_0_15px_rgba(6,182,212,0.05)]';
    const accentColorClass = primary === 'purple' ? 'bg-purple-500/5' : 'bg-cyan-500/5';
    const textColorClass = primary === 'purple' ? 'text-purple-700' : 'text-cyan-700';
    const barColorClass = primary === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]';

    return html`
        <div className=${`flex flex-col h-full p-3 justify-between border relative overflow-hidden group ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            <canvas 
                ref=${canvasRef} 
                width="400" 
                height="120" 
                className="w-full h-32 bg-black/40 border border-zinc-900/50 rounded-sm mb-2"
            />
            
            <div className="flex flex-col gap-3 relative z-10 flex-1">
                <div className="flex justify-between items-center px-1">
                    <span className=${`text-[11px] uppercase font-mono font-black tracking-widest ${textColorClass}`}>
                        ${config.name}
                    </span>
                    <span className=${`text-[10px] font-mono font-bold ${resonanceSync > 85 ? 'text-emerald-500' : (primary === 'purple' ? 'text-purple-400' : 'text-cyan-400')}`}>
                        SYNC: ${Math.floor(resonanceSync)}%
                    </span>
                </div>

                <!-- Sliders más grandes y táctiles -->
                <div className="space-y-4 px-1">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold px-1">
                            <span>${isSectarian ? 'Sintonía_del_Alma' : 'Frecuencia'}</span>
                            <span>${localFreq.toFixed(1)}Hz</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="60" 
                            step="0.1"
                            value=${localFreq}
                            onChange=${(e) => adjust('localFrequency', parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold px-1">
                            <span>${isSectarian ? 'Oscilación_del_Velo' : 'Fase'}</span>
                            <span>${(localPhase / Math.PI).toFixed(2)}π</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max=${Math.PI * 2} 
                            step="0.1"
                            value=${localPhase}
                            onChange=${(e) => adjust('localPhase', parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                </div>

                <button 
                    onClick=${synchronize}
                    disabled=${resonanceSync < 90}
                    className=${`w-full py-3 border-2 text-[12px] font-black tracking-[0.3em] transition-all uppercase mt-auto
                        ${resonanceSync >= 90 
                            ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:text-white' 
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-700 cursor-not-allowed'}`}
                >
                    ${config.action}
                </button>
            </div>
        </div>
    `;
};

/**
 * MÓDULO DE OXÍGENO (MOD-02)
 * Minijuego de Válvulas.
 */
const OxygenModule = ({ isActive, storyPath }) => {
    const currentStep = useGameState('currentStep');
    const pathConfig = PATH_CONFIGS[storyPath || 0];
    const { primary, emergency } = pathConfig.theme;
    const config = pathConfig.emergencies.oxygen;
    const isSectarian = storyPath === 1;

    // REGLA: En el nivel 6 ("La Urgencia"), el módulo debe ser interactuable siempre
    const isLevel6 = currentStep === 6;
    const forceActive = isLevel6 || isActive;

    const [sequence, setSequence] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const startMinigame = () => {
        const newSeq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4) + 1);
        setSequence(newSeq);
        setUserInput([]);
        setIsGenerating(true);
        
        const sequenceLabels = newSeq.map(n => config.labels[n-1]);
        bus.emit('TERMINAL_PRINT', { 
            text: `${config.alert} ORDEN: ${sequenceLabels.join(' ➔ ')}`, 
            type: 'SYSTEM' 
        });

        setTimeout(() => setIsGenerating(false), 2000);
    };

    const handlePress = (num) => {
        if (!forceActive || sequence.length === 0) return;
        
        const nextInput = [...userInput, num];
        setUserInput(nextInput);

        if (nextInput[nextInput.length - 1] !== sequence[nextInput.length - 1]) {
            const errorText = `[ERROR] ${config.name} FALLIDO. REINTENTAR SECUENCIA.`;
            bus.emit('TERMINAL_PRINT', { text: errorText, type: 'ERROR' });
            setUserInput([]);
            return;
        }

        if (nextInput.length === sequence.length) {
            bus.emit('TERMINAL_PRINT', { text: config.success, type: 'SUCCESS' });
            setSequence([]);
            setUserInput([]);
            
            // Activar estabilización en el estado global
            engineState.o2Stabilized = true;
            bus.emit('O2_STABILIZED', { duration: 10000 });
            
            setTimeout(() => {
                engineState.o2Stabilized = false;
                bus.emit('EMERGENCY_END', { type: 'oxygen' });
            }, 10000);
        }
    };

    const symbols = config.labels;
    const statusText = engineState.o2Stabilized ? config.status[1] : config.status[0];

    const primaryColorClass = primary === 'purple' ? 'border-purple-500/20 bg-purple-950/5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]' : 'border-red-500/20 bg-red-950/5 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]';
    const textColorClass = primary === 'purple' ? 'text-purple-600' : 'text-red-600';
    const statusColorClass = primary === 'purple' ? 'text-purple-900' : 'text-red-900';
    const barColorClass = primary === 'purple' ? 'bg-purple-500/50' : 'bg-red-500/50';
    const buttonActiveColorClass = primary === 'purple' ? 'bg-purple-500/40 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'bg-red-500/40 border-red-400 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
    const buttonIdleColorClass = primary === 'purple' ? 'bg-zinc-900/80 border-purple-900/40 text-purple-900' : 'bg-zinc-900/80 border-red-900/40 text-red-900';
    const mainButtonColorClass = primary === 'purple' ? 'border-purple-700 bg-purple-900/30 text-purple-500 hover:bg-purple-500/30 hover:text-purple-400' : 'border-red-700 bg-red-900/30 text-red-500 hover:bg-red-500/30 hover:text-red-400';

    return html`
        <div className=${`flex flex-col h-full p-2 justify-between border relative overflow-hidden group ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            <!-- Warning stripe detail -->
            ${isSectarian ? html`
                <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#2e1065,#2e1065_10px,#4c1d95_10px,#4c1d95_20px)] opacity-40"></div>
            ` : html`
                <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#450a0a,#450a0a_10px,#7f1d1d_10px,#7f1d1d_20px)] opacity-20"></div>
            `}
            
            <div className="flex flex-col gap-1 mb-2 relative z-10">
                <div className="flex justify-between items-center">
                    <span className=${`text-[10px] uppercase font-mono font-bold tracking-tighter ${textColorClass}`}>
                        ${config.name}
                    </span>
                    <span className=${`text-[8px] font-mono ${statusColorClass}`}>
                        STATUS: ${statusText}
                    </span>
                </div>
                <div className=${`h-0.5 w-full relative overflow-hidden ${isSectarian ? 'bg-purple-900/30' : 'bg-red-900/30'}`}>
                    <div className=${`absolute inset-0 animate-pulse ${barColorClass}`}></div>
                </div>
            </div>
            
            <div className=${`relative ${isSectarian ? 'h-32 w-32 mx-auto mt-2' : 'grid grid-cols-2 gap-2'} relative z-10`}>
                ${[1, 2, 3, 4].map(num => {
                    const isPressed = userInput.includes(num);
                    const label = symbols[num - 1];
                    
                    // Posicionamiento en rombo para el sectario
                    const sectarianPos = [
                        'top-0 left-1/2 -translate-x-1/2',    // 1: Norte
                        'top-1/2 right-0 -translate-y-1/2',   // 2: Este
                        'bottom-0 left-1/2 -translate-x-1/2', // 3: Sur
                        'top-1/2 left-0 -translate-y-1/2'     // 4: Oeste
                    ][num-1];

                    return html`
                        <button 
                            key=${num}
                            onClick=${() => handlePress(num)}
                            className=${`border font-mono text-[9px] transition-all flex items-center justify-center relative overflow-hidden
                                ${isPressed ? buttonActiveColorClass : buttonIdleColorClass}
                                ${isSectarian ? 
                                    `absolute w-10 h-10 rotate-45 ${sectarianPos} border-purple-500/30 hover:bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]` : 
                                    'h-10 hover:border-red-600 hover:bg-red-900/20 active:scale-95'}
                            `}
                        >
                            <span className=${`z-10 ${isSectarian ? '-rotate-45 tracking-[0.1em] font-black text-[7px]' : ''} ${isPressed ? 'animate-pulse' : ''}`}>
                                ${label}
                            </span>
                            ${isPressed && html`<div className=${`absolute inset-0 animate-flicker ${isSectarian ? 'bg-purple-500/20' : 'bg-red-500/10'}`}></div>`}
                        </button>
                    `;
                })}
                ${isSectarian && html`
                    <!-- Botón de Inicio Integrado en el Centro para el Sectario -->
                    <button 
                        onClick=${startMinigame}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 hover:bg-purple-500/20 transition-all z-20 flex items-center justify-center group/btn"
                    >
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse group-hover/btn:scale-125 transition-transform"></div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black text-purple-400/60 whitespace-nowrap tracking-[0.2em] group-hover/btn:text-purple-400">
                            ${config.action}
                        </span>
                    </button>
                `}
            </div>

            ${!isSectarian && html`
                <button 
                    onClick=${startMinigame}
                    className=${`w-full mt-4 py-1.5 border text-[9px] font-bold tracking-widest transition-all uppercase shadow-[0_0_10px_rgba(153,27,27,0.2)] ${mainButtonColorClass}`}
                >
                    ${config.action}
                </button>
            `}

            <div className=${`text-[9px] font-mono flex justify-between mt-auto pt-2 ${primary === 'purple' ? 'text-purple-900/60' : 'text-red-900/60'}`}>
                <span>${isSectarian ? 'ALIENTO_VITAL' : 'OXYGEN_LEVEL'}</span>
                <span className="opacity-50">${config.module}</span>
            </div>
        </div>
    `;
};

/**
 * MÓDULO DE ENERGÍA (MOD-05)
 * Minijuego de Power Grid 12x6.
 */
const PowerGridModule = ({ isActive, storyPath }) => {
    const currentStep = useGameState('currentStep');
    const pathConfig = PATH_CONFIGS[storyPath || 0];
    const { primary } = pathConfig.theme;
    const config = pathConfig.emergencies.energy;
    const isSectarian = storyPath === 1;

    // REGLA: En el nivel 6 ("La Urgencia"), el módulo debe ser interactuable siempre
    const isLevel6 = currentStep === 6;
    const forceActive = isLevel6 || isActive;

    const [path, setPath] = useState([]);
    const [burned, setBurned] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);

    const initGrid = () => {
        const newBurned = new Set();
        const maxBurned = isSectarian ? 6 : 10; 
        
        while (newBurned.size < maxBurned) {
            const idx = Math.floor(Math.random() * 72);
            if (idx % 12 !== 0 && idx % 12 !== 11) {
                newBurned.add(idx);
            }
        }
        setBurned(newBurned);

        // Empezar con un nodo aleatorio en la primera columna
        const startIdx = Math.floor(Math.random() * 6) * 12;
        setPath([startIdx]);
    };

    useEffect(() => { initGrid(); }, []);

    const handleInteraction = (idx) => {
        if (!forceActive || burned.has(idx)) return;

        const lastIdx = path[path.length - 1];
        if (idx === lastIdx) return;

        // Verificar si el nodo es adyacente al último
        const r1 = Math.floor(lastIdx / 12), c1 = lastIdx % 12;
        const r2 = Math.floor(idx / 12), c2 = idx % 12;
        const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);

        if (isAdjacent) {
            const existingIdx = path.indexOf(idx);
            if (existingIdx !== -1) {
                setPath(path.slice(0, existingIdx + 1));
            } else {
                const newPath = [...path, idx];
                setPath(newPath);

                if (idx % 12 === 11) {
                    bus.emit('TERMINAL_PRINT', { text: config.success, type: 'SUCCESS' });
                    // No usamos global state.energy directamente aquí, emitimos el evento o usamos bus
                    bus.emit('EMERGENCY_END', { type: 'energy' });
                    setTimeout(() => initGrid(), 1000);
                    setIsDragging(false);
                }
            }
        } else if (idx % 12 === 0) {
            setPath([idx]);
        }
    };

    const handleMouseDown = (idx) => {
        if (path[path.length - 1] === idx || idx % 12 === 0) {
            setIsDragging(true);
            if (idx % 12 === 0) setPath([idx]);
        }
    };

    const handleMouseEnter = (idx) => {
        if (isDragging) handleInteraction(idx);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const getArrowDirection = (from, to) => {
        const r1 = Math.floor(from / 12), c1 = from % 12;
        const r2 = Math.floor(to / 12), c2 = to % 12;
        if (r2 < r1) return '↑';
        if (r2 > r1) return '↓';
        if (c2 < c1) return '←';
        if (c2 > c1) return '→';
        return '';
    };

    const primaryColorClass = primary === 'purple' ? 'border-purple-500/20 bg-purple-950/5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]' : 'border-emerald-500/20 bg-emerald-950/5 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]';
    const textColorClass = primary === 'purple' ? 'text-purple-600' : 'text-emerald-600';
    const statusColorClass = primary === 'purple' ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]';
    const cellActiveColorClass = primary === 'purple' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.8)]';
    const footerTextColorClass = primary === 'purple' ? 'text-purple-900/60' : 'text-emerald-900/60';

    return html`
        <div className=${`flex flex-col h-full p-2 border relative overflow-hidden group select-none ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            <div className="flex justify-between items-center px-1 mb-1 relative z-10">
                <span className=${`text-[10px] uppercase font-mono font-bold tracking-tighter ${textColorClass}`}>
                    ${config.name}
                </span>
                <div className="flex gap-1 items-center">
                    <span className="text-[8px] text-zinc-600 font-mono mr-1">LINK_ESTABLISHED</span>
                    <div className=${`w-1.5 h-1.5 rounded-full ${path.length > 1 ? 'animate-pulse ' + statusColorClass : 'bg-zinc-800'}`}></div>
                </div>
            </div>

            <div className="grid grid-cols-12 grid-rows-6 gap-0.5 flex-1 bg-black/80 p-1 border border-zinc-800/50 relative">
                ${Array.from({ length: 72 }).map((_, i) => {
                    const pathIndex = path.indexOf(i);
                    const isActive = pathIndex !== -1;
                    const isLast = pathIndex === path.length - 1 && path.length > 0;
                    const isBurned = burned.has(i);
                    const isStart = i % 12 === 0;
                    const isEnd = i % 12 === 11;

                    let arrow = '';
                    if (isActive && !isLast) {
                        arrow = getArrowDirection(i, path[pathIndex + 1]);
                    }

                    return html`
                        <div 
                            key=${i}
                            onMouseDown=${() => handleMouseDown(i)}
                            onMouseEnter=${() => handleMouseEnter(i)}
                            className=${`
                                w-full h-full cursor-crosshair transition-all duration-200 border flex items-center justify-center font-bold text-[14px] relative
                                ${isBurned ? 'bg-red-950/20 border-red-900/10 opacity-20 cursor-not-allowed' : 
                                  isActive ? cellActiveColorClass : 
                                  isStart ? 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:bg-zinc-800' :
                                  isEnd ? 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:bg-zinc-800' :
                                  'bg-zinc-950 border-zinc-900 hover:bg-zinc-900'}
                                ${isLast && !isBurned ? 'ring-1 ring-white/50 z-20 scale-105' : ''}
                            `}
                        >
                            ${isActive && html`
                                <span className=${`z-10 ${isLast ? 'animate-bounce' : ''}`}>
                                    ${isLast ? (isEnd ? '✓' : '●') : arrow}
                                </span>
                            `}
                            ${isStart && !isActive && !isBurned && html`<span className="text-[8px] opacity-30">IN</span>`}
                            ${isEnd && !isActive && !isBurned && html`<span className="text-[8px] opacity-30">OUT</span>`}
                        </div>
                    `;
                })}
            </div>
            
            <div className=${`text-[9px] font-mono flex justify-between px-1 mt-auto pt-1 ${footerTextColorClass}`}>
                <span>${isSectarian ? 'CONEXIÓN_SANGUÍNEA' : 'ENERGY_NODE_SYSTEM'}</span>
                <span className="opacity-50">${path.length} / 12 NODES</span>
            </div>
        </div>
    `;
};


/**
 * COMPONENTE PRINCIPAL: EMERGENCY CONSOLE
 */
export const EmergencyConsole = () => {
    const storyPath = useGameState('storyPath');
    const currentStep = useGameState('currentStep');
    const emergencies = useGameState('emergencies') || { resonance: false, oxygen: false, energy: false };

    // REGLA: En el nivel 6 ("La Urgencia"), todos los módulos deben estar activos visualmente
    const isLevel6 = currentStep === 6;

    return html`
        <div className=${`grid grid-cols-3 h-full w-full bg-black/40 divide-x divide-zinc-800/50 relative overflow-hidden ${Object.values(emergencies).some(v => v) ? 'ring-1 ring-red-500/30' : ''}`}>
            <!-- Scanline overlay for industrial feel -->
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

            <!-- Columna 1: Resonancia -->
            <div className=${`h-full transition-all duration-500 ${emergencies.resonance ? 'emergency-glitch active-module' : (isLevel6 ? 'active-module' : 'standby-module')}`}>
                <${ResonanceModule} isActive=${emergencies.resonance} storyPath=${storyPath} />
            </div>

            <!-- Columna 2: Oxígeno -->
            <div className=${`h-full transition-all duration-500 ${emergencies.oxygen ? 'emergency-glitch active-module' : (isLevel6 ? 'active-module' : 'standby-module')}`}>
                <${OxygenModule} isActive=${emergencies.oxygen} storyPath=${storyPath} />
            </div>

            <!-- Columna 3: Energía -->
            <div className=${`h-full transition-all duration-500 ${emergencies.energy ? 'emergency-glitch active-module' : (isLevel6 ? 'active-module' : 'standby-module')}`}>
                <${PowerGridModule} isActive=${emergencies.energy} storyPath=${storyPath} />
            </div>
        </div>
    `;
};
