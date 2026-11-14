/**
 * JUICE.JS
 * Sonido sintetizado (ZzFX) y animaciones (Motion) de respuesta. Las dos librerías llegan por CDN:
 * si no cargan, todo sigue funcionando en silencio y sin animar.
 */
import { fxReduced } from './components/FeelLayer.js';

let zzfxMod = null;
import('zzfx').then(m => { zzfxMod = m; }).catch(() => { /* sin red: sin sonido */ });

const SOUND_KEY = 'nakasthu_sound';
export const soundOn = () => { try { return localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; } };
export const setSoundOn = (on) => { try { localStorage.setItem(SOUND_KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ } };

// Parámetros ZzFX: [volumen, aleatoriedad, frecuencia, ataque, sostén, caída, forma, ...]
const SFX = {
    click: [0.25, 0, 900, 0, 0.01, 0.02, 1, 1.5],
    scan: [0.3, 0, 220, 0.02, 0.25, 0.1, 2, 0.6, 18, 0, 0, 0, 0.05],
    scanDone: [0.4, 0, 660, 0, 0.04, 0.12, 1, 1.8, 0, 0, 340, 0.04],
    pass: [0.45, 0, 523, 0.01, 0.06, 0.18, 1, 1.4, 0, 0, 260, 0.05],
    kill: [0.6, 0.05, 90, 0.01, 0.12, 0.35, 3, 2.2, -4, 0, 0, 0, 0, 0.8],
    error: [0.7, 0, 140, 0, 0.18, 0.3, 4, 2, 0, 0, -40, 0.08, 0.1],
    unlock: [0.4, 0, 330, 0.02, 0.1, 0.25, 0, 1.2, 0, 0, 220, 0.08, 0.08],
    quota: [0.5, 0, 392, 0.02, 0.2, 0.4, 0, 1.5, 0, 0, 196, 0.1, 0.1],
    achievement: [0.45, 0, 784, 0.01, 0.12, 0.3, 0, 1.6, 0, 0, 392, 0.06, 0.06],
    alarm: [0.5, 0, 480, 0.02, 0.3, 0.2, 2, 1, 0, 0, 0, 0, 0.12, 0, 0, 0, 0.18],
    whoosh: [0.25, 0.1, 160, 0.05, 0.05, 0.2, 4, 0.6, 30]
};

export const sfx = (name) => {
    if (!zzfxMod || !soundOn() || !SFX[name]) return;
    try {
        const ctx = zzfxMod.ZZFX.audioContext;
        if (ctx?.state === 'suspended') ctx.resume();
        zzfxMod.zzfx(...SFX[name]);
    } catch { /* audio bloqueado hasta el primer gesto */ }
};

const motion = () => (!fxReduced() && window.Motion?.animate ? window.Motion : null);

/** Anima con Motion si está disponible; devuelve la promesa de fin o una resuelta. */
export const animate = (el, keyframes, options) => {
    const m = motion();
    if (!m || !el) return Promise.resolve();
    return m.animate(el, keyframes, options).finished?.catch(() => {}) ?? Promise.resolve();
};

/** Texto flotante que sube y se desvanece desde un elemento (+10, −5…). */
export const floatText = (anchor, text, color = '#e4e4e7') => {
    if (!anchor || fxReduced()) return;
    const r = anchor.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    // Sale hacia la derecha del valor: arriba se pisaría con la barra vecina
    el.style.cssText = `left:${r.right + 6}px;top:${r.top + r.height / 2}px;color:${color}`;
    document.body.appendChild(el);
    const m = motion();
    if (!m) { el.remove(); return; }
    m.animate(el, { x: [0, 22], opacity: [0, 1, 1, 0], scale: [0.8, 1.15, 1, 1] }, { duration: 0.9, ease: [0.23, 1, 0.32, 1] })
        .finished.finally(() => el.remove());
};

/**
 * Despide al sujeto: copia su retrato encima de la escena y lo anima según la sentencia.
 * El original ya se habrá desmontado cuando termine.
 */
export const dismissPortrait = (source, kind) => {
    const m = motion();
    if (!m || !source?.getBoundingClientRect) return;
    const r = source.getBoundingClientRect();
    if (!r.width) return;
    const ghost = document.createElement('canvas');
    ghost.width = source.width;
    ghost.height = source.height;
    ghost.getContext('2d').drawImage(source, 0, 0);
    ghost.className = 'pixel-art portrait-ghost';
    ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    document.body.appendChild(ghost);

    const anim = kind === 'pass'
        // Autorizado: cruza la compuerta hacia el Bastión
        ? m.animate(ghost, { x: [0, r.width * 1.6], opacity: [1, 1, 0], filter: ['brightness(1)', 'brightness(1.6) hue-rotate(60deg)', 'brightness(1)'] }, { duration: 0.55, ease: [0.32, 0.72, 0, 1] })
        // Sacrificado: se aplasta, se enrojece y cae
        : m.animate(ghost, { scaleY: [1, 1.15, 0.05], scaleX: [1, 0.9, 1.4], y: [0, -6, r.height * 0.45], opacity: [1, 1, 0], filter: ['none', 'sepia(1) saturate(6) hue-rotate(-50deg)', 'sepia(1) saturate(6) hue-rotate(-50deg)'] }, { duration: 0.6, ease: 'easeIn' });
    anim.finished.finally(() => ghost.remove());

    if (kind !== 'pass') burst(r, '#dc2626');
};

/** Chispas cuadradas que saltan de un rectángulo (estilo píxel). */
export const burst = (rect, color, count = 14) => {
    const m = motion();
    if (!m) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('i');
        p.className = 'pixel-spark';
        p.style.cssText = `left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height * 0.6}px;background:${color}`;
        document.body.appendChild(p);
        const a = (i / count) * Math.PI * 2;
        const d = 30 + (i % 4) * 14;
        m.animate(p, { x: [0, Math.cos(a) * d], y: [0, Math.sin(a) * d * 0.7 + 30], opacity: [1, 0], scale: [1, 0.4] }, { duration: 0.5 + (i % 3) * 0.12, ease: 'easeOut' })
            .finished.finally(() => p.remove());
    }
};
