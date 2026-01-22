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

/**
 * Configuración de los 12 pasos narrativos.
 * Cada paso tiene: type, name, briefingText, meta (objetivos ocultos), subjectCount
 */
export const STEPS_CONFIG = {
    1: {
        type: 'cinematic',
        name: 'La Avanzadilla',
        briefingText: 'Kael, Deyar y Alexia. Tres sombras modificadas descendieron a Zhyr. No buscaban gloria, buscaban la Piedra. Pero la Piedra los encontró primero.',
        meta: null
    },
    2: {
        type: 'mechanic',
        name: 'El Contacto',
        briefingText: 'La sincronización neural con el Bastión requiere contacto absoluto. El Monolito pulsa. Mantén la conexión o el sistema colapsa.',
        meta: { syncRequired: 100 }
    },
    3: {
        type: 'cinematic',
        name: 'El Gran Desvío',
        briefingText: 'La Piedra despertó. Un tercio de la humanidad se desvaneció en un parpadeo. El caos reina en las Distribuciones. Tú eres el Operador del Bastión, el último filtro entre el orden y la extinción.',
        meta: null
    },
    4: {
        type: 'gameplay',
        name: 'Reconstrucción',
        briefingText: 'Orval Drexler ha ordenado la reconstrucción. Necesitamos mano de obra calificada. Evalúa los sujetos según su utilidad técnica.',
        subjectCount: 10,
        meta: {
            requiredTechnicians: 6,
            hiddenGoal: 'Estabilizar el país con técnicos cualificados'
        }
    },
    5: {
        type: 'cinematic',
        name: 'La Grieta Social',
        briefingText: 'Las plazas de Dispay arden. La gente no quiere trabajar, quiere a sus desaparecidos. En el BioScan, las lecturas empiezan a mostrar algo más que carne: muestran ecos, susurros de los que se fueron.',
        meta: null
    },
    6: {
        type: 'gameplay',
        name: 'La Urgencia',
        briefingText: 'El tiempo apremia. Los disturbios se intensifican. Procesa los sujetos con rapidez. [ADVERTENCIA: Anomalía detectada en cola de espera]',
        subjectCount: 7,
        meta: {
            kaminAppears: true,
            kaminPosition: 7,
            timeMultiplier: 1.5
        }
    },
    7: {
        type: 'cinematic',
        name: 'El Mensajero de Aitor',
        briefingText: 'Kamin no habla de odio, habla de esperanza. Dice que el portal es un regalo, un Renacimiento. Su voz calma el zumbido de las máquinas. La gente empieza a escucharlo.',
        meta: { actChange: true, newStoryPath: 1 }
    },
    8: {
        type: 'gameplay',
        name: 'El Convencimiento',
        briefingText: 'La secta de Kamin crece. Necesitamos sujetos con alta influencia para estabilizar la situación. Si fallas en reclutar suficientes devotos, el Bastión sufrirá sabotajes.',
        subjectCount: 5,
        meta: {
            requiredInfluence: 3,
            penaltyOnFail: 'sabotage'
        }
    },
    9: {
        type: 'cinematic',
        name: 'La Fe Ciega',
        briefingText: 'Ya no hay ciudadanos, solo devotos. El Bastión hiede a incienso y aceite de máquina. La fe es el nuevo combustible de la Nakara.',
        meta: null
    },
    10: {
        type: 'gameplay',
        name: 'La Cosecha de Adeptos',
        briefingText: 'Admisión masiva. Ya no importa la técnica, solo la cantidad. El Bastión necesita cuerpos. El propósito es secundario.',
        subjectCount: 15,
        meta: {
            massAdmission: true,
            coreColorOverride: 'purple'
        }
    },
    11: {
        type: 'mechanic',
        name: 'El Juicio Final',
        briefingText: 'El terminal se divide. Leina intenta cerrar la brecha. Kamin exige el sacrificio final. Tu desempeño determinará el destino.',
        meta: {
            dualChoice: true,
            leftOption: { name: 'ESTABILIZAR', faction: 'orden', color: 'cyan' },
            rightOption: { name: 'TRASCENDER', faction: 'caos', color: 'purple' }
        }
    },
    12: {
        type: 'cinematic',
        name: 'Epílogo',
        briefingText: null, // Se determina según el final elegido
        meta: {
            endings: {
                orden: 'Cierras el portal. La humanidad sobrevive en un mundo roto, pero real. Leina te mira con gratitud silenciosa.',
                caos: 'Kamin empuja a Leina hacia la grieta. Las sombras devoran el Bastión. "El renacimiento nunca es sencillo", susurra antes de desvanecerse.'
            }
        }
    }
};

