/**
 * ICON.JS
 * Iconos píxel (pixelarticons, fuente alojada en assets/). Sustituyen a emojis y dingbats,
 * que cada sistema operativo pinta distinto y rompen la estética industrial.
 * Decorativo por defecto (aria-hidden); con `label` se anuncia como imagen.
 */
import { html } from '../utils/html.js';
import { ICON_CODES } from '../iconMap.js';

// Color semántico por recurso: el mismo icono siempre con el mismo significado.
export const ICON_TONE = {
    energy: 'text-amber-400',
    stability: 'text-red-400',
    orbital: 'text-cyan-400',
    ok: 'text-emerald-400',
    bad: 'text-red-500',
    warn: 'text-amber-500',
    lore: 'text-cyan-300',
    sect: 'text-purple-400',
    muted: 'text-zinc-500'
};

export const iconChar = (name) => String.fromCodePoint(ICON_CODES[name] ?? ICON_CODES.circle);

export const Icon = ({ name, tone, className = '', label }) => html`
    <i
        className=${`pxi ${tone ? ICON_TONE[tone] || '' : ''} ${className}`}
        aria-hidden=${label ? undefined : 'true'}
        role=${label ? 'img' : undefined}
        aria-label=${label}
        data-icon=${name}
    >${iconChar(name)}</i>
`;
