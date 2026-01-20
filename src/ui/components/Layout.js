/**
 * LAYOUT.JS
 * Grid 12x12 Estricta para la interfaz de Nakasthu.
 * Regla 2.C: Posicionamiento de módulos y efectos dinámicos de fase/energía.
 */
import { html } from '../utils/html.js';
import { MainLayout, ModuleWrapper } from './MainLayout.js';
import { SidebarLeft } from './SidebarLeft.js';
import { CenterCore } from './CenterCore.js';
import { SidebarRight } from './SidebarRight.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';

const { useState, useEffect } = React;

export const Layout = () => {
    // Suscribirse a valores globales para efectos de Layout
    const phase = useGameState('phase');
    const energy = useGameState('energy');
    const stability = useGameState('stability');
    const orbitalCycle = useGameState('orbitalCycle');
    const gameStatus = useGameState('gameStatus');
    const stats = useGameState('stats');
    const processedCount = useGameState('processedCount');
    const quota = useGameState('quota');
    const judgmentErrors = useGameState('judgmentErrors');
    const tutorialStep = useGameState('tutorialStep');

    const [flash, setFlash] = useState(null); // { color, duration }
    const [alarm, setAlarm] = useState(false);
    const [sacrificePeak, setSacrificePeak] = useState(false);
    const [modal, setModal] = useState(null); // { title, content }

    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [deathReason, setDeathReason] = useState(null);

    // Lógica de bloqueo de tutorial
    const getModuleTutorialStatus = (areaId) => {
        if (!tutorialStep || tutorialStep === 0) return { locked: false, highlighted: false };

        // El cabezal de estado nunca se bloquea
        if (areaId === 'C_HEADER') return { locked: false, highlighted: false };

        switch (tutorialStep) {
            case 1: // Escaneo
                if (areaId === 'L_UPPER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 2: // Resonancia
                if (areaId === 'C_FOOTER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 3: // Decisión
                if (areaId === 'C_MAIN') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            default:
                return { locked: false, highlighted: false };
        }
    };

    // Modal de Bienvenida (Game Designer Request)
    useEffect(() => {
        if (gameStatus === 'PLAYING' && !hasSeenWelcome) {
            setModal({
                title: 'PROTOCOLO DE INDUCCIÓN - OPERADOR',
                content: html`
                    <div className="space-y-4 text-[14px]">
                        <p className="font-bold text-amber-500">BIENVENIDO, OPERADOR.</p>
                        <p>Tu misión es procesar <span className="text-zinc-100">${quota} sujetos</span> antes de que el eclipse orbital alcance el cenit.</p>
                        <ul className="space-y-2 list-none border-l border-zinc-800 pl-4">
                            <li><span className="text-cyan-400">● BIOSCAN:</span> Utilízalo para extraer datos críticos del sujeto.</li>
                            <li><span className="text-emerald-400">● RESONANCIA:</span> Mantén la frecuencia alineada para evitar el colapso de integridad neural.</li>
                            <li><span className="text-amber-400">● COMMS:</span> Decide el destino (Autorizar/Sacrificar) en la consola de comandos.</li>
                        </ul>
                        <p className="text-zinc-500 italic text-[12px]">"Nakasthu no es una prisión, es el último filtro antes del vacío."</p>
                    </div>
                `,
                footer: html`
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick=${() => setModal(null)}
                            className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-all uppercase text-[12px] tracking-widest"
                        >
                            INICIAR INDUCCIÓN
                        </button>
                        <button 
                            onClick=${() => {
                                setModal(null);
                                state.tutorialStep = 0;
                            }}
                            className="flex-1 py-2 bg-zinc-950 border border-red-900/30 text-red-900/60 hover:text-red-600 transition-all uppercase text-[10px] tracking-tighter"
                        >
                            SALTAR TUTORIAL [RIESGO]
                        </button>
                    </div>
                `
            });
            setHasSeenWelcome(true);
        }
    }, [gameStatus, hasSeenWelcome, quota]);

    // Listener para feedback de impacto
    useEffect(() => {
        const onFlash = (data) => {
            setFlash({ color: data.color || 'white', duration: data.duration || 300 });
            setTimeout(() => setFlash(null), data.duration || 300);
            
            // Activar alarma si el flash es rojo (indicativo de error/sacrificio)
            if (data.color === '#ef4444' || data.color === 'red') {
                setAlarm(true);
                setTimeout(() => setAlarm(false), 600);
            }
        };

        const onSacrificePeak = () => {
            setSacrificePeak(true);
            setTimeout(() => setSacrificePeak(false), 1500);
        };

        const onOpenModal = (data) => setModal(data);
        
        const onSystemFailure = (data) => {
            setDeathReason(data.reason === 'ENERGY_DEPLETED' ? 'ERROR CRÍTICO: Agotamiento de Energía' : 'SUJETO DESCONTROLADO: Inestabilidad Neural');
        };

        bus.on('TRIGGER_FLASH', onFlash);
        bus.on('SACRIFICE_PEAK', onSacrificePeak);
        bus.on('OPEN_MODAL', onOpenModal);
        bus.on('SYSTEM_FAILURE', onSystemFailure);
        return () => {
            bus.off('TRIGGER_FLASH', onFlash);
            bus.off('SACRIFICE_PEAK', onSacrificePeak);
            bus.off('OPEN_MODAL', onOpenModal);
            bus.off('SYSTEM_FAILURE', onSystemFailure);
        };
    }, []);

    const isEclipse = phase === 'ECLIPSE';
    const isCriticalEnergy = energy < 10;
    const isGameOver = gameStatus === 'GAME_OVER';
    const isStartMenu = gameStatus === 'START_MENU';
    const isPaused = state.isPaused;

    // Listener para pausa (Escape key)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && gameStatus === 'PLAYING') {
                const newPauseState = !state.isPaused;
                state.isPaused = newPauseState;
                bus.emit('GAME_PAUSE', { paused: newPauseState });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus]);

    // Lógica de cálculo de rango
    const getRank = () => {
        if (isGameOver || judgmentErrors > 5) return { label: 'F', color: 'text-red-600', desc: 'FRACASO ABSOLUTO' };
        if (judgmentErrors === 0 && energy > 80) return { label: 'S', color: 'text-amber-400', desc: 'EJECUCIÓN PERFECTA' };
        if (judgmentErrors <= 2) return { label: 'A', color: 'text-emerald-400', desc: 'DESEMPEÑO SOBRESALIENTE' };
        if (judgmentErrors <= 5) return { label: 'C', color: 'text-yellow-600', desc: 'DESEMPEÑO ACEPTABLE' };
        return { label: 'D', color: 'text-zinc-500', desc: 'RIESGO OPERATIVO' };
    };

    const rank = getRank();

    // Estilo dinámico del borde del contenedor
    const gridStyle = {
        borderColor: isEclipse ? 'rgba(6, 182, 212, 0.5)' : 'rgba(120, 53, 15, 0.3)', 
        boxShadow: alarm ? 'inset 0 0 40px rgba(255, 0, 0, 0.4)' : (isEclipse ? '0 0 30px rgba(6, 182, 212, 0.15)' : '0 0 15px rgba(120, 53, 15, 0.05)'),
        filter: isEclipse ? 'hue-rotate(180deg) contrast(1.1)' : isCriticalEnergy ? 'hue-rotate(-20deg) contrast(1.2)' : 'none'
    };

    return html`
        <div className=${`relative min-h-screen bg-[#1a1a1c] text-zinc-300 overflow-hidden cursor-default select-none font-mono transition-all duration-[1000ms] ${isPaused ? 'grayscale' : ''}`}>
            
            <!-- VFX Perimetral Progresivo -->
            <div 
                className=${`vignette-damage ${alarm || sacrificePeak ? 'active-alarm' : ''}`}
                style=${{
                    zIndex: 50,
                    '--vignette-opacity': sacrificePeak ? 1.0 : (alarm ? 0.8 : (isEclipse ? orbitalCycle / 100 : 0)),
                    boxShadow: `inset 0 0 120px rgba(${alarm || isEclipse || sacrificePeak ? '153, 27, 27' : '0, 0, 0'}, ${sacrificePeak ? 0.8 : (alarm ? 0.6 : (isEclipse ? 0.4 : 0))})`
                }}
            >
                <div className="noise-texture"></div>
            </div>

            <!-- Overlay de Pantalla de Inicio -->
            <div className=${`start-menu ${isStartMenu ? 'active' : ''}`}>
                <div className="flex flex-col items-center space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold tracking-[1em] text-zinc-100 opacity-90">NAKASTHU</h1>
                        <p className="text-[12px] text-zinc-400 tracking-[0.3em] uppercase">SISTEMA DE GESTIÓN DE BIOMASA v.15.0</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-64">
                        <button 
                            onClick=${() => state.gameStatus = 'PLAYING'}
                            className="group relative border border-cyan-500/40 bg-cyan-950/20 px-8 py-3 hover:bg-cyan-500/30 transition-all"
                        >
                            <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Iniciar Turno</span>
                            <div className="absolute inset-0 border border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        </button>
                        
                        <button 
                            onClick=${() => bus.emit('OPEN_MODAL', { title: 'CONFIGURACIÓN', content: 'AJUSTES DE NÚCLEO NO DISPONIBLES EN ESTA VERSIÓN.' })}
                            className="border border-zinc-800 bg-zinc-900/60 px-8 py-2 text-zinc-400 font-mono text-xs hover:text-zinc-200 transition-all uppercase tracking-widest"
                        >
                            Configuración
                        </button>
                    </div>
                </div>
            </div>

            <!-- Protocolo de Colapso (Muerte) -->
            <div className=${`death-screen ${isGameOver ? 'active' : ''}`}>
                <div className="flex flex-col items-center space-y-8 max-w-2xl text-center px-4">
                    <h1 className="text-red-600 font-mono text-3xl tracking-[0.2em] uppercase font-black">
                        BASTIÓN COMPROMETIDO
                    </h1>
                    <div className="space-y-4">
                        <p className="text-red-500 font-bold text-xl tracking-widest animate-pulse">
                            ${deathReason || 'CONEXIÓN CORTADA'}
                        </p>
                        <p className="text-zinc-500 text-[14px] leading-relaxed">
                            La integridad del sistema ha fallado irremediablemente. La biomasa residual ha sido purgada y el enlace neural se ha desvanecido en el vacío.
                        </p>
                    </div>
                    <button 
                        onClick=${() => {
                            setDeathReason(null);
                            state.resetState();
                        }}
                        className="px-10 py-4 border border-red-900/50 text-red-500 font-mono text-sm hover:bg-red-900/20 transition-all uppercase tracking-[0.4em] font-bold"
                    >
                        Reiniciar Protocolo Zhyr
                    </button>
                </div>
            </div>

            <!-- Main Grid Structure (12x6 Estricto) -->
            <div className=${`transition-all duration-[2000ms] ${isGameOver || isStartMenu ? 'opacity-0 pointer-events-none' : ''}`}>
                <${MainLayout}>
                    <${SidebarLeft} getModuleTutorialStatus=${getModuleTutorialStatus} />
                    <${CenterCore} getModuleTutorialStatus=${getModuleTutorialStatus} />
                    <${SidebarRight} getModuleTutorialStatus=${getModuleTutorialStatus} />
                <//>
            </div>

            <!-- Modal de Pausa -->
            ${isPaused && html`
                <div className="modal-overlay z-[700]">
                    <div className="bg-zinc-950 border border-cyan-900/50 p-12 text-center space-y-6">
                        <h2 className="text-cyan-500 font-mono text-2xl tracking-[0.5em] animate-pulse">SISTEMA EN ESPERA</h2>
                        <p className="text-zinc-500 text-[10px] tracking-widest uppercase">INTERRUPCIÓN DE FLUJO NEURAL DETECTADA</p>
                        <button 
                            onClick=${() => state.isPaused = false}
                            className="px-8 py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-[0.3em] text-xs"
                        >
                            Reanudar Conexión
                        </button>
                    </div>
                </div>
            `}

            <!-- Sistema de Modales -->
            ${modal && html`
                <div className="modal-overlay" onClick=${() => setModal(null)}>
                    <div className="bg-[#1a1a1c] border border-zinc-800 p-6 w-[500px] shadow-2xl relative" onClick=${e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <h2 className="text-zinc-300 font-bold tracking-widest uppercase text-sm">${modal.title}</h2>
                            <button onClick=${() => setModal(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                        </div>
                        <div className="text-zinc-400 font-mono text-[12px] leading-relaxed my-4">
                            ${modal.content}
                        </div>
                        ${modal.footer ? modal.footer : html`
                            <button 
                                onClick=${() => setModal(null)}
                                className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-all uppercase text-[12px] tracking-widest"
                            >
                                Cerrar Registro
                            </button>
                        `}
                    </div>
                </div>
            `}

            <!-- CRT Overlay Global -->
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>

            <!-- Impact Flash Overlay -->
            ${flash && html`
                <div 
                    className="fixed inset-0 z-[300] pointer-events-none transition-opacity duration-75"
                    style=${{ 
                        backgroundColor: flash.color,
                        opacity: 0.3
                    }}
                />
            `}
        </div>
    `;
};
