/**
 * TUTORIALCONTROLLER.JS
 * Sistema modular de tutoriales basado en ModuleRegistry.
 * Regla 2.A: Vanilla JS.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { MODULES } from './ModuleRegistry.js';

// Definición del contenido de tutoriales por módulo
const TUTORIAL_CONTENT = {
    [MODULES.BIOSCAN.tutorial]: {
        title: 'MÓDULO DESBLOQUEADO: BIOSCAN',
        steps: [
            "Localice el [[MOD-01]] a su izquierda. Este es su ojo principal en el Bastión.",
            "Realice un ESCANEO TÉRMICO para identificar la firma de calor del sujeto.",
            "Compare los resultados con los parámetros biológicos estándar (36.5°C - 37.5°C)."
        ]
    },
    [MODULES.ANALYTICS.tutorial]: {
        title: 'MÓDULO DESBLOQUEADO: ANALYTICS',
        steps: [
            "Observe el [[MOD-02]] superior. El Motor Analítico procesa los datos crudos.",
            "Detecte anomalías en la sincronización neural. Valores bajos indican inestabilidad o desincronización.",
            "Use estos datos para juzgar la legitimidad de la solicitud de ingreso."
        ]
    },
    [MODULES.RESONANCE.tutorial]: {
        title: 'MÓDULO DESBLOQUEADO: RESONANCIA',
        steps: [
            "El [[MOD-05]] inferior gestiona el enlace neural directo.",
            "Sincronice la frecuencia hasta superar el 85% para estabilizar la conexión.",
            "Una conexión inestable aumentará el consumo de energía y riesgo de corrupción."
        ]
    },
    [MODULES.OPERATIONS.tutorial]: {
        title: 'PROTOCOLO: OPERACIONES',
        steps: [
            "Use el [[MOD-04]] central para emitir el juicio final.",
            "[AUTORIZAR]: Permite el ingreso al Bastión. Consume estabilidad si hay error.",
            "[SACRIFICAR]: Elimina la amenaza. Restaura estabilidad, pero tiene coste moral."
        ]
    },
    [MODULES.LORE_ARCHIVE.tutorial]: {
        title: 'ACCESO: ARCHIVO LORE',
        steps: [
            "El comando `/lore` desbloquea el acceso a la memoria recuperada de Zhyr.",
            "Busque pistas en los diálogos de NPC para desbloquear nuevas entradas.",
            "La información es poder. Úsela para desbloquear comandos ocultos."
        ]
    },
    [MODULES.QUOTA_TRACKER.tutorial]: {
        title: 'PROTOCOLO: CUOTAS',
        steps: [
            "El Bastión exige resultados. Cada ciclo tiene un objetivo de producción.",
            "Complete el procesamiento de sujetos válidos para cumplir la cuota.",
            "Fallar repetidamente en la cuota atraerá la atención de Kamin. Y no querrá eso."
        ]
    },
    'TUTO_UNREST': {
        title: 'ALERTA: DISTURBIOS CIVILES',
        steps: [
            "El descontento en los sectores bajos ha alcanzado niveles críticos.",
            "El Medidor de Disturbios rastrea la tensión social. Rechazos injustificados aumentan la tensión.",
            "Si el nivel llega a CRÍTICO, ocurrirán sabotajes automáticos."
        ]
    },
    'TUTO_FACTION': {
        title: 'ANÁLISIS: FACCIONES',
        steps: [
            "La sociedad se divide. 'Orden' (Técnicos) vs 'Caos' (Devotos).",
            "Sus decisiones alimentan una de estas fuerzas. El equilibrio es frágil.",
            "Visualice el dominio ideológico en el nuevo panel. Desbloqueará opciones únicas."
        ]
    },
    'TUTO_RITUAL': {
        title: 'PROTOCOLO: RITUALES',
        steps: [
            "El sacrificio genera 'Carga Ritual'. Acumúlela eliminando amenazas.",
            "Use las cargas para realizar rituales de Purificación (Estabilidad) o Ascensión (Energía).",
            "Advertencia: Los rituales tienen un alto coste moral e impacto en la facción."
        ]
    },
    'TUTO_PORTAL': {
        title: 'ALERTA: INESTABILIDAD DIMENSIONAL',
        steps: [
            "El Portal se debilita. La exposición constante a sujetos anómalos corroe la realidad.",
            "Supervise el Monitor de Flujo. Si baja del 30%, ocurrirán fugas de vacío.",
            "Debe invertir recursos para ESTABILIZAR el portal manualmente si decae demasiado."
        ]
    }
};

import { html } from '../ui/utils/html.js';

class TutorialController {
    constructor() {
        this.activeTutorialId = null;
        this.currentStepIndex = 0;
        this.isModalOpen = false;
        this.init();
    }

    init() {
        // Escuchar desbloqueo de módulos
        bus.on('MODULE_UNLOCKED', (data) => {
            if (data.tutorialId && TUTORIAL_CONTENT[data.tutorialId]) {
                this.proposeTutorial(data.id, data.name, data.tutorialId);
            }
        });

        // Avance manual desde el modal
        bus.on('TUTORIAL_CONTINUE', () => {
            this.nextStep();
        });

        // Cierre de modal
        bus.on('UI_MODAL_CLOSE', () => {
            this.isModalOpen = false;
        });

        // Reset forzado del sistema
        bus.on('SYSTEM_FORCE_RESET', () => {
            this.cancelActiveTutorial();
        });
    }

    proposeTutorial(moduleId, moduleName, tutorialId) {
        console.log(`[TUTORIAL] Proposal for: ${moduleName}`);

        // Si ya hay un tutorial activo, lo ignoramos o encolamos (por ahora simple: ignorar si está ocupado, o mostrar si es solo una propuesta encima de nada)
        // Mejor: Si isModalOpen es true, esperar.
        if (this.isModalOpen) {
            console.log(`[TUTORIAL] Modal open, retrying proposal for ${moduleName} in 2s...`);
            setTimeout(() => this.proposeTutorial(moduleId, moduleName, tutorialId), 2000);
            return;
        }

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
        const content = TUTORIAL_CONTENT[this.activeTutorialId];
        if (!content) return;

        // Sincronizar estado global para que UI reaccione (Highlights, Unlocks)
        state.tutorialStep = this.currentStepIndex;

        const stepText = content.steps[this.currentStepIndex];
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
        const content = TUTORIAL_CONTENT[this.activeTutorialId];
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
