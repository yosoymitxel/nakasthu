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

export const SidebarRight = ({ getModuleTutorialStatus }) => {
    const storyPath = useGameState('storyPath');
    const isSectarian = storyPath === 1;

    return html`
        <${React.Fragment}>
            <${ModuleWrapper} 
                area="R_TOP"
                locked=${getModuleTutorialStatus('R_TOP').locked}
                highlighted=${getModuleTutorialStatus('R_TOP').highlighted}
            >
                <${Panel} title=${isSectarian ? "MOD-08: SANTUARIO_MANDO" : "MOD-08: CONTROL"} areaId="R_TOP" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${ControlPanel} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_UPPER"
                locked=${getModuleTutorialStatus('R_UPPER').locked}
                highlighted=${getModuleTutorialStatus('R_UPPER').highlighted}
            >
                <${Panel} title=${isSectarian ? "MOD-09: CÓDICE_SAGRADO" : "MOD-09: LORE_ARCHIVE"} areaId="R_UPPER" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <${LoreArchive} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_MIDDLE"
                locked=${getModuleTutorialStatus('R_MIDDLE').locked}
                highlighted=${getModuleTutorialStatus('R_MIDDLE').highlighted}
            >
                <${Panel} title=${isSectarian ? "MOD-06: COMUNIÓN_ALMAS" : "MOD-06: ZHYR_OS"} areaId="R_MIDDLE" className="w-full h-full overflow-hidden">
                    ${isSectarian ? html`<${FactionTracker} />` : html`<${Terminal} />`}
                <//>
            <//>

            <${ModuleWrapper} 
                area="R_BOTTOM"
                locked=${getModuleTutorialStatus('R_BOTTOM').locked}
                highlighted=${getModuleTutorialStatus('R_BOTTOM').highlighted}
            >
                <${Panel} title=${isSectarian ? "MOD-07: AGITACIÓN_HERÉTICA" : "MOD-07: QUICK_REF"} areaId="R_BOTTOM" className="w-full h-full overflow-hidden">
                    ${isSectarian ? html`<${UnrestMonitor} />` : html`<${SystemInfo} />`}
                <//>
            <//>
        <//>
    `;
};
