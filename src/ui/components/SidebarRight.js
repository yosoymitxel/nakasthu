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
            <${ModuleWrapper} 
                area="R_TOP"
                locked=${getModuleTutorialStatus('R_TOP').locked}
                highlighted=${getModuleTutorialStatus('R_TOP').highlighted}
            >
                <${Panel} title="MOD-08: CONTROL" areaId="R_TOP" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${ControlPanel} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_UPPER"
                locked=${getModuleTutorialStatus('R_UPPER').locked}
                highlighted=${getModuleTutorialStatus('R_UPPER').highlighted}
            >
                <${Panel} title="MOD-09: LORE_ARCHIVE" areaId="R_UPPER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${LoreArchive} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_MIDDLE"
                locked=${getModuleTutorialStatus('R_MIDDLE').locked}
                highlighted=${getModuleTutorialStatus('R_MIDDLE').highlighted}
            >
                <${Panel} title="MOD-06: ZHYR_OS" areaId="R_MIDDLE" className="w-full h-full overflow-hidden">
                    <${Terminal} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_BOTTOM"
                locked=${getModuleTutorialStatus('R_BOTTOM').locked}
                highlighted=${getModuleTutorialStatus('R_BOTTOM').highlighted}
            >
                <${Panel} title="MOD-07: QUICK_REF" areaId="R_BOTTOM" className="w-full h-full overflow-hidden">
                    <${SystemInfo} />
                <//>
            <//>
        <//>
    `;
};
