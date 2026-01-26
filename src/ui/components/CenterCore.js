/**
 * CENTERCORE.JS
 * Agrupador del bloque central (Operaciones y Núcleo).
 */
import { html } from '../utils/html.js';
import { ModuleWrapper } from './MainLayout.js';
import { Panel } from './Panel.js';
import { HeaderNucleo } from './HeaderNucleo.js';
import { Operations } from './Operations.js';
import { EmergencyConsole } from './EmergencyConsole.js';

import { getModuleName } from '../../systems/ModuleRegistry.js';
import { useGameState } from '../hooks/useGameState.js';

export const CenterCore = ({ getModuleTutorialStatus, unlockedModules = new Set() }) => {
    const storyPath = useGameState('storyPath');

    return html`
        <${React.Fragment}>
            <${ModuleWrapper} 
                area="C_HEADER"
                locked=${getModuleTutorialStatus('C_HEADER').locked}
                highlighted=${getModuleTutorialStatus('C_HEADER').highlighted}
            >
                <${Panel} title="SYS_STATUS: CORE_NUCLEO" areaId="C_HEADER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${HeaderNucleo} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="C_MAIN"
                locked=${getModuleTutorialStatus('C_MAIN').locked}
                highlighted=${getModuleTutorialStatus('C_MAIN').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-04', storyPath)} areaId="C_MAIN" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${Operations} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="C_FOOTER"
                locked=${getModuleTutorialStatus('C_FOOTER').locked}
                highlighted=${getModuleTutorialStatus('C_FOOTER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-06', storyPath)} areaId="C_FOOTER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${EmergencyConsole} />
                <//>
            <//>
        <//>
    `;
};
