/**
 * GAMESEQUENCER.JS
 * Máquina de estados para los 12 pasos narrativos de Nakasthu.
 * Regla 2.A: Vanilla JS puro, comunicación via Bus.emit().
 * 
 * Basado en "La piedra y los desaparecidos" - HistoriaCompleta.md
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { html } from '../ui/utils/html.js';
import { quotaTracker } from './QuotaTracker.js';
import { factionSystem } from './FactionSystem.js';
import { CONFIG } from '../data/gameConfig.js';
import { STEPS_CONFIG } from '../data/stepsConfig.js';
import { MechanicManager } from '../services/MechanicManager.js';
import { calculateJudgmentRecommendation, checkStepMeta } from '../utils/gameplayUtils.js';

/**
 * Clase GameSequencer - Gestiona la progresión narrativa
 */
class GameSequencer {
    constructor() {
        this.currentStep = 1;
        this.storyPath = 0; // 0: Técnico, 1: Religioso
        this.decisionSub = null;
    }

    /**
     * Inicializa el secuenciador sincronizando con State
     */
    init() {
        this.currentStep = state.currentStep || 1;
        this.storyPath = state.storyPath || 0;

        console.log('%c[SEQUENCER] Sistema narrativo inicializado en paso ' + this.currentStep, 'color: #9333ea; font-weight: bold;');

        // Suscribirse a eventos de procesamiento - Limpiar previa si existe
        if (this.decisionSub) this.decisionSub();

        this.decisionSub = bus.on('DECISION_MADE', ({ subject, action }) => {
            this.registerSubjectResult(subject, action);
            this.checkGameStatus();
        });

        // Set initial status based on step type
        const initialStepData = this.getCurrentStepData();
        if (initialStepData.config.type === 'cinematic') {
            state.gameStatus = 'CINEMATIC';
        } else if (initialStepData.config.type === 'mechanic') {
            state.gameStatus = 'MECHANIC';
        } else {
            state.gameStatus = 'PLAYING';
        }

        bus.emit('STEP_CHANGE', initialStepData);
        
        // Inicializar manager de mecánicas para el paso actual
        MechanicManager.init(initialStepData.config);
    }

    /**
     * Obtiene la configuración del paso actual
     */
    getCurrentStepData() {
        const config = STEPS_CONFIG[this.currentStep];
        return {
            step: this.currentStep,
            config,
            storyPath: this.storyPath,
            stats: {
                processedCount: state.processedCount,
                judgmentErrors: state.judgmentErrors,
                techniciansRecruited: state.techniciansRecruited,
                devotsRecruited: state.devotsRecruited,
                influenceGathered: state.influenceGathered
            }
        };
    }

    /**
     * Avanza al siguiente paso de la secuencia
     */
    nextStep() {
        if (this.currentStep >= 12) {
            console.log('%c[SEQUENCER] Secuencia completada. Fin del juego.', 'color: #ef4444;');
            state.gameStatus = 'GAME_OVER';
            bus.emit('GAME_COMPLETE', { finalStep: 12 });
            return false;
        }

        const nextStepIdx = this.currentStep + 1;
        const nextConfig = STEPS_CONFIG[nextStepIdx];

        // Sincronizar con State
        state.startBatch();

        this.finalizeStepTransition(nextStepIdx);
        state.endBatch();
        return true;
    }

