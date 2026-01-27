/**
 * PANEL.JS
 * Componente base para los contenidos de los módulos.
 * El "Embudo" Nivel 1.5: El Puente entre Bloque y Componente.
 * Estética: Industrial, Dark Sci-Fi.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { bus } from '../../core/Bus.js';

const { useState, useEffect, memo } = React;

export const Panel = memo(({ title, children, className = "", contentClassName = "", areaId = null }) => {
    const storyPath = useGameState('storyPath');
    const colorOverride = useGameState('coreColorOverride');
    const [showTooltip, setShowTooltip] = useState(false);

    // Tema basado en la ruta narrativa o override de nivel
    const isReligious = storyPath === 1;
    const themeColor = colorOverride || (isReligious ? 'purple' : 'cyan');
    const accentColor = colorOverride 
        ? (colorOverride === 'cyan' ? 'text-cyan-400' : (colorOverride === 'purple' ? 'text-purple-400' : 'text-zinc-400'))
        : (isReligious ? 'text-purple-400' : 'text-amber-500');

    const tooltips = isReligious ? {
        'L_TOP': "Sello del Vacío y heráldica de la Orden.",
        'L_UPPER': "Lectura del alma y detección de impurezas biológicas.",
        'L_LOWER': "Análisis de resonancia espiritual y probabilidad de corrupción.",
        'L_BOTTOM': "Enlace con el éter de datos.",
        'C_HEADER': "Estado del Santuario: Fe, Estabilidad y Ciclo Orbital.",
        'C_MAIN': "Altar del Vacío: Observación del sujeto.",
        'C_FOOTER': "Ajusta la resonancia para evitar el colapso del velo.",
        'R_TOP': "Ritos de purificación y seguimiento de sacrificios.",
        'R_UPPER': "Libros de sabiduría y registros de la Orden.",
        'R_MIDDLE': "Altar de comandos RITUAL_OS.",
        'R_BOTTOM': "Referencia rápida de ritos del sistema."
    } : {
        'L_TOP': "Identificador de sesión y logo corporativo.",
        'L_UPPER': "Escaneo biológico y detección de anomalías.",
        'L_LOWER': "Análisis de datos y probabilidad de corrupción.",
        'L_BOTTOM': "Enlace de reserva de datos.",
        'C_HEADER': "Estado del núcleo: Energía, Estabilidad y Ciclo.",
        'C_MAIN': "Visualizador de cámara de contención.",
        'C_FOOTER': "Ajusta la frecuencia para evitar el colapso de integridad.",
        'R_TOP': "Objetivos de misión y seguimiento de cuota.",
        'R_UPPER': "Archivos históricos y registros del sistema.",
        'R_MIDDLE': "Consola de comandos ZHYR_OS.",
        'R_BOTTOM': "Referencia rápida de comandos de sistema."
    };

    return html`
        <div className=${`relative flex flex-col h-full w-full overflow-hidden ${className} ${isReligious ? 'bg-indigo-950/5' : ''}`}>
            
            ${isReligious && html`
                <div className="absolute top-0 right-0 p-1 pointer-events-none opacity-20">
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-purple-500">
                        <path d="M0 6 L12 6 M6 0 L6 12" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                </div>
            `}

            <!-- Header del Panel -->
            <div 
                onMouseEnter=${() => setShowTooltip(true)}
                onMouseLeave=${() => setShowTooltip(false)}
                className=${`
                    px-2 py-1 flex justify-between items-center bg-black/40 border-b border-zinc-800/40 relative z-10
                    ${isReligious ? 'border-purple-900/30 bg-indigo-950/20' : ''}
                `}
            >
                <div className="flex items-center gap-2">
                    <div className=${`w-1.5 h-1.5 rounded-full ${isReligious ? 'bg-purple-500 animate-pulse' : 'bg-amber-600'} opacity-40`}></div>
                    <span className=${`text-[11px] font-bold uppercase tracking-[0.2em] font-mono ${accentColor}`}>
                        ${title}
                    </span>
                </div>
                
                <!-- Indicador de señal -->
                <div className="flex gap-0.5">
                    ${[1, 2, 3].map(i => html`
                        <div key=${i} className=${`w-1 h-3 ${isReligious ? 'bg-purple-800/40 border-l border-purple-500/20' : 'bg-zinc-800'}`}></div>
                    `)}
                </div>

                <!-- Tooltip Contextual (Level 3 Info) -->
                ${showTooltip && areaId && tooltips[areaId] && html`
                    <div className="absolute top-full left-0 w-full bg-black/95 border border-zinc-800 p-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-[10px] text-zinc-400 font-mono leading-tight italic">
                            [DOC] ${tooltips[areaId]}
                        </p>
                    </div>
                `}
            </div>

            <!-- Contenido del Panel (Aquí van los Componentes Nivel 1) -->
            <div className=${`flex-1 relative scroll-container ${contentClassName}`}>
                ${children}
            </div>
        </div>
    `;
});

Panel.displayName = 'Panel';

