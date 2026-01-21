/**
 * GAMEPLAYSCREEN.JS
 * Pantalla principal de juego (12x6 Grid).
 * Regla 2.C: Estilo industrial, módulos activos.
 */
import { html } from '../../utils/html.js';
import { MainLayout, ModuleWrapper } from '../../components/MainLayout.js';
import { SidebarLeft } from '../../components/SidebarLeft.js';
import { CenterCore } from '../../components/CenterCore.js';
import { SidebarRight } from '../../components/SidebarRight.js';
import { useGameState } from '../../hooks/useGameState.js';

const { memo } = React;

export const GameplayScreen = memo(({ getModuleTutorialStatus }) => {
    return html`
        <div className="gameplay-screen w-full h-full animate-fade-in">
            <${MainLayout}>
                <${SidebarLeft} getModuleTutorialStatus=${getModuleTutorialStatus} />
                <${CenterCore} getModuleTutorialStatus=${getModuleTutorialStatus} />
                <${SidebarRight} getModuleTutorialStatus=${getModuleTutorialStatus} />
            <//>
        </div>
    `;
});

GameplayScreen.displayName = 'GameplayScreen';
