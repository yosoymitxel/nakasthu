import Bus from '../../core/Bus.js';

const { useCallback } = React;

/**
 * useAudio Hook
 * Permite disparar sonidos desde componentes React de forma limpia.
 */
export default function useAudio() {
    const playSfx = useCallback((key) => {
        Bus.emit('PLAY_SFX', key);
    }, []);

    const playMusic = useCallback((key) => {
        Bus.emit('PLAY_MUSIC', key);
    }, []);

    return { playSfx, playMusic };
}
