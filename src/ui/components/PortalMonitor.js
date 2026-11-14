/**
 * PORTALMONITOR.JS (MOD-11)
 * Monitor de flujo y estabilidad dimensional.
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from '../hooks/useGameState.js';
import { CONFIG } from '../../data/gameConfig.js';

const { useState, useEffect } = React;

export const PortalMonitor = () => {
    const [flux, setFlux] = useState({ stability: 100 });
    const stability = useGameState('stability'); // Global stability
    
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;
    const energy = useGameState('energy');
    
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
        <div className="flex flex-col h-full w-full bg-black/40 p-3 font-mono relative overflow-hidden">
            ${isSectarian && html`
                <!-- Efecto Onírico: Partículas del Vacío -->
                <div key="dream-particles" className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-500 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping opacity-10" style=${{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20" style=${{ animationDelay: '2s' }}></div>
                </div>
            `}

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
                        ${isSectarian ? 'Presencia_del_Velo' : 'Flujo_Dimensional'}
                    </span>
                    <h4 className=${`text-sm font-black tracking-tighter ${status.color} ${isSectarian && combinedStability < 40 ? 'animate-pulse blur-[0.5px]' : ''}`}>
                        ${isSectarian ? 'ESTABILIDAD_ESPIRITUAL' : 'INTEGRIDAD'}: ${combinedStability}%
                    </h4>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">${isSectarian ? 'Voluntad' : 'Estado'}</span>
                    <div className=${`text-[10px] font-bold ${status.color} ${isSectarian && combinedStability < 40 ? 'italic' : ''}`}>${status.label}</div>
                </div>
            </div>

            <!-- VISUALIZACIÓN DE ONDA / NÚCLEO -->
            <div className=${`flex-1 relative flex items-center justify-center overflow-hidden border bg-black/60 my-2 ${isSectarian ? 'border-purple-900/30 rounded-full' : 'border-zinc-800/50'}`}>
                ${isSectarian && html`
                    <!-- Símbolo de Ritual de fondo -->
                    <div key="ritual-symbol" className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 animate-[spin_30s_linear_infinite]">
                            <path d="M 50 5 L 61 35 L 95 35 L 68 55 L 79 85 L 50 65 L 21 85 L 32 55 L 5 35 L 39 35 Z" fill="none" stroke="#a855f7" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="0.2" strokeDasharray="1 2" />
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" strokeWidth="0.1" strokeDasharray="4 4" />
                        </svg>
                    </div>
                `}
                <svg viewBox="0 0 200 60" className="w-full h-full relative z-10">
                    ${isSectarian ? html`
                        <${React.Fragment} key="sectarian-wave">
                            <!-- Onda Sectaria: Más orgánica/caótica -->
                            <path 
                                d=${`M 0 30 C 50 ${30 - (100-combinedStability)}, 150 ${30 + (100-combinedStability)}, 200 30`}
                                fill="none" 
                                stroke=${combinedStability < 40 ? '#ef4444' : '#a855f7'} 
                                strokeWidth="2"
                                className="animate-pulse"
                                strokeDasharray=${combinedStability < 40 ? '1 1' : 'none'}
                            />
                            <path 
                                d=${`M 0 30 C 50 ${30 + (100-combinedStability)/2}, 150 ${30 - (100-combinedStability)/2}, 200 30`}
                                fill="none" 
                                stroke=${combinedStability < 40 ? '#ef4444' : '#6366f1'} 
                                strokeWidth="0.5"
                                opacity="0.2"
                            />
                        <//>
                    ` : html`
                        <${React.Fragment} key="tech-wave">
                            <!-- Onda Operario: Más geométrica/técnica -->
                            <path 
                                d=${`M 0 30 Q 50 ${30 - (100-combinedStability)/2}, 100 30 T 200 30`}
                                fill="none" 
                                stroke=${combinedStability < 40 ? '#ef4444' : '#9333ea'} 
                                strokeWidth="1"
                                className="animate-pulse"
                            />
                            <path 
                                d=${`M 0 30 Q 50 ${30 + (100-combinedStability)/3}, 100 30 T 200 30`}
                                fill="none" 
                                stroke=${combinedStability < 40 ? '#ef4444' : '#06b6d4'} 
                                strokeWidth="0.5"
                                opacity="0.5"
                            />
                        <//>
                    `}
                </svg>
                
                <div className=${`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none`}></div>
                
                ${isSectarian && html`
                    <!-- Brillo central onírico -->
                    <div key="dream-glow" className=${`absolute w-12 h-12 rounded-full blur-xl transition-all duration-1000 ${combinedStability < 40 ? 'bg-red-500/20' : 'bg-purple-500/20 animate-pulse'}`}></div>
                `}
            </div>

            <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>${isSectarian ? 'RESONANCIA_DEL_VACÍO' : 'RESONANCIA_LOCAL'}</span>
                    <span>${Math.floor(flux.stability)}%</span>
                </div>
                ${isSectarian ? html`
                    <!-- Ritual Runes instead of a bar -->
                    <div className="flex justify-between gap-1 h-1.5">
                        ${[...Array(10)].map((_, i) => {
                            const active = (flux.stability / 10) > i;
                            return html`
                                <div 
                                    key=${i} 
                                    className=${`flex-1 transition-all duration-700 ${active ? (combinedStability < 40 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]') : 'bg-purple-950/30'}`}
                                    style=${{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
                                ></div>
                            `;
                        })}
                    </div>
                ` : html`
                    <div className=${`w-full h-1 overflow-hidden bg-zinc-900`}>
                        <div 
                            className=${`h-full transition-all duration-500 ${combinedStability < 40 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style=${{ width: `${flux.stability}%` }}
                        ></div>
                    </div>
                `}
            </div>

            <!-- La única acción del monitor: gastar energía para cerrar la brecha -->
            <button
                onClick=${() => bus.emit('PORTAL_STABILIZE')}
                disabled=${flux.stability >= 100 || energy < CONFIG.PORTAL.STABILIZE_COST}
                className=${`portal-fix relative z-10 ${flux.stability < 40 ? 'urgent' : ''}`}
            >
                <span>${isSectarian ? 'Sellar el velo' : 'Estabilizar'}</span>
                <span className="portal-fix-hint">−${CONFIG.PORTAL.STABILIZE_COST}⚡ +${CONFIG.PORTAL.STABILIZE_AMOUNT}%</span>
            </button>

            ${combinedStability < 30 && html`
                <div className="mt-2 text-[8px] text-red-500 animate-pulse font-bold uppercase text-center border border-red-900/30 py-1 relative z-10">
                    ${isSectarian ? 'PELIGRO: EL VELO SE DESGARRA' : 'PELIGRO: BRECHA DIMENSIONAL DETECTADA'}
                </div>
            `}
        </div>
    `;
};
