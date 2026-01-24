/**
 * SIDEBARRIGHT.JS
 * Agrupador del bloque lateral derecho (Control, Archivo y OS).
 */
import { html } from '../utils/html.js';
import { ModuleWrapper } from './MainLayout.js';
import { Panel } from './Panel.js';
import { ControlPanel } from './ControlPanel.js';
import { LoreArchive } from './LoreArchive.js';
import { Terminal } from './Terminal.js';
import { SystemInfo } from './SystemInfo.js';
import { FactionTracker } from './FactionTracker.js';
import { UnrestMonitor } from './UnrestMonitor.js';
import { useGameState } from '../hooks/useGameState.js';

import { getModuleName } from '../../systems/ModuleRegistry.js';

export const SidebarRight = ({ getModuleTutorialStatus, unlockedModules = new Set() }) => {
    const storyPath = useGameState('storyPath');
    
    // MOD-08 (Faction System) se muestra si está activo en el registro, 
    // independientemente de la ruta (aunque su contenido cambie)
    const isSectarian = storyPath === 1;
    const isFactionActive = unlockedModules && typeof unlockedModules.has === 'function' 
        ? unlockedModules.has('MOD-08') 
        : false;

    // Determinar el título del panel R_MIDDLE
    const rMiddleTitle = isFactionActive 
        ? (isSectarian ? getModuleName('MOD-08', storyPath) : 'Sistemas de Control')
        : getModuleName('MOD-09', storyPath);

    return html`
        <${React.Fragment}>
            <${ModuleWrapper} 
                area="R_TOP"
                locked=${getModuleTutorialStatus('R_TOP').locked}
                highlighted=${getModuleTutorialStatus('R_TOP').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-07', storyPath)} areaId="R_TOP" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${ControlPanel} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_UPPER"
                locked=${getModuleTutorialStatus('R_UPPER').locked}
                highlighted=${getModuleTutorialStatus('R_UPPER').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-03', storyPath)} areaId="R_UPPER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${LoreArchive} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_MIDDLE"
                locked=${getModuleTutorialStatus('R_MIDDLE').locked}
                highlighted=${getModuleTutorialStatus('R_MIDDLE').highlighted}
            >
                <${Panel} title=${rMiddleTitle} areaId="R_MIDDLE" className="w-full h-full overflow-hidden">
                    <div className="flex flex-col h-full gap-2">
                        ${isFactionActive && html`<${FactionTracker} />`}
                        <${Terminal} />
                    </div>
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_BOTTOM"
                locked=${getModuleTutorialStatus('R_BOTTOM').locked}
                highlighted=${getModuleTutorialStatus('R_BOTTOM').highlighted}
            >
                <${Panel} title=${getModuleName('MOD-10', storyPath)} areaId="R_BOTTOM" className="w-full h-full overflow-hidden">
                    <${UnrestMonitor} />
                <//>
            <//>
        <//>
    `;
};
