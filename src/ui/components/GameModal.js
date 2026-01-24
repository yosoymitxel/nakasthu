/**
 * GAMEMODAL.JS
 * Modal de overlay para Briefing (inicio de nivel) y Summary (fin de nivel).
 * Regla 2.C: Estilo tétrico - bordes ámbar, fondo negro, tipografía mono.
 * 
 * Fragmentos narrativos basados en "La piedra y los desaparecidos"
 */
import { html } from '../utils/html.js';
import { bus } from '../../core/Bus.js';
import { state } from '../../core/State.js';
import { CONFIG } from '../../data/gameConfig.js';
import { getRandomFragment, calculateRank } from '../../utils/systemUtils.js';

const { useState, useEffect, memo } = React;

/**
 * Componente GameModal
 */
export const GameModal = memo(({
    mode = 'Briefing', // 'Briefing' | 'Summary'
    title = '',
    content = '',
    stats = null,
    onContinue = null,
    onRestart = null,
    visible = false,
    isTutorial = false
}) => {
    const [animatedText, setAnimatedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [fragment, setFragment] = useState('');

    // Efecto de tipeo para el contenido
    useEffect(() => {
        if (!visible || !content) return;

        setIsTyping(true);
        setAnimatedText('');
        setFragment(getRandomFragment(state.currentStep, state.storyPath));

        let index = 0;
        let accumulator = '';

        const typeInterval = setInterval(() => {
            const char = content[index];
            if (char !== undefined) {
                accumulator += char;
                setAnimatedText(accumulator);
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, isTutorial ? 15 : 25); // Más rápido en el tutorial

        return () => {
            clearInterval(typeInterval);
            setIsTyping(false);
        };
    }, [visible, content, isTutorial]);

    // Procesar texto para convertir [[MOD-XX]] en enlaces clickeables
    const processContent = (text) => {
        if (!text) return '';

        const parts = text.split(/(\[\[MOD-\d+\]\])/g);
        return parts.map((part, i) => {
            const match = part.match(/\[\[MOD-(\d+)\]\]/);
            if (match) {
                const modId = match[0].replace('[[', '').replace(']]', '');
                const areaId = CONFIG.UI.MOD_MAP[modId] || 'C_HEADER';

                return html`
                    <button 
                        key=${`mod-link-${i}`}
                        onClick=${(e) => {
                        e.stopPropagation();
                        bus.emit('HIGHLIGHT_MODULE', { area: areaId });
                    }}
                        className="text-amber-500 font-bold hover:text-amber-400 underline decoration-amber-500/30 underline-offset-4 transition-colors px-1 bg-amber-500/5 rounded"
                    >
                        ${modId}
                    </button>
                `;
            }
            return part;
        });
    };

    if (!visible) {
        return null;
    }

    const rank = calculateRank(stats);

    return html`
        <div className=${`game-modal-overlay fixed inset-0 z-[800] flex items-center justify-center p-4 transition-all duration-500 ${isTutorial ? 'bg-black/30' : 'bg-black/90'}`}>
            <!-- Contenedor principal con borde ámbar -->
            <div className=${`game-modal relative w-full max-w-lg border border-amber-900/40 shadow-2xl transition-all duration-300 ${isTutorial ? 'bg-[#0a0a0a]/60 backdrop-blur-md ring-1 ring-amber-500/10' : 'bg-[#0a0a0a]/95'}`}>
                
                <!-- Esquinas decorativas -->
                <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-amber-500/60" />
                <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-amber-500/60" />
                <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-amber-500/60" />
                <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-amber-500/60" />

                <!-- Header -->
                <div className="border-b border-amber-900/30 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-amber-500 text-[10px] tracking-[0.4em] uppercase font-black">
                                ${isTutorial ? '◆ TUTORIAL_GUIDE' : (mode === 'Briefing' ? '◆ BRIEFING_INIT' : '◆ SUMMARY_REPORT')}
                            </span>
                        </div>
                        <span className="text-zinc-700 text-xs font-mono">
                            ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h2 className="text-zinc-100 text-lg font-bold tracking-wide mt-2 uppercase">
                        ${title}
                    </h2>
                </div>

                <!-- Contenido -->
                <div className="p-6 space-y-4">
                    ${mode === 'Briefing' ? html`
                        <${React.Fragment}>
                            <div className="text-zinc-400 font-mono text-sm leading-relaxed min-h-[80px]">
                                ${processContent(animatedText)}
                                ${isTyping && html`<span className="animate-pulse">▌</span>`}
                            </div>
                            
                            <!-- No mostrar fragmentos en el tutorial -->
                            ${!isTutorial && html`
                                <div className="mt-6 pt-4 border-t border-zinc-800/50">
                                    <p className="text-zinc-600 text-xs italic leading-relaxed">
                                        ${fragment}
                                    </p>
                                </div>
                            `}
                        <//>
                    ` : html`
                        <${React.Fragment}>
                            <div className="flex items-center justify-center py-4">
                                <div className="text-center">
                                    <div className=${`text-6xl font-black ${rank.color}`}>
                                        ${rank.label}
                                    </div>
                                    <div className="text-xs tracking-widest text-zinc-500 mt-1">
                                        ${rank.desc}
                                    </div>
                                </div>
                            </div>

                            ${stats && html`
                                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                    <div className="bg-zinc-900/50 p-3 border border-zinc-800/50">
                                        <span className="text-zinc-500">Procesados</span>
                                        <div className="text-zinc-300 text-lg">${stats.processedCount || 0}</div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 border border-zinc-800/50">
                                        <span className="text-zinc-500">Errores</span>
                                        <div className=${`text-lg ${(stats.judgmentErrors || 0) > 3 ? 'text-red-500' : 'text-zinc-300'}`}>
                                            ${stats.judgmentErrors || 0}
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 border border-zinc-800/50">
                                        <span className="text-zinc-500">Energía</span>
                                        <div className="text-cyan-400 text-lg">${Math.floor(stats.energy || 0)}%</div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 border border-zinc-800/50">
                                        <span className="text-zinc-500">Estabilidad</span>
                                        <div className="text-emerald-400 text-lg">${Math.floor(stats.stability || 0)}%</div>
                                    </div>
                                </div>
                            `}

                            ${content && html`
                                <p className="text-zinc-500 text-sm text-center pt-2">
                                    ${content}
                                </p>
                            `}
                        <//>
                    `}
                </div>

                <!-- Footer con botones -->
                <div className="border-t border-amber-900/30 p-4 space-y-3">
                    ${mode === 'Briefing' ? html`
                        <${React.Fragment}>
                            <button 
                                onClick=${() => {
                if (onContinue) onContinue();
                if (isTutorial) {
                    bus.emit('TUTORIAL_CONTINUE', {});
                }
                bus.emit('STORY_MODAL_CLOSE', {});
            }}
                                disabled=${isTyping}
                                className=${`
                                    w-full py-3 border text-sm tracking-[0.3em] uppercase font-bold
                                    transition-all duration-300
                                    ${isTyping
                ? 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400'}
                                `}
                            >
                                ${isTyping ? 'RECIBIENDO TRANSMISIÓN...' : (isTutorial ? 'RECIBIDO' : 'INICIAR OPERACIONES')}
                            </button>

                            ${isTutorial && !isTyping && html`
                                <button 
                                    onClick=${() => {
                bus.emit('TUTORIAL_SKIP_ALL', {});
                bus.emit('STORY_MODAL_CLOSE', {});
            }}
                                    className="w-full py-2 border border-red-900/40 text-red-500/60 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-red-900/10 hover:text-red-400 transition-all"
                                >
                                    OMITIR TODO EL TUTORIAL
                                </button>
                            `}
                        <//>
                    ` : html`
                        <div className="flex gap-3">
                            <button 
                                key="btn-continue"
                                onClick=${() => {
                if (onContinue) onContinue();
                bus.emit('STORY_MODAL_CLOSE', {});
            }}
                                className="flex-1 py-3 border border-cyan-500/50 text-cyan-400 text-sm tracking-widest uppercase hover:bg-cyan-500/10 transition-all"
                            >
                                CONTINUAR
                            </button>
                            <button 
                                key="btn-restart"
                                onClick=${() => {
                if (onRestart) onRestart();
                gameSequencer.resetLevel();
                bus.emit('STORY_MODAL_CLOSE', {});
            }}
                                className="flex-1 py-3 border border-red-900/50 text-red-500/70 text-sm tracking-widest uppercase hover:bg-red-900/10 hover:text-red-400 transition-all"
                            >
                                REINICIAR DÍA
                            </button>
                        </div>
                    `}
                </div>

                <!-- Línea de escaneo decorativa -->
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div 
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
                        style=${{ animation: 'scan-line 4s linear infinite' }}
                    />
                </div>
            </div>
        </div>
    `;
});

GameModal.displayName = 'GameModal';

/**
 * Hook para controlar el modal desde el Bus
 */
export const useGameModal = () => {
    const [modalState, setModalState] = useState({
        visible: false,
        mode: 'Briefing',
        title: '',
        content: '',
        stats: null,
        isTutorial: false
    });

    useEffect(() => {
        const handleShow = (data) => {
            console.log('%c[GAMEMODAL] STORY_MODAL_OPEN received', 'color: #f59e0b; font-weight: bold;', data);
            state.isModalOpen = true; // Pausar motor
            setModalState({
                visible: true,
                mode: data.mode || 'Briefing',
                title: data.title || '',
                content: data.content || '',
                stats: data.stats || null,
                isTutorial: data.isTutorial || false
            });
        };

        const handleClose = () => {
            state.isModalOpen = false; // Reanudar motor
            setModalState(prev => ({ ...prev, visible: false }));
        };

        bus.on('STORY_MODAL_OPEN', handleShow);
        bus.on('STORY_MODAL_CLOSE', handleClose);

        return () => {
            bus.off('STORY_MODAL_OPEN', handleShow);
            bus.off('STORY_MODAL_CLOSE', handleClose);
        };
    }, []);

    return modalState;
};
