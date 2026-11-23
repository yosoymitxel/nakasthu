/**
 * INTERLUDES.JS
 * Lógica de las escenas jugables dentro de las cinemáticas. Vanilla JS puro (Regla 2.A):
 * reductores sin estado propio; la vista guarda el resultado.
 */

/** Doce informes: sellar uno a uno; leer no cambia nada, pero queda dicho. */
export const createReportsRun = (cfg) => ({ index: 0, read: [], sealed: 0, timedOut: false, done: false, total: cfg.items.length });

export const readReport = (run) => (run.done || run.read.includes(run.index) ? run : { ...run, read: [...run.read, run.index] });

export const sealReport = (run) => {
    if (run.done) return run;
    const sealed = run.sealed + 1;
    return { ...run, sealed, index: Math.min(sealed, run.total - 1), done: sealed >= run.total };
};

/** Se acaba el tiempo: el resto se sella sin ella. */
export const timeoutReports = (run) => (run.done ? run : { ...run, sealed: run.total, timedOut: true, done: true });

/** La línea de cierre: si leyó el de la galería siete, si se le acabó el tiempo, o lo normal. */
export const reportsVerdict = (cfg, run) => {
    const seven = cfg.items.findIndex(i => i.seven);
    if (run.read.includes(seven)) return cfg.read;
    if (run.timedOut) return cfg.timeout;
    return cfg.unread;
};

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ ]/g, ' ').trim();
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Busca un nombre en el paquete de Eidolon. Los del libro tienen ficha escrita; los demás, por hash:
 * el veintiséis por ciento sale en un lote (siempre el mismo para el mismo nombre).
 * `listNames`: nombres de LA LISTA de la partida (los procesados en tu mesa se marcan).
 */
export const searchEidolon = (cfg, query, listNames = []) => {
    const q = fold(query);
    if (q.length < 2) return null;
    const words = q.split(/\s+/);
    const rec = cfg.records.find(r => r.keys.some(k => words.includes(k)));
    if (rec) return { query: query.trim(), lines: rec.lines, lot: rec.lines.some(l => /lote \d/.test(l)) };
    const h = hash(q);
    const lot = h % 100 < 26;
    const lines = [lot
        ? cfg.lot.replace('{lote}', 100 + (h % 400)).replace('{plantilla}', `${1 + (h % 9)}-${'ABCDEF'[h % 6]}`)
        : cfg.none];
    if (listNames.some(n => fold(n).startsWith(q) || fold(n).includes(q))) lines.push(cfg.mine);
    return { query: query.trim(), lines, lot };
};
