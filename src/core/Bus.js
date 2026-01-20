/**
 * BUS.JS
 * Sistema de eventos centralizado para la comunicación desacoplada.
 * Regla 2.A: Vanilla JS puro.
 */

class Bus {
    constructor() {
        this.events = {};
    }

    /**
     * Suscribe un callback a un evento.
     * @param {string} event - Nombre del evento.
     * @param {Function} callback - Función a ejecutar.
     * @returns {Function} - Función para desuscribirse.
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        return () => this.off(event, callback);
    }

    /**
     * Elimina una suscripción.
     * @param {string} event - Nombre del evento.
     * @param {Function} callback - Función a eliminar.
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Emite un evento con datos opcionales.
     * @param {string} event - Nombre del evento.
     * @param {any} data - Datos a pasar a los callbacks.
     */
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

export const bus = new Bus();
