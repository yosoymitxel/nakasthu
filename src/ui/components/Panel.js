/**
 * PANEL.JS
 * Componente base para los módulos de la interfaz.
 * Estética: Industrial, Dark Sci-Fi.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { bus } from '../../core/Bus.js';

export const Panel = ({ title, children, className = "", contentClassName = "", areaId = null, locked = false, isTutorialHighlight = false, allowReadWhileLocked = false }) => {
    const phase = useGameState('phase');
    const [highlight, setHighlight] = React.useState(null); // { color, type }
    const [showTooltip, setShowTooltip] = React.useState(false);
    const isEclipse = phase === 'ECLIPSE';
    const isInteractive = className.includes('interactive-panel');

    const tooltips = {
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

    React.useEffect(() => {
        if (!areaId) return;

        const onHighlight = (data) => {
            if (data.areas && data.areas.includes(areaId)) {
                setHighlight({ color: data.color, type: data.type || 'pulse' });
                if (data.duration) {
                    setTimeout(() => setHighlight(null), data.duration);
                }
            } else if (data.areas === null || (data.clear && data.clear.includes(areaId))) {
                setHighlight(null);
            }
        };

        bus.on('HIGHLIGHT_MODULE', onHighlight);
        return () => bus.off('HIGHLIGHT_MODULE', onHighlight);
    }, [areaId]);

    const highlightStyle = isTutorialHighlight ? {
        outline: '2px solid #06b6d4',
        boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
        zIndex: 10
    } : (highlight ? {
        outline: `2px solid ${highlight.color}`,
        outlineOffset: '-2px',
        zIndex: 10
    } : {});

    return html`
        <div 
            style=${highlightStyle}
            className=${`
                relative bg-zinc-900/40 border border-zinc-800 transition-all duration-300
                flex flex-col overflow-hidden group
                ${highlight?.type === 'pulse' ? 'animate-pulse-fast' : ''}
                ${isInteractive ? 'hover:bg-zinc-800/20 cursor-pointer' : ''}
                ${isEclipse ? 'shadow-[0_0_15px_rgba(6,182,212,0.02)]' : 'shadow-[0_0_15px_rgba(217,119,6,0.02)]'}
                ${className} 
                ${locked && !allowReadWhileLocked ? 'opacity-20 pointer-events-none grayscale' : ''} 
                ${locked && allowReadWhileLocked ? 'opacity-80 grayscale-[0.2] pointer-events-none border-zinc-800' : ''} 
                ${isTutorialHighlight ? 'animate-pulse border-cyan-500/50 z-50 bg-cyan-950/10' : ''}
            `}
        >
            <div 
                onMouseEnter=${() => setShowTooltip(true)}
                onMouseLeave=${() => setShowTooltip(false)}
                className=${`px-2 py-1 flex justify-between items-center border-b border-zinc-800 transition-colors duration-700 relative z-20 ${isEclipse ? 'bg-cyan-950/10' : 'bg-zinc-900/60'}`}
            >
                <span className=${`text-[14px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${isEclipse ? 'text-cyan-400' : 'text-amber-500'}`}>
                    ${title}
                </span>
                <div className=${`w-1.5 h-1.5 ${isEclipse ? 'bg-cyan-500/60 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-amber-600/30'}`}></div>
                
                <!-- Tooltip Contextual -->
                ${showTooltip && areaId && tooltips[areaId] && html`
                    <div className="absolute top-full left-0 w-full bg-zinc-950 border border-zinc-800 p-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-[12px] text-zinc-300 font-mono leading-tight italic">
                            ${tooltips[areaId]}
                        </p>
                    </div>
                `}
            </div>

            <div className=${`flex-1 p-2 relative ${contentClassName}`}>
                ${children}
                
                <!-- Esquinas decorativas finas -->
                <div className=${`absolute top-0 left-0 w-2 h-2 border-t border-l ${isEclipse ? 'border-cyan-500/40' : 'border-amber-600/20'}`}></div>
                <div className=${`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${isEclipse ? 'border-cyan-500/40' : 'border-amber-600/20'}`}></div>
            </div>
        </div>
    `;
};
