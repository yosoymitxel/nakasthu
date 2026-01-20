/**
 * CENTERCORE.JS
 * Agrupador del bloque central (Operaciones y Núcleo).
 */
import { html } from '../utils/html.js';
import { ModuleWrapper } from './MainLayout.js';
import { Panel } from './Panel.js';
import { HeaderNucleo } from './HeaderNucleo.js';
import { Operations } from './Operations.js';
import { Oscilloscope } from './Oscilloscope.js';

export const CenterCore = ({ getModuleTutorialStatus }) => {
    return html`
        <${React.Fragment}>
            <${ModuleWrapper} area="C_HEADER">
                <${Panel} 
                    title="MOD-03: CORE_HEADER" 
                    areaId="C_HEADER" 
                    className="w-full h-full overflow-hidden" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('C_HEADER').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('C_HEADER').highlighted}
                    allowReadWhileLocked=${false}
                >
                    <${HeaderNucleo} />
                <//>
            <//>

            <${ModuleWrapper} area="C_MAIN">
                <${Panel} 
                    title="MOD-04: OPERATIONS" 
                    areaId="C_MAIN" 
                    className="w-full h-full overflow-hidden" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('C_MAIN').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('C_MAIN').highlighted}
                >
                    <${Operations} />
                <//>
            <//>

            <${ModuleWrapper} area="C_FOOTER">
                <${Panel} 
                    title="MOD-05: RESONANCE" 
                    areaId="C_FOOTER" 
                    className="w-full h-full overflow-hidden interactive-panel" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('C_FOOTER').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('C_FOOTER').highlighted}
                >
                    <${Oscilloscope} />
                <//>
            <//>
        <//>
    `;
};
