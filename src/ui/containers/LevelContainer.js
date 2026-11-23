/**
 * LEVELCONTAINER.JS
 * Componente contenedor que gestiona el renderizado de diferentes tipos de niveles
 * y el modo infinito.
 */
import { html } from '../utils/html.js';
import { CinematicScreen } from '../screens/cinematic/CinematicScreen.js';
import { MechanicScreen } from '../screens/mechanic/MechanicScreen.js';
import { GameplayScreen } from '../screens/gameplay/GameplayScreen.js';
import { useGameState } from '../hooks/useGameState.js';
import { gameSequencer } from '../../systems/GameSequencer.js';

export const LevelContainer = ({ stepConfig, getModuleTutorialStatus, unlockedModules }) => {
    const stepIntro = useGameState('stepIntro');
    const currentStep = useGameState('currentStep');
    if (!stepConfig) return null;
    // Preludio de un paso jugable (paso 10: Beren, Eidolon y el buscador) antes del briefing
    if (stepConfig.type === 'gameplay' && stepIntro && stepIntro === currentStep && stepConfig.intro) {
        return html`<${CinematicScreen} config=${stepConfig} pages=${stepConfig.intro} onDone=${() => gameSequencer.openBriefing()} />`;
    }

    // Lógica para determinar qué pantalla mostrar
    const renderScreen = () => {
        switch (stepConfig.type) {
            case 'cinematic':
                return html`<${CinematicScreen} config=${stepConfig} />`;
            case 'mechanic':
                return html`<${MechanicScreen} config=${stepConfig} />`;
            case 'gameplay':
            default:
                // El GameplayScreen ya maneja subjectCount: Infinity si viene en la config
                return html`<${GameplayScreen} 
                    getModuleTutorialStatus=${getModuleTutorialStatus} 
                    unlockedModules=${unlockedModules} 
                    config=${stepConfig} 
                />`;
        }
    };

    return html`
        <div className="level-container relative w-full h-full">
            ${renderScreen()}
            
            ${stepConfig.meta?.infinite && html`
                <div className="absolute top-1 left-1/2 -translate-x-1/2 max-[820px]:hidden z-[150] pointer-events-none">
                    <div className="bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">MODO_INFINITO</span>
                        <div className="w-1 h-1 bg-cyan-500 animate-pulse"></div>
                    </div>
                </div>
            `}
        </div>
    `;
};
