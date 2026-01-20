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
        bus.on('STATE_CHANGE:gameStatus', (status) => {
            if (status === 'PLAYING' && state.processedCount === 0 && !this.isActive && state.tutorialStep === 0 && !state.hasSeenTutorial) {
                this.startTutorial();
            }
        });

        bus.on('STATE_CHANGE:tutorialStep', (step) => {
            if (step === 0 && this.isActive) {
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
        
        bus.emit('TERMINAL_PRINT', {
            text: '>>> PROTOCOLO DE INDUCCIÓN ACTIVADO. SIGA LAS INSTRUCCIONES.',
            type: 'SYSTEM'
        });

        await this.wait(1500);

        this.notifySystem("MOD-03 (CORE_HEADER) DETECTADO. NOTA SOBRE INDICADORES SUPERIORES:");
        this.notifySystem("1. ENERGÍA: Consumida por escaneos. Se recupera con sacrificios.");
        this.notifySystem("2. ESTABILIDAD: Integridad neural. Si llega a 0, la sesión termina.");
        this.notifySystem("3. ORBITAL_SYNC: Proximidad al ECLIPSE. Mantenga vigilancia.");

        await this.wait(3000);

        this.notifySystem(">>> EL TUTORIAL ES UNA ZONA SEGURA. LOS RECURSOS NO SE AGOTARÁN AQUÍ.");
        this.notifySystem("PASO 1: ACCEDA AL MOD-01 (BIOSCAN) Y REALICE UN ESCANEO TÉRMICO.");
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
            this.notifySystem("LECTURA RECIBIDA EN MOD-02. PASO 2: LA RESONANCIA (MOD-05) ESTÁ FALLANDO. AJUSTE LA FRECUENCIA HASTA > 80%.");
            // No simulamos caída de estabilidad para mantener el tutorial seguro
        } else if (nextStep === 3) {
            // Asegurar que hay un sujeto presente para autorizar
            if (!state.currentEntity) {
                state.nextSubject();
            }
            this.notifySystem("SINCRONÍA ESTABLECIDA. PASO 3: EL SUJETO ESTÁ LIMPIO. USE MOD-04 PARA [AUTORIZAR] EL ACCESO.");
        } else if (nextStep === 4) {
            this.notifySystem("SISTEMAS NOMINALES. CONTROL MANUAL ENTREGADO. BUENA SUERTE, OPERADOR.");
            state.isTutorialActive = false;
            state.tutorialStep = 0;
            state.hasSeenTutorial = true;
            localStorage.setItem('nakasthu_tutorial_seen', 'true');
            this.isActive = false;
        }
    }

    notifySystem(text) {
        bus.emit('TERMINAL_PRINT', {
            text: text,
            type: 'INFO'
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const tutorialController = new TutorialController();
