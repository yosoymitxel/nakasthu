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

export const SidebarRight = ({ getModuleTutorialStatus }) => {
    return html`
        <${React.Fragment}>
            <${ModuleWrapper} area="R_TOP">
                <${Panel} 
                    title="CONTROL" 
                    areaId="R_TOP" 
                    className="w-full h-full overflow-hidden" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('R_TOP').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('R_TOP').highlighted}
                    allowReadWhileLocked=${false}
                >
                    <${ControlPanel} />
                <//>
            <//>

            <${ModuleWrapper} area="R_UPPER">
                <${Panel} 
                    title="LORE_ARCHIVE" 
                    areaId="R_UPPER" 
                    className="w-full h-full overflow-hidden" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('R_UPPER').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('R_UPPER').highlighted}
                >
                    <${LoreArchive} />
                <//>
            <//>

            <${ModuleWrapper} area="R_MIDDLE">
                <${Panel} 
                    title="MOD-06: ZHYR_OS" 
                    areaId="R_MIDDLE" 
                    className="w-full h-full overflow-hidden"
                    locked=${getModuleTutorialStatus('R_MIDDLE').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('R_MIDDLE').highlighted}
                    allowReadWhileLocked=${true}
                >
                    <${Terminal} />
                <//>
            <//>

            <${ModuleWrapper} area="R_BOTTOM">
                <${Panel} 
                    title="MOD-07: QUICK_REF" 
                    areaId="R_BOTTOM" 
                    className="w-full h-full overflow-hidden interactive-panel"
                    locked=${getModuleTutorialStatus('R_BOTTOM').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('R_BOTTOM').highlighted}
                    allowReadWhileLocked=${false}
                >
                    <${SystemInfo} />
                <//>
            <//>
        <//>
    `;
};
