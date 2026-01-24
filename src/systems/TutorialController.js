/**
 * TUTORIALCONTROLLER.JS
 * Sistema modular de tutoriales basado en ModuleRegistry.
 * Regla 2.A: Vanilla JS.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { MODULES, localizeTutorialText } from './ModuleRegistry.js';

// Definición del contenido de tutoriales por módulo (Ruta Técnica)
const TUTORIAL_CONTENT = {
    [MODULES.BIOSCAN?.tutorial || 'TUTO_BIOSCAN']: {
        title: 'MÓDULO DESBLOQUEADO: BIOSCAN',
        steps: [
            "Localice el [[MOD-01]] a su izquierda. Este es su ojo principal en el Bastión.",
            "Realice un ESCANEO TÉRMICO para identificar la firma de calor del sujeto.",
            "Compare los resultados con los parámetros biológicos estándar (36.5°C - 37.5°C)."
        ]
    },
    [MODULES.ANALYTICS?.tutorial || 'TUTO_ANALYTICS']: {
        title: 'MÓDULO DESBLOQUEADO: ANALYTICS',
        steps: [
            "Observe el [[MOD-02]] superior. El Motor Analítico procesa los datos crudos.",
            "Detecte anomalías en la sincronización neural. Valores bajos indican inestabilidad o desincronización.",
            "Use estos datos para juzgar la legitimidad de la solicitud de ingreso."
        ]
    },
    [MODULES.RESONANCE?.tutorial || 'TUTO_RESONANCE']: {
        title: 'MÓDULO DESBLOQUEADO: RESONANCIA',
        steps: [
            "El [[MOD-06]] inferior gestiona el enlace neural directo.",
            "Sincronice la frecuencia hasta superar el 85% para estabilizar la conexión.",
            "Una conexión inestable aumentará el consumo de energía y riesgo de corrupción."
        ]
    },
    [MODULES.OPERATIONS?.tutorial || 'TUTO_OPERATIONS']: {
        title: 'PROTOCOLO: OPERACIONES',
        steps: [
            "Use el [[MOD-04]] central para emitir el juicio final.",
            "[AUTORIZAR]: Permite el ingreso al Bastión. Consume estabilidad si hay error.",
            "[SACRIFICAR]: Elimina la amenaza. Restaura estabilidad, pero tiene coste moral."
        ]
    },
    [MODULES.LORE_ARCHIVE?.tutorial || 'TUTO_LORE']: {
        title: 'ACCESO: ARCHIVO LORE',
        steps: [
            "El comando `/lore` desbloquea el acceso a la memoria recuperada de Zhyr.",
            "Busque pistas en los diálogos de NPC para desbloquear nuevas entradas.",
            "La información es poder. Úsela para desbloquear comandos ocultos."
        ]
    },
    [MODULES.QUOTA_TRACKER?.tutorial || 'TUTO_QUOTA']: {
        title: 'PROTOCOLO: CUOTAS',
        steps: [
            "El Bastión exige resultados. Cada ciclo tiene un objetivo de producción.",
            "Complete el procesamiento de sujetos válidos para cumplir la cuota.",
            "Fallar repetidamente en la cuota atraerá la atención de Kamin. Y no querrá eso."
        ]
    },
    [MODULES.UNREST_METER?.tutorial || 'TUTO_UNREST']: {
        title: 'ALERTA: DISTURBIOS CIVILES',
        steps: [
            "El descontento en los sectores bajos ha alcanzado niveles críticos.",
            "El Medidor de Disturbios rastrea la tensión social. Rechazos injustificados aumentan la tensión.",
            "Si el nivel llega a CRÍTICO, ocurrirán sabotajes automáticos."
        ]
    },
    [MODULES.FACTION_SYSTEM?.tutorial || 'TUTO_FACTION']: {
        title: 'ANÁLISIS: FACCIONES',
        steps: [
            "La sociedad se divide. 'Orden' (Técnicos) vs 'Caos' (Devotos).",
            "Sus decisiones alimentan una de estas fuerzas. El equilibrio es frágil.",
            "Visualice el dominio ideológico en el nuevo panel. Desbloqueará opciones únicas."
        ]
    },
    [MODULES.TERMINAL?.tutorial || 'TUTO_TERMINAL']: {
        title: 'ACCESO: TERMINAL DE COMANDOS',
        steps: [
            "El [[MOD-09]] permite una intervención directa en los sistemas de Zhyr.",
            "Escriba comandos para interactuar. Use `HELP` para ver la lista de comandos disponibles.",
            "Algunas funciones críticas requieren autorización previa o estados de emergencia."
        ]
    },
    [MODULES.PORTAL_MONITOR?.tutorial || 'TUTO_PORTAL']: {
        title: 'ALERTA: INESTABILIDAD DIMENSIONAL',
        steps: [
            "El Portal se debilita. La exposición constante a sujetos anómalos corroe la realidad.",
            "Supervise el Monitor de Flujo. Si baja del 30%, ocurrirán fugas de vacío.",
            "Debe invertir recursos para ESTABILIZAR el portal manualmente si decae demasiado."
        ]
    }
};

// Definición del contenido de tutoriales por módulo (Ruta Sectaria)
const TUTORIAL_CONTENT_SECTARIAN = {
    [MODULES.BIOSCAN?.tutorial || 'TUTO_BIOSCAN']: {
        title: 'REVELACIÓN: ALTAR DE EXAMEN',
        steps: [
            "Observe el [[MOD-01]]. No solo vemos carne, vemos la pureza de la esencia.",
            "Realice una LECTURA DE AURA para identificar la vibración del sujeto.",
            "Busque la sintonía perfecta. Solo los puros de espíritu heredarán el Bastión."
        ]
    },
    [MODULES.ANALYTICS?.tutorial || 'TUTO_ANALYTICS']: {
        title: 'REVELACIÓN: EMANACIONES DEL ALMA',
        steps: [
            "El [[MOD-02]] superior traduce los susurros del vacío.",
            "Mida la Corrupción del Alma. Un alma manchada por la duda es un riesgo para la Comunión.",
            "Use estas visiones para decidir quién merece la iluminación."
        ]
    },
    [MODULES.RESONANCE?.tutorial || 'TUTO_RESONANCE']: {
        title: 'REVELACIÓN: SINCRO-FE',
        steps: [
            "El [[MOD-06]] inferior es el nexo de sintonía espiritual.",
            "Alinee las frecuencias del alma con el latido del Aitor hasta el 85%.",
            "La falta de fe (desincronización) debilita nuestra conexión con lo sagrado."
        ]
    },
    [MODULES.OPERATIONS?.tutorial || 'TUTO_OPERATIONS']: {
        title: 'RITUAL: CONSAGRACIÓN',
        steps: [
            "El [[MOD-04]] es su altar de juicio. El destino de las almas está en sus manos.",
            "[CONSAGRAR]: Recibe al adepto en nuestra fe. Fortalece la comunión.",
            "[PURGAR]: Libera al impuro de su carga física. El Aitor requiere sacrificios."
        ]
    },
    [MODULES.QUOTA_TRACKER?.tutorial || 'TUTO_QUOTA']: {
        title: 'RITUAL: LA COSECHA',
        steps: [
            "El Aitor exige una cuota de almas para mantener el Velo.",
            "Complete la cosecha de adeptos para asegurar nuestra supervivencia espiritual.",
            "Si la cosecha falla, el Velo se rasgará. Y el vacío entrará."
        ]
    },
    [MODULES.TERMINAL?.tutorial || 'TUTO_TERMINAL']: {
        title: 'REVELACIÓN: SUSURROS DEL VACÍO',
        steps: [
            "El [[MOD-09]] es su canal directo con la voz del Aitor.",
            "Escuche los susurros y responda. Use el lenguaje sagrado para intervenir en la realidad.",
            "Ciertos rituales de comando solo pueden ser ejecutados en estados de éxtasis o crisis."
        ]
    },
    [MODULES.UNREST_METER?.tutorial || 'TUTO_UNREST']: {
        title: 'ALERTA: AGITACIÓN HERÉTICA',
        steps: [
            "Los no creyentes se agitan en las sombras del Bastión.",
            "El Monitor de Agitación mide el riesgo de Cisma. Las purgas injustas alimentan la herejía.",
            "Si la agitación desborda, los infieles sabotearán nuestros sistemas sagrados."
        ]
    },
    [MODULES.FACTION_SYSTEM?.tutorial || 'TUTO_FACTION']: {
        title: 'VISIÓN: SINTONÍA DEL ALMA',
        steps: [
            "El mundo se divide entre el Dogma y el Éxtasis.",
            "Sus actos inclinan la balanza del destino. Busque la sintonía con el Aitor.",
            "Observe el Panel de Comunión. El dominio de nuestra fe desbloqueará milagros técnicos."
        ]
    },
    [MODULES.PORTAL_MONITOR?.tutorial || 'TUTO_PORTAL']: {
        title: 'ALERTA: DEBILIDAD DEL VELO',
        steps: [
            "El Velo entre mundos se desgarra. La presencia del Aitor exige un conducto estable.",
            "Vigile la Estabilidad del Velo. Si decae, las sombras del vacío se filtrarán.",
            "Debe realizar oraciones de estabilización (recursos) si el Velo empieza a rasgarse."
        ]
    }
};

import { html } from '../ui/utils/html.js';

class TutorialController {
    constructor() {
        this.activeTutorialId = null;
        this.currentStepIndex = 0;
        this.isModalOpen = false;
        this.proposalQueue = []; // Cola para tutoriales pendientes
        this.init();
    }

    init() {
        // Escuchar desbloqueo de módulos
        bus.on('MODULE_UNLOCKED', (data) => {
            const hasContent = TUTORIAL_CONTENT[data.tutorialId] || TUTORIAL_CONTENT_SECTARIAN[data.tutorialId];
            if (data.tutorialId && hasContent) {
                this.proposeTutorial(data.id, data.name, data.tutorialId);
            }
        });

        // Escuchar cambios de estado para procesar la cola
        bus.on('STATE_CHANGE:gameStatus', (status) => {
            console.log(`[TUTORIAL] Game status changed to: ${status}. Checking queue...`);
            if (status === 'PLAYING') {
                // Pequeño delay para dejar que la UI se asiente tras una cinemática
                setTimeout(() => this.checkQueue(), 1000);
            }
        });

        // Avance manual desde el modal
        bus.on('TUTORIAL_CONTINUE', () => {
            this.nextStep();
        });

        // Cierre de modal
        bus.on('UI_MODAL_CLOSE', () => {
            this.isModalOpen = false;
            // Al cerrar cualquier modal, ver si hay algo en cola
            setTimeout(() => this.checkQueue(), 500);
        });

        // Escuchar cierre de modal de historia (Briefing/Summary) para procesar la cola
        bus.on('STORY_MODAL_CLOSE', () => {
            console.log(`[TUTORIAL] Story modal closed. Checking queue...`);
            // Solo procesar si estamos en juego
            if (state.gameStatus === 'PLAYING') {
                setTimeout(() => this.checkQueue(), 800);
            }
        });

        // Omitir todo el tutorial (reutilizando lógica de Mod-08)
        bus.on('TUTORIAL_SKIP_ALL', () => {
            console.log('[TUTORIAL] Skipping all pending tutorials.');
            localStorage.setItem('nakasthu_skip_tutorials', 'true');
            localStorage.setItem('nakasthu_tutorial_seen', 'true');
            
            this.proposalQueue = []; // Limpiar cola
            this.cancelActiveTutorial(); // Cancelar el actual
            
            // Actualizar estado global para que otros módulos se enteren
            state.startBatch();
            state.isTutorialActive = false;
            state.tutorialStep = 0;
            state.endBatch();

            bus.emit('TERMINAL_PRINT', {
                text: '>>> PROTOCOLO DE INDUCCIÓN ABORTADO POR EL OPERADOR. CONTROL TOTAL RESTABLECIDO.',
                type: 'SYSTEM'
            });
        });

        // Reset forzado del sistema
        bus.on('SYSTEM_FORCE_RESET', () => {
            this.proposalQueue = []; // Limpiar cola en reset
            this.cancelActiveTutorial();
        });
    }

    /**
     * Procesa la cola de tutoriales pendientes
     */
    checkQueue() {
        if (this.proposalQueue.length === 0 || this.isModalOpen || state.gameStatus !== 'PLAYING') {
            return;
        }

        const next = this.proposalQueue.shift();
        console.log(`[TUTORIAL] Processing queued tutorial: ${next.moduleName}`);
        this.proposeTutorial(next.moduleId, next.moduleName, next.tutorialId);
    }

    proposeTutorial(moduleId, moduleName, tutorialId) {
        // REGLA: No mostrar tutoriales durante cinemáticas o si ya hay un modal abierto
        if (state.gameStatus !== 'PLAYING' || this.isModalOpen) {
            // Evitar duplicados en la cola
            const exists = this.proposalQueue.some(p => p.tutorialId === tutorialId);
            if (!exists) {
                console.log(`[TUTORIAL] System busy (Status: ${state.gameStatus}). Queuing: ${moduleName}`);
                this.proposalQueue.push({ moduleId, moduleName, tutorialId });
            }
            return;
        }

        console.log(`[TUTORIAL] Proposing tutorial for: ${moduleName}`);
        this.isModalOpen = true; // Marcar como ocupado inmediatamente

        bus.emit('UI_MODAL_OPEN', {
            title: 'NUEVO SISTEMA DETECTADO',
            content: html`
                <div className="space-y-4">
                    <p className="text-emerald-400 font-bold text-lg">${moduleName}</p>
                    <p className="text-zinc-300">Se ha instalado un nuevo módulo en su terminal.</p>
                    <p className="text-zinc-400 text-sm">¿Desea ejecutar el protocolo de instrucción?</p>
                </div>
            `,
            footer: html`
                <div className="flex gap-2 w-full">
                    <button 
                        onClick=${() => {
                    bus.emit('UI_MODAL_CLOSE'); // El controller escuchará esto y pondrá isModalOpen = false
                    // Pequeño hack: marcamos isModalOpen true de nuevo inmediatamente para que el startModule lo tome
                    this.isModalOpen = true;

                    setTimeout(() => this.startModuleTutorial(tutorialId), 100);
                }}
                        className="flex-1 py-2 bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase tracking-widest text-xs"
                    >
                        INICIAR INSTRUCCIÓN
                    </button>
                    <button 
                        onClick=${() => {
                    bus.emit('UI_MODAL_CLOSE');
                    bus.emit('TERMINAL_PRINT', { text: `> Tutorial skipped for ${moduleName}. Use /help to review.`, type: 'INFO' });
                }}
                        className="flex-1 py-2 bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all uppercase tracking-widest text-xs"
                    >
                        OMITIR
                    </button>
                </div>
            `
        });
    }

    startModuleTutorial(tutorialId) {
        console.log(`[TUTORIAL] Iniciando tutorial: ${tutorialId}`);
        this.activeTutorialId = tutorialId;

        // Sync with global state
        state.isTutorialActive = true;
        state.activeTutorialId = tutorialId;

        // Modal is already open (from proposal) or closed.
        // We need to ensure we overlap correctly.

        // If coming from Proposal, we are 'isModalOpen=true'.
        // We emit STORY_MODAL_OPEN which replaces the current modal.
        this.currentStepIndex = 0;
        this.showCurrentStep();
    }

    endTutorial() {
        console.log(`[TUTORIAL] Completado: ${this.activeTutorialId}`);
        this.activeTutorialId = null;

        // Sync with global state
        state.isTutorialActive = false;
        state.activeTutorialId = null;
        state.tutorialStep = 0;

        this.currentStepIndex = 0;
        this.isModalOpen = false;
        bus.emit('UI_MODAL_CLOSE'); // Asegurar cierre

        // Feedback visual de completado
        bus.emit('TERMINAL_PRINT', {
            text: '>>> TUTORIAL MODULE COMPLETED. SYSTEM OPTIMIZED.',
            type: 'SUCCESS'
        });
    }

    showCurrentStep() {
        // Seleccionar contenido según la ruta narrativa
        const contentPool = state.storyPath === 1 ? TUTORIAL_CONTENT_SECTARIAN : TUTORIAL_CONTENT;
        const content = contentPool[this.activeTutorialId] || TUTORIAL_CONTENT[this.activeTutorialId];
        
        if (!content) return;

        // Sincronizar estado global para que UI reaccione (Highlights, Unlocks)
        state.tutorialStep = this.currentStepIndex;

        const rawText = content.steps[this.currentStepIndex];
        const stepText = localizeTutorialText(rawText, state.storyPath);
        const title = `${content.title} (${this.currentStepIndex + 1}/${content.steps.length})`;

        this.isModalOpen = true;
        bus.emit('STORY_MODAL_OPEN', {
            mode: 'Briefing', // Reutilizamos el estilo de briefing
            isTutorial: true,
            title: title,
            content: stepText,
            allowClose: false // Obligar a completar o tener botón de "Entendido" que emita TUTORIAL_CONTINUE
        });
    }

    nextStep() {
        const contentPool = state.storyPath === 1 ? TUTORIAL_CONTENT_SECTARIAN : TUTORIAL_CONTENT;
        const content = contentPool[this.activeTutorialId] || TUTORIAL_CONTENT[this.activeTutorialId];
        
        if (!content) return;

        this.currentStepIndex++;
        // Sync here too just in case though showCurrentStep does it
        state.tutorialStep = this.currentStepIndex;

        if (this.currentStepIndex < content.steps.length) {
            // Siguiente paso
            // Pequeño delay visual
            setTimeout(() => this.showCurrentStep(), 300);
        } else {
            // Fin del tutorial
            this.endTutorial();
        }
    }

    // Método para cancelar tutoriales activos forzosamente (ej: al saltar de nivel)
    cancelActiveTutorial() {
        if (!this.activeTutorialId) return;

        console.log(`[TUTORIAL] Cancelando tutorial activo: ${this.activeTutorialId}`);
        this.activeTutorialId = null;
        this.currentStepIndex = 0;
        state.isTutorialActive = false;
        state.activeTutorialId = null;
        state.tutorialStep = 0;
        this.isModalOpen = false;
        bus.emit('UI_MODAL_CLOSE');
    }

    // Método para reiniciar tutoriales desde settings (Futuro)
    replayTutorial(moduleId) {
        const module = Object.values(MODULES).find(m => m.id === moduleId);
        if (module && module.tutorial) {
            this.startModuleTutorial(module.tutorial);
        }
    }
}

export const tutorialController = new TutorialController();
