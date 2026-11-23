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
        this.musicLevel = 1;
        this.ambience = null;
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
        const gain = (s.isPaused ? MUSIC_VOLUME * 0.4 : MUSIC_VOLUME) * this.musicLevel;
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

    /**
     * Ambiente de una página de cinemática, sintetizado (sin archivos): pájaros, zumbido grave,
     * chasquidos húmedos, un latido cada diez segundos o silencio. `level` escala la música (0 la corta).
     */
    cue(name, level = 1) {
        this.ambience?.stop();
        this.ambience = null;
        if (level !== this.musicLevel) { this.musicLevel = level; this.updateMusic(state); }
        if (!name || name === 'silence' || !soundOn() || typeof AudioContext === 'undefined') return;
        this.ctx ||= new AudioContext();
        const ctx = this.ctx;
        const out = ctx.createGain();
        out.gain.value = 0;
        out.gain.setTargetAtTime(1, ctx.currentTime, 0.4);
        out.connect(ctx.destination);
        const nodes = [];
        const timers = [];
        const tone = (type, freq, gain) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = type; o.frequency.value = freq; g.gain.value = gain;
            o.connect(g).connect(out); o.start();
            nodes.push(o);
            return o;
        };
        // Una ráfaga corta: pájaro (barrido agudo), chasquido (ruido filtrado) o golpe de latido (grave)
        const burst = (kind) => {
            const now = ctx.currentTime, g = ctx.createGain();
            g.connect(out);
            if (kind === 'click') {
                const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
                const src = ctx.createBufferSource(), f = ctx.createBiquadFilter();
                f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 900; f.Q.value = 6;
                src.buffer = buf; g.gain.value = 0.25;
                src.connect(f).connect(g); src.start(now);
                return;
            }
            const o = ctx.createOscillator();
            o.connect(g);
            if (kind === 'bird') {
                const f0 = 2600 + Math.random() * 900;
                o.frequency.setValueAtTime(f0, now);
                o.frequency.exponentialRampToValueAtTime(f0 * 1.35, now + 0.07);
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(0.04, now + 0.015);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
                o.start(now); o.stop(now + 0.1);
            } else {
                o.frequency.value = 52;
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                o.start(now); o.stop(now + 0.25);
            }
        };
        const every = (min, max, fn) => {
            const tick = () => { fn(); timers.push(setTimeout(tick, min + Math.random() * (max - min))); };
            timers.push(setTimeout(tick, min));
        };
        if (name === 'birds') every(500, 2200, () => { burst('bird'); if (Math.random() < 0.5) setTimeout(() => burst('bird'), 110); });
        if (name === 'drone' || name === 'clicks') { tone('sine', 40, 0.22); tone('sine', 80, 0.05); }
        if (name === 'clicks') every(80, 420, () => burst('click'));
        if (name === 'heart') {
            tone('sine', 38, 0.08);
            const beat = () => { burst('beat'); setTimeout(() => burst('beat'), 160); };
            beat();
            timers.push(setInterval(beat, 10000));
        }
        this.ambience = {
            stop: () => {
                timers.forEach(id => { clearTimeout(id); clearInterval(id); });
                out.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
                nodes.forEach(o => o.stop(ctx.currentTime + 0.6));
                setTimeout(() => out.disconnect(), 800);
            }
        };
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