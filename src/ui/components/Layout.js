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
import { gameSequencer, STEPS_CONFIG } from '../../systems/GameSequencer.js';

// Importar Pantallas
import { CinematicScreen } from '../screens/cinematic/CinematicScreen.js';
import { MechanicScreen } from '../screens/mechanic/MechanicScreen.js';
import { GameplayScreen } from '../screens/gameplay/GameplayScreen.js';
import { LoreScreen } from '../screens/lore/LoreScreen.js';
import { GameModal, useGameModal } from './GameModal.js';

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
    const techniciansRecruited = useGameState('techniciansRecruited');
    const devotsRecruited = useGameState('devotsRecruited');
    const tutorialStep = useGameState('tutorialStep');

    const [flash, setFlash] = useState(null); // { color, duration }
    const [alarm, setAlarm] = useState(false);
    const [sacrificePeak, setSacrificePeak] = useState(false);
    const [modal, setModal] = useState(null); // { title, content }

    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [deathReason, setDeathReason] = useState(null);
    const [deathDetails, setDeathDetails] = useState(null);
    const [deathStats, setDeathStats] = useState(null);

    // Sistema de Pasos Narrativos
    const currentStep = useGameState('currentStep');
    const stepConfig = STEPS_CONFIG[currentStep];
    const gameModalState = useGameModal();

    // Sincronizar Sequencer al montar (Solo si ya estamos en una partida)
    useEffect(() => {
        if (gameStatus !== 'START_MENU') {
            gameSequencer.init();
        }
    }, []);

    // Lógica de bloqueo de tutorial
    const getModuleTutorialStatus = (areaId) => {
        const isTutorialActive = useGameState('isTutorialActive');
        const tutorialStep = useGameState('tutorialStep');

        // Si no hay tutorial, todo desbloqueado
        if (!isTutorialActive) return { locked: false, highlighted: false };

        switch (tutorialStep) {
            case 1: // Bienvenida - Todo bloqueado (excepto C_HEADER)
                return { locked: true, highlighted: false };
            case 2: // Escaneo - Resaltar BioScan
                if (areaId === 'L_UPPER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 3: // Análisis - Resaltar Analytics
                if (areaId === 'L_LOWER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 4: // Resonancia - Resaltar Oscilloscope
                if (areaId === 'C_FOOTER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 5: // Decisión - Resaltar Operations
                if (areaId === 'C_MAIN') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            case 6: // Recursos - Resaltar Cabezal
                if (areaId === 'C_HEADER') return { locked: false, highlighted: true };
                return { locked: true, highlighted: false };
            default:
                return { locked: false, highlighted: false };
        }
    };

    // Modal de Bienvenida (Omitido ahora por sistema de pasos, pero guardamos la lógica si se requiere)
    /*
    useEffect(() => {
        if (gameStatus === 'PLAYING' && !hasSeenWelcome && currentStep === 1) {
            // ... bienvenida original
        }
    }, [gameStatus, hasSeenWelcome, quota]);
    */

    // Listener para feedback de impacto
    useEffect(() => {
        const onFlash = (data) => {
            // Solo procesar flashes globales o sin target específico
            if (data.target && data.target !== 'GLOBAL') return;

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
        const onCloseModal = () => setModal(null);

        const onSystemFailure = (data) => {
            setDeathReason(data.reason === 'ENERGY_DEPLETED' ? 'ERROR CRÍTICO: Agotamiento de Energía' : 'SUJETO DESCONTROLADO: Inestabilidad Neural');
            setDeathDetails(data.details || data.text);
            setDeathStats(data.stats);
        };

        const onGameEnding = (data) => {
            setDeathReason(`FINAL ALCANZADO: ${data.faction === 'orden' ? 'ORDEN' : 'TRASCENDENCIA'}`);
            setDeathDetails(data.text);
            setDeathStats(data.stats);
        };

        bus.on('TRIGGER_FLASH', onFlash);
        bus.on('SACRIFICE_PEAK', onSacrificePeak);
        bus.on('OPEN_MODAL', onOpenModal);
        bus.on('MODAL_CLOSE_INTERNAL', onCloseModal);
        bus.on('SYSTEM_FAILURE', onSystemFailure);
        bus.on('GAME_ENDING', onGameEnding);
        return () => {
            bus.off('TRIGGER_FLASH', onFlash);
            bus.off('SACRIFICE_PEAK', onSacrificePeak);
            bus.off('OPEN_MODAL', onOpenModal);
            bus.off('MODAL_CLOSE_INTERNAL', onCloseModal);
            bus.off('SYSTEM_FAILURE', onSystemFailure);
            bus.off('GAME_ENDING', onGameEnding);
        };
    }, []);

    const isEclipse = phase === 'ECLIPSE';
    const isCriticalEnergy = energy < 15;
    const isCriticalStability = stability < 15;
    const isGameOver = gameStatus === 'GAME_OVER';
    const isStartMenu = gameStatus === 'START_MENU';
    const isLoreArchive = gameStatus === 'LORE_ARCHIVE';
    const isPaused = state.isPaused;

    // Listener para pausa y Lore (Escape key)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (gameStatus === 'LORE_ARCHIVE') {
                    state.gameStatus = 'PLAYING';
                    return;
                }
                
                if (gameStatus === 'PLAYING') {
                    const newPauseState = !state.isPaused;
                    state.isPaused = newPauseState;
                    bus.emit('GAME_PAUSE', { paused: newPauseState });
                }
            }

            if (e.key.toLowerCase() === 'l' && gameStatus === 'PLAYING' && !state.isPaused && !state.focusMode) {
                state.gameStatus = 'LORE_ARCHIVE';
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus]);

    // Lógica de cálculo de rango
    const getRank = () => {
        // Priorizar estadísticas del final si existen
        const errors = deathStats?.errors !== undefined ? deathStats.errors : judgmentErrors;
        const currentEnergy = deathStats?.energy !== undefined ? deathStats.energy : energy;

        // Si hay errores críticos o falló el sistema, es F
        const isSystemFailure = deathReason && (deathReason.includes('ERROR CRÍTICO') || deathReason.includes('SUJETO DESCONTROLADO'));
        
        if (isSystemFailure || errors > 5) return { label: 'F', color: 'text-red-600', desc: 'FRACASO ABSOLUTO' };
        
        // Si llegamos a un final normal, evaluar desempeño
        if (errors === 0 && currentEnergy > 80) return { label: 'S', color: 'text-amber-400', desc: 'EJECUCIÓN PERFECTA' };
        if (errors <= 2) return { label: 'A', color: 'text-emerald-400', desc: 'DESEMPEÑO SOBRESALIENTE' };
        if (errors <= 5) return { label: 'C', color: 'text-yellow-600', desc: 'DESEMPEÑO ACEPTABLE' };
        return { label: 'D', color: 'text-zinc-500', desc: 'RIESGO OPERATIVO' };
    };

    const rank = getRank();

    // Estilo dinámico del borde del contenedor
    const gridStyle = {
        borderColor: isEclipse ? 'rgba(6, 182, 212, 0.5)' : 'rgba(120, 53, 15, 0.3)',
        boxShadow: alarm ? 'inset 0 0 40px rgba(255, 0, 0, 0.4)' : (isEclipse ? '0 0 30px rgba(6, 182, 212, 0.15)' : '0 0 15px rgba(120, 53, 15, 0.05)'),
        filter: isEclipse ? 'hue-rotate(180deg) contrast(1.1)' : isCriticalEnergy ? 'hue-rotate(-20deg) contrast(1.2)' : 'none'
    };

    // Clases dinámicas para alertas críticas
    const criticalClass = (isCriticalEnergy || isCriticalStability) ? 'animate-vibrate-subtle' : '';
    const energyAlertClass = isCriticalEnergy ? 'shadow-[inset_0_0_100px_rgba(245,158,11,0.4)]' : '';
    const stabilityAlertClass = isCriticalStability ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.4)]' : '';

    return html`
        <div className=${`relative min-h-screen bg-[#1a1a1c] text-zinc-300 overflow-hidden cursor-default select-none font-mono transition-all duration-[1000ms] ${isPaused ? 'grayscale' : ''} ${criticalClass}`}>
            
            <!-- Bordes de Emergencia (Degradado y Vibración) -->
            ${(isCriticalEnergy || isCriticalStability) && html`
                <div className=${`absolute inset-0 pointer-events-none z-[100] border-transparent transition-all duration-1000 animate-pulse-border-critical ${isCriticalEnergy ? 'border-amber-600/30 ' + energyAlertClass : 'border-red-600/30 ' + stabilityAlertClass}`}></div>
            `}

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
                            onClick=${() => {
                                if (currentStep === 1) {
                                    bus.emit('GAME_START');
                                }
                                state.gameStatus = 'PLAYING';
                            }}
                            className="group relative border border-cyan-500/40 bg-cyan-950/20 px-8 py-3 hover:bg-cyan-500/30 transition-all"
                        >
                            <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Iniciar Turno</span>
                            <div className="absolute inset-0 border border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        </button>

                        <button 
                            onClick=${() => state.gameStatus = 'LORE_ARCHIVE'}
                            className="border border-zinc-800 bg-zinc-900/60 px-8 py-2 text-zinc-400 font-mono text-xs hover:text-zinc-200 hover:border-cyan-500/30 transition-all uppercase tracking-widest"
                        >
                            Archivo de Lore
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

            <!-- Archivo de Lore Pantalla Completa -->
            ${isLoreArchive && html`<${LoreScreen} />`}

            <!-- Protocolo de Colapso (Muerte / Final) -->
            <div className=${`death-screen ${isGameOver ? 'active' : ''}`}>
                <div className="flex flex-col items-center space-y-8 max-w-4xl text-center px-4 overflow-y-auto max-h-screen py-12 custom-scrollbar">
                    <h1 className=${`font-mono text-4xl tracking-[0.3em] uppercase font-black ${deathReason && deathReason.includes('FINAL') ? 'text-cyan-500' : 'text-red-600'}`}>
                        ${deathReason && deathReason.includes('FINAL') ? 'PROTOCOLOS COMPLETADOS' : 'BASTIÓN COMPROMETIDO'}
                    </h1>
                    
                    <div className="space-y-6 w-full max-w-2xl">
                        <div className=${`p-4 border bg-zinc-950/40 ${deathReason && deathReason.includes('FINAL') ? 'border-cyan-900/30' : 'border-red-900/30'}`}>
                            <p className=${`font-bold text-xl tracking-widest animate-pulse mb-2 ${deathReason && deathReason.includes('FINAL') ? 'text-cyan-400' : 'text-red-500'}`}>
                                ${deathReason || 'CONEXIÓN CORTADA'}
                            </p>
                            <p className="text-zinc-400 text-[14px] leading-relaxed italic">
                                ${deathDetails || 'La integridad del sistema ha fallado irremediablemente. La biomasa residual ha sido purgada.'}
                            </p>
                        </div>

                        ${deathStats && html`
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6 border-y border-zinc-800/50">
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sujetos Procesados</span>
                                    <span className="text-2xl font-black text-zinc-200">${deathStats.processed || processedCount}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Errores de Juicio</span>
                                    <span className="text-2xl font-black text-red-500">${deathStats.errors !== undefined ? deathStats.errors : judgmentErrors}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Técnicos Reclutados</span>
                                    <span className="text-xl font-bold text-cyan-400">${deathStats.techniciansRecruited || techniciansRecruited}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Devotos Admitidos</span>
                                    <span className="text-xl font-bold text-purple-400">${deathStats.devotsRecruited || devotsRecruited}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Inocentes Sacrificados</span>
                                    <span className="text-xl font-bold text-zinc-400">${deathStats.innocentsSacrificed || stats.innocentsSacrificed}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Corruptos Autorizados</span>
                                    <span className="text-xl font-bold text-zinc-400">${deathStats.corruptsAuthorized || stats.corruptsAuthorized}</span>
                                </div>
                            </div>
                        `}

                        <div className="text-center space-y-2">
                            <div className=${`text-3xl font-black tracking-widest ${rank.color}`}>RANGO: ${rank.label}</div>
                            <div className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">${rank.desc}</div>
                        </div>
                    </div>

                    <div className="flex gap-6 mt-4">
                        <button 
                            onClick=${() => {
                                setDeathReason(null);
                                setDeathDetails(null);
                                setDeathStats(null);
                                gameSequencer.resetLevel();
                                state.gameStatus = 'PLAYING';
                            }}
                            className="group relative px-10 py-4 border border-red-600/50 text-red-400 font-mono text-sm hover:bg-red-900/20 transition-all uppercase tracking-[0.2em] font-bold"
                        >
                            <span className="relative z-10">Reiniciar Nivel</span>
                            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <button 
                            onClick=${() => {
                                setDeathReason(null);
                                setDeathDetails(null);
                                setDeathStats(null);
                                state.resetState();
                            }}
                            className="px-10 py-4 border border-zinc-800 text-zinc-500 font-mono text-sm hover:bg-zinc-900/40 transition-all uppercase tracking-[0.2em]"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>

            <!-- Renderizado Dinámico de Pantallas según Paso Narrativo -->
            <div className=${`transition-all duration-[2000ms] ${isGameOver || isStartMenu || isLoreArchive ? 'opacity-0 pointer-events-none' : ''}`}>
                ${(!isGameOver && !isStartMenu && !isLoreArchive) && (() => {
            if (!stepConfig) return null;

            switch (stepConfig.type) {
                case 'cinematic':
                    return html`<${CinematicScreen} config=${stepConfig} />`;
                case 'mechanic':
                    return html`<${MechanicScreen} config=${stepConfig} />`;
                case 'gameplay':
                default:
                    return html`<${GameplayScreen} getModuleTutorialStatus=${getModuleTutorialStatus} />`;
            }
        })()}
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

            <!-- Nuevo Sistema de Modales Narrativos -->
            <${GameModal} 
                visible=${gameModalState.visible}
                mode=${gameModalState.mode}
                title=${gameModalState.title}
                content=${gameModalState.content}
                isTutorial=${gameModalState.isTutorial}
                stats=${state}
                onContinue=${() => {
            // El botón del modal ya emite MODAL_CLOSE y TUTORIAL_CONTINUE
        }}
            />

            <!-- Sistema de Modales Antiguo (Compatibilidad) -->
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
