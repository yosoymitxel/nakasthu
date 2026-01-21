/**
 * MAINLAYOUT.JS
 * Componente estructural que define la grid de 12x6.
 * Regla 1: Grid inviolable con áreas nombradas.
 * 
 * Sistema Polimórfico: Labels cambian según storyPath
 * - storyPath 0: Ruta Técnico (Operador)
 * - storyPath 1: Ruta Religioso (Líder)
 */
import { html } from '../utils/html.js';
import { useGameState } from '../hooks/useGameState.js';

const { memo } = React;

/**
 * Configuración de etiquetas según ruta narrativa
 */
const LABELS_CONFIG = {
    0: { // Ruta Técnico/Operador
        action1: 'Mano de Obra',
        action2: 'Filtración Química',
        action3: 'Autorizar',
        rejectLabel: 'Sacrificar',
        utilityLabel: 'Utilidad Técnica',
        themeColor: 'cyan'
    },
    1: { // Ruta Religioso/Líder
        action1: 'Devoción Total',
        action2: 'Sincronía con el Aitor',
        action3: 'Consagrar',
        rejectLabel: 'Purgar',
        utilityLabel: 'Fe Acumulada',
        themeColor: 'purple'
    }
};

/**
 * Hook para obtener las etiquetas actuales según storyPath
 */
export const useStoryLabels = () => {
    const storyPath = useGameState('storyPath');
    return LABELS_CONFIG[storyPath] || LABELS_CONFIG[0];
};

/**
 * Componente MainLayout - Grid 12x6 con soporte polimórfico
 * El "Embudo" Nivel 3: El Contenedor Estructural
 */
export const MainLayout = memo(({ children }) => {
    const storyPath = useGameState('storyPath');
    const themeColor = LABELS_CONFIG[storyPath]?.themeColor || 'cyan';

    return html`
        <div 
            className=${`main-layout-grid theme-${themeColor} relative`}
            data-story-path=${storyPath}
        >
            ${children}
            <!-- Grid Debugger Overlay (Opcional, se puede activar via CSS) -->
            <div className="grid-debug-overlay pointer-events-none absolute inset-0 z-0 opacity-5 border border-zinc-500/10"></div>
        </div>
    `;
});

MainLayout.displayName = 'MainLayout';

/**
 * Wrapper de módulo con soporte para área de grid
 * El "Embudo" Nivel 2: El Bloque Modular
 * Maneja bordes, sombras y estados visuales (Highlight/Lock)
 */
export const ModuleWrapper = memo(({ area, children, className = "", locked = false, highlighted = false }) => {
    const storyPath = useGameState('storyPath');
    const themeColor = LABELS_CONFIG[storyPath]?.themeColor || 'cyan';

    const focusMode = useGameState('focusMode');
    const isShielded = focusMode && area !== 'C_MAIN' && area !== 'C_HEADER' && area !== 'L_LOWER';

    const highlightStyle = highlighted ? {
        boxShadow: `0 0 20px rgba(${themeColor === 'cyan' ? '6, 182, 212' : '147, 51, 234'}, 0.4)`,
        zIndex: 50
    } : {};

    return html`
        <div 
            style=${highlightStyle}
            className=${`
                mod-container mod-${area} 
                border border-zinc-800/50 transition-all duration-[1200ms] ease-in-out
                ${(locked || isShielded) ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}
                ${highlighted ? `border-${themeColor}-500/60 ring-1 ring-${themeColor}-500/30 bg-${themeColor}-950/5 animate-pulse-slow` : 'bg-transparent'}
                ${isShielded ? 'scale-[0.98]' : 'scale-100'}
                ${className}
            `}
        >
            <!-- Borde Industrial -->
            <div className=${`absolute top-0 left-0 w-full h-full pointer-events-none border border-zinc-900/10 z-10`}></div>
            
            <!-- Contenido del Bloque (Componentes Nivel 1) -->
            <div className="w-full h-full relative z-0">
                ${children}
            </div>

            <!-- Sombras y Efectos de Bloque -->
            <div className=${`absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] z-20`}></div>
            
            <!-- Indicador de Bloqueo -->
            ${locked && !isShielded && html`
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[1px]">
                    <div className="transform -rotate-12 border border-red-900/50 bg-black/80 px-4 py-1">
                        <span className="text-[10px] text-red-500 font-black tracking-[0.2em] uppercase">
                            Locked_Access
                        </span>
                    </div>
                </div>
            `}

            <!-- Indicador de Blindaje (Focus Mode) -->
            ${isShielded && html`
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-md animate-fade-in duration-700">
                    <div className="flex flex-col items-center gap-4 animate-flicker">
                        <div className="w-16 h-[1px] bg-cyan-900/40"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] text-cyan-800 font-bold tracking-[0.5em] uppercase mb-1">
                                SISTEMA_EN_FOCO
                            </span>
                            <span className="text-[7px] text-cyan-900/60 font-mono tracking-[0.2em] uppercase">
                                Blindaje Neural Activo
                            </span>
                        </div>
                        <div className="w-16 h-[1px] bg-cyan-900/40"></div>
                        
                        <!-- Mini Scanline animada interna del bloque -->
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(6,182,212,0.1)_50%)] bg-[length:100%_2px]"></div>
                    </div>
                </div>
            `}

            <!-- Indicador de Sincronización (Analytics en Focus Mode) -->
            ${focusMode && area === 'L_LOWER' && html`
                <div className="absolute top-0 right-0 p-2 z-40 pointer-events-none animate-pulse-slow">
                    <div className="flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                        <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">Neural_Monitor</span>
                    </div>
                </div>
            `}
        </div>
    `;
});

ModuleWrapper.displayName = 'ModuleWrapper';

/**
 * Barra de Utilidad Invisible
 * Muestra el progreso de utilidad de sujetos sin números exactos
 */
export const InvisibleUtilityBar = memo(({ value = 0, max = 100 }) => {
    const storyPath = useGameState('storyPath');
    const labels = LABELS_CONFIG[storyPath] || LABELS_CONFIG[0];
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Color según storyPath
    const barColor = storyPath === 1
        ? 'bg-purple-500'
        : 'bg-cyan-500';

    return html`
        <div className="invisible-utility-bar w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-600 text-[10px] uppercase tracking-widest">
                    ${labels.utilityLabel}
                </span>
                <!-- Sin número exacto, solo indicador visual -->
                <span className="text-zinc-700 text-[10px]">
                    ${percentage < 30 ? '▽ BAJO' : percentage < 70 ? '◇ MEDIO' : '△ ALTO'}
                </span>
            </div>
            <div className="h-1 bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div 
                    className=${`h-full ${barColor} transition-all duration-500`}
                    style=${{ width: `${percentage}%`, opacity: 0.7 }}
                />
            </div>
        </div>
    `;
});

InvisibleUtilityBar.displayName = 'InvisibleUtilityBar';

