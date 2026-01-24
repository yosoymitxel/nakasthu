/**
 * SIDEBARLEFT.JS
 * Agrupador del bloque lateral izquierdo (Análisis e Identidad).
 */
import { html } from '../utils/html.js';
import { ModuleWrapper } from './MainLayout.js';
import { Panel } from './Panel.js';
import { Logo } from './Logo.js';
import { BioScan } from './BioScan.js';
import { Analytics } from './Analytics.js';
import { PortalMonitor } from './PortalMonitor.js';
import { useGameState } from '../hooks/useGameState.js';

import { getModuleName } from '../../systems/ModuleRegistry.js';

export const SidebarLeft = ({ getModuleTutorialStatus, unlockedModules = new Set() }) => {
    const storyPath = useGameState('storyPath');

    return html`
        <${React.Fragment}>
            <${ModuleWrapper} 
                area="L_TOP"
                locked=${getModuleTutorialStatus('L_TOP').locked}
                highlighted=${getModuleTutorialStatus('L_TOP').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-00', storyPath)} areaId="L_TOP" className="w-full h-full overflow-hidden">
                    <${Logo} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_UPPER"
                locked=${getModuleTutorialStatus('L_UPPER').locked}
                highlighted=${getModuleTutorialStatus('L_UPPER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-01', storyPath)} areaId="L_UPPER" className="w-full h-full overflow-hidden">
                    <${BioScan} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_LOWER"
                locked=${getModuleTutorialStatus('L_LOWER').locked}
                highlighted=${getModuleTutorialStatus('L_LOWER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-02', storyPath)} areaId="L_LOWER" className="w-full h-full overflow-hidden">
                    <${Analytics} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_BOTTOM"
                locked=${getModuleTutorialStatus('L_BOTTOM').locked}
                highlighted=${getModuleTutorialStatus('L_BOTTOM').highlighted}
                className="bg-black/20"
            >
                <${Panel} title=${getModuleName('MOD-11', storyPath)} areaId="L_BOTTOM" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${PortalMonitor} />
                <//>
            <//>
        <//>
    `;
};
