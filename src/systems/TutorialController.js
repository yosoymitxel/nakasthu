/**
 * TUTORIALCONTROLLER.JS
 * Gestiona la secuencia narrativa inicial y el aprendizaje del jugador.
 * Regla 2.A: Vanilla JS.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class TutorialController {
    constructor() {
        this.isActive = false;
        this.modalOpen = false;
        this.pendingStep = null;
        this.init();
    }

    init() {
        // Activación desde el secuenciador
        bus.on('STATE_CHANGE:tutorialStep', (step) => {
            if (step === 1 && !this.isActive) {
                this.startTutorial();
            } else if (step === 0 && this.isActive) {
                this.stopTutorial();
            }
        });

        // Avance manual (Botón RECIBIDO en el modal)
        bus.on('TUTORIAL_CONTINUE', async () => {
            this.modalOpen = false;
            await this.wait(300); // Pausa visual para transición

            if (this.pendingStep) {
                const next = this.pendingStep;
                this.pendingStep = null;
                this.advanceToStep(next);
            } else {
                // Avances secuenciales manuales
                if (state.tutorialStep === 1) {
                    this.advanceToStep(2); // De bienvenida a BioScan
                } else if (state.tutorialStep === 3) {
                    this.advanceToStep(4); // De Analytics a Resonancia (Manual)
                } else if (state.tutorialStep === 6) {
                    this.advanceToStep(7); // De recursos a finalización
                }
            }
        });

        // Avance por acciones del juego (Gatillados por eventos)
        bus.on('SCAN_COMPLETED', async (data) => {
            if (state.tutorialStep === 2 && data.type.id === 'THERMAL') {
                if (this.modalOpen) {
                    this.pendingStep = 3; // Mostrar Analytics después del modal
                } else {
                    await this.wait(800);
                    this.advanceToStep(3); // De BioScan a Analytics Result
                }
            }
        });

        bus.on('RESONANCE_UPDATE', async (data) => {
            // Solo avanzar si estamos en el paso 4 y la sincronía es alta
            if (state.tutorialStep === 4 && data.sync > 85) {
                if (this.modalOpen) {
                    this.pendingStep = 5;
                } else {
                    await this.wait(800);
                    this.advanceToStep(5); // De Resonancia a Decisión
                }
            }
        });

        bus.on('SESSION_TERMINATED', async () => {
            if (state.tutorialStep === 5) {
                if (this.modalOpen) {
                    this.pendingStep = 6;
                } else {
                    await this.wait(800);
                    this.advanceToStep(6); // De Decisión a Recursos
                }
            }
        });
    }

    async startTutorial() {
        this.isActive = true;
        state.isTutorialActive = true;
        state.tutorialStep = 1;

        if (!state.currentEntity) {
            state.nextSubject();
        }

        this.notifySystem(
            "Bienvenido al Protocolo de Inducción, Operador. Aquí aprenderá a gestionar la biomasa en el Bastión Nakasthu. Durante este proceso, solo los módulos necesarios estarán operativos.",
            "FASE 0: INDUCCIÓN NEURAL"
        );
    }

    stopTutorial() {
        this.isActive = false;
        state.isTutorialActive = false;
        state.tutorialStep = 0;
        this.modalOpen = false;
        this.pendingStep = null;
    }

    advanceToStep(nextStep) {
        console.log(`[TUTORIAL] Advancing from ${state.tutorialStep} to ${nextStep}`);

        // Evitar dobles llamadas o pasos repetidos
        if (state.tutorialStep === nextStep) return;

        state.tutorialStep = nextStep;

        if (nextStep === 2) {
            this.notifySystem(
                "PASO 1: LA DETECCIÓN. Localice el [[MOD-01]] a su izquierda. Realice un ESCANEO TÉRMICO para identificar la firma de calor del sujeto. Este es el primer paso para cualquier procesamiento.",
                "PASO 1: EL BIOSCAN"
            );
        } else if (nextStep === 3) {
            this.notifySystem(
                "Lectura térmica recibida con éxito. Observe el [[MOD-02]] superior. Analytics ha procesado los rastros, revelando anomalías en la firma biológica. Este módulo será su guía para juzgar la legitimidad del sujeto.",
                "PASO 2: ANÁLISIS DE DATOS"
            );
        } else if (nextStep === 4) {
            this.notifySystem(
                "Ahora que conoce al sujeto, debemos estabilizar la conexión. PASO 3: LA RESONANCIA. El [[MOD-05]] inferior está desajustado. Sincronice la frecuencia hasta superar el 85% para estabilizar el enlace neural.",
                "PASO 3: RESONANCIA NEURAL"
            );
        } else if (nextStep === 5) {
            if (!state.currentEntity) state.nextSubject();
            this.notifySystem(
                "Enlace estable y seguro. PASO 4: LA SENTENCIA. Use el [[MOD-04]] central para [AUTORIZAR] el acceso del sujeto. Durante el tutorial, las acciones no consumen energía.",
                "PASO 4: OPERACIONES"
            );
        } else if (nextStep === 6) {
            this.notifySystem(
                "Sujeto procesado correctamente. Control de recursos: El [[MOD-03]] superior muestra la ENERGÍA (vital para escaneos), la ESTABILIDAD (integridad del sistema) y el CICLO ORBITAL. Manténgalos bajo vigilancia constante.",
                "PASO 5: RECURSOS CRÍTICOS"
            );
        } else if (nextStep === 7) {
            this.notifySystem(
                "Inducción completada. El control manual ha sido transferido. La Nakara requiere su juicio, Operador. No nos falle.",
                "SISTEMAS NOMINALES"
            );

            // Finalización formal
            state.isTutorialActive = false;
            state.tutorialStep = 0;
            state.hasSeenTutorial = true;
            localStorage.setItem('nakasthu_tutorial_seen', 'true');
            this.isActive = false;

            // Feedback visual de reset
            bus.emit('TERMINAL_PRINT', { text: '>>> REFRESHING INTERFACE... ZHYR_OS ONLINE.', type: 'SYSTEM' });
            bus.emit('TRIGGER_FLASH', { color: '#00FFFF', duration: 1000 });
        }
    }

    notifySystem(text, title = 'MANUAL DE INDUCCIÓN') {
        this.modalOpen = true;
        bus.emit('MODAL_SHOW', {
            mode: 'Briefing',
            isTutorial: true,
            title: title,
            content: text
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const tutorialController = new TutorialController();