    /**
     * Finaliza la transición al nuevo paso (llamado tras decisión de tutorial o directamente)
     */
    finalizeStepTransition(stepIdx) {
        this.currentStep = stepIdx;

        // Emitir evento de cambio de paso para el ModuleRegistry
        bus.emit('STATE_CHANGE:step', this.currentStep);

        state.currentStep = this.currentStep;

        const currentConfig = STEPS_CONFIG[this.currentStep];
        const stepData = this.getCurrentStepData();

        console.log(`%c[SEQUENCER] Avanzando a paso ${this.currentStep}: ${stepData.config.name}`, 'color: #10b981;');

        // Resetear contadores de progreso para el nuevo nivel
        state.processedCount = 0;
        state.judgmentErrors = 0;
        state.techniciansRecruited = 0;
        state.devotsRecruited = 0;
        state.influenceGathered = 0;
        state.utilidadOculta = 0;
        state.quota = currentConfig.subjectCount || CONFIG.DEFAULT_QUOTA;

        // Sincronizar QuotaTracker
        quotaTracker.setQuota(state.quota);

        // Verificar si hay cambio de acto
        if (stepData.config.meta?.actChange) {
            this.storyPath = stepData.config.meta.newStoryPath;
            state.storyPath = this.storyPath;
            bus.emit('ACT_CHANGE', { newAct: this.storyPath });
        }

        // Determine and set Game Status based on step type
        if (state.gameStatus !== 'GAME_OVER') {
            if (stepData.config.type === 'cinematic') {
                state.gameStatus = 'CINEMATIC';
            } else if (stepData.config.type === 'mechanic') {
                state.gameStatus = 'MECHANIC';
            } else {
                state.gameStatus = 'PLAYING';
            }
        }

        bus.emit('STEP_CHANGE', stepData);

        // Inicializar manager de mecánicas para el nuevo paso
        MechanicManager.init(currentConfig);

        // Mostrar modal de briefing SOLO para gameplay (Y si no hay tutorial activo)
        if (stepData.config.type === 'gameplay' && !state.isTutorialActive) {
            bus.emit('STORY_MODAL_OPEN', {
                mode: 'Briefing',
                title: stepData.config.name,
                content: stepData.config.briefingText
            });
        }
    }

    /**
     * Reinicia las variables del nivel actual sin retroceder la historia
     */
    resetLevel() {
        const currentConfig = STEPS_CONFIG[this.currentStep];

        // Sincronizar con State
        state.startBatch();
        state.energy = CONFIG.ENERGY.INITIAL;
        state.stability = CONFIG.STABILITY.INITIAL;
        state.processedCount = 0;
        state.judgmentErrors = 0;
        state.techniciansRecruited = 0;
        state.devotsRecruited = 0;
        state.influenceGathered = 0;
        state.utilidadOculta = 0;
        state.quota = currentConfig.subjectCount || CONFIG.DEFAULT_QUOTA;

        // Sincronizar QuotaTracker
        quotaTracker.setQuota(state.quota);

        state.nextSubject();      // Forzar nuevo sujeto para evitar el mismo
        state.endBatch();

        console.log('%c[SEQUENCER] Nivel reiniciado. Limpieza profunda completada.', 'color: #f59e0b;');
        bus.emit('LEVEL_RESET', { step: this.currentStep });
    }

    /**
     * Registra el resultado de procesar un sujeto
     */
    registerSubjectResult(subject, action) {
        const { utility, influence, type } = subject;

        state.startBatch();
        if (action === 'authorize') {
            if (type === 'técnico') {
                state.techniciansRecruited++;
                state.utilidadOculta += 10;
                factionSystem.registerAction('ORDEN', 1);
            } else if (type === 'devoto') {
                state.devotsRecruited++;
                state.utilidadOculta -= 5; // Balance narrativo
                factionSystem.registerAction('CAOS', 1);
            }

            if (influence) {
                state.influenceGathered += influence;
            }
        } else if (action === 'sacrifice') {
            bus.emit('ACTION_TAKEN', { action: 'SACRIFICE', subjectId: subject.id });
        }
        state.endBatch();
    }

