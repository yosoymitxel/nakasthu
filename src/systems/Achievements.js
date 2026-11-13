/**
 * ACHIEVEMENTS.JS
 * Otorga los logros de src/data/achievements.js escuchando el Bus. Motor puro: sin DOM ni React.
 * El progreso vive aparte de la partida (localStorage) para que reiniciar no lo borre.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { STEPS_CONFIG } from '../data/stepsConfig.js';

const KEY = 'nakasthu_achievements';
const STREAK_GOAL = 8;

class Achievements {
    constructor() {
        this.unlocked = {};   // id -> fecha ISO
        this.stats = {};      // contadores entre partidas
        this.seen = {};       // colecciones sin repetidos: stat -> { id: true }
        this.streak = 0;
        this.talkedThisLevel = false;
        this.lastErrors = 0;
        this.infiniteRun = 0;
        this.load();
        this.init();
    }

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
            this.unlocked = saved.unlocked || {};
            this.stats = saved.stats || {};
            this.seen = saved.seen || {};
        } catch { /* guardado ilegible: se empieza de cero */ }
    }

    save() {
        try {
            localStorage.setItem(KEY, JSON.stringify({ unlocked: this.unlocked, stats: this.stats, seen: this.seen }));
        } catch { /* sin almacenamiento: el progreso dura la sesión */ }
    }

    reset() {
        this.unlocked = {};
        this.stats = {};
        this.seen = {};
        this.streak = 0;
        this.talkedThisLevel = false;
        this.lastErrors = 0;
        this.infiniteRun = 0;
        this.save();
    }

    has(id) { return !!this.unlocked[id]; }

    award(id) {
        if (this.has(id)) return;
        const def = ACHIEVEMENTS.find(a => a.id === id);
        if (!def) return;
        this.unlocked[id] = new Date().toISOString();
        this.save();
        bus.emit('ACHIEVEMENT_UNLOCKED', def);
    }

    bump(stat, amount = 1) {
        this.stats[stat] = (this.stats[stat] || 0) + amount;
        this.checkGoals(stat);
        this.save();
    }

    collect(stat, id) {
        const set = this.seen[stat] || (this.seen[stat] = {});
        if (set[id]) return;
        set[id] = true;
        this.stats[stat] = Object.keys(set).length;
        this.checkGoals(stat);
        this.save();
    }

    checkGoals(stat) {
        for (const a of ACHIEVEMENTS) {
            if (a.stat === stat && this.stats[stat] >= a.goal) this.award(a.id);
        }
    }

    progress(def) {
        return def.stat ? Math.min(def.goal, this.stats[def.stat] || 0) : null;
    }

    init() {
        bus.on('SCAN_COMPLETED', () => this.award('primer_escaneo'));

        bus.on('DIALOGUE_STARTED', () => {
            this.talkedThisLevel = true;
            this.award('primer_enlace');
        });

        bus.on('DECISION_MADE', ({ subject, action }) => {
            this.award('primer_veredicto');
            this.bump('processed');

            const isKamin = subject?.id === 'KAMIN' || subject?.name?.toLowerCase().includes('kamin');
            if (isKamin && action === 'authorize') this.award('mensajero');

            // El motor cuenta el error antes de emitir: comparar con el último valor visto
            const erred = state.judgmentErrors > this.lastErrors;
            this.lastErrors = state.judgmentErrors;
            this.streak = erred ? 0 : this.streak + 1;
            if (this.streak >= STREAK_GOAL) this.award('ojo_clinico');

            if (STEPS_CONFIG[state.currentStep]?.meta?.infinite && ++this.infiniteRun >= 30) this.award('bucle');
        });

        bus.on('QUOTA_MET', () => {
            if (state.judgmentErrors === 0) this.award('turno_limpio');
            if (!this.talkedThisLevel) this.award('sin_preguntas');
        });

        const newLevel = () => { this.talkedThisLevel = false; this.lastErrors = 0; this.infiniteRun = 0; };
        bus.on('STEP_CHANGE', newLevel);
        bus.on('LEVEL_RESET', newLevel);

        bus.on('EMERGENCY_END', () => this.award('crisis_resuelta'));
        bus.on('LORE_UNLOCKED', (loreId) => { if (loreId) this.collect('lore', String(loreId)); });
        bus.on('GAME_ENDING', ({ faction }) => this.award(faction === 'orden' ? 'final_orden' : 'final_caos'));
    }
}

export const achievements = new Achievements();
