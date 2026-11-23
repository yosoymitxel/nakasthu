/**
 * OBJECTIVEBAR.JS
 * Meta del turno siempre visible sobre la guía de flujo: qué hay que conseguir,
 * cuánto falta y si ya está cumplido.
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';
import { STEPS_CONFIG } from '../../data/stepsConfig.js';
import { getStepObjective, getObjectivePercent } from '../../utils/objectiveUtils.js';
import { fatigueTier } from '../../utils/pressureUtils.js';

export const ObjectiveBar = ({ isSectarian }) => {
    const currentStep = useGameState('currentStep');
    const processed = useGameState('processedCount');
    const quota = useGameState('quota');
    const technicians = useGameState('techniciansRecruited');
    const influence = useGameState('influenceGathered');
    const shiftHours = useGameState('shiftHours') || 0;

    const stepConfig = STEPS_CONFIG[currentStep];
    const objective = getStepObjective(stepConfig, {
        processed,
        quota,
        technicians,
        influence
    });

    if (!objective) return null;

    const percent = getObjectivePercent(objective);
    const stateLabel = objective.complete ? 'CUMPLIDO' : objective.infinite ? 'SIN LÍMITE' : 'EN CURSO';
    const className = `objective-bar ${isSectarian ? 'sect' : ''} ${objective.complete ? 'done' : ''}`;

    return html`
        <div className=${className} role="group" aria-label="Objetivo del turno">
            <div className="objective-head">
                <div className="objective-title">
                    <span className="objective-kicker">OBJETIVO // ${String(currentStep).padStart(2, '0')}${shiftHours > 0 && html` · <span className=${`objective-shift t${fatigueTier(shiftHours)}`} title="Horas de turno sin relevo">TURNO ${shiftHours} H</span>`}</span>
                    <span className="objective-label">${objective.label}</span>
                </div>
                <span className="objective-state">${stateLabel}</span>
            </div>

            <div
                className="objective-track"
                role="progressbar"
                aria-label=${objective.label}
                aria-valuemin="0"
                aria-valuemax=${objective.target || 100}
                aria-valuenow=${objective.target ? objective.progress : percent}
            >
                <div
                    className=${`objective-fill ${objective.infinite ? 'is-infinite' : ''}`}
                    style=${{ width: `${percent}%` }}
                ></div>
            </div>

            <div className="objective-meta">
                <span className="objective-hint">${objective.hint}</span>
                <span className="objective-count">${objective.countLabel}</span>
            </div>
        </div>
    `;
};
