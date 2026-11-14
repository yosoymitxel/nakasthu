/**
 * FEELLAYER.JS
 * Respuesta sensorial a los eventos del motor, en tres niveles (leve / medio / fuerte):
 * sacudida por trauma que decae, sello de veredicto y aviso de error. Solo capa visual:
 * no toca el estado. Se apaga con "Reducir efectos" o con prefers-reduced-motion.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect, useRef } = React;

const KEY = 'nakasthu_reduce_fx';
export const fxReduced = () => {
    try {
        return localStorage.getItem(KEY) === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { return false; }
};
export const setFxReduced = (on) => { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ } };

// Sacudida = trauma². Los golpes suman en vez de reiniciar, y decae en tiempo real.
let trauma = 0, raf = 0, last = 0, phase = 0;
const root = document.documentElement;
const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    trauma = Math.max(0, trauma - 1.8 * dt);
    phase += dt * 30;
    const s = trauma * trauma;
    root.style.setProperty('--shake-x', `${(9 * s * Math.sin(phase * 1.7)).toFixed(2)}px`);
    root.style.setProperty('--shake-y', `${(6 * s * Math.sin(phase * 2.3)).toFixed(2)}px`);
    if (trauma > 0) raf = requestAnimationFrame(step);
    else { raf = 0; root.style.removeProperty('--shake-x'); root.style.removeProperty('--shake-y'); }
};
export const shake = (amount) => {
    if (fxReduced()) return;
    trauma = Math.min(1, trauma + amount);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
};

const TIER = { small: 0.3, medium: 0.5, large: 0.85 };

export const FeelLayer = () => {
    const storyPath = useGameState('storyPath') || 0;
    const errors = useGameState('judgmentErrors');
    const prevErrors = useRef(errors);
    const [stamp, setStamp] = useState(null); // { id, text, tone }
    const sect = storyPath === 1;

    const show = (text, tone, ms = 1100) => {
        const id = Date.now();
        setStamp({ id, text, tone });
        setTimeout(() => setStamp(s => (s?.id === id ? null : s)), ms);
    };

    useEffect(() => {
        const onScan = () => shake(TIER.small);
        const onDecision = ({ action }) => {
            const kill = /SACRIF/i.test(action || '');
            shake(kill ? TIER.medium : TIER.small);
            show(kill ? (sect ? 'PURGADO' : 'SACRIFICADO') : (sect ? 'CONSAGRADO' : 'AUTORIZADO'), kill ? 'kill' : 'pass');
        };
        const onQuota = () => { shake(TIER.medium); show(sect ? 'COSECHA COMPLETA' : 'CUOTA CUMPLIDA', 'quota', 1600); };
        const onThreat = () => shake(TIER.medium);

        bus.on('SCAN_COMPLETED', onScan);
        bus.on('DECISION_MADE', onDecision);
        bus.on('QUOTA_MET', onQuota);
        bus.on('PORTAL_ANOMALY', onThreat);
        bus.on('RIOT_EVENT', onThreat);
        bus.on('SABOTAGE_TRIGGERED', onThreat);
        return () => {
            bus.off('SCAN_COMPLETED', onScan);
            bus.off('DECISION_MADE', onDecision);
            bus.off('QUOTA_MET', onQuota);
            bus.off('PORTAL_ANOMALY', onThreat);
            bus.off('RIOT_EVENT', onThreat);
            bus.off('SABOTAGE_TRIGGERED', onThreat);
        };
    }, [sect]);

    // Un error de juicio pisa al sello del veredicto: es lo que el jugador tiene que ver
    useEffect(() => {
        if (errors > prevErrors.current) {
            shake(TIER.large);
            show(sect ? 'JUICIO PROFANO' : 'ERROR DE JUICIO', 'error', 1500);
        }
        prevErrors.current = errors;
    }, [errors]);

    if (!stamp) return null;
    return html`
        <div className="feel-stamp-wrap" aria-live="assertive">
            <div key=${stamp.id} className=${`feel-stamp ${stamp.tone} ${fxReduced() ? 'still' : ''}`}>${stamp.text}</div>
        </div>
    `;
};
