/**
 * Utility for managing full screen mode in NAKASTHU OS.
 */

export const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

export const isFullScreen = () => {
    return !!document.fullscreenElement;
};
