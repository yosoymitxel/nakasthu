/**
 * OBJECTIVEUTILS.JS
 * Deriva la meta visible de un paso a partir de su configuración y los contadores del nivel.
 * La comparten la barra de objetivo y los modales de briefing/resumen.
 */

const asNumber = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback);

export const getStepObjective = (stepConfig, stats = {}) => {
    const meta = stepConfig?.meta;
    if (!meta) return null;

    const processed = asNumber(stats.processed, 0);
    const quota = stats.quota;
    const technicians = asNumber(stats.technicians, 0);
    const influence = asNumber(stats.influence, 0);

    if (meta.requiredTechnicians) {
        const target = meta.requiredTechnicians;
        return {
            label: `Reclutar ${target} técnicos`,
            hint: 'Autoriza a los técnicos que pasen el escaneo.',
            progress: Math.min(technicians, target),
            target,
            countLabel: `${Math.min(technicians, target)}/${target}`,
            complete: technicians >= target,
            infinite: false
        };
    }

    if (meta.requiredInfluence) {
        const target = meta.requiredInfluence;
        return {
            label: `Reunir ${target} de influencia`,
            hint: 'La influencia solo cuenta al autorizar.',
            progress: Math.min(influence, target),
            target,
            countLabel: `${Math.min(influence, target)}/${target}`,
            complete: influence >= target,
            infinite: false
        };
    }

    if (meta.infinite) {
        return {
            label: 'Sobrevivir al bucle',
            hint: 'Sin cuota: cada sujeto cuenta.',
            progress: processed,
            target: null,
            countLabel: `${processed} procesados`,
            complete: false,
            infinite: true
        };
    }

    if (Number.isFinite(quota) && quota > 0) {
        const done = Math.min(processed, quota);
        return {
            label: `Procesar ${quota} sujetos`,
            hint: 'Cierra el turno antes de que el sistema colapse.',
            progress: done,
            target: quota,
            countLabel: `${done}/${quota}`,
            complete: processed >= quota,
            infinite: false
        };
    }

    return null;
};

export const getObjectivePercent = (objective) => {
    if (!objective) return 0;
    if (objective.infinite) return 100;
    if (!objective.target) return 0;
    return Math.min(100, Math.max(0, Math.round((objective.progress / objective.target) * 100)));
};
