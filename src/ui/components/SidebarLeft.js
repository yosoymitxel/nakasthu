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

export const SidebarLeft = ({ getModuleTutorialStatus }) => {
    return html`
        <${React.Fragment}>
            <${ModuleWrapper} area="L_TOP">
                <${Panel} 
                    title="SYS_INIT" 
                    areaId="L_TOP" 
                    className="w-full h-full overflow-hidden"
                    locked=${getModuleTutorialStatus('L_TOP').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('L_TOP').highlighted}
                    allowReadWhileLocked=${false}
                >
                    <${Logo} />
                <//>
            <//>

            <${ModuleWrapper} area="L_UPPER">
                <${Panel} 
                    title="MOD-01: BIOSCAN" 
                    areaId="L_UPPER" 
                    className="w-full h-full overflow-hidden interactive-panel"
                    locked=${getModuleTutorialStatus('L_UPPER').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('L_UPPER').highlighted}
                >
                    <${BioScan} />
                <//>
            <//>

            <${ModuleWrapper} area="L_LOWER">
                <${Panel} 
                    title="MOD-02: ANALYTICS" 
                    areaId="L_LOWER" 
                    className="w-full h-full overflow-hidden"
                    locked=${getModuleTutorialStatus('L_LOWER').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('L_LOWER').highlighted}
                    allowReadWhileLocked=${false}
                >
                    <${Analytics} />
                <//>
            <//>

            <${ModuleWrapper} area="L_BOTTOM">
                <${Panel} 
                    title="RESERVE_LINK" 
                    areaId="L_BOTTOM" 
                    className="w-full h-full overflow-hidden" 
                    contentClassName="!p-0"
                    locked=${getModuleTutorialStatus('L_BOTTOM').locked}
                    isTutorialHighlight=${getModuleTutorialStatus('L_BOTTOM').highlighted}
                >
                    <div className="h-full w-full flex items-center justify-center">
                        <span className="text-[12px] text-zinc-600 tracking-widest uppercase italic animate-pulse">
                            Sin datos de respaldo...
                        </span>
                    </div>
                <//>
            <//>
        <//>
    `;
};
