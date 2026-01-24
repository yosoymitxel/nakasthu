/**
 * OSCILLOSCOPE.JS (MOD-06)
 * Visualización de ondas de resonancia.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state as engineState } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { MechanicManager } from '../../services/MechanicManager.js';

const { useEffect, useRef } = React;

export const Oscilloscope = () => {
    const canvasRef = useRef(null);
    const targetFreq = useGameState('targetFrequency');
    const targetPhase = useGameState('targetPhase');
    const localFreq = useGameState('localFrequency');
    const localPhase = useGameState('localPhase');
    const resonanceSync = useGameState('resonanceSync');
    const stability = useGameState('stability');
    const isPaused = useGameState('isPaused');
    const isTutorialActive = useGameState('isTutorialActive');
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;

    // Estado local para sliders suaves
    const [sliderFreq, setSliderFreq] = React.useState(localFreq);
    const [sliderPhase, setSliderPhase] = React.useState(localPhase);

    // Sincronizar sliders con estado global si cambia externamente
    useEffect(() => {
        setSliderFreq(localFreq);
    }, [localFreq]);

    useEffect(() => {
        setSliderPhase(localPhase);
    }, [localPhase]);

    const valuesRef = useRef({ 
        targetFreq, 
        targetPhase, 
        localFreq: sliderFreq, 
        localPhase: sliderPhase, 
        stability, 
        resonanceSync, 
        isPaused,
        isTutorialActive,
        isSectarian
    });

    useEffect(() => {
        valuesRef.current = { 
            targetFreq, 
            targetPhase, 
            localFreq: sliderFreq, 
            localPhase: sliderPhase, 
            stability, 
            resonanceSync, 
            isPaused,
            isTutorialActive,
            isSectarian
        };
    }, [targetFreq, targetPhase, sliderFreq, sliderPhase, stability, resonanceSync, isPaused, isTutorialActive, isSectarian]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let timeA = 0; // Tiempo para onda Sujeto
        let timeB = 0; // Tiempo para onda Jugador

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const render = () => {
            const { 
                targetFreq, 
                targetPhase, 
                localFreq, 
                localPhase, 
                stability, 
                resonanceSync, 
                isPaused,
                isTutorialActive,
                isSectarian 
            } = valuesRef.current;
            
            const width = canvas.width / window.devicePixelRatio;
            const height = canvas.height / window.devicePixelRatio;
            const midY = height / 2;

            ctx.clearRect(0, 0, width, height);
            
            // Incrementar tiempo para animación si no está pausado
            if (!isPaused) {
                if (isTutorialActive) {
                    timeA += 0.005; // Sujeto muy lento en tutorial
                    timeB += 0.12;  // Jugador muy rápido en tutorial
                } else {
                    timeA += 0.05;
                    timeB += 0.05;
                }
            }
            
            // Glitch basado en estabilidad (0-100)
            const glitchIntensity = (100 - stability) / 100;
            const isCritical = stability < 20;
            
            // Dibujar Rejilla
            ctx.strokeStyle = isCritical ? 'rgba(153, 27, 27, 0.1)' : (isSectarian ? 'rgba(147, 51, 234, 0.05)' : 'rgba(20, 20, 20, 0.3)');
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
            }
            for (let i = 0; i < height; i += 20) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
            }

            // Onda A: SUJETO (Referencia con tiempo)
            ctx.beginPath();
            ctx.strokeStyle = isCritical ? 'rgba(153, 27, 27, 0.4)' : (isSectarian ? 'rgba(147, 51, 234, 0.3)' : 'rgba(6, 182, 212, 0.4)');
            ctx.lineWidth = 1.5;
            for (let x = 0; x < width; x++) {
                const glitch = isPaused ? 0 : (Math.random() - 0.5) * 5 * Math.pow(glitchIntensity, 2);
                // Escalar frecuencia para visualización y añadir tiempo
                const y = midY + Math.sin(x * (targetFreq * 0.02) + targetPhase + timeA) * 25 + glitch;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Onda B: JUGADOR (Controlada con tiempo)
            const normalColor = isSectarian ? '#a855f7' : '#06b6d4';
            const syncColor = isSectarian ? '#d8b4fe' : '#06b6d4';
            const mismatchColor = isSectarian ? '#7e22ce' : '#f59e0b';
            
            const waveColor = isCritical ? '#ef4444' : resonanceSync > 90 ? syncColor : mismatchColor;
            ctx.beginPath();
            ctx.strokeStyle = waveColor;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = resonanceSync > 80 ? 15 : 0;
            ctx.shadowColor = waveColor;

            for (let x = 0; x < width; x++) {
                const glitch = isPaused ? 0 : (Math.random() - 0.5) * 10 * Math.pow(glitchIntensity, 2);
                // Escalar frecuencia para visualización y añadir tiempo
                const y = midY + Math.sin(x * (localFreq * 0.02) + localPhase + timeB) * 25 + glitch;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []); // Loop estable

    const handleFreqChange = (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) return;
        setSliderFreq(val);
        engineState.localFrequency = val;
        MechanicManager.updateResonance(); // Actualización inmediata
    };

    const handlePhaseChange = (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) return;
        setSliderPhase(val);
        engineState.localPhase = val;
        MechanicManager.updateResonance(); // Actualización inmediata
    };

    return html`
        <div className="flex h-50 w-full bg-transparent overflow-hidden p-3 gap-4">
            <!-- Columna del Osciloscopio -->
            <div className="flex-1 relative border-[0.5px] border-zinc-800 bg-black/20">
                <canvas ref=${canvasRef} className="w-full h-50 opacity-80" />
                
                <!-- Overlay de Datos -->
                <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                    <div className="flex items-center gap-2">
                        <div className=${`w-1 h-3 ${isSectarian ? 'bg-purple-600/30' : 'bg-cyan-600/30'}`}></div>
                        <span className=${`text-[12px] font-black tracking-widest uppercase ${isSectarian ? 'text-purple-600/40' : 'text-cyan-600/40'}`}>
                            ${isSectarian ? 'Señal_del_Alma' : 'Subject_Signal'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className=${`w-1 h-3 ${resonanceSync > 90 ? (isSectarian ? 'bg-purple-600/60' : 'bg-cyan-600/60') : (isSectarian ? 'bg-purple-800/40' : 'bg-amber-600/40')}`}></div>
                        <span className=${`text-[12px] font-black tracking-widest uppercase ${resonanceSync > 90 ? (isSectarian ? 'text-purple-400' : 'text-cyan-600/60') : (isSectarian ? 'text-purple-700' : 'text-amber-600/60')}`}>
                            ${isSectarian ? 'Sintonía_Aura' : 'Sync_Match'}: ${Math.floor(resonanceSync)}%
                        </span>
                    </div>
                </div>
            </div>

            <!-- Columna de Sliders de Sintonización -->
            <div className="w-48 flex flex-col justify-center gap-6 border-l-[0.5px] border-zinc-800 pl-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest">
                            ${isSectarian ? 'Sintonía_Voz' : 'Frequency_Mod'}
                        </span>
                        <span className="text-[12px] text-zinc-400 font-mono">${sliderFreq.toFixed(1)}Hz</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="60.0" 
                        step="0.1" 
                        value=${sliderFreq}
                        onChange=${handleFreqChange}
                        className=${`w-full h-[1px] bg-zinc-900 appearance-none cursor-pointer ${isSectarian ? 'accent-purple-700/50' : 'accent-cyan-700/50'}`}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest">
                            ${isSectarian ? 'Alineación_Aura' : 'Phase_Shift'}
                        </span>
                        <span className="text-[12px] text-zinc-400 font-mono">${sliderPhase.toFixed(2)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="6.28" 
                        step="0.01" 
                        value=${sliderPhase}
                        onChange=${handlePhaseChange}
                        className=${`w-full h-[1px] bg-zinc-900 appearance-none cursor-pointer ${isSectarian ? 'accent-purple-500/50' : 'accent-amber-700/50'}`}
                    />
                </div>
            </div>
        </div>
    `;
};
