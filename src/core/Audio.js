/**
 * AUDIO.JS
 * Gestor de audio para Nakasthu.
 * Regla 2.A: Vanilla JS puro.
 */
import { bus } from './Bus.js';
import { state } from './State.js';
import { soundOn } from '../ui/juice.js';

const MUSIC_VOLUME = 0.35;

class AudioManager {
    constructor() {
        this.sounds = {};
        this.config = null;
        this.buffers = {};
        this.music = null;
        this.musicId = null;
    }

    async init() {
        try {
            const response = await fetch('./src/data/AudioConfig.json');
            this.config = await response.json();
            bus.on('TERMINAL_PRINT', () => this.play('sfx_terminal'));
            bus.on('CRITICAL_ERROR_FEEDBACK', () => this.play('sfx_alert'));
        } catch (error) {
            console.error("[AUDIO] Error crítico al cargar configuración:", error);
        }
        bus.on('STATE_CHANGE', (s) => this.updateMusic(s));
        bus.on('SOUND_TOGGLE', () => this.updateMusic(state));
        // El navegador no deja sonar nada hasta el primer gesto
        const unlock = () => { this.ctx?.resume(); this.updateMusic(state); };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    }

    trackFor(s) {
        if (s.gameStatus === 'CINEMATIC') return s.endingFaction ? 'final' : 'cinematica';
        if (s.gameStatus === 'GAME_OVER') return s.endingFaction ? 'final' : null;
        if (['PLAYING', 'MECHANIC', 'PAUSED', 'LOADING'].includes(s.gameStatus)) return s.storyPath === 1 ? 'ruta-fe' : 'ruta-operador';
        return null;
    }

    async updateMusic(s) {
        const id = soundOn() ? this.trackFor(s) : null;
        const gain = s.isPaused ? MUSIC_VOLUME * 0.4 : MUSIC_VOLUME;
        if (id === this.musicId) {
            this.music?.gain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.3);
            return;
        }
        this.musicId = id;
        if (this.music) {
            const old = this.music;
            old.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            old.src.stop(this.ctx.currentTime + 3);
            this.music = null;
        }
        if (!id) return;
        this.ctx ||= new AudioContext();
        this.buffers[id] ||= fetch(`./assets/musica/${id}.mp3`)
            .then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b));
        let buffer;
        try { buffer = await this.buffers[id]; } catch { delete this.buffers[id]; return; }
        if (this.musicId !== id || this.music) return;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const g = this.ctx.createGain();
        g.gain.value = 0;
        g.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.8);
        src.connect(g).connect(this.ctx.destination);
        src.start();
        this.music = { src, gain: g };
    }

    play(id) {
        if (!this.config || !this.config[id]) return;
        const sound = new Audio(this.config[id].src);
        if (!soundOn()) return;
        sound.volume = this.config[id].volume;
        sound.play().catch(() => {}); // Ignorar errores de interacción
    }
}

export const audio = new AudioManager();