    /**
     * Verifica el estado global para transiciones o fallos críticos
     */
    checkGameStatus() {
        // 1. Verificar Fallo Crítico (Errores de Juicio)
        if (state.judgmentErrors >= CONFIG.MAX_JUDGMENT_ERRORS) {
            console.log('%c[SEQUENCER] Límite de errores alcanzado. FALLO DE SISTEMA.', 'color: #ef4444; font-weight: bold;');
            state.gameStatus = 'GAME_OVER';
            bus.emit('SYSTEM_FAILURE', {
                reason: 'EXCESSIVE_ERRORS',
                errors: state.judgmentErrors
            });
            return;
        }

        // 2. Verificar si se completó la cuota del nivel
        if (state.processedCount >= state.quota) {
            const config = STEPS_CONFIG[this.currentStep];
            const metaResults = checkStepMeta(config.meta);
            
            if (!metaResults.success) {
                console.log('%c[SEQUENCER] Cuota completada pero metas no alcanzadas.', 'color: #f59e0b;');
                if (metaResults.messages.some(m => m.includes('Influencia'))) {
                    bus.emit('SABOTAGE_TRIGGERED', {});
                }
            } else {
                console.log('%c[SEQUENCER] Cuota completada exitosamente.', 'color: #10b981;');
            }
            
            this.nextStep();
        }
    }

    /**
     * Salta inmediatamente a un paso específico (DevMode / Selector de Nivel)
     */
    jumpToStep(stepIndex) {
        if (!STEPS_CONFIG[stepIndex]) {
            console.error(`[SEQUENCER] Paso inválido: ${stepIndex}`);
            return;
        }

        console.log(`%c[SEQUENCER] >>> JUMPING TO STEP ${stepIndex} <<<`, 'color: #fca5a5; font-weight: bold; background: #450a0a; padding: 4px;');

        // 1. Limpieza total del estado anterior
        state.resetState();

        // 2. Limpieza de tutoriales activos (importar controller o emitir evento)
        // Usamos evento para desacoplar si no tenemos acceso directo, pero como es sistema central...
        // Importamos dinámicamente o asumimos que TutorialController escucha el reset, 
        // pero mejor ser explícito si podemos. 
        // Por ahora confiamos en resetState() que pone isTutorialActive false, 
        // pero TutorialController interno necesita resetearse también.
        // Emitiremos un evento de FORCE_RESET
        bus.emit('SYSTEM_FORCE_RESET');

        // 3. Forzar parámetros del paso
        this.currentStep = stepIndex;
        // Reset path only if jumping to early steps, otherwise keep? 
        // For "independent module" testing, we assume path 0 default.
        if (stepIndex <= 3) {
            this.storyPath = 0;
        }

        // 4. Inicializar transición como si fuera carga limpia
        state.startBatch();
        state.currentStep = stepIndex;
        state.storyPath = this.storyPath;
        state.gameStatus = 'LOADING'; // Temporal para evitar ticks locos
        state.endBatch();

        setTimeout(() => {
            this.finalizeStepTransition(stepIndex);

            // Forzar cierre de cualquier modal residual
            bus.emit('UI_MODAL_CLOSE');

            console.log(`[SEQUENCER] Salto completado.`);
        }, 100);
    }

    /**
     * Establece el final elegido
     */
    setEnding(faction) {
        const endings = STEPS_CONFIG[12].meta.endings;
        const endingText = endings[faction];

        state.startBatch();
        // Ya no seteamos GAME_OVER aquí, lo hará nextStep() tras el epílogo
        state.endBatch();

        bus.emit('GAME_ENDING', {
            faction,
            text: endingText,
            stats: {
                techniciansRecruited: state.techniciansRecruited,
                devotsRecruited: state.devotsRecruited,
                influenceGathered: state.influenceGathered,
                processed: state.processedCount,
                errors: state.judgmentErrors,
                energy: state.energy,
                ...state.stats
            }
        });
    }
}

// Singleton export
export const gameSequencer = new GameSequencer();

// Inicializar cuando el juego comienza
bus.on('GAME_START', () => gameSequencer.init());

// Comandos de desarrollo
window.__NAKASTHU_SEQUENCER__ = gameSequencer;
