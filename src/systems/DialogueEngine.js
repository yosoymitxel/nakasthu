/**
 * DIALOGUEENGINE.JS
 * Motor de procesamiento de diálogos y eventos.
 * Regla 2.A: Vanilla JS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { applyTraits } from '../services/EntityService.js';
import { analyzeSubjectProbability } from '../utils/scannerUtils.js';
import { narrativeFlags } from './NarrativeFlags.js';

// Por defecto una respuesta del operador cierra las alternativas: si no, se podía negar algo y
// acto seguido concederlo. Sólo las charlas de pura indagación marcan `exclusive: false`.
export const isExclusive = (dialogue) => dialogue?.exclusive !== false;

// Opciones visibles según lo que el operador decidió antes (`if`).
const visibleOptions = (options = []) => options.filter(o => narrativeFlags.matches(o.if));

// Anclas y personajes con nombre hablan nada más llegar, sin pulsar INTERROGAR: si no, casi nadie los oía.
export const speaksOnArrival = (dialogue) => !!(dialogue && (dialogue.priority || dialogue.forEntity || dialogue.npcTraits));
const ARRIVAL_DELAY = 900;

// Kamin entra en la cola del paso 6 con su identidad: un diálogo con `npcTraits` de otro personaje
// lo convertía en ese otro. `forEntity` reserva un diálogo para un sujeto concreto.
const fitsEntity = (dialogue, entity) => {
    if (dialogue.forEntity) return dialogue.forEntity === entity?.id;
    if (entity?.id !== 'KAMIN') return true;
    const npcId = String(dialogue.npcTraits?.id || '').toUpperCase();
    return !npcId || npcId.includes('KAMIN');
};

/**
 * Quién habla, explícito en los datos: `speaker` de la opción o del diálogo, si no el NPC
 * del diálogo y, en último caso, el sujeto en cámara. La UI pone su etiqueta genérica si es null.
 */
export function resolveSpeaker(dialogue, option, entity = state.currentEntity) {
    const name = option?.speaker || dialogue?.speaker || dialogue?.npcTraits?.id || entity?.name || entity?.id;
    return name ? String(name).toUpperCase() : null;
}

class DialogueEngine {
    constructor() {
        this.dialogues = [];
        this.currentDialogue = null;
        this.loadDialogues();
        this.setupListeners();
    }

    setupListeners() {
        // Al terminar una sesión (Sacrificio/Autorización), limpiar el diálogo actual
        // El diálogo se elige al llegar el sujeto: si lo convierte en otro personaje, entra ya con su cara
        bus.on('SUBJECT_PREPARE', (subject) => {
            this.reserved = null;
            const dialogue = this.pickDialogue(subject);
            if (!dialogue) return;
            if (dialogue.npcTraits) {
                applyTraits(subject, dialogue.npcTraits);
                subject.traitsFrom = dialogue.id;
            }
            // Se marca como usado al abrirse (startDialogue): un ancla de un sujeto que se va sin hablar vuelve al pool
            this.reserved = { entityId: subject.id, dialogue };
        });

        bus.on('NEW_SUBJECT_DETECTED', () => this.scheduleArrival());
        bus.on('STORY_MODAL_CLOSE', () => this.scheduleArrival());
        // Las propuestas de tutorial de módulo van por otro canal y no tocan state.isModalOpen
        bus.on('UI_MODAL_OPEN', () => { this.uiModal = true; });
        bus.on('UI_MODAL_CLOSE', () => { this.uiModal = false; this.scheduleArrival(); });

        bus.on('SESSION_TERMINATED', () => {
            if (this.currentDialogue) {
                this.closeDialogue();
            }
        });
    }

    scheduleArrival() {
        if (!speaksOnArrival(this.reserved?.dialogue)) return;
        clearTimeout(this.arrivalTimer);
        this.arrivalTimer = setTimeout(() => this.openOnArrival(), ARRIVAL_DELAY);
    }

