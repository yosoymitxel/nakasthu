/**
 * FACTIONSYSTEM.JS (MOD_FACTION)
 * Sistema de alineamiento ideológico (Orden vs Caos).
 * Desbloqueado en Paso 7: "El Mensajero de Aitor".
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class FactionSystem {
    constructor() {
        this.alignments = { ORDEN: 0, CAOS: 0 };
        this.milestones = { ORDEN: [20, 50, 80], CAOS: [20, 50, 80] };
        this.achievedMilestones = { ORDEN: [], CAOS: [] };
        this.isActive = false; // Se activa con el módulo
        this.init();
    }

    init() {
        bus.on('LEVEL_RESET', () => {
            // La facción persiste entre niveles, pero si se requiere reset total:
            // this.reset(); 
            // En este juego la facción es global, no se resetea por nivel.
        });

        bus.on('MODULE_UNLOCKED', (data) => {
            if (data.id === 'MOD_FACTION') {
                this.isActive = true;
            }
        });

        // Escuchar decisiones del jugador (Integración con GameSequencer/Operations)
        bus.on('SUBJECT_PROCESSED', (data) => {
            if (!this.isActive) return;

            // Lógica simple: Técnicos -> Orden, Devotos -> Caos
            // Esto debería venir enriquecido en el evento, pero por ahora inferimos del state
            // O mejor, GameSequencer emite un evento específico de facción
        });

        bus.on('FACTION_ACTION', (data) => {
            if (!this.isActive) return;
            this.registerAction(data.faction, data.amount);
        });
    }

    reset() {
        this.alignments = { ORDEN: 0, CAOS: 0 };
        this.achievedMilestones = { ORDEN: [], CAOS: [] };
        this.emitUpdate();
    }

    registerAction(faction, amount = 1) {
        if (!this.alignments.hasOwnProperty(faction)) return;

        this.alignments[faction] += amount;
        this.checkMilestones(faction);
        this.emitUpdate();
    }

    checkMilestones(faction) {
        const score = this.alignments[faction];
        const levels = this.milestones[faction];

        levels.forEach((milestone, index) => {
            if (score >= milestone && !this.achievedMilestones[faction].includes(milestone)) {
                this.achievedMilestones[faction].push(milestone);
                bus.emit('FACTION_MILESTONE', {
                    faction: faction,
                    level: index + 1,
                    threshold: milestone
                });

                bus.emit('TERMINAL_PRINT', {
                    text: `>>> FACTION RISE: ${faction} LEVEL ${index + 1} REACHED.`,
                    type: 'SYSTEM'
                });
            }
        });
    }

    getDominantFaction() {
        if (this.alignments.ORDEN > this.alignments.CAOS) return 'ORDEN';
        if (this.alignments.CAOS > this.alignments.ORDEN) return 'CAOS';
        return 'NEUTRAL';
    }

    emitUpdate() {
        bus.emit('FACTION_UPDATE', {
            orden: this.alignments.ORDEN,
            caos: this.alignments.CAOS,
            dominant: this.getDominantFaction()
        });
    }
}

export const factionSystem = new FactionSystem();
