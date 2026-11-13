/**
 * PIXELPORTRAIT.JS
 * Busto píxel 16x20 del sujeto, generado a partir de su id.
 * Determinista: el mismo id dibuja siempre la misma cara (nada de Math.random al renderizar).
 */
import { html } from '../utils/html.js';

const { useRef, useEffect, memo } = React;

const W = 16, H = 20;
const INK = '#11131c';
const SKIN = [['#c39b7f', '#725547'], ['#a9805f', '#5e4436'], ['#d8b79c', '#8a6a58'], ['#8a6248', '#4a3328']];
const HAIR = ['#292a31', '#50515b', '#725547', '#c2a36a', '#a9b2c3', '#8c394b'];
const CLOTH = [['#313849', '#5b6578'], ['#29394a', '#587287'], ['#416b55', '#8fbc88'], ['#50515b', '#a9b2c3'], ['#8c394b', '#d45c65']];

const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
};

const draw = (ctx, seed, variant) => {
    let s = hash(String(seed));
    const pick = (arr) => { const v = arr[s % arr.length]; s = Math.imul(s ^ (s >>> 13), 2654435761) >>> 0; return v; };
    const r = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const eidolon = variant === 'eidolon';
    const hooded = variant === 'sect' || variant === 'sect-eidolon';
    const corrupt = eidolon || variant === 'sect-eidolon';

    let [skin, shade] = pick(SKIN);
    const hair = pick(HAIR);
    let [cloth, trim] = pick(CLOTH);
    const hairStyle = pick([0, 1, 2, 3]);
    const mouth = pick([0, 1, 2]);
    if (corrupt) { skin = '#b8c5bf'; shade = '#6e9eaa'; }
    if (hooded) { cloth = '#3b2a55'; trim = '#7c5cb0'; }

    ctx.clearRect(0, 0, W, H);

    // Hombros y torso
    r(INK, 3, 12, 10, 1); r(INK, 2, 13, 12, 7);
    r(cloth, 4, 13, 8, 1); r(cloth, 3, 14, 10, 6);
    r(trim, 7, 13, 2, 2);
    r(trim, 4, 16, 2, 1);

    // Cuello y cabeza con contorno
    r(INK, 4, 3, 8, 9); r(INK, 5, 2, 6, 1);
    r(shade, 7, 11, 2, 2);
    r(skin, 5, 4, 6, 7);
    r(shade, 10, 5, 1, 6);

    // Pelo o capucha
    if (hooded) {
        r(INK, 3, 2, 10, 2); r(cloth, 4, 2, 8, 2); r(cloth, 4, 4, 1, 8); r(cloth, 11, 4, 1, 8); r(trim, 5, 3, 6, 1);
    } else {
        r(hair, 5, 3, 6, 2);
        if (hairStyle === 1) { r(hair, 4, 4, 1, 4); r(hair, 11, 4, 1, 4); }
        if (hairStyle === 2) { r(hair, 4, 4, 1, 7); r(hair, 11, 4, 1, 7); r(hair, 5, 5, 1, 1); }
        if (hairStyle === 3) { r(skin, 5, 3, 6, 2); r(hair, 5, 3, 2, 1); }
    }

    // Cara
    const eye = corrupt ? '#d45c65' : INK;
    r(eye, 6, 7); r(eye, 9, 7);
    if (corrupt) { r('#8c394b', 6, 8); r('#8c394b', 9, 8, 1, 2); }
    if (mouth === 0) r(shade, 7, 9, 2, 1);
    if (mouth === 1) r(INK, 7, 9, 2, 1);
    if (mouth === 2) { r(INK, 7, 9, 1, 1); r(shade, 8, 9, 1, 1); }
};

export const PixelPortrait = memo(({ seed, variant = 'human', className = '' }) => {
    const ref = useRef(null);
    useEffect(() => {
        const ctx = ref.current?.getContext('2d');
        if (ctx) draw(ctx, seed, variant);
    }, [seed, variant]);

    return html`<canvas ref=${ref} width=${W} height=${H} className=${`pixel-art ${className}`} style=${{ aspectRatio: `${W} / ${H}` }}></canvas>`;
});

PixelPortrait.displayName = 'PixelPortrait';
