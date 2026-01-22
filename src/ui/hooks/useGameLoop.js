/**
 * USEGAMELOOP.JS
 * Hook para centralizar la sincronización de intervalos con la UI.
 * Este hook asegura que el motor de juego respete el estado de la UI (Tutorial/Pausa).
 */
import { state } from '../../core/State.js';
import { bus } from '../../core/Bus.js';
import { useGameState } from './useGameState.js';

const { useEffect } = React;

export const useGameLoop = (gameLoopInstance) => {
    const gameStatus = useGameState('gameStatus');
    const isPaused = useGameState('isPaused');
    const isModalOpen = useGameState('isModalOpen');
    const isTutorialActive = useGameState('isTutorialActive');

    useEffect(() => {
        if (gameStatus === 'PLAYING' && !isPaused && !isModalOpen && !isTutorialActive) {
            gameLoopInstance.start();
        } else {
            // El stop del motor es preventivo, la lógica de tick 
            // ya valida estos estados, pero esto asegura eficiencia.
            gameLoopInstance.stop();
        }

        return () => gameLoopInstance.stop();
    }, [gameStatus, isPaused, isModalOpen, isTutorialActive, gameLoopInstance]);

    return {
        isActive: gameStatus === 'PLAYING' && !isPaused && !isModalOpen && !isTutorialActive
    };
};
