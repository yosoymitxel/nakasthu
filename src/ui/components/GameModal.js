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
import { gameSequencer, STEPS_CONFIG } from '../../systems/GameSequencer.js';

const { useState, useEffect, memo } = React;

/**
 * Fragmentos narrativos para los briefings
 * Parafraseados de HistoriaCompleta.md
 */
const NARRATIVE_FRAGMENTS = {
    // Órdenes de Orval Drexler
    drexler: [
        '"La distracción es un lujo que no podemos permitirnos. Cada sujeto procesado es un paso hacia la estabilidad." — Orval Drexler',
        '"El monolito es la clave, y Talok lo reclamará antes que nadie. No habrá interferencias." — Orval Drexler',
        '"El caos es útil. Deja que griten, que se desahoguen. Cuando estén cansados, vendrán a nosotros." — Orval Drexler',
        '"No subestimen a Kamin. Es más que un fanático. Sabe manipular a las masas." — Orval Drexler'
    ],
    // Susurros de Kamin
    kamin: [
        '"El portal no es solo una puerta; es un espejo. Nos refleja lo que hemos ignorado." — Kamin, Mensajero de Aitor',
        '"La verdad siempre cuesta caro. Pero vale la pena pagar el precio." — Kamin',
        '"Nos han mentido durante meses. La respuesta no está en sus tecnologías vacías." — Kamin',
        '"Hay algo allí. Observándonos. El Renacimiento está cerca." — Kamin'
    ],
    // Reportes del sistema
    sistema: [
        '>>> ALERTA: Desviación detectada en patrones neurales de la población.',
        '>>> INFORME: Protestas en aumento. Índice de estabilidad: CRÍTICO.',
        '>>> REGISTRO: Sujeto #7 presenta anomalías incompatibles con protocolo estándar.',
        '>>> ADVERTENCIA: Interferencia del Eidolon detectada en subsistema de decisiones.'
    ]
};

/**
 * Obtiene un fragmento narrativo aleatorio según el paso y contexto
 */
const getRandomFragment = (step, storyPath) => {
    if (step <= 3 || step === 4) {
        return NARRATIVE_FRAGMENTS.drexler[Math.floor(Math.random() * NARRATIVE_FRAGMENTS.drexler.length)];
    } else if (step >= 7 && storyPath === 1) {
        return NARRATIVE_FRAGMENTS.kamin[Math.floor(Math.random() * NARRATIVE_FRAGMENTS.kamin.length)];
    } else {
        return NARRATIVE_FRAGMENTS.sistema[Math.floor(Math.random() * NARRATIVE_FRAGMENTS.sistema.length)];
    }
};

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
    visible = false
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
        }, 25);

        return () => {
            clearInterval(typeInterval);
            setIsTyping(false);
        };
    }, [visible, content]);

    // Calcular rango de desempeño
    const getRank = (stats) => {
        if (!stats) return { label: 'N/A', color: 'text-zinc-500' };

        const errors = stats.judgmentErrors || 0;
        const processed = stats.processedCount || 0;

        if (errors === 0 && processed >= 10) return { label: 'S', color: 'text-amber-400', desc: 'PERFECTO' };
        if (errors <= 1) return { label: 'A', color: 'text-emerald-400', desc: 'EXCELENTE' };
        if (errors <= 3) return { label: 'B', color: 'text-cyan-400', desc: 'BUENO' };
        if (errors <= 5) return { label: 'C', color: 'text-yellow-500', desc: 'ACEPTABLE' };
        return { label: 'D', color: 'text-red-500', desc: 'DEFICIENTE' };
    };

    if (!visible) {
        return null;
    }

    console.log(`%c[GAMEMODAL] Rendering visible modal: ${title}`, 'color: #f59e0b;');
    const rank = getRank(stats);

    return html`
        <div className="game-modal-overlay fixed inset-0 z-[800] bg-black/90 flex items-center justify-center p-4">
            <!-- Contenedor principal con borde ámbar -->
            <div className="game-modal relative w-full max-w-lg bg-[#0a0a0a] border border-amber-900/40 shadow-2xl">
                
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
                                ${mode === 'Briefing' ? '◆ BRIEFING_INIT' : '◆ SUMMARY_REPORT'}
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
                                ${animatedText}
                                ${isTyping && html`<span className="animate-pulse">▌</span>`}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-zinc-800/50">
                                <p className="text-zinc-600 text-xs italic leading-relaxed">
                                    ${fragment}
                                </p>
                            </div>
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
                <div className="border-t border-amber-900/30 p-4">
                    ${mode === 'Briefing' ? html`
                        <button 
                            onClick=${() => {
                if (onContinue) onContinue();
                bus.emit('MODAL_CLOSE', {});
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
                            ${isTyping ? 'RECIBIENDO TRANSMISIÓN...' : 'INICIAR OPERACIONES'}
                        </button>
                    ` : html`
                        <div className="flex gap-3">
                            <button 
                                key="btn-continue"
                                onClick=${() => {
                if (onContinue) onContinue();
                bus.emit('MODAL_CLOSE', {});
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
                bus.emit('MODAL_CLOSE', {});
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
        stats: null
    });

    useEffect(() => {
        const handleShow = (data) => {
            console.log('%c[GAMEMODAL] MODAL_SHOW received', 'color: #f59e0b; font-weight: bold;', data);
            setModalState({
                visible: true,
                mode: data.mode || 'Briefing',
                title: data.title || '',
                content: data.content || '',
                stats: data.stats || null
            });
        };

        const handleClose = () => {
            setModalState(prev => ({ ...prev, visible: false }));
        };

        bus.on('MODAL_SHOW', handleShow);
        bus.on('MODAL_CLOSE', handleClose);

        return () => {
            bus.off('MODAL_SHOW', handleShow);
            bus.off('MODAL_CLOSE', handleClose);
        };
    }, []);

    return modalState;
};
