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
    const isSectarian = storyPath === 1;

    return html`
        <${React.Fragment}>
            ${isSectarian && html`
                <${React.Fragment} key="sectarian-fx">
                    <!-- Efecto de bruma onírica para el lateral -->
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_50%,_rgba(168,85,247,0.05)_0%,_transparent_50%)]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-950/10 to-transparent"></div>
                    </div>
                <//>
            `}
            <${ModuleWrapper} 
                key="L_TOP"
                area="L_TOP"
                locked=${getModuleTutorialStatus('L_TOP').locked}
                highlighted=${getModuleTutorialStatus('L_TOP').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-00', storyPath)} areaId="L_TOP" className="w-full h-full overflow-hidden">
                    <${Logo} />
                <//>
            <//>

            <${ModuleWrapper} 
                key="L_UPPER"
                area="L_UPPER"
                locked=${getModuleTutorialStatus('L_UPPER').locked}
                highlighted=${getModuleTutorialStatus('L_UPPER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-01', storyPath)} areaId="L_UPPER" className="w-full h-full overflow-hidden">
                    <${BioScan} />
                <//>
            <//>

            <${ModuleWrapper} 
                key="L_LOWER"
                area="L_LOWER"
                locked=${getModuleTutorialStatus('L_LOWER').locked}
                highlighted=${getModuleTutorialStatus('L_LOWER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-02', storyPath)} areaId="L_LOWER" className="w-full h-full overflow-hidden">
                    <${Analytics} />
                <//>
            <//>

            <${ModuleWrapper} 
                key="L_BOTTOM"
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
