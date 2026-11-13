/**
 * PIXELPORTRAIT.JS
 * Busto píxel 16x20 del sujeto, generado a partir de su id y su especie.
 * Determinista: el mismo id dibuja siempre la misma cara (nada de Math.random al renderizar).
 * El retrato es cosmético: un Eidolon imita cualquier forma y solo se delata con `corrupt`.
 */
import { html } from '../utils/html.js';

const { useRef, useEffect, memo } = React;

const W = 16, H = 20;
const INK = '#11131c';
const SKIN = [['#c39b7f', '#725547'], ['#a9805f', '#5e4436'], ['#d8b79c', '#8a6a58'], ['#8a6248', '#4a3328']];
const HAIR = ['#292a31', '#50515b', '#725547', '#c2a36a', '#a9b2c3', '#8c394b'];
const CLOTH = [['#313849', '#5b6578'], ['#29394a', '#587287'], ['#416b55', '#8fbc88'], ['#50515b', '#a9b2c3'], ['#8c394b', '#d45c65']];

// Formas no humanas de Zhyr. [piel, sombra]
const ALIENS = ['zhyriano', 'nakari', 'quitinoso', 'cristalino'];
const ALIEN_SKIN = {
    zhyriano: ['#a9b2c3', '#5b6578'],
    nakari: ['#7c5cb0', '#3b2a55'],
    quitinoso: ['#416b55', '#1f3a2c'],
    cristalino: ['#6e9eaa', '#29394a']
};

const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
};

/** Forma del retrato según la especie del motor (HUMANO, CLON, HÍBRIDO, EIDOLON). */
export const morphFor = (species, seed) => {
    const h = hash(String(seed));
    if (species === 'CLON') return 'clon';
    if (species === 'HÍBRIDO') return ALIENS[h % ALIENS.length];
    if (species === 'EIDOLON') return ['humano', 'clon', ...ALIENS][h % 6];
    return 'humano';
};

