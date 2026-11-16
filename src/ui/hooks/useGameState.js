/**
 * USEGAMESTATE.JS
 * El Puente (Bridge) optimizado entre React y el Motor Vanilla.
 * Regla 2.B: Suscripción con limpieza de memoria garantizada.
 */
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';

const { useState, useEffect } = React;

/**
 * Hook para consumir el estado global.
 * @param {string} key - Propiedad específica a observar.
 * @returns {any} - Valor actual.
 */
export const useGameState = (key = null) => {
    const [value, setValue] = useState(key ? state[key] : { ...state });

    useEffect(() => {
        const handler = (data) => {
            if (key) {
                // El evento específico trae el valor nuevo; el global trae el estado completo
                if (data !== null && typeof data === 'object' && key in data) {
                    setValue(data[key]);
                } else {
                    setValue(data);
                }
            } else {
                setValue({ ...state });
            }
        };

        // Escuchar cambios específicos Y cambios globales (batch)
        const eventName = key ? `STATE_CHANGE:${key}` : 'STATE_CHANGE';
        bus.on(eventName, handler);
        
        // Si hay un key, también escuchamos el evento global por si hay un batch update
        if (key) {
            bus.on('STATE_CHANGE', handler);
        }

        return () => {
            bus.off(eventName, handler);
            if (key) {
                bus.off('STATE_CHANGE', handler);
            }
        };
    }, [key]);

    return value;
};
