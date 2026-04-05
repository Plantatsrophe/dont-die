import { G } from '../core/globals.js';
export { startBackgroundMusic, stopBackgroundMusic } from './audio_music.js';
export { playSound } from './audio_sfx.js';
export function initAudio() {
    if (!G.audioCtx) {
        let AC = window.AudioContext || window.webkitAudioContext;
        if (AC)
            G.audioCtx = new AC();
    }
}
