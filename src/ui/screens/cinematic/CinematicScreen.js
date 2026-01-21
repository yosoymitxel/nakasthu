/**
 * CINEMATICSCREEN.JS
 * Pantalla para pasos narrativos tipo 'cinematic'.
 * Estilo tétrico y minimalista.
 */
import { html } from '../../utils/html.js';
import { useGameState } from '../../hooks/useGameState.js';
import { bus } from '../../../core/Bus.js';
import { gameSequencer } from '../../../systems/GameSequencer.js';

const { useState, useEffect, memo } = React;

export const CinematicScreen = memo(({ config }) => {
    const [animatedText, setAnimatedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [showContinue, setShowContinue] = useState(false);

    const content = config.briefingText || "";

    useEffect(() => {
        setAnimatedText('');
        setIsTyping(true);
        setShowContinue(false);

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
                setShowContinue(true);
                clearInterval(typeInterval);
            }
        }, 30);

        return () => {
            clearInterval(typeInterval);
            setIsTyping(false);
        };
    }, [content]);

    const handleContinue = () => {
        gameSequencer.nextStep();
    };

    return html`
        <div className="cinematic-screen fixed inset-0 flex items-center justify-center bg-black overflow-hidden z-[400]">
            <!-- Fondo con grano y aberración -->
            <div className="absolute inset-0 opacity-10 pointer-events-none noise-texture"></div>
            
            <div className="max-w-2xl w-full px-8 text-center space-y-12">
                <!-- Título del Paso (Opcional) -->
                ${config.name && html`
                    <h3 className="text-zinc-600 text-[10px] tracking-[1em] uppercase border-b border-zinc-900 pb-4">
                        ${config.name}
                    </h3>
                `}

                <!-- Texto Narrativo -->
                <p className="text-zinc-300 text-lg md:text-xl font-mono leading-relaxed min-h-[120px]">
                    ${animatedText}
                    ${isTyping && html`<span className="animate-pulse inline-block w-2 h-5 bg-zinc-500 ml-1"></span>`}
                </p>

                <!-- Botón de Continuar -->
                <div className=${`transition-opacity duration-1000 ${showContinue ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button 
                        onClick=${handleContinue}
                        className="group relative px-12 py-3 border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-400 transition-all font-mono text-xs uppercase tracking-[0.4em]"
                    >
                        [ CONTINUAR ]
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none"></div>
                    </button>
                    
                    <p className="text-[9px] text-zinc-700 mt-4 tracking-[0.2em] uppercase">
                        Protocolo de enlace neural activo
                    </p>
                </div>
            </div>

            <!-- Efectos de Glitch Aleatorios -->
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-zinc-800 opacity-20 animate-scanline"></div>
                ${isTyping && html`
                    <div className="absolute top-1/2 left-1/4 w-1/2 h-[2px] bg-white/5 animate-glitch-line"></div>
                `}
            </div>
        </div>
    `;
});

CinematicScreen.displayName = 'CinematicScreen';
