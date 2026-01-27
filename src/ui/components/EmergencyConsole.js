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
        <div className=${`flex flex-col h-full p-3 border relative overflow-hidden group ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            <!-- Título y Estado -->
            <div className=${`absolute top-0 right-0 w-12 h-12 rotate-45 translate-x-6 -translate-y-6 pointer-events-none ${accentColorClass}`}></div>
            
            <canvas ref=${canvasRef} width="200" height="60" className=${`w-full h-16 bg-black/40 border transition-colors ${primary === 'purple' ? 'border-purple-800/50 group-hover:border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'border-cyan-800/50 group-hover:border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'}`} />
            <div className="flex flex-col gap-1">
                <div className=${`flex justify-between text-[10px] uppercase font-mono ${textColorClass}`}>
                    <span>${config.name}</span>
                    <span className=${resonanceSync >= 90 ? 'text-emerald-400 animate-pulse' : (primary === 'purple' ? 'text-purple-400' : 'text-cyan-400')}>${Math.floor(resonanceSync)}%</span>
                </div>
                <div className=${`h-1 bg-zinc-900 border ${primary === 'purple' ? 'border-purple-900/50' : 'border-cyan-900/50'}`}>
                    <div className=${`h-full transition-all duration-300 ${barColorClass}`} style=${{ width: `${resonanceSync}%` }} />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-0.5">
                    <span className=${`text-[8px] uppercase font-bold tracking-widest ${isSectarian ? 'text-purple-400 animate-pulse' : (primary === 'purple' ? 'text-purple-600' : 'text-cyan-600')}`}>
                        ${isSectarian ? 'Sintonía_del_Alma' : 'Frecuencia'}
                    </span>
                    <input type="range" min="0.1" max="60" step="0.1" value=${localFreq} 
                        onChange=${(e) => adjust('localFrequency', parseFloat(e.target.value))}
                        className=${`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all ${isSectarian ? 'accent-purple-500 hover:accent-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : (primary === 'purple' ? 'accent-purple-500 hover:accent-purple-400' : 'accent-cyan-500 hover:accent-cyan-400')}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className=${`text-[8px] uppercase font-bold tracking-widest ${isSectarian ? 'text-red-400 animate-pulse' : (primary === 'purple' ? 'text-red-600' : 'text-purple-600')}`}>
                        ${isSectarian ? 'Oscilación_del_Velo' : 'Fase'}
                    </span>
                    <input type="range" min="0" max=${Math.PI * 2} step="0.1" value=${localPhase}
                        onChange=${(e) => adjust('localPhase', parseFloat(e.target.value))}
                        className=${`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all ${isSectarian ? 'accent-red-500 hover:accent-red-400 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : (primary === 'purple' ? 'accent-red-500 hover:accent-red-400' : 'accent-purple-500 hover:accent-purple-400')}`} />
                </div>
            </div>

            <button 
                onClick=${synchronize}
                disabled=${resonanceSync < 90}
                className=${`w-full py-1 text-[10px] font-bold border transition-all ${resonanceSync >= 90 ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-700'}`}
            >
                ${config.action}
            </button>

            <div className=${`text-[9px] font-mono flex justify-between mt-auto ${primary === 'purple' ? 'text-purple-900' : 'text-cyan-900'}`}>
                <span className="opacity-50">${config.module} // ${isSectarian ? 'ARMONÍA_ESPIRITUAL' : 'ENLACE_NEURAL'}</span>
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

    const [grid, setGrid] = useState([]);
    const [burned, setBurned] = useState(new Set());

    const initGrid = () => {
        const newBurned = new Set();
        // Reducción drástica de obstáculos para el sectario (Ruta 1)
        const maxBurned = isSectarian ? 2 : 4; 
        
        while (newBurned.size < maxBurned) {
            const idx = Math.floor(Math.random() * 72);
            // No bloquear la primera ni la última columna para asegurar salida/entrada
            if (idx % 12 !== 0 && idx % 12 !== 11) {
                newBurned.add(idx);
            }
        }
        setBurned(newBurned);

        // Pre-activar las primeras DOS columnas para dar un "empujón" inicial al jugador
        const initialGrid = new Array(72).fill(false);
        for (let r = 0; r < 6; r++) {
            const idx0 = r * 12;
            const idx1 = r * 12 + 1;
            if (!newBurned.has(idx0)) initialGrid[idx0] = true;
            if (!newBurned.has(idx1) && !newBurned.has(idx0)) initialGrid[idx1] = true;
        }
        setGrid(initialGrid);
    };

    useEffect(() => { initGrid(); }, []);

    const toggleCell = (idx) => {
        if (!forceActive || burned.has(idx)) return;
        const newGrid = [...grid];
        newGrid[idx] = !newGrid[idx];
        setGrid(newGrid);

        if (checkConnection(newGrid)) {
            bus.emit('TERMINAL_PRINT', { text: config.success, type: 'SUCCESS' });
            engineState.energy = Math.min(100, engineState.energy + 15);
            bus.emit('EMERGENCY_END', { type: 'energy' });
            initGrid();
        }
    };

    const checkConnection = (currentGrid) => {
        const rows = 6;
        const cols = 12;
        const queue = [];
        const visited = new Set();

        for (let r = 0; r < rows; r++) {
            const idx = r * cols;
            if (currentGrid[idx]) {
                queue.push(idx);
                visited.add(idx);
            }
        }

        while (queue.length > 0) {
            const curr = queue.shift();
            const r = Math.floor(curr / cols);
            const c = curr % cols;
            if (c === cols - 1) return true;
            const neighbors = [
                { r: r - 1, c }, { r: r + 1, c },
                { r, c: c - 1 }, { r, c: c + 1 }
            ];
            for (const n of neighbors) {
                if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
                    const nIdx = n.r * cols + n.c;
                    if (currentGrid[nIdx] && !visited.has(nIdx) && !burned.has(nIdx)) {
                        visited.add(nIdx);
                        queue.push(nIdx);
                    }
                }
            }
        }
        return false;
    };

    const primaryColorClass = primary === 'purple' ? 'border-purple-500/20 bg-purple-950/5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]' : 'border-emerald-500/20 bg-emerald-950/5 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]';
    const textColorClass = primary === 'purple' ? 'text-purple-600' : 'text-emerald-600';
    const statusColorClass = primary === 'purple' ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]';
    const statusIdleColorClass = primary === 'purple' ? 'bg-purple-900/50' : 'bg-emerald-900/50';
    const cellActiveColorClass = primary === 'purple' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] border-purple-400' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] border-emerald-400';
    const footerTextColorClass = primary === 'purple' ? 'text-purple-900/60' : 'text-emerald-900/60';

    return html`
        <div className=${`flex flex-col h-full p-2 border relative overflow-hidden group ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            ${isSectarian ? html`
                <div className="absolute inset-0 bg-[radial-gradient(#a855f708_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none"></div>
            ` : html`
                <div className="absolute inset-0 bg-[radial-gradient(#10b98108_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
            `}
            
            <div className="flex justify-between items-center px-1 mb-1 relative z-10">
                <span className=${`text-[10px] uppercase font-mono font-bold tracking-tighter ${textColorClass}`}>
                    ${config.name}
                </span>
                <div className="flex gap-1">
                    <div className=${`w-1.5 h-1.5 rounded-full animate-pulse ${statusColorClass}`}></div>
                    <div className=${`w-1.5 h-1.5 rounded-full ${statusIdleColorClass}`}></div>
                </div>
            </div>

            <div className=${`grid grid-cols-12 grid-rows-6 gap-0.5 flex-1 bg-black/60 p-1 border border-zinc-800/50 shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden ${isSectarian ? 'rotate-0 rounded-lg' : ''}`}>
                ${isSectarian && html`
                    <!-- Ritual Overlay Background -->
                    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 animate-[spin_60s_linear_infinite]">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="1 3" />
                            <path d="M 50 5 L 95 50 L 50 95 L 5 50 Z" fill="none" stroke="#a855f7" strokeWidth="0.2" />
                        </svg>
                    </div>
                `}
                ${grid.map((active, i) => {
                    const isBurned = burned.has(i);
                    return html`
                        <div 
                            key=${i}
                            onClick=${() => toggleCell(i)}
                            className=${`
                                w-full h-full cursor-crosshair transition-all duration-300 border relative z-10
                                ${isBurned ? (isSectarian ? 'bg-purple-900/10 border-purple-950 opacity-10 grayscale' : 'bg-red-950/60 border-red-900/40 opacity-40') : 
                                  active ? cellActiveColorClass : 
                                  (isSectarian ? 'bg-slate-950/40 border-slate-900/30 hover:bg-purple-900/20 hover:border-purple-800/40' : 'bg-zinc-900/80 border-zinc-800/50 hover:bg-emerald-900/40 hover:border-emerald-800/50')}
                                ${!isBurned && active && 'animate-pulse'}
                                ${isSectarian && !isBurned && !active ? 'rounded-[1px]' : ''}
                                ${isSectarian && active ? 'scale-75 rotate-45 rounded-none' : ''}
                            `}
                        >
                            ${isSectarian && active && html`<div className="w-full h-full bg-white/5 blur-[3px] animate-ping"></div>`}
                        </div>
                    `;
                })}
            </div>
            
            <div className=${`text-[9px] font-mono flex justify-between px-1 mt-auto pt-1 ${footerTextColorClass}`}>
                <span>${isSectarian ? 'CANAL_DE_ALMAS' : config.name.toUpperCase().replace(' ', '_')}</span>
                <span className="opacity-50">${config.module}</span>
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
