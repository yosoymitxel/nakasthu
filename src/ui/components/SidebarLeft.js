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
            <${ModuleWrapper} 
                area="L_TOP"
                locked=${getModuleTutorialStatus('L_TOP').locked}
                highlighted=${getModuleTutorialStatus('L_TOP').highlighted}
            >
                <${Panel} title="SYS_INIT" areaId="L_TOP" className="w-full h-full overflow-hidden">
                    <${Logo} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_UPPER"
                locked=${getModuleTutorialStatus('L_UPPER').locked}
                highlighted=${getModuleTutorialStatus('L_UPPER').highlighted}
            >
                <${Panel} title="MOD-01: BIOSCAN" areaId="L_UPPER" className="w-full h-full overflow-hidden">
                    <${BioScan} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_LOWER"
                locked=${getModuleTutorialStatus('L_LOWER').locked}
                highlighted=${getModuleTutorialStatus('L_LOWER').highlighted}
            >
                <${Panel} title="MOD-02: ANALYTICS" areaId="L_LOWER" className="w-full h-full overflow-hidden">
                    <${Analytics} />
                <//>
            <//>

            <${ModuleWrapper} 
                area="L_BOTTOM"
                locked=${getModuleTutorialStatus('L_BOTTOM').locked}
                highlighted=${getModuleTutorialStatus('L_BOTTOM').highlighted}
                className="bg-black/20"
            >
                <${Panel} title="RESERVE_LINK" areaId="L_BOTTOM" className="w-full h-full overflow-hidden" contentClassName="!p-0">
                    <div className="h-full w-full flex items-center justify-center">
                        <span className="text-[10px] text-zinc-700 tracking-widest uppercase italic animate-pulse">
                            Sin datos de respaldo...
                        </span>
                    </div>
                <//>
            <//>
        <//>
    `;
};
