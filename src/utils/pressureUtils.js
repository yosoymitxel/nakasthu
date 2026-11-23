/**
 * PRESSUREUTILS.JS
 * Lo que pesa entre turnos: horas de turno, el cerco del paso 10 y el registro de Kamin.
 * Funciones puras: el secuenciador y la UI las leen con el estado que ya tienen.
 */
import { CONFIG } from '../data/gameConfig.js';
import { STEPS_CONFIG } from '../data/stepsConfig.js';
import { KAMIN_REGISTER } from '../data/kaminRegister.js';

const F = CONFIG.FATIGUE;

/** 0 descansado, 1 cansado (energía inicial más baja), 2 agotado (lento y doble pulsación). */
export const fatigueTier = (hours = 0) => (hours >= F.EXHAUSTED_AT ? 2 : hours >= F.TIRED_AT ? 1 : 0);

/** Multiplicador de espera para textos y botones: el agotado lee más despacio. */
export const fatigueFactor = (hours = 0) => (fatigueTier(hours) === 2 ? F.SLOW_FACTOR : 1);

/** Horas que suma un turno: las suyas más una por cada tramo jugado, con tope. */
export const turnShiftHours = (meta, seconds = 0) =>
    (meta?.shiftHours || 0) + Math.min(F.MAX_EXTRA_HOURS, Math.floor(Math.max(0, seconds) / F.SECONDS_PER_HOUR));

/** Horas acumuladas al empezar un paso sin haber jugado los anteriores (selector, continuar). */
export const baseShiftHours = (step) => Object.entries(STEPS_CONFIG)
    .filter(([id]) => Number(id) < step)
    .reduce((sum, [, c]) => sum + (c.meta?.shiftHours || 0), 0);

/** Energía con la que empieza un turno jugable según el cansancio. */
export const fatigueStartEnergy = (hours) => CONFIG.ENERGY.INITIAL - (fatigueTier(hours) >= 1 ? F.TIRED_ENERGY : 0);

/** Parte del cerco que toca tras procesar `processed` sujetos (o null). `given`: partes ya dados. */
export const siegeNoticeAt = (siege, processed, given = 0) => {
    if (!siege || processed <= 0 || processed % siege.every !== 0) return null;
    const index = processed / siege.every - 1;
    if (index !== given || index >= siege.notices.length) return null;
    return { index, grows: index < siege.grow, ...siege.notices[index] };
};

/** Espera entre sujetos: cada parte del cerco la acorta. */
export const siegeDelay = (base, siege, given = 0) => Math.round(base * Math.pow(siege?.delayFactor || 1, given));

/**
 * Escalones visibles del registro de Kamin y fieles actuales.
 * Dentro del paso en curso, un escalón con `at` espera a que la cola pase de ese número.
 * En el paso 10 cada parte del cerco suma sus llegadas.
 */
export const kaminRegister = (step = 1, processed = 0, siegeGiven = 0) => {
    const entries = KAMIN_REGISTER.filter(e => e.step < step || (e.step === step && processed >= (e.at || 0)));
    let faithful = entries.reduce((n, e) => (e.faithful != null ? e.faithful : n), 0);
    const siege = STEPS_CONFIG[10]?.meta?.siege;
    if (siege && step >= 10) {
        const given = step === 10 ? siegeGiven : siege.notices.length;
        faithful += siege.notices.slice(0, given).reduce((n, s) => n + (s.arrivals || 0), 0);
    }
    return { entries, faithful };
};

/** Escalones que aparecen justo ahora (al empezar el paso o al pasar un sujeto), para avisar en la terminal. */
export const kaminRegisterNew = (step, processed, { entering = false } = {}) => KAMIN_REGISTER.filter(e =>
    entering
        ? (e.step === step && !e.at) || (e.step === step - 1 && STEPS_CONFIG[e.step]?.type !== 'gameplay')
        : e.step === step && e.at && e.at === processed
);
