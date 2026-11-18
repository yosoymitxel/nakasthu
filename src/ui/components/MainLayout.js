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
import { CONFIG } from '../../data/gameConfig.js';
import { PATH_CONFIGS } from '../../data/pathConfigs.js';

import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';

import { Icon } from '../shared/Icon.js';
const { memo, useState, useEffect } = React;

const AREA_TAB = {
    C_MAIN: 'mando', C_HEADER: 'mando',
    L_UPPER: 'escaner', L_LOWER: 'escaner',
    C_FOOTER: 'sistemas', L_BOTTOM: 'sistemas', R_BOTTOM: 'sistemas',
    R_TOP: 'registro', R_UPPER: 'registro', R_MIDDLE: 'registro'
};

/**
 * Hook para obtener las etiquetas actuales según storyPath
 */
export const useStoryLabels = () => {
    const storyPath = useGameState('storyPath') || 0;
    return PATH_CONFIGS[storyPath] || PATH_CONFIGS[0];
};

/**
 * Componente MainLayout - Grid 12x6 con soporte polimórfico
 * El "Embudo" Nivel 3: El Contenedor Estructural
 */
export const MainLayout = memo(({ children }) => {
    const storyPath = useGameState('storyPath') || 0;
    const colorOverride = useGameState('coreColorOverride');
    const themeColor = colorOverride || (PATH_CONFIGS[storyPath] || PATH_CONFIGS[0]).theme.primary;

    // Pestañas (solo visibles en pantalla estrecha, ver grid.css)
    const [tab, setTab] = useState('mando');
    const requiredScan = useGameState('requiredScan');
    const currentEntity = useGameState('currentEntity');
    const scanPending = !!(currentEntity && requiredScan && !currentEntity.scannedTypes?.includes(requiredScan));

    // El motor cambia `emergencies` sin reemplazar el objeto: se sigue por eventos
    const [emergencyActive, setEmergencyActive] = useState(false);
    useEffect(() => {
        const sync = () => setTimeout(() => setEmergencyActive(Object.values(state.emergencies || {}).some(Boolean)), 0);
        const events = ['EMERGENCY_START', 'EMERGENCY_END', 'STEP_CHANGE', 'LEVEL_RESET'];
        events.forEach(e => bus.on(e, sync));
        sync();
        return () => events.forEach(e => bus.off(e, sync));
    }, []);

    useEffect(() => {
        const onFocus = ({ area }) => { if (AREA_TAB[area]) setTab(AREA_TAB[area]); };
        bus.on('UI_FOCUS_AREA', onFocus);
        return () => bus.off('UI_FOCUS_AREA', onFocus);
    }, []);

    const sect = storyPath === 1;
    const tabs = [
        ['mando', sect ? 'Altar' : 'Mando'],
        ['escaner', sect ? 'Examen' : 'Escáner'],
        ['sistemas', sect ? 'Ritos' : 'Sistemas'],
        ['registro', sect ? 'Crónicas' : 'Registro']
    ];

    return html`
        <div
            className=${`main-layout-grid theme-${themeColor} relative`}
            data-story-path=${storyPath}
            data-tab=${tab}
        >
            ${children}
            <nav className="mobile-tabs" style=${{ '--tab-color': sect ? '#a855f7' : '#22d3ee' }}>
                ${tabs.map(([id, label]) => html`
                    <button key=${id} className=${tab === id ? 'on' : ''} onClick=${() => setTab(id)}>
                        ${label}
                        ${id === 'escaner' && scanPending && tab !== id && html`<span className="tab-dot"></span>`}
                        ${id === 'sistemas' && emergencyActive && tab !== id && html`<span className="tab-dot alert"></span>`}
                    </button>
                `)}
                <!-- Pausa siempre a mano en móvil: antes sólo existía dentro de la pestaña Registro -->
                <button className="tab-pause" title="PAUSA" aria-label="Pausa" onClick=${() => { state.isPaused = true; bus.emit('GAME_PAUSE', { paused: true }); }}><${Icon} name="pause" /></button>
            </nav>
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
const SHIELDED_IN_FOCUS = new Set(['L_UPPER', 'R_TOP', 'C_FOOTER']);

export const ModuleWrapper = memo(({ area, children, className = "", locked = false, highlighted = false }) => {
    const storyPath = useGameState('storyPath');
    const labels = useStoryLabels();
    const isSectarian = storyPath === 1;
    const themeColor = isSectarian ? 'purple' : 'cyan';

    const focusMode = useGameState('focusMode');
    const isShielded = focusMode && SHIELDED_IN_FOCUS.has(area);

    // Al desbloquearse, el módulo "arranca" en vez de aparecer sin más
    const [booting, setBooting] = useState(false);
    const wasLocked = React.useRef(locked);
    useEffect(() => {
        if (wasLocked.current && !locked && !highlighted) {
            setBooting(true);
            const t = setTimeout(() => setBooting(false), 900);
            wasLocked.current = locked;
            return () => clearTimeout(t);
        }
        wasLocked.current = locked;
    }, [locked]);

    // Foco pedido por otro panel: fijo (HIGHLIGHT_MODULE) o breve (UI_FOCUS_AREA)
    const [focusColor, setFocusColor] = useState(null);
    useEffect(() => {
        let timer;
        const onHighlight = (d) => {
            if (d.areas?.includes(area)) {
                setFocusColor(d.color || '#f59e0b');
                // Con duración es un destello; sin ella queda fijo hasta el `clear`
                if (d.duration) { clearTimeout(timer); timer = setTimeout(() => setFocusColor(null), d.duration); }
            }
            if (d.clear?.includes(area)) setFocusColor(null);
        };
        const onFocus = (d) => {
            if (d.area !== area) return;
            setFocusColor(d.color || '#f59e0b');
            clearTimeout(timer);
            timer = setTimeout(() => setFocusColor(null), 1800);
        };
        bus.on('HIGHLIGHT_MODULE', onHighlight);
        bus.on('UI_FOCUS_AREA', onFocus);
        return () => {
            clearTimeout(timer);
            bus.off('HIGHLIGHT_MODULE', onHighlight);
            bus.off('UI_FOCUS_AREA', onFocus);
        };
    }, [area]);

    const highlightStyle = focusColor ? { '--focus-color': focusColor } : highlighted ? {
        boxShadow: `0 0 20px rgba(${isSectarian ? '147, 51, 234' : '6, 182, 212'}, 0.4)`,
        zIndex: 50
    } : {};

    return html`
        <div
            style=${highlightStyle}
            className=${`
                mod-container mod-${area} ${locked && !isShielded ? 'mod-locked' : ''} ${focusColor ? 'mod-focus' : ''} ${booting ? 'mod-boot' : ''}

                border transition-all duration-[1200ms] ease-in-out
                ${isSectarian ? 'border-indigo-900/20' : 'border-zinc-800/50'}
                ${locked ? 'opacity-50 pointer-events-none grayscale' : isShielded ? 'opacity-60 pointer-events-none' : 'opacity-100'}
                ${highlighted ? `border-${themeColor}-500/60 ring-1 ring-${themeColor}-500/30 ${isSectarian ? 'bg-indigo-950/10' : 'bg-cyan-950/5'} animate-pulse-slow` : 'bg-transparent'}
                                ${className}
            `}
        >
            <!-- Borde Temático -->
            <div className=${`absolute top-0 left-0 w-full h-full pointer-events-none z-10 ${isSectarian ? 'border border-purple-500/5 opacity-10' : 'border border-zinc-900/10'}`}></div>
            
            ${isSectarian && html`
                <${React.Fragment} key="sectarian-decor">
                    <!-- Elemento Onírico: Esquina Ritual -->
                    <div key="corner-tl" className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/20 z-20 pointer-events-none"></div>
                    <div key="corner-br" className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/20 z-20 pointer-events-none"></div>
                <//>
            `}

            <!-- Contenido del Bloque (Componentes Nivel 1) -->
            <div className=${`w-full h-full relative z-0 ${locked ? 'invisible' : ''}`}>
                ${children}
            </div>

            <!-- Sombras y Efectos de Bloque -->
            <div className=${`absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] z-20`}></div>
            
            <!-- Indicador de Bloqueo -->
            ${locked && !isShielded && html`
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[1px]">
                    <div className=${`border bg-black/80 px-4 py-1 ${isSectarian ? 'border-purple-900/50 shadow-[0_0_10px_rgba(147,51,234,0.1)]' : 'border-red-900/50'}`}>
                        <span className=${`text-[10px] font-black tracking-[0.2em] uppercase ${isSectarian ? 'text-purple-400' : 'text-red-500'}`}>
                            ${labels.layout.lockedLabel}
                        </span>
                    </div>
                </div>
            `}

            <!-- Indicador de Sincronización (Analytics en Focus Mode) -->
            ${focusMode && area === 'L_LOWER' && html`
                <div className="absolute top-7 right-0 p-1 z-40 pointer-events-none animate-pulse-slow">
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
    const labels = useStoryLabels();
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Color según storyPath
    const barColor = storyPath === 1
        ? 'bg-purple-500'
        : 'bg-cyan-500';

    return html`
        <div className="invisible-utility-bar w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-600 text-[10px] uppercase tracking-widest">
                    ${labels.layout.utilityLabel}
                </span>
                <!-- Sin número exacto, solo indicador visual -->
                <span className="text-zinc-700 text-[10px]">
                    <${Icon} name=${percentage < 30 ? 'trending-down' : percentage < 70 ? 'minus' : 'trending-up'} /> ${percentage < 30 ? 'BAJO' : percentage < 70 ? 'MEDIO' : 'ALTO'}
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

