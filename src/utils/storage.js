/**
 * STORAGE.JS
 * Acceso a localStorage que nunca lanza.
 * POR QUÉ: en iframes con almacenamiento de terceros bloqueado (itch.io, Safari estricto)
 * incluso `typeof localStorage` lanza SecurityError y el Bastión no llegaba a arrancar.
 * Sin almacenamiento, el juego funciona igual; simplemente no recuerda nada.
 */

function backend() {
    try {
        const ls = globalThis.localStorage;
        return ls && typeof ls.getItem === 'function' ? ls : null;
    } catch {
        return null;
    }
}

export function storageGet(key, fallback = null) {
    try {
        const v = backend()?.getItem(key);
        return v === null || v === undefined ? fallback : v;
    } catch {
        return fallback;
    }
}

export function storageSet(key, value) {
    try {
        backend()?.setItem(key, String(value));
        return true;
    } catch {
        return false; // Cuota llena o acceso denegado: no es fatal.
    }
}

export function storageRemove(key) {
    try { backend()?.removeItem(key); } catch { /* sin almacenamiento */ }
}

/** JSON con validación: datos corruptos o de forma inesperada devuelven `fallback`. */
export function storageGetJSON(key, fallback, validate = () => true) {
    const raw = storageGet(key);
    if (raw === null || raw === '') return fallback;
    try {
        const parsed = JSON.parse(raw);
        return validate(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

/** Entero acotado: protege el selector de niveles de valores manipulados (NaN, negativos, 999). */
export function storageGetInt(key, { fallback, min, max }) {
    const n = Number.parseInt(storageGet(key, ''), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}
