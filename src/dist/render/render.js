import { G, ctx, offscreenMapCanvas } from '../core/globals.js';
import { renderParallax, renderParallaxLayer2 } from './render_parallax.js';
import { renderStartScreen, renderIntroScreen, renderInstructions } from './render_menus.js';
import { renderConduits, preRenderMap, renderAnimatedTiles } from './render_world.js';
import { renderEntities } from './render_entities.js';
import { renderBoss } from './render_bosses.js';
import { renderPlayer, renderPlayerCutscene } from './render_player.js';
import { renderHUD, renderOverlays, renderCredits, renderShareButton } from './render_ui.js';
export function render() {
    const { gameState, camera } = G;
    // 1. Static State Screens (Start, Intro, Instructions)
    if (gameState === 'START') {
        renderStartScreen();
        return;
    }
    if (gameState === 'INTRO') {
        renderIntroScreen();
        return;
    }
    if (gameState === 'INSTRUCTIONS') {
        renderInstructions();
        return;
    }
    // 2. Parallax Background Layers
    renderParallax();
    renderParallaxLayer2();
    // 3. World Space Transformation
    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
    renderConduits();
    preRenderMap();
    ctx.drawImage(offscreenMapCanvas, 0, 0);
    renderAnimatedTiles();
    renderEntities();
    renderBoss();
    renderPlayer();
    renderPlayerCutscene();
    ctx.restore();
    // 4. Screen Space Overlays (HUD, Menus, Credits)
    renderHUD();
    renderOverlays();
    renderCredits();
    renderShareButton();
}