const draw = (ctx, seed, morph, hooded, corrupt) => {
    let s = hash(String(seed));
    const pick = (arr) => { const v = arr[s % arr.length]; s = Math.imul(s ^ (s >>> 13), 2654435761) >>> 0; return v; };
    const r = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    let [skin, shade] = pick(SKIN);
    const hair = pick(HAIR);
    let [cloth, trim] = pick(CLOTH);
    const hairStyle = pick([0, 1, 2, 3]);
    const mouth = pick([0, 1, 2]);
    const alien = ALIEN_SKIN[morph];
    if (alien) [skin, shade] = alien;
    if (morph === 'clon') { cloth = '#50515b'; trim = '#a9b2c3'; }
    if (hooded) { cloth = '#3b2a55'; trim = '#7c5cb0'; }
    if (corrupt) { skin = '#b8c5bf'; shade = '#6e9eaa'; }

    ctx.clearRect(0, 0, W, H);

    // Hombros y torso
    r(INK, 3, 12, 10, 1); r(INK, 2, 13, 12, 7);
    r(cloth, 4, 13, 8, 1); r(cloth, 3, 14, 10, 6);
    r(trim, 7, 13, 2, 2);
    r(trim, 4, 16, 2, 1);
    r(shade, 7, 11, 2, 2);

    // Cabeza con contorno; cada forma cambia la silueta
    if (morph === 'zhyriano') {
        r(INK, 3, 1, 10, 8); r(INK, 4, 9, 8, 2); r(INK, 5, 11, 6, 1);
        r(skin, 4, 2, 8, 6); r(skin, 5, 8, 6, 2); r(skin, 6, 10, 4, 1);
        r(shade, 11, 3, 1, 5);
        r(INK, 5, 6, 2, 2); r(INK, 9, 6, 2, 2); r('#587287', 5, 6); r('#587287', 9, 6);
        r(shade, 7, 10, 2, 1);
    } else if (morph === 'nakari') {
        r(INK, 4, 3, 8, 9); r(INK, 5, 2, 6, 1);
        r(skin, 5, 3, 6, 8);
        r(shade, 10, 4, 1, 7);
        r(INK, 3, 1, 1, 4); r(INK, 12, 1, 1, 4); r(skin, 3, 2, 1, 2); r(skin, 12, 2, 1, 2);
        r('#c2a36a', 6, 7); r('#c2a36a', 9, 7); r('#c2a36a', 7, 5, 2, 1); r(INK, 8, 5);
        r(shade, 6, 9, 4, 1); r(shade, 6, 10); r(shade, 9, 10);
    } else if (morph === 'quitinoso') {
        r(INK, 4, 3, 8, 8); r(INK, 5, 2, 6, 1); r(INK, 5, 11, 2, 1); r(INK, 9, 11, 2, 1);
        r(skin, 5, 3, 6, 7);
        r(shade, 5, 3, 6, 1); r(shade, 7, 4, 2, 2);
        r(INK, 5, 0, 1, 2); r(INK, 10, 0, 1, 2);
        r('#d45c65', 5, 6, 2, 2); r('#d45c65', 9, 6, 2, 2); r('#8c394b', 6, 7); r('#8c394b', 10, 7);
        r(shade, 6, 9, 1, 2); r(shade, 9, 9, 1, 2); r(INK, 7, 9, 2, 1);
    } else if (morph === 'cristalino') {
        r(INK, 6, 1, 4, 1); r(INK, 5, 2, 6, 1); r(INK, 4, 3, 8, 6); r(INK, 5, 9, 6, 1); r(INK, 6, 10, 4, 2);
        r(skin, 6, 2, 4, 1); r(skin, 5, 3, 6, 6); r(skin, 6, 9, 4, 1); r(skin, 7, 10, 2, 1);
        r('#e3e7ec', 6, 3, 1, 3); r('#e3e7ec', 7, 2); r(shade, 9, 4, 2, 5); r(shade, 8, 8, 2, 2);
        r('#e3e7ec', 6, 7); r('#e3e7ec', 9, 7);
    } else {
        r(INK, 4, 3, 8, 9); r(INK, 5, 2, 6, 1);
        r(skin, 5, 4, 6, 7);
        r(shade, 10, 5, 1, 6);
        if (morph === 'clon') {
            // Rapado y con el código de lote en la frente
            r(skin, 5, 3, 6, 1); r(INK, 6, 5); r(INK, 8, 5); r(INK, 9, 5);
        } else if (!hooded) {
            r(hair, 5, 3, 6, 2);
            if (hairStyle === 1) { r(hair, 4, 4, 1, 4); r(hair, 11, 4, 1, 4); }
            if (hairStyle === 2) { r(hair, 4, 4, 1, 7); r(hair, 11, 4, 1, 7); r(hair, 5, 5, 1, 1); }
            if (hairStyle === 3) { r(skin, 5, 3, 6, 2); r(hair, 5, 3, 2, 1); }
        }
        r(INK, 6, 7); r(INK, 9, 7);
        if (mouth === 0) r(shade, 7, 9, 2, 1);
        if (mouth === 1) r(INK, 7, 9, 2, 1);
        if (mouth === 2) { r(INK, 7, 9, 1, 1); r(shade, 8, 9, 1, 1); }
    }

    if (hooded) {
        r(INK, 3, 1, 10, 2); r(cloth, 4, 1, 8, 2); r(cloth, 3, 3, 2, 9); r(cloth, 11, 3, 2, 9); r(trim, 5, 2, 6, 1);
    }

    // Un Eidolon inestable deja de sostener la forma
    if (corrupt) {
        r('#d45c65', 6, 7); r('#d45c65', 9, 7); r('#8c394b', 6, 8); r('#8c394b', 9, 8, 1, 2);
        r(INK, 4, 5, 3, 1); r(INK, 10, 10, 3, 1);
    }
};

export const PixelPortrait = memo(({ seed, morph = 'humano', hooded = false, corrupt = false, className = '' }) => {
    const ref = useRef(null);
    useEffect(() => {
        const ctx = ref.current?.getContext('2d');
        if (ctx) draw(ctx, seed, morph, hooded, corrupt);
    }, [seed, morph, hooded, corrupt]);

    return html`<canvas ref=${ref} width=${W} height=${H} className=${`pixel-art ${className}`} style=${{ aspectRatio: `${W} / ${H}` }}></canvas>`;
});

PixelPortrait.displayName = 'PixelPortrait';
