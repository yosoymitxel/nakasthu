/**
 * LEINACONSOLE.JS
 * La consola de Leina en el paso 11 (cap. 15): cuatro comandos, uno con doble pulsación.
 * En orden amplían la puerta (final 'caos'); los mismos cuatro al revés la cierran ('orden').
 * Regla 2.A: Vanilla JS puro. Reductor sin estado propio: la vista guarda el resultado y lo vuelve a pasar.
 */

/** Estado inicial de la consola a partir de `stepsConfig[11].meta.console`. */
export const createConsoleRun = (cfg) => ({
    entered: [], faction: null, armed: false, done: false, error: null, vortex: cfg.vortex.start
});

const sequenceFor = (cfg, faction) => {
    const ids = cfg.commands.map(c => c.id);
    return faction === 'orden' ? ids.reverse() : ids;
};

/** Resuelve lo tecleado a un comando: id, etiqueta o una de sus palabras. */
export const matchCommand = (cfg, input) => {
    const t = String(input || '').trim().toLowerCase();
    if (!t) return null;
    return cfg.commands.find(c => c.id === t || c.label.toLowerCase().startsWith(t) || c.words?.some(w => t.startsWith(w))) || null;
};

/**
 * Pulsa un comando. El primero decide el sentido; uno fuera de orden anula la secuencia y la deja
 * como al principio (se puede empezar en el otro sentido). El de doble pulsación pide una segunda igual.
 */
export const pressCommand = (cfg, run, id) => {
    if (run.done) return run;
    const cmd = cfg.commands.find(c => c.id === id);
    if (!cmd) return run;
    let faction = run.faction;
    if (!faction) {
        if (id === sequenceFor(cfg, 'caos')[0]) faction = 'caos';
        else if (id === sequenceFor(cfg, 'orden')[0]) faction = 'orden';
    }
    const expected = faction ? sequenceFor(cfg, faction)[run.entered.length] : null;
    if (id !== expected) {
        return { ...createConsoleRun(cfg), error: 'ORDEN NO VÁLIDO. SECUENCIA ANULADA.' };
    }
    if (cmd.double && !run.armed) return { ...run, faction, armed: true, error: null };
    const entered = [...run.entered, id];
    return {
        entered, faction, armed: false, error: null,
        done: entered.length === cfg.commands.length,
        vortex: cfg.vortex[faction][entered.length - 1]
    };
};
