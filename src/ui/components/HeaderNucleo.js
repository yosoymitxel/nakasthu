/**
 * HEADERNUCLEO.JS
 * Bloque 5: MOD-03 CORE_HEADER.
 * Restauración de barras originales y alineación de sistema.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';

export const HeaderNucleo = () => {
    const energy = useGameState('energy');
    const stability = useGameState('stability');
    const orbitalCycle = useGameState('orbitalCycle');
    const isPaused = useGameState('isPaused');

    const handleManual = () => {
        bus.emit('OPEN_MODAL', {
            title: 'OPERATIONAL_MANUAL',
            content: html`
                <div className="space-y-4 text-zinc-400 font-mono text-[11px]">
                    <p><strong className="text-cyan-500">OBJETIVO:</strong> Procesar biomasa según criterios de pureza.</p>
                    <p><strong className="text-red-500">SACRIFICAR:</strong> Elimina sujetos corruptos (+30 Energía). Error si es puro (-25 Estabilidad).</p>
                    <p><strong className="text-emerald-500">AUTORIZAR:</strong> Permite el paso de sujetos puros (-10 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).</p>
                    <p><strong className="text-amber-500">RESONANCIA:</strong> Sincroniza frecuencia y fase para evitar degradación de estabilidad.</p>
                </div>
            `
        });
    };

    return html`
        <div className="relative flex flex-col h-full w-full bg-black/20 p-2 justify-center gap-1">
            <!-- CONTADOR SOLAR (Top Right) -->
            <div className="absolute top-2 right-4 text-[10px] font-mono text-zinc-500 tracking-tighter">
                SOLAR ${Math.floor(orbitalCycle)}/100
            </div>

            <!-- Barra 1: ENERGÍA (Amarillo/Amber) -->
            <div className="flex items-center gap-3 pr-16">
                <span className="text-[7px] text-amber-600 font-bold uppercase tracking-widest w-16">Energy_Flux</span>
                <div className="flex-1 h-3 bg-zinc-900/50 relative border border-zinc-800/30">
                    <div 
                        className="absolute h-full bg-amber-500 transition-all duration-1000"
                        style=${{ width: `${Math.floor(energy)}%` }}
                    ></div>
                </div>
                <span className="text-[9px] font-mono text-amber-500/80 w-8 text-right">${Math.floor(energy)}%</span>
            </div>

            <!-- Barra 2: ESTABILIDAD (Rojo) -->
            <div className="flex items-center gap-3 pr-16">
                <span className="text-[7px] text-red-600 font-bold uppercase tracking-widest w-16">Stability_Idx</span>
                <div className="flex-1 h-3 bg-zinc-900/50 relative border border-zinc-800/30">
                    <div 
                        className="absolute h-full bg-red-600 transition-all duration-1000"
                        style=${{ width: `${Math.floor(stability)}%` }}
                    ></div>
                </div>
                <span className="text-[9px] font-mono text-red-500/80 w-8 text-right">${Math.floor(stability)}%</span>
            </div>

            <!-- Barra 3: CICLO ORBITAL (Cian) -->
            <div className="flex items-center gap-3 pr-16">
                <span className="text-[7px] text-cyan-600 font-bold uppercase tracking-widest w-16">Orbital_Sync</span>
                <div className="flex-1 h-3 bg-zinc-900/50 relative border border-zinc-800/30">
                    <div 
                        className="absolute h-full bg-cyan-500 transition-all duration-[2000ms] ease-linear"
                        style=${{ width: `${Math.floor(orbitalCycle)}%` }}
                    ></div>
                </div>
                <span className="text-[9px] font-mono text-cyan-500/80 w-8 text-right">${Math.floor(orbitalCycle)}%</span>
            </div>
        </div>
    `;
};
