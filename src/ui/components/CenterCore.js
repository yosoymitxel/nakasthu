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
            <${ModuleWrapper} 
                area="C_HEADER"
                locked=${getModuleTutorialStatus('C_HEADER').locked}
                highlighted=${getModuleTutorialStatus('C_HEADER').highlighted}
            >
                <${Panel} title="MOD-03: CORE_HEADER" areaId="C_HEADER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${HeaderNucleo} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="C_MAIN"
                locked=${getModuleTutorialStatus('C_MAIN').locked}
                highlighted=${getModuleTutorialStatus('C_MAIN').highlighted}
            >
                <${Panel} title="MOD-04: OPERATIONS" areaId="C_MAIN" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${Operations} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="C_FOOTER"
                locked=${getModuleTutorialStatus('C_FOOTER').locked}
                highlighted=${getModuleTutorialStatus('C_FOOTER').highlighted}
            >
                <${Panel} title="MOD-05: RESONANCE" areaId="C_FOOTER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${Oscilloscope} />
                <//>
            <//>
        <//>
    `;
};