/**
 * Clase GameSequencer - Gestiona la progresión narrativa
 */
class GameSequencer {
    constructor() {
        this.currentStep = 1;
        this.gameData = {
            score: 0,
            energia: 100,
            cuota: 10,
            utilidadOculta: 0,
            techniciansRecruited: 0,
            devotsRecruited: 0,
            influenceGathered: 0
        };
        this.storyPath = 0; // 0: Técnico, 1: Religioso
    }

    /**
     * Inicializa el secuenciador sincronizando con State
     */
    init() {
        this.currentStep = state.currentStep || 1;
        this.storyPath = state.storyPath || 0;

        if (state.gameData) {
            this.gameData = { ...this.gameData, ...state.gameData };
        }

        console.log('%c[SEQUENCER] Sistema narrativo inicializado en paso ' + this.currentStep, 'color: #9333ea; font-weight: bold;');
        bus.emit('STEP_CHANGE', this.getCurrentStepData());
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
            gameData: { ...this.gameData }
        };
    }

    /**
     * Avanza al siguiente paso de la secuencia
     */
    nextStep() {
        if (this.currentStep >= 12) {
            console.log('%c[SEQUENCER] Secuencia completada. Fin del juego.', 'color: #ef4444;');
            bus.emit('GAME_COMPLETE', { finalStep: 12 });
            return false;
        }

        const nextStepIdx = this.currentStep + 1;
        const nextConfig = STEPS_CONFIG[nextStepIdx];

        // Sincronizar con State
        state.startBatch();

        // REGLA ESPECIAL: Opción de tutorial al iniciar el primer Gameplay (Paso 4)
        if (nextStepIdx === 4 && !state.tutorialChoiceMade) {
            bus.emit('OPEN_MODAL', {
                title: 'PROTOCOLO DE INDUCCIÓN - OPERADOR',
                content: html`
                    <div className="space-y-4 text-[14px] font-mono">
                        <p className="font-bold text-amber-500">IDENTIDAD CONFIRMADA. ENLACE ESTABLECIDO.</p>
                        <p>¿Desea iniciar el protocolo de inducción asistida? [TUTORIAL]</p>
                        <p className="text-zinc-500 italic text-[12px]">"La ignorancia es el primer paso hacia el colapso de integridad."</p>
                    </div>
                `,
                footer: html`
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick=${() => {
                        state.tutorialChoiceMade = true;
                        state.isTutorialActive = true;
                        state.tutorialStep = 1;
                        bus.emit('MODAL_CLOSE_INTERNAL');
                        this.finalizeStepTransition(nextStepIdx);
                    }}
                            className="flex-1 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase text-[12px] tracking-widest"
                        >
                            ACEPTAR PROTOCOLO
                        </button>
                        <button 
                            onClick=${() => {
                        state.tutorialChoiceMade = true;
                        state.isTutorialActive = false;
                        state.tutorialStep = 0;
                        bus.emit('MODAL_CLOSE_INTERNAL');
                        this.finalizeStepTransition(nextStepIdx);
                    }}
                            className="flex-1 py-2 bg-zinc-950 border border-red-900/30 text-red-900/60 hover:text-red-600 transition-all uppercase text-[10px] tracking-tighter"
                        >
                            SALTAR [AUTO-DIDACTA]
                        </button>
                    </div>
                `
            });
            state.endBatch();
            return true;
        }

        this.finalizeStepTransition(nextStepIdx);
        state.endBatch();
        return true;
    }

    /**
     * Finaliza la transición al nuevo paso (llamado tras decisión de tutorial o directamente)
     */
    finalizeStepTransition(stepIdx) {
        this.currentStep = stepIdx;
        state.currentStep = this.currentStep;

        const stepData = this.getCurrentStepData();

        console.log(`%c[SEQUENCER] Avanzando a paso ${this.currentStep}: ${stepData.config.name}`, 'color: #10b981;');

        // Verificar si hay cambio de acto
        if (stepData.config.meta?.actChange) {
            this.storyPath = stepData.config.meta.newStoryPath;
            state.storyPath = this.storyPath;
            bus.emit('ACT_CHANGE', { newAct: this.storyPath });
        }

        bus.emit('STEP_CHANGE', stepData);

        // Mostrar modal de briefing SOLO para gameplay (Y si no hay tutorial activo)
        if (stepData.config.type === 'gameplay' && !state.isTutorialActive) {
            bus.emit('MODAL_SHOW', {
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

        // Reiniciar datos del nivel a sus valores iniciales
        this.gameData = {
            score: 0,
            energia: 100,
            cuota: currentConfig.subjectCount || 10,
            utilidadOculta: 0,
            techniciansRecruited: 0,
            devotsRecruited: 0,
            influenceGathered: 0
        };

        // Sincronizar con State
        state.startBatch();
        state.gameData = { ...this.gameData };
        state.energy = 100;
        state.stability = 100;
        state.processedCount = 0;
        state.judgmentErrors = 0; // También reiniciar errores de juicio
        state.nextSubject();      // Forzar nuevo sujeto para evitar el mismo
        state.endBatch();

        console.log('%c[SEQUENCER] Nivel reiniciado. Limpieza profunda completada.', 'color: #f59e0b;');
        bus.emit('LEVEL_RESET', { step: this.currentStep, gameData: this.gameData });
    }

    /**
     * Registra el resultado de procesar un sujeto
     */
    recordSubjectResult(result) {
        const { accepted, subjectType, influence } = result;

        if (accepted) {
            if (subjectType === 'technician') {
                this.gameData.techniciansRecruited++;
                this.gameData.utilidadOculta += 10;
            } else if (subjectType === 'devot') {
                this.gameData.devotsRecruited++;
                this.gameData.utilidadOculta -= 5; // Balance narrativo
            }

            if (influence) {
                this.gameData.influenceGathered += influence;
            }
        }

        // Actualizar State
        state.gameData = { ...this.gameData };

        bus.emit('SUBJECT_PROCESSED', { gameData: this.gameData });
    }

    /**
     * Verifica si se cumplen las metas ocultas del paso
     */
    checkStepMeta() {
        const config = STEPS_CONFIG[this.currentStep];
        const meta = config.meta;

        if (!meta) return { success: true };

        const results = { success: true, messages: [] };

        // Verificar técnicos requeridos (Paso 4)
        if (meta.requiredTechnicians) {
            if (this.gameData.techniciansRecruited < meta.requiredTechnicians) {
                results.success = false;
                results.messages.push(`Técnicos insuficientes: ${this.gameData.techniciansRecruited}/${meta.requiredTechnicians}`);
            }
        }

        // Verificar influencia requerida (Paso 8)
        if (meta.requiredInfluence) {
            if (this.gameData.influenceGathered < meta.requiredInfluence) {
                results.success = false;
                results.messages.push('Influencia insuficiente. Sabotaje inminente.');
                bus.emit('SABOTAGE_TRIGGERED', {});
            }
        }

        return results;
    }

    /**
     * Calcula la recomendación del sistema para el Juicio Final
     */
    calculateJudgmentRecommendation() {
        const techScore = (this.gameData.techniciansRecruited / 16) * 100; // Max ~16 técnicos
        const faithScore = (this.gameData.devotsRecruited / 20) * 100; // Max ~20 devotos

        const weightedTech = techScore * 0.7;
        const weightedFaith = faithScore * 0.3;

        return {
            techPercentage: Math.min(100, Math.round(techScore)),
            faithPercentage: Math.min(100, Math.round(faithScore)),
            recommendation: weightedTech >= weightedFaith ? 'ESTABILIZAR' : 'TRASCENDER',
            dominant: weightedTech >= weightedFaith ? 'orden' : 'caos'
        };
    }

    /**
     * Establece el final elegido
     */
    setEnding(faction) {
        const endings = STEPS_CONFIG[12].meta.endings;
        const endingText = endings[faction];

        state.startBatch();
        state.gameStatus = 'GAME_OVER';
        state.endBatch();

        bus.emit('GAME_ENDING', {
            faction,
            text: endingText,
            stats: { ...this.gameData }
        });
    }
}

// Singleton export
export const gameSequencer = new GameSequencer();

// Inicializar cuando el juego comienza
bus.on('GAME_START', () => gameSequencer.init());

// Comandos de desarrollo
window.__NAKASTHU_SEQUENCER__ = gameSequencer;
