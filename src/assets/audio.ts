import { G } from '../core/globals.js';

export { startBackgroundMusic, stopBackgroundMusic } from './audio_music.js';
export { playSound } from './audio_sfx.js';

export function initAudio() {
    if (!G.audioCtx) {
        let AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) G.audioCtx = new AC();
    }
}
