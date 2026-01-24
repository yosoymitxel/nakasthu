/**
 * PORTALMONITOR.JS (MOD_PORTAL)
 * Monitor de flujo y estabilidad dimensional.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';

const { useState, useEffect } = React;

export const PortalMonitor = () => {
    const [flux, setFlux] = useState({ stability: 100 });
    const stability = useGameState('stability'); // Global stability
    
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;
    
    useEffect(() => {
        const onUpdate = (data) => {
            setFlux(data);
        };
        bus.on('PORTAL_UPDATE', onUpdate);
        return () => bus.off('PORTAL_UPDATE', onUpdate);
    }, []);

    // Combinar estabilidad local del portal con la estabilidad global del sistema
    const combinedStability = Math.floor((flux.stability + (stability || 100)) / 2);

    const getStatus = () => {
        if (combinedStability < 30) return { 
            label: isSectarian ? 'BLASFEMO' : 'CRÍTICO', 
            color: 'text-red-500', 
            glow: 'shadow-red-500/50' 
        };
        if (combinedStability < 60) return { 
            label: isSectarian ? 'PERTURBADO' : 'INESTABLE', 
            color: 'text-purple-500', 
            glow: 'shadow-purple-500/50' 
        };
        return { 
            label: isSectarian ? 'SANTIFICADO' : 'ÓPTIMO', 
            color: isSectarian ? 'text-purple-400' : 'text-cyan-500', 
            glow: isSectarian ? 'shadow-purple-500/30' : 'shadow-cyan-500/50' 
        };
    };

    const status = getStatus();

    return html`
        <div className="flex flex-col h-full w-full bg-black/40 p-3 font-mono">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
                        ${isSectarian ? 'Presencia_del_Aitor' : 'Flujo_Dimensional'}
                    </span>
                    <h4 className=${`text-sm font-black tracking-tighter ${status.color}`}>
                        ${isSectarian ? 'ESTABILIDAD_DEL_VELO' : 'INTEGRIDAD'}: ${combinedStability}%
                    </h4>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">Estado</span>
                    <div className=${`text-[10px] font-bold ${status.color}`}>${status.label}</div>
                </div>
            </div>

            <!-- VISUALIZACIÓN DE ONDA / NÚCLEO -->
            <div className="flex-1 relative flex items-center justify-center overflow-hidden border border-zinc-800/50 bg-black/60 my-2">
                <svg viewBox="0 0 200 60" className="w-full h-full">
                    <path 
                        d=${`M 0 30 Q 50 ${30 - (100-combinedStability)/2}, 100 30 T 200 30`}
                        fill="none" 
                        stroke=${combinedStability < 40 ? '#ef4444' : (isSectarian ? '#a855f7' : '#9333ea')} 
                        strokeWidth="1"
                        className="animate-pulse"
                    />
                    <path 
                        d=${`M 0 30 Q 50 ${30 + (100-combinedStability)/3}, 100 30 T 200 30`}
                        fill="none" 
                        stroke=${combinedStability < 40 ? '#ef4444' : (isSectarian ? '#7e22ce' : '#06b6d4')} 
                        strokeWidth="0.5"
                        opacity="0.5"
                    />
                </svg>
                
                <div className=${`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none`}></div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>${isSectarian ? 'SINTONÍA_EXTERNA' : 'RESONANCIA_LOCAL'}</span>
                    <span>${Math.floor(flux.stability)}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                    <div 
                        className=${`h-full transition-all duration-500 ${combinedStability < 40 ? 'bg-red-500' : (isSectarian ? 'bg-purple-600' : 'bg-purple-500')}`}
                        style=${{ width: `${flux.stability}%` }}
                    ></div>
                </div>
            </div>

            ${combinedStability < 30 && html`
                <div className="mt-2 text-[8px] text-red-500 animate-pulse font-bold uppercase text-center border border-red-900/30 py-1">
                    ${isSectarian ? 'PELIGRO: EL VELO SE DESGARRA' : 'PELIGRO: BRECHA DIMENSIONAL DETECTADA'}
                </div>
            `}
        </div>
    `;
};