    /** Abre la primera línea del sujeto reservado si sigue en cámara y nada lo tapa (briefing, tutorial, otro diálogo). */
    openOnArrival() {
        const reserved = this.reserved;
        if (!speaksOnArrival(reserved?.dialogue) || reserved.entityId !== state.currentEntity?.id) return false;
        if (state.gameStatus !== 'PLAYING' || state.isModalOpen || this.uiModal || state.isTutorialActive || state.isPaused) return false;
        if (this.currentDialogue || state.activeDialogue) return false;
        this.reserved = null;
        this.startDialogue(reserved.dialogue);
        return true;
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
            narrativeFlags.declare(manifest.flags);
            console.log('[DIALOGUE] Base de datos modular cargada:', this.dialogues.length);
        } catch (error) {
            console.error('[DIALOGUE] Error cargando diálogos modulares:', error);
        }
    }

    /**
     * Inicia un diálogo aleatorio o específico basado en el contexto actual.
     */
    triggerRandomDialogue() {
        const reserved = this.reserved?.entityId === state.currentEntity?.id ? this.reserved.dialogue : null;
        this.reserved = null;
        const dialogue = reserved || this.pickDialogue(state.currentEntity);
        if (dialogue) this.startDialogue(dialogue);
    }

    /** Elige el diálogo para un sujeto sin abrirlo. */
    pickDialogue(entity) {
        if (this.dialogues.length === 0) return null;

        const currentStep = state.currentStep || 1;
        const eligible = this.dialogues.filter(d => narrativeFlags.matches(d.requires) && fitsEntity(d, entity));
        if (eligible.length === 0) return null;

        // 1. Filtrar diálogos por el paso actual (minStep/maxStep)
        let pool = eligible.filter(d => {
            const minStep = d.minStep || 1;
            const maxStep = d.maxStep || 12;
            return currentStep >= minStep && currentStep <= maxStep;
        });

        // 2. Priorizar diálogos NO usados en esta sesión (para evitar repetición inmediata)
        let unusedPool = pool.filter(d => !state.usedDialogueIds.includes(d.id));

        // Si todos los diálogos del pool actual han sido usados, reseteamos los de este pool
        if (unusedPool.length === 0 && pool.length > 0) {
            console.log('[DIALOGUE] Pool agotado para este paso. Reiniciando memoria local.');
            state.usedDialogueIds = state.usedDialogueIds.filter(id => !pool.some(d => d.id === id));
            unusedPool = pool;
        }

        // 3. Fallback: Si no hay diálogos específicos para este paso, usar los de pasos anteriores
        if (unusedPool.length === 0) {
            unusedPool = eligible.filter(d => (d.minStep || 1) <= currentStep && !state.usedDialogueIds.includes(d.id));
        }

        // 4. Fallback final: Si aún así no hay nada, usar todo el pool disponible
        if (unusedPool.length === 0) unusedPool = pool.length > 0 ? pool : eligible;

        // Las anclas de cada hilo (`priority`) y los diálogos reservados al sujeto salen antes que el resto
        const anchors = unusedPool.filter(d => d.priority || d.forEntity);
        if (anchors.length) unusedPool = anchors;

        return unusedPool[Math.floor(Math.random() * unusedPool.length)];
    }

    /** Abre un diálogo concreto (también lo usan los tests que recorren todas las ramas). */
    startDialogue(dialogue) {
        this.currentDialogue = { ...dialogue, options: visibleOptions(dialogue.options) };

        // Registrar como usado
        const usedIds = [...state.usedDialogueIds];
        if (!usedIds.includes(this.currentDialogue.id)) {
            usedIds.push(this.currentDialogue.id);
            state.usedDialogueIds = usedIds;
        }

        // Aplicar sobreescritura de rasgos de NPC si existen (salvo si ya llegó con ellos)
        if (this.currentDialogue.npcTraits && state.currentEntity && state.currentEntity.traitsFrom !== this.currentDialogue.id) {
            console.log(`%c[DIALOGUE] Aplicando rasgos narrativos al sujeto: ${this.currentDialogue.id}`, 'color: #06b6d4; font-weight: bold;');
            state.startBatch();
            applyTraits(state.currentEntity, this.currentDialogue.npcTraits);
            state.endBatch();
            // Notificar que el sujeto ha sido actualizado (para que los módulos se refresquen)
            bus.emit('NEW_SUBJECT_DETECTED', state.currentEntity);
        }

        // Actualizar estado para React
        state.focusMode = true;
        const speaker = resolveSpeaker(this.currentDialogue);
        state.activeDialogue = {
            id: this.currentDialogue.id,
            text: this.currentDialogue.text,
            speaker,
            exclusive: isExclusive(this.currentDialogue),
            options: this.currentDialogue.options.map(opt => ({ ...opt, used: false }))
        };

        bus.emit('DIALOGUE_STARTED', { ...this.currentDialogue, speaker });
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

        const active = state.activeDialogue;
        const uiOption = active?.options[optionIndex];

        // Una opción resuelta no se ejecuta dos veces (doble clic o llamada directa)
        if (uiOption?.used) return;

        // Decisión exclusiva: una vez elegida una ruta, las hermanas quedan descartadas
        if (isExclusive(this.currentDialogue) && active?.options.some(o => o.used)) return;

        const option = this.currentDialogue.options[optionIndex];
        if (!option) return;

        // Consumir recursos y afectar al sujeto
        state.startBatch();
        if (option.energyCost) state.energy = Math.floor(Math.max(0, state.energy - option.energyCost));
        if (option.stabilityImpact) state.stability = Math.floor(Math.min(100, Math.max(0, state.stability + option.stabilityImpact)));

        // Análisis de voz: la PRIMERA respuesta del sujeto aporta un indicio con fiabilidad propia.
        // Antes se metía en el promedio un número sin relación con la verdad y empeoraba la lectura.
        // corruptionImpact sólo mueve el dato narrativo `corruption`; NO entra en el indicio.
        if (option.corruptionImpact && state.currentEntity?.scannedData) {
            const sd = state.currentEntity.scannedData;
            sd.corruption = Math.min(100, Math.max(0, (sd.corruption || 0) + option.corruptionImpact));
        }
        const subject = state.currentEntity;
        if (subject && !subject.voiceRead) {
            const probability = analyzeSubjectProbability('VOICE', subject, state.mode);
            const history = [...(subject.scannedData?.corruptionHistory || []), probability];
            state.currentEntity = {
                ...subject,
                voiceRead: true,
                scannedData: { ...subject.scannedData, corruptionHistory: history },
                corruptionEstimate: Math.round(history.reduce((x, y) => x + y, 0) / history.length)
            };
            bus.emit('TERMINAL_PRINT', {
                text: `[ANÁLISIS DE VOZ] ${probability > 50 ? 'Microtemblor y evasivas detectadas' : 'Respuesta coherente'} · indicio ${probability}%`,
                type: probability > 50 ? 'ERROR' : 'INFO'
            });
            console.log(`%c[DIALOGUE] Lectura de voz: ${probability}%`, 'color: #ef4444;');
        }
        state.endBatch();

        // Lo decidido queda en la memoria narrativa para diálogos posteriores
        if (option.set) narrativeFlags.set(option.set);

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

        // Emitir consecuencia para el chat y analíticas
        bus.emit('DIALOGUE_OPTION_SELECTED', {
            speaker: resolveSpeaker(this.currentDialogue, option),
            option: option.text,
            consequence: option.consequence,
            corruptionImpact: option.corruptionImpact || 0,
            stabilityImpact: option.stabilityImpact || 0
        });

        // Lógica de Ramificación (Depth)
        if (option.next) {
            // El hilo de la conversación continúa en un nuevo nodo
            this.currentDialogue = {
                ...this.currentDialogue,
                text: option.consequence, // La respuesta del sujeto se convierte en el nuevo contexto
                options: visibleOptions(option.next)
            };

            state.activeDialogue = {
                id: this.currentDialogue.id,
                text: this.currentDialogue.text,
                speaker: state.activeDialogue?.speaker ?? resolveSpeaker(this.currentDialogue),
                exclusive: isExclusive(this.currentDialogue),
                options: this.currentDialogue.options.map(opt => ({ ...opt, used: false }))
            };
        } else {
            // Marcar opción como usada en el estado si no hay ramificación
            if (state.activeDialogue) {
                // En una decisión exclusiva se cierran también las rutas no elegidas
                const lockSiblings = isExclusive(this.currentDialogue);
                const newOptions = state.activeDialogue.options.map((opt, i) =>
                    (i === optionIndex || lockSiblings) ? { ...opt, used: true } : opt
                );
                state.activeDialogue = {
                    ...state.activeDialogue,
                    options: newOptions
                };
            }
        }
    }
}

export const dialogueEngine = new DialogueEngine();
