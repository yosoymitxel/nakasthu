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
        this.setupListeners();
    }

    setupListeners() {
        // Al terminar una sesión (Sacrificio/Autorización), limpiar el diálogo actual
        bus.on('SESSION_TERMINATED', () => {
            if (this.currentDialogue) {
                this.closeDialogue();
            }
        });
    }

    async loadDialogues() {
        try {
            // Verificación robusta del entorno
            const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
            const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST;

            let manifest;
            const manifestPath = './src/data/dialogues/manifest.json';

            if (isBrowser && !isTest) {
                const response = await fetch(manifestPath);
                manifest = await response.json();
            } else {
                const fs = await import('fs/promises');
                const path = await import('path');
                const fullManifestPath = path.join(process.cwd(), 'src', 'data', 'dialogues', 'manifest.json');
                const content = await fs.readFile(fullManifestPath, 'utf-8');
                manifest = JSON.parse(content);
            }

            // Cargar todos los archivos del manifest
            const allDialogues = [];
            for (const file of manifest.files) {
                let data;
                if (isBrowser && !isTest) {
                    const response = await fetch(`./src/data/dialogues/${file}`);
                    data = await response.json();
                } else {
                    const fs = await import('fs/promises');
                    const path = await import('path');
                    const filePath = path.join(process.cwd(), 'src', 'data', 'dialogues', file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    data = JSON.parse(content);
                }
                if (data.dialogues) {
                    allDialogues.push(...data.dialogues);
                }
            }

            this.dialogues = allDialogues;
            console.log('[DIALOGUE] Base de datos modular cargada:', this.dialogues.length);
        } catch (error) {
            console.error('[DIALOGUE] Error cargando diálogos modulares:', error);
        }
    }

    /**
     * Inicia un diálogo aleatorio o específico basado en el contexto actual.
     */
    triggerRandomDialogue() {
        if (this.dialogues.length === 0) return;

        const currentStep = state.currentStep || 1;
        
        // 1. Filtrar diálogos por el paso actual (minStep/maxStep)
        let pool = this.dialogues.filter(d => {
            const minStep = d.minStep || 1;
            const maxStep = d.maxStep || 12;
            return currentStep >= minStep && currentStep <= maxStep;
        });

        // 2. Priorizar diálogos NO usados en esta sesión (para evitar repetición inmediata)
        if (!state.usedDialogueIds) state.usedDialogueIds = [];
        
        let unusedPool = pool.filter(d => !state.usedDialogueIds.includes(d.id));
        
        // Si todos los diálogos del pool actual han sido usados, reseteamos los de este pool
        if (unusedPool.length === 0 && pool.length > 0) {
            console.log('[DIALOGUE] Pool agotado para este paso. Reiniciando memoria local.');
            state.usedDialogueIds = state.usedDialogueIds.filter(id => !pool.some(d => d.id === id));
            unusedPool = pool;
        }

        // 3. Fallback: Si no hay diálogos específicos para este paso, usar los de pasos anteriores
        if (unusedPool.length === 0) {
            unusedPool = this.dialogues.filter(d => (d.minStep || 1) <= currentStep && !state.usedDialogueIds.includes(d.id));
        }

        // 4. Fallback final: Si aún así no hay nada, usar todo el pool disponible
        if (unusedPool.length === 0) unusedPool = pool.length > 0 ? pool : this.dialogues;

        const randomIndex = Math.floor(Math.random() * unusedPool.length);
        this.currentDialogue = unusedPool[randomIndex];

        // Registrar como usado
        if (!state.usedDialogueIds.includes(this.currentDialogue.id)) {
            state.usedDialogueIds.push(this.currentDialogue.id);
        }

        // Actualizar estado para React
        state.focusMode = true;
        state.activeDialogue = {
            id: this.currentDialogue.id,
            text: this.currentDialogue.text,
            options: this.currentDialogue.options.map(opt => ({ ...opt, used: false }))
        };

        bus.emit('DIALOGUE_STARTED', this.currentDialogue);
    }

    /**
     * Finaliza manualmente el diálogo actual.
     */
    closeDialogue() {
        this.currentDialogue = null;
        state.activeDialogue = null;
        state.focusMode = false;
        bus.emit('DIALOGUE_ENDED');
    }

    /**
     * Procesa la opción seleccionada.
     */
    selectOption(optionIndex) {
        if (!this.currentDialogue) return;

        const option = this.currentDialogue.options[optionIndex];
        if (!option) return;

        // Consumir recursos y afectar al sujeto
        state.startBatch();
        if (option.energyCost) state.energy = Math.floor(Math.max(0, state.energy - option.energyCost));
        if (option.stabilityImpact) state.stability = Math.floor(Math.max(0, state.stability + option.stabilityImpact));
        
        // Impacto mecánico en la corrupción del sujeto actual
        if (option.corruptionImpact && state.currentEntity) {
            // Ajustar la probabilidad de corrupción del sujeto basado en el diálogo
            const currentProb = state.currentEntity.scannedData.corruption || 0;
            const newCorruption = Math.min(100, Math.max(0, currentProb + option.corruptionImpact));
            
            state.currentEntity.scannedData.corruption = newCorruption;
            
            // Añadir al historial de indicios para el promedio en MOD-02
            if (!state.currentEntity.scannedData.corruptionHistory) {
                state.currentEntity.scannedData.corruptionHistory = [];
            }
            state.currentEntity.scannedData.corruptionHistory.push(newCorruption);
            
            console.log(`%c[DIALOGUE] Impacto en corrupción: ${option.corruptionImpact}% (Total: ${newCorruption}%)`, 'color: #ef4444;');
        }
        state.endBatch();

        // Desbloquear lore si existe
        if (option.loreUnlock) {
            bus.emit('LORE_UNLOCKED', option.loreUnlock);
            
            // Si es un comando de terminal
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

        // Emitir consecuencia para el chat
        bus.emit('DIALOGUE_OPTION_SELECTED', {
            option: option.text,
            consequence: option.consequence
        });

        // Lógica de Ramificación (Depth)
        if (option.next) {
            // El hilo de la conversación continúa en un nuevo nodo
            this.currentDialogue = {
                ...this.currentDialogue,
                text: option.consequence, // La respuesta del sujeto se convierte en el nuevo contexto
                options: option.next
            };

            state.activeDialogue = {
                id: this.currentDialogue.id,
                text: this.currentDialogue.text,
                options: this.currentDialogue.options.map(opt => ({ ...opt, used: false }))
            };
        } else {
            // Marcar opción como usada en el estado si no hay ramificación
            if (state.activeDialogue) {
                const newOptions = [...state.activeDialogue.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], used: true };
                state.activeDialogue = {
                    ...state.activeDialogue,
                    options: newOptions
                };
            }
        }
    }
}

export const dialogueEngine = new DialogueEngine();
