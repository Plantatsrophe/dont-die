import { G } from '../core/globals.js?v=105';

export { startBackgroundMusic, stopBackgroundMusic } from './audio_music.js?v=105';
export { playSound } from './audio_sfx.js?v=105';

export function initAudio() {
    if (!G.audioCtx) {
        let AC = window.AudioContext || window.webkitAudioContext;
        if (AC) G.audioCtx = new AC();
    }
}
