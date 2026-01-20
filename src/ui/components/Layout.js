/**
 * LAYOUT.JS
 * Grid 12x12 Estricta para la interfaz de Nakasthu.
 * Regla 2.C: Posicionamiento de módulos y efectos dinámicos de fase/energía.
 */
import { html } from '../utils/html.js';
import { Panel } from './Panel.js';
import { BioScan } from './BioScan.js';
import { Analytics } from './Analytics.js';
import { Oscilloscope } from './Oscilloscope.js';
import { Terminal } from './Terminal.js';
import { SystemInfo } from './SystemInfo.js';
import { Logo } from './Logo.js';
import { HeaderNucleo } from './HeaderNucleo.js';
import { Operations } from './Operations.js';
import { ControlPanel } from './ControlPanel.js';
import { LoreArchive } from './LoreArchive.js';
import { PortalScene } from './PortalScene.js';
import { SubjectVisual } from './SubjectVisual.js';
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

    const [flash, setFlash] = useState(null); // { color, duration }
    const [alarm, setAlarm] = useState(false);
    const [sacrificePeak, setSacrificePeak] = useState(false);
    const [modal, setModal] = useState(null); // { title, content }

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

        bus.on('TRIGGER_FLASH', onFlash);
        bus.on('SACRIFICE_PEAK', onSacrificePeak);
        bus.on('OPEN_MODAL', onOpenModal);
        return () => {
            bus.off('TRIGGER_FLASH', onFlash);
            bus.off('SACRIFICE_PEAK', onSacrificePeak);
            bus.off('OPEN_MODAL', onOpenModal);
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
                state.isPaused = !state.isPaused;
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
        <div className=${`relative min-h-screen bg-[#0a0a0b] text-zinc-100 overflow-hidden cursor-default select-none font-mono transition-all duration-[1000ms] ${isPaused ? 'grayscale' : ''}`}>
            <!-- Estilos Globales Forzados -->
            <style>
                body { 
                    background-color: #0a0a0b !important; 
                    cursor: default !important;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                .vignette-damage {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 150;
                    opacity: var(--vignette-opacity, 0);
                    transition: opacity 1.5s ease-in-out;
                    background: radial-gradient(circle, transparent 40%, rgba(153, 27, 27, 0.4) 100%);
                    box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8);
                }
                .vignette-damage.active-alarm {
                    animation: pulse-biomass 4s ease-in-out infinite;
                }
                @keyframes pulse-biomass {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                }
                .noise-texture {
                    position: absolute;
                    inset: 0;
                    opacity: 0.05;
                    background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
                    mix-blend-mode: overlay;
                }
                .death-screen, .start-menu {
                    position: fixed;
                    inset: 0;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 500;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 1.5s ease-in-out;
                }
                .death-screen.active, .start-menu.active {
                    opacity: 1;
                    pointer-events: all;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 600;
                    backdrop-filter: blur(4px);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(120, 53, 15, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(120, 53, 15, 0.5);
                }
            </style>

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
                        <h1 className="text-4xl font-bold tracking-[1em] text-zinc-100 opacity-80">NAKASTHU</h1>
                        <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">SISTEMA DE GESTIÓN DE BIOMASA v.15.0</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-64">
                        <button 
                            onClick=${() => state.gameStatus = 'PLAYING'}
                            className="group relative border border-cyan-500/30 bg-cyan-950/10 px-8 py-3 hover:bg-cyan-500/20 transition-all"
                        >
                            <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Iniciar Turno</span>
                            <div className="absolute inset-0 border border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        </button>
                        
                        <button 
                            onClick=${() => bus.emit('OPEN_MODAL', { title: 'CONFIGURACIÓN', content: 'AJUSTES DE NÚCLEO NO DISPONIBLES EN ESTA VERSIÓN.' })}
                            className="border border-zinc-800 bg-zinc-900/50 px-8 py-2 text-zinc-500 font-mono text-xs hover:text-zinc-300 transition-all uppercase tracking-widest"
                        >
                            Configuración
                        </button>
                    </div>
                </div>
            </div>

            <!-- Protocolo de Colapso (Muerte) -->
            <div className=${`death-screen ${isGameOver ? 'active' : ''}`}>
                <div className="flex flex-col items-center space-y-8">
                    <h1 className="text-emerald-500 font-mono text-xl tracking-[0.5em] uppercase animate-none">
                        BASTIÓN COMPROMETIDO. CONEXIÓN CORTADA.
                    </h1>
                    <button 
                        onClick=${() => state.resetState()}
                        className="px-6 py-2 border border-emerald-900/30 text-emerald-700 font-mono text-xs hover:bg-emerald-900/10 transition-all uppercase tracking-widest"
                    >
                        Reiniciar Protocolo Zhyr
                    </button>
                </div>
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
                    <div className="bg-zinc-950 border border-zinc-800 p-8 max-w-lg w-full space-y-6" onClick=${e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                            <h2 className="text-zinc-400 font-bold tracking-widest uppercase text-sm">${modal.title}</h2>
                            <button onClick=${() => setModal(null)} className="text-zinc-600 hover:text-zinc-400">✕</button>
                        </div>
                        <div className="text-zinc-500 font-mono text-[12px] leading-relaxed">
                            ${modal.content}
                        </div>
                        <button 
                            onClick=${() => setModal(null)}
                            className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-all uppercase text-[10px] tracking-widest"
                        >
                            Cerrar Registro
                        </button>
                    </div>
                </div>
            `}

            <!-- Main Grid Structure (12x6 Estricto) -->
            <div 
                className=${`grid w-screen h-screen transition-all duration-[2000ms] p-1 gap-1 bg-[#0a0a0b] ${isGameOver || isStartMenu ? 'opacity-0 pointer-events-none' : ''}`}
                style=${{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gridTemplateRows: 'repeat(6, 16.66vh)',
                    overflow: 'hidden'
                }}
            >
                
                <${Panel} title="SYS_INIT" className="col-start-1 col-end-3 row-start-1 row-end-2 overflow-hidden">
                    <${Logo} />
                <//>

            <div className="col-start-1 col-end-3 row-start-2 row-end-6 flex flex-col gap-1 overflow-hidden">
                <${Panel} 
                    title="MOD-01: BIOSCAN" 
                    className="overflow-hidden interactive-panel"
                    style=${{ height: '40%' }}
                >
                    <${BioScan} />
                <//>
                <${Panel} 
                    title="MOD-02: ANALYTICS" 
                    className="flex-grow overflow-hidden"
                >
                    <${Analytics} />
                <//>
            </div>

                <${Panel} title="RESERVE_LINK" className="col-start-1 col-end-3 row-start-6 row-end-7 overflow-hidden" contentClassName="!p-0">
                    <div className="h-full w-full flex items-center justify-center">
                        <span className="text-[8px] text-zinc-800 tracking-widest uppercase italic animate-pulse">
                            Sin datos de respaldo...
                        </span>
                    </div>
                <//>

                <${Panel} title="MOD-03: CORE_HEADER" className="col-start-3 col-end-10 row-start-1 row-end-2 overflow-hidden" contentClassName="!p-0">
                    <${HeaderNucleo} />
                <//>

                <${Panel} title="MOD-04: OPERATIONS" className="col-start-3 col-end-10 row-start-2 row-end-5 overflow-hidden" contentClassName="!p-0">
                    <${Operations} />
                <//>

                <${Panel} title="MOD-05: RESONANCE" className="col-start-3 col-end-10 row-start-5 row-end-7 overflow-hidden interactive-panel" contentClassName="!p-0">
                    <${Oscilloscope} />
                <//>

                <${Panel} title="CONTROL" className="col-start-10 col-end-13 row-start-1 row-end-2 overflow-hidden" contentClassName="!p-0">
                    <${ControlPanel} />
                <//>

                <${Panel} title="LORE_ARCHIVE" className="col-start-10 col-end-13 row-start-2 row-end-3 overflow-hidden" contentClassName="!p-0">
                    <${LoreArchive} />
                <//>

                <${Panel} title="MOD-06: ZHYR_OS" className="col-start-10 col-end-13 row-start-3 row-end-5 overflow-hidden">
                    <${Terminal} />
                <//>

                <${Panel} title="MOD-07: QUICK_REF" className="col-start-10 col-end-13 row-start-5 row-end-7 overflow-hidden interactive-panel">
                    <${SystemInfo} />
                <//>
            </div>

            <!-- Overlay de Impacto (Flash) -->
            ${flash && html`
                <div 
                    className="fixed inset-0 z-[200] pointer-events-none transition-opacity duration-300"
                    style=${{ 
                        backgroundColor: flash.color, 
                        opacity: 0.15 
                    }}
                />
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
