/**
 * DIALOGUEENGINE.JS
 * Motor de procesamiento de diálogos y eventos.
 * Regla 2.A: Vanilla JS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';

class DialogueEngine {
    constructor() {
        this.dialogues = [];
        this.currentDialogue = null;
        this.loadDialogues();
    }

    async loadDialogues() {
        try {
            // Intentar cargar desde el entorno de navegador o node (test)
            let data;

            // Verificación robusta del entorno
            const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
            const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST;

            if (isBrowser && !isTest) {
                const response = await fetch('./src/data/dialogues.json');
                data = await response.json();
            } else {
                // Fallback para entornos de test (Vitest/Node)
                const fs = await import('fs/promises');
                const path = await import('path');
                const filePath = path.join(process.cwd(), 'src', 'data', 'dialogues.json');
                const content = await fs.readFile(filePath, 'utf-8');
                data = JSON.parse(content);
            }

            this.dialogues = data.dialogues;
            console.log('[DIALOGUE] Base de datos cargada:', this.dialogues.length);
        } catch (error) {
            console.error('[DIALOGUE] Error cargando diálogos:', error);
        }
    }

    /**
     * Inicia un diálogo aleatorio o específico.
     */
    triggerRandomDialogue() {
        if (this.dialogues.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.dialogues.length);
        this.currentDialogue = this.dialogues[randomIndex];

        // Actualizar estado para React
        state.focusMode = true;
        state.activeDialogue = {
            id: this.currentDialogue.id,
            text: this.currentDialogue.text,
            options: this.currentDialogue.options
        };

        bus.emit('DIALOGUE_STARTED', this.currentDialogue);
    }

    /**
     * Procesa la opción seleccionada y sus consecuencias.
     */
    selectOption(optionIndex) {
        if (!this.currentDialogue || !this.currentDialogue.options[optionIndex]) return;

        const option = this.currentDialogue.options[optionIndex];

        // Aplicar consecuencias al estado global (Omitir en tutorial)
        if (!state.isTutorialActive) {
            state.energy = Math.max(0, state.energy - (option.energyCost || 0));
            state.stability = Math.min(100, Math.max(0, state.stability + (option.stabilityImpact || 0)));
        }

        if (option.loreUnlock) {
            bus.emit('LORE_UNLOCKED', option.loreUnlock);

            // Si el desbloqueo contiene un comando (ej: CMD_LOGS), añadir a unlockedCommands
            if (option.loreUnlock.startsWith('CMD_')) {
                const command = option.loreUnlock.replace('CMD_', '');
                if (!state.unlockedCommands.includes(command)) {
                    state.unlockedCommands = [...state.unlockedCommands, command];
                    bus.emit('TERMINAL_PRINT', {
                        text: `> NUEVO COMANDO AUTORIZADO: ${command}`,
                        type: 'INFO'
                    });
                }
            }
        }

        bus.emit('DIALOGUE_CONSEQUENCE', {
            text: option.consequence,
            originalOption: option.text
        });

        // Limpiar diálogo actual en estado
        this.currentDialogue = null;
        state.activeDialogue = null;
        state.focusMode = false;
    }
}

export const dialogueEngine = new DialogueEngine();
