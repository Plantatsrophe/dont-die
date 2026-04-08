import { G, player } from './globals.js';
import { handleUIAccept } from '../logic/game_ui.js';
import { updateGame } from '../logic/game_logic.js';
import { playSound } from '../assets/audio.js';
import { render } from '../render/render.js';
/**
 * Master RequestAnimationFrame hook.
 * Implements semi-fixed time-stepping to ensure stable physics regardless of
 * screen refresh rate (60Hz vs 144Hz).
 *
 * @param timestamp Current browser frame timestamp
 */
let lastTime = 0;
export function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1)
        dt = 0.1; // Prevention of massive jumps in logic if backgrounded
    lastTime = timestamp;
    // Handle Active Gameplay States with sub-stepping
    if (['PLAYING', 'DYING', 'LEVEL_CLEAR', 'VALVE_CUTSCENE'].includes(G.gameState)) {
        const MAX_STEP = 0.016; // 60 FPS Target step
        let rem = dt;
        while (rem > 0) {
            let step = Math.min(rem, MAX_STEP);
            updateGame(step);
            rem -= step;
            // Interrupt sub-steps if state changed to a non-physics screen
            if (['GAMEOVER', 'WIN'].includes(G.gameState))
                break;
        }
    }
    // Cinematic: Intro scroll
    else if (G.gameState === 'INTRO') {
        G.introY -= 30 * dt;
        if (G.introY < -600)
            handleUIAccept();
    }
    // Cinematic: Final game completion sequence
    else if (G.gameState === 'CREDITS_CUTSCENE') {
        player.cutsceneTimer = (player.cutsceneTimer || 0) + dt;
        if (player.cutsceneTimer > 5.0) {
            G.gameState = 'CREDITS';
            player.cutsceneTimer = 0;
            playSound('win');
        }
    }
    else if (G.gameState === 'CREDITS') {
        player.cutsceneTimer = (player.cutsceneTimer || 0) + dt;
    }
    // Draw everything to screen
    render();
    // Cycle
    requestAnimationFrame(gameLoop);
}
