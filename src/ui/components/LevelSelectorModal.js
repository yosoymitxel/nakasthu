/**
 * LEVELSELECTORMODAL.JS
 * Modal para seleccionar niveles (pasos narrativos) desbloqueados.
 */
import { html } from '../utils/html.js';
import { STEPS_CONFIG } from '../../data/stepsConfig.js';
import { gameSequencer } from '../../systems/GameSequencer.js';
import { useGameState } from '../hooks/useGameState.js';

export const LevelSelectorModal = ({ isOpen, onClose }) => {
    const maxStepReached = useGameState('maxStepReached') || 1;
    
    if (!isOpen) return null;

    const steps = Object.entries(STEPS_CONFIG).map(([id, config]) => ({
        id: parseInt(id),
        ...config
    })).filter(s => s.id <= 12); // Pasos normales hasta el epílogo

    const infiniteSteps = Object.entries(STEPS_CONFIG).map(([id, config]) => ({
        id: parseInt(id),
        ...config
    })).filter(s => s.id > 12); // Pasos especiales (Infinito, etc)

    const handleSelect = (id) => {
        gameSequencer.jumpToStep(id);
        onClose();
    };

    const renderStepButton = (step, maxStepReached, handleSelect) => {
        const isLocked = step.id > maxStepReached;
        const isCinematic = step.type === 'cinematic';
        
        return html`
            <button 
                key=${step.id}
                onClick=${() => !isLocked && handleSelect(step.id)}
                className=${`group relative p-4 border text-left transition-all ${
                    isLocked 
                    ? 'border-zinc-900 bg-zinc-950/50 cursor-not-allowed opacity-50' 
                    : 'border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-950/10'
                }`}
                disabled=${isLocked}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className=${`text-[10px] font-bold tracking-widest ${isLocked ? 'text-zinc-700' : 'text-cyan-600'}`}>
                        PASO_${step.id.toString().padStart(2, '0')}
                    </span>
                    <div className=${`p-1 border ${isLocked ? 'border-zinc-800 text-zinc-800' : 'border-zinc-700 text-zinc-500'}`}>
                        ${isCinematic ? html`
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                                <line x1="7" y1="2" x2="7" y2="22" />
                                <line x1="17" y1="2" x2="17" y2="22" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <line x1="2" y1="7" x2="7" y2="7" />
                                <line x1="2" y1="17" x2="7" y2="17" />
                                <line x1="17" y1="17" x2="22" y2="17" />
                                <line x1="17" y1="7" x2="22" y2="7" />
                            </svg>
                        ` : html`
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        `}
                    </div>
                </div>
                
                <h4 className=${`text-xs font-bold tracking-wider uppercase mb-1 ${isLocked ? 'text-zinc-600' : 'text-zinc-200 group-hover:text-cyan-400'}`}>
                    ${isLocked ? 'ACCESO RESTRINGIDO' : step.name}
                </h4>
                
                <p className="text-[9px] text-zinc-500 leading-tight uppercase tracking-tighter line-clamp-2">
                    ${isLocked ? 'Completa la secuencia previa para sincronizar.' : (step.briefingText || 'Evaluación de biomasa en curso...')}
                </p>

                ${!isLocked && html`
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-500 transition-all group-hover:w-full"></div>
                `}
            </button>
        `;
    };

    return html`
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <!-- Header -->
                <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
                    <div className="space-y-1">
                        <h2 className="text-zinc-100 font-bold tracking-[0.3em] uppercase text-sm">Selector de Secuencias</h2>
                        <p className="text-zinc-500 text-[10px] tracking-widest uppercase">Base de Datos de Despliegue Bastión</p>
                    </div>
                    <button onClick=${onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <!-- Grid de Niveles -->
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                    <!-- Secuencias de Historia -->
                    <div className="space-y-4">
                        <h3 className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase border-l-2 border-zinc-800 pl-3">Secuencias de Historia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${steps.map(step => renderStepButton(step, maxStepReached, handleSelect))}
                        </div>
                    </div>

                    <!-- Modos Especiales -->
                    ${infiniteSteps.length > 0 && html`
                        <div className="space-y-4 pt-4 border-t border-zinc-900">
                            <h3 className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase border-l-2 border-cyan-900 pl-3">Protocolos de Continuidad</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${infiniteSteps.map(step => renderStepButton(step, maxStepReached, handleSelect))}
                            </div>
                        </div>
                    `}
                </div>

                <!-- Footer -->
                <footer className="p-4 border-t border-zinc-800 bg-zinc-900/20 text-center">
                    <p className="text-[8px] text-zinc-600 tracking-[0.2em] uppercase">
                        Precaución: El salto de secuencia puede causar desorientación neural.
                    </p>
                </footer>
            </div>
        </div>
    `;
};
