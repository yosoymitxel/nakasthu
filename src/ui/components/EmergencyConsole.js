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

import { Icon } from '../shared/Icon.js';
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
            // De medio ciclo a seis a lo ancho, y la onda ocupa casi todo el alto
            const k = (f) => (Math.PI * 2 * (0.5 + (f / 60) * 5.5)) / width;
            const amp = midY * 0.8;

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
                    const targetY = midY + Math.sin(x * k(targetFreq) + targetPhase + time) * amp;
                    const localY = midY + Math.sin(x * k(localFreq) + localPhase + time) * amp;
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
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 5]);
                for (let x = 0; x < width; x++) {
                    const y = midY + Math.sin(x * k(targetFreq) + targetPhase + time) * amp;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.setLineDash([]);

                // Onda Local
                ctx.beginPath();
                ctx.strokeStyle = resonanceSync > 85 ? '#10b981' : '#06b6d4';
                ctx.lineWidth = 2;
                for (let x = 0; x < width; x++) {
                    const y = midY + Math.sin(x * k(localFreq) + localPhase + time) * amp;
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
        if (freqHit && phaseHit) {
            bus.emit('TERMINAL_PRINT', { text: config.success, type: 'SUCCESS' });
            engineState.stability = Math.min(100, engineState.stability + 10);
            bus.emit('EMERGENCY_END', { type: 'resonance' });
        }
    };

    let phaseGap = Math.abs(targetPhase - localPhase) % (Math.PI * 2);
    if (phaseGap > Math.PI) phaseGap = Math.PI * 2 - phaseGap;
    const freqHit = Math.abs(targetFreq - localFreq) < 2;
    const phaseHit = phaseGap < 0.4;

    // Como una tarea de panel: al encajar las dos muescas se cierra sola
    useEffect(() => {
        if (!isActive || !freqHit || !phaseHit) return;
        const id = setTimeout(synchronize, 700);
        return () => clearTimeout(id);
    }, [isActive, freqHit && phaseHit]);

    const notch = (value, min, max, hit) => html`<i className=${`em-notch ${hit ? 'hit' : ''}`} style=${{ left: `${((value - min) / (max - min)) * 100}%` }}></i>`;

    const primaryColorClass = primary === 'purple' ? 'border-purple-500/20 bg-purple-950/5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]' : 'border-cyan-500/20 bg-cyan-950/5 shadow-[inset_0_0_15px_rgba(6,182,212,0.05)]';
    const accentColorClass = primary === 'purple' ? 'bg-purple-500/5' : 'bg-cyan-500/5';
    const textColorClass = primary === 'purple' ? 'text-purple-700' : 'text-cyan-700';
    const barColorClass = primary === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]';

    return html`
        <div className=${`flex flex-col h-full p-2 border relative overflow-hidden group ${!forceActive ? 'grayscale opacity-40' : 'animate-flicker'} ${primaryColorClass}`}>
            <canvas 
                ref=${canvasRef} 
                width="400" 
                height="120" 
                className=${`w-full flex-1 min-h-[40px] bg-black/40 border border-zinc-900/50 rounded-sm mb-1 ${resonanceSync >= 90 ? 'em-done' : ''}`}
            />
            
            <div className="flex flex-col gap-2 relative z-10 flex-none">
                <div className="flex justify-between items-center px-1">
                    <span className=${`text-[11px] uppercase font-mono font-black tracking-widest ${textColorClass}`}>
                        ${config.name}
                    </span>
                    <span className=${`text-[10px] font-mono font-bold ${resonanceSync > 85 ? 'text-emerald-500' : (primary === 'purple' ? 'text-purple-400' : 'text-cyan-400')}`}>
                        SYNC: ${Math.floor(resonanceSync)}%
                    </span>
                </div>

                <!-- Sliders más grandes y táctiles -->
                <div className="space-y-2 px-1">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold px-1">
                            <span>${isSectarian ? 'Sintonía_del_Alma' : 'Frecuencia'}</span>
                            <span>${localFreq.toFixed(1)}Hz</span>
                        </div>
                        <div className="em-dial">${notch(targetFreq, 0.1, 60, freqHit)}
                        <input 
                            type="range" 
                            min="0.1" 
                            max="60" 
                            step="0.1"
                            value=${localFreq}
                            onChange=${(e) => adjust('localFrequency', parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        /></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold px-1">
                            <span>${isSectarian ? 'Oscilación_del_Velo' : 'Fase'}</span>
                            <span>${(localPhase / Math.PI).toFixed(2)}π</span>
                        </div>
                        <div className="em-dial">${notch(targetPhase, 0, Math.PI * 2, phaseHit)}
                        <input 
                            type="range" 
                            min="0" 
                            max=${Math.PI * 2} 
                            step="0.1"
                            value=${localPhase}
                            onChange=${(e) => adjust('localPhase', parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        /></div>
                    </div>
                </div>

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
    const [wrong, setWrong] = useState(0);
    useEffect(() => { if (isActive && sequence.length === 0 && !engineState.o2Stabilized) startMinigame(); }, [isActive]);

    const startMinigame = () => {
        const newSeq = [1, 2, 3, 4];
        for (let i = 3; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newSeq[i], newSeq[j]] = [newSeq[j], newSeq[i]]; }
        setSequence(newSeq);
        setUserInput([]);
        
        bus.emit('TERMINAL_PRINT', { text: config.alert, type: 'SYSTEM' });
    };

    const handlePress = (num) => {
        if (!forceActive || sequence.length === 0) return;
        
        const nextInput = [...userInput, num];
        setUserInput(nextInput);

        if (nextInput[nextInput.length - 1] !== sequence[nextInput.length - 1]) {
            const errorText = `[ERROR] ${config.name} FALLIDO. REINTENTAR SECUENCIA.`;
            bus.emit('TERMINAL_PRINT', { text: errorText, type: 'ERROR' });
            setUserInput([]);
            setWrong(num);
            setTimeout(() => setWrong(0), 350);
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
            
            <!-- Orden a seguir: se enciende cada paso al acertarlo -->
            <div className="em-seq relative z-10" aria-label="Orden de la secuencia">
                ${sequence.length === 0
                    ? html`<span className="em-seq-hint">${config.action} <${Icon} name="chevron-right" /></span>`
                    : sequence.map((n, i) => html`
                        <span key=${i} className=${`em-seq-step ${i < userInput.length ? 'ok' : i === userInput.length ? 'next' : ''}`}>${i < userInput.length ? html`<${Icon} name="check" />` : i + 1}</span>
                    `)}
            </div>

            <div className=${`relative grid grid-cols-2 grid-rows-2 gap-2 flex-1 min-h-[88px] relative z-10`}>
                ${[1, 2, 3, 4].map(num => {
                    const isPressed = userInput.includes(num);
                    const order = sequence.indexOf(num) + 1;
                    const isNext = order > 0 && order === userInput.length + 1;
                    const label = symbols[num - 1];
                    

                    return html`
                        <button 
                            key=${num}
                            onClick=${() => handlePress(num)}
                            className=${`border font-mono text-[9px] transition-all flex items-center justify-center overflow-hidden
                                ${isPressed ? buttonActiveColorClass : buttonIdleColorClass}
                                ${isNext ? 'em-next' : ''} ${wrong === num ? 'em-wrong' : ''}
                                ${isSectarian ? 
                                    'relative h-full min-h-10 rounded-tl-2xl rounded-br-2xl border-purple-500/30 hover:bg-purple-500/20 active:scale-95' : 
                                    'relative h-full min-h-10 text-[12px] hover:border-red-600 hover:bg-red-900/20 active:scale-95'}
                            `}
                        >
                            <span className=${`z-10 ${isSectarian ? 'tracking-[0.15em] font-black text-[11px]' : ''} ${isPressed ? 'animate-pulse' : ''}`}>
                                ${label}
                            </span>
                            ${order > 0 && html`<b className=${`em-order ${isPressed ? 'ok' : ''} ${num % 2 === 0 ? 'right' : ''}`}>${isPressed ? html`<${Icon} name="check" />` : order}</b>`}
                            ${isPressed && html`<div className=${`absolute inset-0 animate-flicker ${isSectarian ? 'bg-purple-500/20' : 'bg-red-500/10'}`}></div>`}
                        </button>
                    `;
                })}
                ${isSectarian && html`
                    <!-- Botón de Inicio Integrado en el Centro para el Sectario -->
                    <button 
                        onClick=${startMinigame}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full border border-purple-500/40 bg-[#14081f] hover:bg-purple-500/20 transition-all z-20 flex items-center justify-center group/btn"
                    >
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse group-hover/btn:scale-125 transition-transform"></div>
                        
                    </button>
                `}
            </div>

            ${!isSectarian && html`
                <button 
                    onClick=${startMinigame}
                    className=${`w-full mt-2 py-1.5 border text-[9px] font-bold tracking-widest transition-all uppercase shadow-[0_0_10px_rgba(153,27,27,0.2)] ${mainButtonColorClass}`}
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
    const [done, setDone] = useState(false);

    const initGrid = () => {
        const newBurned = new Set();
        const maxBurned = isSectarian ? 6 : 10; 
        
        while (newBurned.size < maxBurned) {
            const idx = Math.floor(Math.random() * 72);
            if (idx % 12 !== 0 && idx % 12 !== 11) {
                newBurned.add(idx);
            }
        }
        // Un tablero sin camino de IN a OUT no se puede ganar: se vuelve a tirar
        const open = (i) => i >= 0 && i < 72 && !newBurned.has(i);
        const seen = new Set(), queue = [0, 12, 24, 36, 48, 60];
        let solvable = false;
        while (queue.length && !solvable) {
            const i = queue.pop();
            if (seen.has(i)) continue;
            seen.add(i);
            if (i % 12 === 11) solvable = true;
            for (const j of [i - 12, i + 12, i % 12 ? i - 1 : -1, i % 12 < 11 ? i + 1 : -1]) if (open(j)) queue.push(j);
        }
        if (!solvable) return initGrid();
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
                    setDone(true);
                    setTimeout(() => { setDone(false); initGrid(); }, 1000);
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

    // Con el dedo no hay mouseenter: se mira qué celda queda debajo
    const handleTouchMove = (e) => {
        const t = e.touches[0];
        const cell = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-cell]');
        if (cell) handleInteraction(Number(cell.dataset.cell));
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const getArrowDirection = (from, to) => {
        const r1 = Math.floor(from / 12), c1 = from % 12;
        const r2 = Math.floor(to / 12), c2 = to % 12;
        if (r2 < r1) return 'arrow-up';
        if (r2 > r1) return 'arrow-down';
        if (c2 < c1) return 'arrow-left';
        if (c2 > c1) return 'arrow-right';
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

            <div onTouchMove=${handleTouchMove} style=${{ touchAction: 'none' }} className="grid grid-cols-12 grid-rows-6 gap-0.5 flex-1 min-h-0 bg-black/80 p-1 border border-zinc-800/50 relative">
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
                            data-cell=${i}
                            onClick=${() => handleInteraction(i)}
                            onMouseDown=${() => handleMouseDown(i)}
                            onMouseEnter=${() => handleMouseEnter(i)}
                            className=${`
                                w-full h-full min-h-0 overflow-hidden cursor-crosshair transition-all duration-200 border flex items-center justify-center font-bold text-[12px] leading-none relative
                                ${isBurned ? 'em-burned cursor-not-allowed' : 
                                  isActive ? cellActiveColorClass + (done ? ' em-done' : '') : 
                                  isStart ? 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:bg-zinc-800' :
                                  isEnd ? 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:bg-zinc-800' :
                                  'bg-zinc-950 border-zinc-900 hover:bg-zinc-900'}
                                ${isLast && !isBurned ? 'ring-1 ring-white/50 z-20 scale-105' : ''}
                                ${isEnd && !isActive && !isBurned && forceActive ? 'em-socket' : ''}
                            `}
                        >
                            ${isActive && html`
                                <span className=${`z-10 ${isLast ? 'animate-bounce' : ''}`}>
                                    <${Icon} name=${isLast ? (isEnd ? 'check' : (path.length === 1 ? 'zap' : 'circle')) : (arrow || 'circle')} />
                                </span>
                            `}
                            ${isBurned && html`<span className="text-[9px]"><${Icon} name="close" /></span>`}
                            ${isEnd && !isActive && !isBurned && html`<span className="text-[10px]"><${Icon} name="bullseye" /></span>`}
                        </div>
                    `;
                })}
                ${forceActive && path.length === 1 && html`<i className="em-drag-hint" style=${{ top: `${(Math.floor(path[0] / 12) + 0.5) / 6 * 100}%` }}></i>`}
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

    const anyActive = Object.values(emergencies).some(v => v);
    const names = PATH_CONFIGS[storyPath || 0].emergencies;
    const slots = [
        ['resonance', ResonanceModule, '∿'],
        ['oxygen', OxygenModule, 'wind'],
        ['energy', PowerGridModule, 'zap']
    ];
    const open = (type) => isLevel6 || emergencies[type];

    return html`
        <div
            className=${`em-console bg-black/40 ${anyActive ? 'ring-1 ring-red-500/30' : ''}`}
            style=${{ gridTemplateColumns: slots.map(([type]) => (open(type) ? 'minmax(0, 1fr)' : (anyActive || isLevel6 ? '52px' : 'minmax(0, 1fr)'))).join(' ') }}
        >
            ${slots.map(([type, Module, glyph]) => open(type) ? html`
                <div key=${type} className=${`em-slot ${emergencies[type] ? 'emergency-glitch' : ''}`}>
                    <${Module} isActive=${emergencies[type]} storyPath=${storyPath} />
                </div>
            ` : html`
                <div key=${type} className="em-idle">
                    <span className="em-glyph"><${Icon} name=${glyph} /></span>
                    <span className="em-idle-name">${names[type].name}</span>
                    <span className="em-ok"><${Icon} name="circle" tone="ok" /> estable</span>
                </div>
            `)}
        </div>
    `;
};
