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
