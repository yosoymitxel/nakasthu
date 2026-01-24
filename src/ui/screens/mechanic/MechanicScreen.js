/**
 * MECHANICSCREEN.JS
 * Pantalla para pasos de mecánicas especiales (Monolito, Juicio Final).
 */
import { html } from '../../utils/html.js';
import { SpecialMechanic } from '../../components/SpecialMechanic.js';
import { useGameState } from '../../hooks/useGameState.js';
import { bus } from '../../../core/Bus.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';
import { calculateJudgmentRecommendation } from '../../../utils/gameplayUtils.js';

const { memo, useState, useEffect } = React;

export const MechanicScreen = memo(({ config }) => {
    const currentStep = useGameState('currentStep');
    const [judgmentChoice, setJudgmentChoice] = useState(null);

    const handleMonolithComplete = () => {
        gameSequencer.nextStep();
    };

    const handleFinalJudgment = (faction) => {
        gameSequencer.setEnding(faction);
        gameSequencer.nextStep();
    };

    // Caso 11: Juicio Final (Split Terminal)
    if (config.meta?.dualChoice) {
        const { leftOption, rightOption } = config.meta;
        const recommendation = calculateJudgmentRecommendation();

        return html`
            <div className="mechanic-screen fixed inset-0 bg-[#050505] flex items-center justify-center z-[450] p-8">
                <div className="w-full max-w-6xl flex flex-col items-center gap-12">
                    
                    <div className="text-center space-y-4">
                        <h2 className="text-zinc-600 text-[10px] tracking-[1em] uppercase">PASO 11 // EL JUICIO FINAL</h2>
                        <h1 className="text-3xl font-bold text-zinc-100 uppercase tracking-widest">${config.name}</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full h-[400px]">
                        <!-- Lado Izquierdo: ORDEN (Leina) -->
                        <div 
                            className=${`relative border border-cyan-900/40 bg-cyan-950/5 p-8 flex flex-col items-center justify-center gap-8 transition-all hover:bg-cyan-950/10 ${judgmentChoice === 'orden' ? 'ring-2 ring-cyan-500' : ''}`}
                            onClick=${() => setJudgmentChoice('orden')}
                        >
                            <div className="absolute top-4 left-4 text-[10px] text-cyan-600 font-bold tracking-widest uppercase">FACTION: ORDER</div>
                            <div className="text-cyan-500 text-center space-y-4">
                                <h3 className="text-2xl font-black tracking-widest">${leftOption.name}</h3>
                                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-mono">
                                    "La estabilidad es la única forma de salvar lo que queda. Cierra la brecha, Operador. Protege el mundo real."
                                </p>
                            </div>
                            
                            <button 
                                onClick=${(e) => { e.stopPropagation(); handleFinalJudgment('orden'); }}
                                className="px-8 py-3 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] hover:bg-cyan-500 hover:text-black transition-all"
                            >
                                EJECUTAR SENTENCIA
                            </button>
                        </div>

                        <!-- Lado Derecho: CAOS (Kamin) -->
                        <div 
                            className=${`relative border border-purple-900/40 bg-purple-950/5 p-8 flex flex-col items-center justify-center gap-8 transition-all hover:bg-purple-950/10 ${judgmentChoice === 'caos' ? 'ring-2 ring-purple-500' : ''}`}
                            onClick=${() => setJudgmentChoice('caos')}
                        >
                            <div className="absolute top-4 right-4 text-[10px] text-purple-600 font-bold tracking-widest uppercase text-right">FACTION: CHAOS</div>
                            <div className="text-purple-500 text-center space-y-4">
                                <h3 className="text-2xl font-black tracking-widest">${rightOption.name}</h3>
                                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-mono">
                                    "El renacimiento exige sacrificio. Trasciende los límites de la carne. Deja que las sombras nos consuman."
                                </p>
                            </div>

                            <button 
                                onClick=${(e) => { e.stopPropagation(); handleFinalJudgment('caos'); }}
                                className="px-8 py-3 bg-purple-900/20 border border-purple-500/50 text-purple-400 text-xs font-black uppercase tracking-[0.3em] hover:bg-purple-500 hover:text-black transition-all"
                            >
                                ABRAZAR EL VACÍO
                            </button>
                        </div>
                    </div>

                    <!-- Recomendación del Sistema -->
                    <div className="w-full max-w-2xl bg-zinc-950/80 border border-zinc-800/50 p-6 font-mono">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">ANÁLISIS DE DESEMPEÑO TÉCNICO V/S FE</span>
                            <span className=${`text-[10px] uppercase font-bold ${recommendation.dominant === 'orden' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                RECOMENDACIÓN: ${recommendation.recommendation}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-zinc-500 uppercase">
                                    <span>Eficacia Técnica</span>
                                    <span className="text-cyan-600">${recommendation.techPercentage}%</span>
                                </div>
                                <div className="h-1 bg-zinc-900 overflow-hidden">
                                    <div className="h-full bg-cyan-600" style=${{ width: `${recommendation.techPercentage}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-zinc-500 uppercase">
                                    <span>Fervor de la Fe</span>
                                    <span className="text-purple-600">${recommendation.faithPercentage}%</span>
                                </div>
                                <div className="h-1 bg-zinc-900 overflow-hidden">
                                    <div className="h-full bg-purple-600" style=${{ width: `${recommendation.faithPercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Por defecto: Casos 2 y 11 (Monolito)
    return html`
        <div className="mechanic-screen-monolith">
            <${SpecialMechanic} onComplete=${handleMonolithComplete} />
        </div>
    `;
});

MechanicScreen.displayName = 'MechanicScreen';
