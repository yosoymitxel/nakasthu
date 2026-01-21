/**
 * TUTORIALCONTROLLER.JS
 * Gestiona la secuencia narrativa inicial y el aprendizaje del jugador.
 * Regla 2.A: Vanilla JS.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class TutorialController {
    constructor() {
        this.step = 0;
        this.isActive = false;
        this.init();
    }

    init() {
        // El tutorial ya no se auto-inicia al entrar a PLAYING.
        // Se activa cuando el secuenciador pone tutorialStep = 1 tras la elección del jugador.
        bus.on('STATE_CHANGE:tutorialStep', (step) => {
            console.log(`%c[TUTORIAL] State change detected: tutorialStep = ${step}`, 'color: #3b82f6;');
            if (step === 1 && !this.isActive) {
                console.log('%c[TUTORIAL] Condition met. Starting tutorial...', 'color: #3b82f6; font-weight: bold;');
                this.startTutorial();
            } else if (step === 0 && this.isActive) {
                this.stopTutorial();
            }
        });

        // Listeners para avanzar en el tutorial
        bus.on('SCAN_COMPLETED', (data) => {
            if (state.tutorialStep === 1 && data.type.id === 'THERMAL') {
                this.advanceToStep(2);
            }
        });

        bus.on('RESONANCE_UPDATE', (data) => {
            if (state.tutorialStep === 2 && data.sync > 80) {
                this.advanceToStep(3);
            }
        });

        bus.on('SESSION_TERMINATED', () => {
            if (state.tutorialStep === 3) {
                this.advanceToStep(4);
            }
        });
    }

    async startTutorial() {
        this.isActive = true;
        state.isTutorialActive = true;
        state.tutorialStep = 1;

        // Asegurar que hay un sujeto presente
        if (!state.currentEntity) {
            state.nextSubject();
        }

        this.notifySystem(
            "Bienvenido, Operador. El MOD-03 (Cabezal) muestra sus recursos críticos: ENERGÍA (vital para escaneos), ESTABILIDAD (integridad del sistema) y CICLO ORBITAL (proximidad al Eclipse). Manténgalos bajo vigilancia.",
            "SISTEMA DE INDUCCIÓN: FASE 0"
        );

        await this.wait(3000);

        this.notifySystem(
            "PASO 1: LA DETECCIÓN. Acceda al MOD-01 (BIOSCAN) a su izquierda y realice un ESCANEO TÉRMICO para identificar la firma de calor del sujeto.",
            "PASO 1: EL BIOSCAN"
        );
    }

    stopTutorial() {
        this.isActive = false;
        state.isTutorialActive = false;
        state.tutorialStep = 0;
        bus.emit('TERMINAL_PRINT', {
            text: '>>> PROTOCOLO DE INDUCCIÓN CANCELADO POR EL OPERADOR.',
            type: 'SYSTEM'
        });
    }

    advanceToStep(nextStep) {
        state.tutorialStep = nextStep;

        if (nextStep === 2) {
            this.notifySystem(
                "Lectura térmica recibida. El MOD-02 (Visualizador) muestra la inconsistencia. PASO 2: LA RESONANCIA. El MOD-05 (Filtro) está desajustado. Use el slider para sincronizar la frecuencia hasta superar el 80%.",
                "PASO 2: RESONANCIA NEURAL"
            );
        } else if (nextStep === 3) {
            // Asegurar que hay un sujeto presente para autorizar
            if (!state.currentEntity) {
                state.nextSubject();
            }
            this.notifySystem(
                "Sincronía establecida. El sujeto es estable. PASO 3: LA DECISIÓN. Use el MOD-04 (OPERATIONS) para [AUTORIZAR] el acceso a la Nakara. No se requiere energía durante el tutorial.",
                "PASO 3: PROTOCOLO DE SENTENCIA"
            );
        } else if (nextStep === 4) {
            this.notifySystem(
                "Sistemas nominales. La inducción ha finalizado. El control manual ha sido transferido. Recuerde: cada decisión alimenta a la Nakara. Buena suerte, Operador.",
                "INDUCCIÓN COMPLETADA"
            );
            state.isTutorialActive = false;
            state.tutorialStep = 0;
            state.hasSeenTutorial = true;
            localStorage.setItem('nakasthu_tutorial_seen', 'true');
            this.isActive = false;
        }
    }

    notifySystem(text, title = 'MANUAL DE INDUCCIÓN') {
        bus.emit('MODAL_SHOW', {
            mode: 'Briefing',
            title: title || 'MANUAL DE INDUCCIÓN',
            content: text
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const tutorialController = new TutorialController();
