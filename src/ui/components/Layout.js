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
import { moduleRegistry, MODULES } from '../../systems/ModuleRegistry.js';
import { gameSequencer } from '../../systems/GameSequencer.js';
import { STEPS_CONFIG } from '../../data/stepsConfig.js';
import { CONFIG } from '../../data/gameConfig.js';

// Importar Pantallas
import { CinematicScreen } from '../screens/cinematic/CinematicScreen.js';
import { MechanicScreen } from '../screens/mechanic/MechanicScreen.js';
import { GameplayScreen } from '../screens/gameplay/GameplayScreen.js';
import { LoreScreen } from '../screens/lore/LoreScreen.js';
import { LevelContainer } from '../containers/LevelContainer.js';
import { GameModal, useGameModal } from './GameModal.js';
import { toggleFullScreen, isFullScreen } from '../utils/fullscreen.js';
import { calculateRank } from '../../utils/systemUtils.js';

import { LevelSelectorModal } from './LevelSelectorModal.js';
import { Backdrop3D } from './Backdrop3D.js';
import { FeelLayer, fxReduced, setFxReduced } from './FeelLayer.js';
import { persistenceManager } from '../../systems/PersistenceManager.js';

const { useState, useEffect } = React;

// Mapeo de Áreas de Grid a IDs de Módulo para el sistema de bloqueo
const AREA_TO_MODULE = CONFIG.UI.AREA_TO_MODULE;

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
    const maxErrors = useGameState('maxErrors');
    const techniciansRecruited = useGameState('techniciansRecruited');
    const devotsRecruited = useGameState('devotsRecruited');
    const tutorialStep = useGameState('tutorialStep');
    const isTutorialActive = useGameState('isTutorialActive');
    const activeTutorialId = useGameState('activeTutorialId');
    const storyPath = useGameState('storyPath') || 0;

    // Estado local para forzar re-render al desbloquear módulos
    const [unlockedModules, setUnlockedModules] = useState(new Set(moduleRegistry.activeModules));

    const [flash, setFlash] = useState(null); // { color, duration }
    const [alarm, setAlarm] = useState(false);
    const [decisionPeak, setDecisionPeak] = useState(null); // 'SACRIFICE' | 'AUTHORIZE' | null
    const [modal, setModal] = useState(null); // { title, content }

    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [deathReason, setDeathReason] = useState(null);
    const [deathDetails, setDeathDetails] = useState(null);
    const [deathStats, setDeathStats] = useState(null);
    const [stableRank, setStableRank] = useState(null); // Capturar rango final para evitar parpadeo
    const [isFS, setIsFS] = useState(isFullScreen());

    const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);

    // Listener para pantalla completa
    useEffect(() => {
        const onFSChange = () => setIsFS(isFullScreen());
        document.addEventListener('fullscreenchange', onFSChange);
        return () => document.removeEventListener('fullscreenchange', onFSChange);
    }, []);

    // Listener para desbloqueo de módulos
    useEffect(() => {
        const onModuleUnlock = () => {
            // Filtrar los módulos que están realmente activos (según paso y ruta)
            const activeIds = Object.values(MODULES)
                .filter(m => moduleRegistry.isModuleActive(m.id))
                .map(m => m.id);
            setUnlockedModules(new Set(activeIds));
        };
        bus.on('MODULE_UNLOCKED', onModuleUnlock);
        bus.on('ACT_CHANGE', onModuleUnlock);

        // Ejecutar inicialmente para sincronizar estado si ya hay módulos
        onModuleUnlock();

        return () => {
            bus.off('MODULE_UNLOCKED', onModuleUnlock);
            bus.off('ACT_CHANGE', onModuleUnlock);
        };
    }, []);

    // Función helper para verificar si un módulo está activo y cumple requisitos de ruta
    const isModuleActive = (moduleId) => moduleRegistry.isModuleActive(moduleId);

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

    // Lógica de bloqueo visual
    const getModuleTutorialStatus = (areaId) => {
        const storyPath = state.storyPath || 0;

        // 0. Determinar el ModuleId correcto para el área según la ruta
        let moduleId = AREA_TO_MODULE[areaId];

        // Excepción para R_MIDDLE que depende de la ruta
        if (areaId === 'R_MIDDLE') {
            moduleId = storyPath === 1 ? AREA_TO_MODULE.R_MIDDLE_SECT : AREA_TO_MODULE.R_MIDDLE_TECH;
        }

        // 1. Estado de Bloqueo Base: Si tiene un ID de módulo mapeado y no está activo -> Bloqueado
        let locked = false;

        if (moduleId) {
            // Si es un módulo registrado, verificamos su estado en el registro
            const isRegisteredModule = Object.values(MODULES).some(m => m.id === moduleId);
            if (isRegisteredModule) {
                locked = !moduleRegistry.isModuleActive(moduleId);
            } else {
                locked = false;
            }
        }

        // 2. Resaltado (Highlight) y Foco (Spotlight) durante Tutoriales
        let highlighted = false;

        if (isTutorialActive) {
            // Mapping de Tutorial ID -> Area ID
            const TUTORIAL_TO_AREA = {
                [MODULES.BIOSCAN?.tutorial || 'TUTO_BIOSCAN']: 'L_UPPER',
                [MODULES.ANALYTICS?.tutorial || 'TUTO_ANALYTICS']: 'L_LOWER',
                [MODULES.RESONANCE?.tutorial || 'TUTO_RESONANCE']: 'C_FOOTER',
                [MODULES.OPERATIONS?.tutorial || 'TUTO_OPERATIONS']: 'C_MAIN',
                [MODULES.LORE_ARCHIVE?.tutorial || 'TUTO_LORE']: 'R_UPPER',
                [MODULES.QUOTA_TRACKER?.tutorial || 'TUTO_QUOTA']: 'R_TOP',
                [MODULES.UNREST_METER?.tutorial || 'TUTO_UNREST']: 'R_BOTTOM',
                [MODULES.FACTION_SYSTEM?.tutorial || 'TUTO_FACTION']: 'R_MIDDLE',
                [MODULES.TERMINAL?.tutorial || 'TUTO_TERMINAL']: 'R_MIDDLE',
                [MODULES.PORTAL_MONITOR?.tutorial || 'TUTO_PORTAL']: 'L_BOTTOM'
            };

            // Determinar si esta área es la target del tutorial actual
            if (activeTutorialId && TUTORIAL_TO_AREA[activeTutorialId] === areaId) {
                highlighted = true;
            } else {
                // Dim/Lock todo lo que no sea el target
                // Esto crea el efecto visual de "Foco" y previene interacciones erróneas
                locked = true;
            }
        }

        return { locked, highlighted };
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
            setDecisionPeak('SACRIFICE');
            setTimeout(() => setDecisionPeak(null), 1500);
        };

        const onAuthorizePeak = () => {
            setDecisionPeak('AUTHORIZE');
            setTimeout(() => setDecisionPeak(null), 1500);
        };

        const onOpenModal = (data) => setModal(data);
        const onCloseModal = () => setModal(null);

        const onSystemFailure = (data) => {
            let reasonLabel = 'SISTEMA COMPROMETIDO';
            if (data.reason === 'ENERGY_DEPLETED') reasonLabel = 'ERROR CRÍTICO: Agotamiento de Energía';
            if (data.reason === 'STABILITY_COLLAPSED') reasonLabel = 'SUJETO DESCONTROLADO: Inestabilidad Neural';
            if (data.reason === 'EXCESSIVE_ERRORS') reasonLabel = 'FALLO OPERATIVO: Exceso de Errores';

            setDeathReason(reasonLabel);
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
        bus.on('AUTHORIZE_EFFECT', onAuthorizePeak);
        bus.on('UI_MODAL_OPEN', onOpenModal);
        bus.on('UI_MODAL_CLOSE', onCloseModal);
        bus.on('SYSTEM_FAILURE', onSystemFailure);
        bus.on('GAME_ENDING', onGameEnding);
        return () => {
            bus.off('TRIGGER_FLASH', onFlash);
            bus.off('SACRIFICE_PEAK', onSacrificePeak);
            bus.off('AUTHORIZE_EFFECT', onAuthorizePeak);
            bus.off('UI_MODAL_OPEN', onOpenModal);
            bus.off('UI_MODAL_CLOSE', onCloseModal);
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
    // Cinemáticas y mecánicas piden su plano de cámara a la escena 3D
    const sceneShot = (!isStartMenu && !isGameOver && !isLoreArchive && stepConfig?.type !== 'gameplay') ? stepConfig?.shot : null;

    // Capturar el rango final para evitar parpadeo al reiniciar el nivel
    useEffect(() => {
        if (isGameOver) {
            const currentStats = {
                errors: deathStats?.errors !== undefined ? deathStats.errors : judgmentErrors,
                energy: deathStats?.energy !== undefined ? deathStats.energy : energy,
                maxErrors: maxErrors || 3,
                processed: deathStats?.processed ?? processedCount
            };
            setStableRank(calculateRank(currentStats));
        } else if (stableRank) {
            // Limpiar con retraso después de que la pantalla de muerte desaparezca (1.5s transition)
            const timer = setTimeout(() => setStableRank(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [isGameOver, deathStats, deathReason]);

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


    const rank = calculateRank({
        errors: deathStats?.errors !== undefined ? deathStats.errors : judgmentErrors,
        energy: deathStats?.energy !== undefined ? deathStats.energy : energy,
        maxErrors: maxErrors || 3,
        processed: deathStats?.processed ?? processedCount
    });

    // Estilo dinámico del borde del contenedor
    const gridStyle = {
        borderColor: isEclipse ? 'rgba(147, 51, 234, 0.5)' : 'rgba(120, 53, 15, 0.3)',
        boxShadow: alarm ? 'inset 0 0 40px rgba(255, 0, 0, 0.4)' : (isEclipse ? '0 0 30px rgba(147, 51, 234, 0.15)' : '0 0 15px rgba(120, 53, 15, 0.05)'),
        filter: isEclipse ? 'hue-rotate(280deg) contrast(1.1) brightness(0.8)' : isCriticalEnergy ? 'hue-rotate(-20deg) contrast(1.2)' : 'none'
    };

    // Clases dinámicas para alertas críticas
    const criticalClass = (isCriticalEnergy || isCriticalStability) ? 'animate-vibrate-subtle' : '';
    const energyAlertClass = isCriticalEnergy ? 'shadow-[inset_0_0_100px_rgba(245,158,11,0.4)]' : '';
    const stabilityAlertClass = isCriticalStability ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.4)]' : '';

    return html`
        <div className=${`relative min-h-screen bg-[#0b0b0d] text-zinc-300 overflow-hidden cursor-default select-none font-mono transition-all duration-[1000ms] ${isPaused ? 'grayscale' : ''} ${criticalClass}`}>
            
            <${Backdrop3D}
                dim=${!isStartMenu && !sceneShot}
                sect=${storyPath === 1}
                shot=${sceneShot}
            />

            <!-- Bordes de Emergencia (Degradado y Vibración) -->
            ${(isCriticalEnergy || isCriticalStability) && html`
                <div className=${`absolute inset-0 pointer-events-none z-[100] border-transparent transition-all duration-1000 animate-pulse-border-critical ${isCriticalEnergy ? 'border-amber-600/30 ' + energyAlertClass : 'border-red-600/30 ' + stabilityAlertClass}`}></div>
            `}

            <!-- VFX Perimetral Progresivo -->
            <div 
                className=${`vignette-damage ${alarm || decisionPeak ? 'active-alarm' : ''}`}
                style=${{
            zIndex: 50,
            '--vignette-opacity': decisionPeak ? 1.0 : (alarm ? 0.8 : (isEclipse ? orbitalCycle / 100 : 0)),
            boxShadow: decisionPeak === 'SACRIFICE'
                ? 'inset 0 0 150px rgba(153, 27, 27, 0.9)'
                : decisionPeak === 'AUTHORIZE'
                    ? 'inset 0 0 150px rgba(5, 150, 105, 0.8)'
                    : `inset 0 0 120px rgba(${alarm ? '153, 27, 27' : (isEclipse ? '147, 51, 234' : '0, 0, 0')}, ${alarm ? 0.6 : (isEclipse ? 0.4 : 0)})`
        }}
            >
                <div className="noise-texture"></div>
            </div>

            <!-- Overlay de Pantalla de Inicio -->
            <div className=${`start-menu ${isStartMenu ? 'active' : ''}`}>
                <div className="flex flex-col items-center space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="menu-title font-bold text-zinc-100 opacity-90">NAKASTHU</h1>
                        <p className="text-[11px] text-zinc-400 tracking-[0.2em] uppercase px-4">SISTEMA DE GESTIÓN DE BIOMASA v.15.0</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-64 max-w-[80vw]">
                        <button 
                            onClick=${() => {
            bus.emit('GAME_START');
        }}
                            className="group relative border border-cyan-500/40 bg-cyan-950/20 px-8 py-3 hover:bg-cyan-500/30 transition-all"
                        >
                            <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Iniciar Juego</span>
                            <div className="absolute inset-0 border border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        </button>

                        <button 
                            onClick=${() => setIsLevelSelectorOpen(true)}
                            className="group relative border border-zinc-800 bg-zinc-900/10 px-8 py-3 hover:bg-zinc-800 transition-all"
                        >
                            <span className="text-zinc-500 group-hover:text-zinc-300 font-mono text-[10px] tracking-[0.2em] uppercase">Selector de Secuencias</span>
                        </button>

                        <button 
                            onClick=${() => state.gameStatus = 'LORE_ARCHIVE'}
                            className="border border-zinc-800 bg-zinc-900/60 px-8 py-2 text-zinc-400 font-mono text-xs hover:text-zinc-200 hover:border-cyan-500/30 transition-all uppercase tracking-widest"
                        >
                            Archivo de Lore
                        </button>
                        
                        <button 
                            onClick=${() => bus.emit('UI_MODAL_OPEN', { title: 'CONFIGURACIÓN', content: 'AJUSTES TÉCNICOS DEL NÚCLEO BASTIÓN.' })}
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
                    ${(() => {
            const isFinal = deathReason && deathReason.includes('FINAL');
            const isProtocol = deathReason && deathReason.includes('PROTOCOL');
            const isErrors = deathReason && deathReason.includes('EXCESSIVE');

            let headerText = 'BASTIÓN COMPROMETIDO';
            let headerColor = 'text-red-600';

            if (isFinal) {
                headerText = 'PROTOCOLOS COMPLETADOS';
                headerColor = 'text-cyan-500';
            } else if (isProtocol) {
                headerText = 'DESEMPEÑO INSUFICIENTE';
                headerColor = 'text-amber-500';
            } else if (isErrors) {
                headerText = 'OPERADOR RELEVADO';
                headerColor = 'text-red-800';
            }

            return html`<h1 className=${`font-mono text-2xl sm:text-4xl tracking-[0.15em] sm:tracking-[0.3em] uppercase font-black ${headerColor}`}>
                            ${headerText}
                        </h1>`;
        })()}
                    
                    <div className="space-y-6 w-full max-w-2xl">
                        <div className=${`p-4 border bg-zinc-950/40 ${deathReason && (deathReason.includes('FINAL') || deathReason.includes('PROTOCOL')) ? 'border-cyan-900/30' : 'border-red-900/30'}`}>
                            <p className=${`font-bold text-xl tracking-widest animate-pulse mb-2 ${deathReason && (deathReason.includes('FINAL') || deathReason.includes('PROTOCOL')) ? 'text-cyan-400' : 'text-amber-500'}`}>
                                ${deathReason || 'CONEXIÓN CORTADA'}
                            </p>
                            <p className="text-zinc-400 text-[14px] leading-relaxed italic">
                                ${deathDetails || 'La integridad del sistema ha fallado irremediablemente. La biomasa residual ha sido purgada.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6 border-y border-zinc-800/50">
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sujetos Procesados</span>
                                <span className="text-2xl font-black text-zinc-200">${deathStats?.processed ?? processedCount}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Errores de Juicio</span>
                                <span className="text-2xl font-black text-red-500">${deathStats?.errors ?? judgmentErrors}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Energía Final</span>
                                <span className="text-xl font-bold text-amber-400">${deathStats?.energy ?? energy}%</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Estabilidad Final</span>
                                <span className="text-xl font-bold text-red-400">${Math.round(deathStats?.stability ?? stability)}%</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Inocentes Sacrificados</span>
                                <span className="text-xl font-bold text-zinc-400">${deathStats?.innocentsSacrificed ?? stats.innocentsSacrificed}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-900/40 border border-zinc-800/30">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Corruptos Autorizados</span>
                                <span className="text-xl font-bold text-zinc-400">${deathStats?.corruptsAuthorized ?? stats.corruptsAuthorized}</span>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <div className=${`text-3xl font-black tracking-widest ${stableRank?.color || rank.color}`}>RANGO: ${stableRank?.label || rank.label}</div>
                            <div className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">${stableRank?.desc || rank.desc}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
                        <button 
                            onClick=${() => {
            setDeathReason(null);
            setDeathDetails(null);
            setDeathStats(null);
            gameSequencer.resetLevel();
            state.gameStatus = 'PLAYING';
        }}
                            className="group relative px-6 sm:px-10 py-4 border border-red-600/50 text-red-400 font-mono text-sm hover:bg-red-900/20 transition-all uppercase tracking-[0.2em] font-bold"
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
                            className="px-6 sm:px-10 py-4 border border-zinc-800 text-zinc-500 font-mono text-sm hover:bg-zinc-900/40 transition-all uppercase tracking-[0.2em]"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>

            <!-- Renderizado Dinámico de Pantallas según Paso Narrativo -->
            <div className=${`transition-all duration-[2000ms] ${isGameOver || isStartMenu || isLoreArchive ? 'opacity-0 pointer-events-none' : ''}`}>
                ${(!isGameOver && !isStartMenu && !isLoreArchive) && html`
                    <${LevelContainer} 
                        stepConfig=${stepConfig} 
                        getModuleTutorialStatus=${getModuleTutorialStatus} 
                        unlockedModules=${unlockedModules} 
                    />
                `}
            </div>

            <!-- Modal de Pausa -->
            ${isPaused && html`
                <div className="modal-overlay z-[700]">
                    <div className="bg-zinc-950 border border-cyan-900/50 p-6 sm:p-12 max-w-[94vw] text-center space-y-6">
                        <h2 className="text-cyan-500 font-mono text-2xl tracking-[0.5em] animate-pulse">SISTEMA EN ESPERA</h2>
                        <p className="text-zinc-500 text-[10px] tracking-widest uppercase">INTERRUPCIÓN DE FLUJO NEURAL DETECTADA</p>
                        <button 
                            onClick=${() => state.isPaused = false}
                            className="px-8 py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-[0.3em] text-xs"
                        >
                            Reanudar Conexión
                        </button>

                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-cyan-900/30">
                            <button 
                                onClick=${() => {
                gameSequencer.resetLevel();
                state.isPaused = false;
            }}
                                className="px-4 py-2 border border-amber-900/30 text-amber-600 hover:bg-amber-900/10 transition-all uppercase tracking-widest text-[10px]"
                            >
                                Reiniciar Nivel
                            </button>
                            <button 
                                onClick=${() => {
                persistenceManager.saveGame(state);
                state.isPaused = false;
            }}
                                className="px-4 py-2 border border-emerald-900/30 text-emerald-600 hover:bg-emerald-900/10 transition-all uppercase tracking-widest text-[10px]"
                            >
                                Guardar Partida
                            </button>
                            <button 
                                onClick=${() => {
                state.resetState();
                state.isPaused = false;
            }}
                                className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:bg-zinc-900/40 transition-all uppercase tracking-widest text-[10px]"
                            >
                                Reiniciar Juego
                            </button>
                            <button 
                                onClick=${() => {
                state.resetState();
                state.gameStatus = 'START_MENU';
                state.isPaused = false;
            }}
                                className="px-4 py-2 border border-red-900/30 text-red-700 hover:bg-red-900/10 transition-all uppercase tracking-widest text-[10px]"
                            >
                                Salir al Menú
                            </button>
                        </div>

                        <button 
                            onClick=${toggleFullScreen}
                            className="w-full mt-4 px-6 py-2 border border-zinc-800 text-zinc-500 hover:text-cyan-500 hover:border-cyan-500/30 transition-all uppercase tracking-widest text-[10px]"
                        >
                            ${isFS ? 'Desactivar Fullscreen' : 'Activar Fullscreen'}
                        </button>
                    </div>
                </div>
            `}

            <${LevelSelectorModal} 
                isOpen=${isLevelSelectorOpen} 
                onClose=${() => setIsLevelSelectorOpen(false)} 
            />

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

            <!-- Sistema de Modales Antiguo (Compatibilidad UI) -->
            ${modal && !gameModalState.visible && html`
                <div className="modal-overlay" onClick=${() => setModal(null)}>
                    <div className="bg-[#1a1a1c] border border-zinc-800 p-6 w-[500px] max-w-[94vw] max-h-[90dvh] overflow-y-auto shadow-2xl relative" onClick=${e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <h2 className="text-zinc-300 font-bold tracking-widest uppercase text-sm">${modal.title}</h2>
                            <button onClick=${() => setModal(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                        </div>
                        <div className="text-zinc-400 font-mono text-[12px] leading-relaxed my-4">
                            ${modal.content}
                            ${modal.title === 'CONFIGURACIÓN' && html`
                                <div className="mt-6 p-4 border border-zinc-800 bg-black/40 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Visualización</span>
                                        <button 
                                            onClick=${toggleFullScreen}
                                            className="px-4 py-1 border border-cyan-900/50 text-cyan-500 text-[10px] hover:bg-cyan-500/10 transition-all uppercase tracking-widest"
                                        >
                                            ${isFS ? 'Salir Pantalla Completa' : 'Entrar Pantalla Completa'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Sacudidas y sellos</span>
                                        <button
                                            onClick=${() => { setFxReduced(!fxReduced()); setModal({ ...modal }); }}
                                            className="px-4 py-1 border border-cyan-900/50 text-cyan-500 text-[10px] hover:bg-cyan-500/10 transition-all uppercase tracking-widest"
                                        >
                                            ${fxReduced() ? 'Reducidos' : 'Completos'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center opacity-50">
                                        <span className="text-zinc-600 uppercase tracking-widest text-[10px]">Calidad_Neural</span>
                                        <span className="text-zinc-700 text-[10px]">MÁXIMA</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 border border-zinc-800 bg-black/40 space-y-4">
                                    <h3 className="text-zinc-500 uppercase tracking-widest text-[10px] border-b border-zinc-800 pb-2 mb-2">Selector de Nivel [DEV]</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        ${Object.entries(STEPS_CONFIG).map(([id, config]) => html`
                                            <button 
                                                onClick=${() => {
                gameSequencer.jumpToStep(parseInt(id));
                setModal(null);
            }}
                                                className="px-2 py-2 border border-zinc-800 text-zinc-500 hover:text-cyan-400 hover:border-cyan-900/50 transition-all uppercase tracking-widest text-[9px] text-left truncate"
                                            >
                                                ${id}. ${config.name}
                                            </button>
                                        `)}
                                    </div>
                                </div>
                            `}
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

            <${FeelLayer} />

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
