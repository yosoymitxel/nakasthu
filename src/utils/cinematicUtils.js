/**
 * CINEMATICUTILS.JS
 * Páginas de cinemática a partir de stepsConfig (sin vista: lo usan CinematicScreen y los tests).
 */
import { narrativeFlags } from '../systems/NarrativeFlags.js';
import { missingList } from '../systems/MissingList.js';

// Reparte el texto en tantas páginas como planos, cortando por frases y equilibrando la longitud
const splitPages = (text, shots = [null]) => {
    const sentences = text.match(/[^.!?»]+[.!?»]+\s*|.+$/g) || [text];
    const out = [];
    let left = text.length;
    shots.forEach((shot, i) => {
        const target = left / (shots.length - i);
        let chunk = '';
        while (sentences.length && (!chunk || chunk.length + sentences[0].length / 2 < target || shots.length - i === 1)) chunk += sentences.shift();
        left -= chunk.length;
        if (chunk.trim()) out.push([chunk.trim(), shot]);
    });
    return out.length ? out : [[text, shots[0]]];
};

/** Páginas de un paso: las escritas a mano, o el briefing repartido si no hay; y la hora de Kael al final. */
export const pagesFor = (config, faction) => {
    let pages;
    if (config.meta?.endings) {
        const endings = config.meta.endings;
        pages = (endings[faction] || endings.orden).pages;
    } else if (config.pages) {
        pages = config.pages;
    } else {
        pages = splitPages(config.briefingText || '', config.shots).map(([text, shot]) => ({ text, shot }));
        if (!pages.some(p => p.shot)) pages[0] = { ...pages[0], shot: config.shot };
    }
    pages = pages
        .filter(p => narrativeFlags.matches(p.if) && !(p.unless && narrativeFlags.matches(p.unless)))
        // `{lista}`: los nombres de LA LISTA de esta partida, los de tu consola primero
        .map(p => ({ title: config.name, ...p, text: p.text.replace('{lista}', () => missingList.readout()) }));
    if (config.clock317) pages.push({ title: '', black: true, clock: true, text: config.clock317 });
    return pages;
};

// La respuesta deja de ser fiable: letras que se repiten, una palabra que sale dos veces.
export const corruptText = (text) => {
    let n = 0;
    return text.replace(/[A-Za-zÁÉÍÓÚáéíóúñÑ]{4,}/g, (w) => {
        n++;
        if (n === 3) return `${w} ${w}`;
        if (n % 4 === 2) return w.slice(0, 2) + w[2].repeat(3) + w.slice(3);
        return w;
    });
};

