/**
 * AUDIO.JS
 * Gestor de audio para Nakasthu.
 * Regla 2.A: Vanilla JS puro.
 */
import { bus } from './Bus.js';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.config = null;
        this.currentAmbient = null;
    }

    async init() {
        try {
            const response = await fetch('./src/data/AudioConfig.json');
            this.config = await response.json();
            console.log("%c[AUDIO] Engine inicializado. Configuración de frecuencias cargada.", "color: #8b5cf6;");
            
            // Suscribirse a eventos para disparar SFX
            bus.on('TERMINAL_PRINT', () => this.play('sfx_terminal'));
            bus.on('CRITICAL_ERROR_FEEDBACK', () => this.play('sfx_alert'));
            
            // Suscribirse a cambios de fase para el ambiente
            bus.on('STATE_CHANGE:mode', (mode) => {
                if (state.gameStatus !== 'PLAYING') return;
                if (mode === 'ECLIPSE') {
                    this.playAmbient('ambient_eclipse');
                } else {
                    this.playAmbient('ambient_solar');
                }
            });

            // Iniciar ambiente al comenzar el juego
            bus.on('STATE_CHANGE:gameStatus', (status) => {
                if (status === 'PLAYING') {
                    const ambient = state.mode === 'ECLIPSE' ? 'ambient_eclipse' : 'ambient_solar';
                    this.playAmbient(ambient);
                } else if (status === 'GAME_OVER' || status === 'START_MENU') {
                    this.stopAmbient();
                }
            });

            // Modular volumen según ciclo orbital (Fase 16)
            bus.on('STATE_CHANGE:orbitalCycle', (cycle) => {
                if (state.mode === 'ECLIPSE' && this.currentAmbient && this.currentAmbient.dataset.id === 'ambient_eclipse') {
                    const baseVol = this.config['ambient_eclipse'].volume;
                    // Aumentar intensidad hasta un 50% extra según el ciclo
                    this.currentAmbient.volume = baseVol + (cycle / 100) * 0.3;
                }
            });

        } catch (error) {
            console.error("[AUDIO] Error crítico al cargar configuración:", error);
        }
    }

    play(id) {
        if (!this.config || !this.config[id]) return;
        const sound = new Audio(this.config[id].src);
        sound.volume = this.config[id].volume;
        sound.play().catch(() => {}); // Ignorar errores de interacción
    }

    playAmbient(id) {
        if (!this.config || !this.config[id]) return;
        
        // No reiniciar si ya está sonando el mismo ambiente
        if (this.currentAmbient && this.currentAmbient.dataset.id === id) return;
        
        if (this.currentAmbient) {
            this.stopAmbient();
        }

        const audio = new Audio(this.config[id].src);
        audio.loop = true;
        audio.volume = this.config[id].volume;
        audio.dataset.id = id;
        this.currentAmbient = audio;

        audio.play().catch(() => {
            console.warn("[AUDIO] Ambiente en espera de interacción del usuario.");
        });
    }

    stopAmbient() {
        if (this.currentAmbient) {
            const oldAmbient = this.currentAmbient;
            let vol = oldAmbient.volume;
            const fade = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0) {
                    oldAmbient.pause();
                    clearInterval(fade);
                } else {
                    oldAmbient.volume = Math.max(0, vol);
                }
            }, 50);
            this.currentAmbient = null;
        }
    }
}

export const audio = new AudioManager();