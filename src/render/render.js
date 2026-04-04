import { G, canvas, ctx, offscreenMapCanvas } from '../core/globals.js?v=105';
import { renderParallax, renderParallaxLayer2 } from './render_parallax.js?v=105';
import { renderStartScreen, renderIntroScreen, renderInstructions } from './render_menus.js?v=105';
import { renderConduits, preRenderMap, renderAnimatedTiles } from './render_world.js?v=105';
import { renderEntities } from './render_entities.js?v=105';
import { renderBoss } from './render_bosses.js?v=105';
import { renderPlayer, renderPlayerCutscene } from './render_player.js?v=105';
import { renderHUD, renderOverlays, renderCredits, renderShareButton } from './render_ui.js?v=105';

export function render() {
    const { gameState, camera } = G;

    // 1. Static State Screens (Start, Intro, Instructions)
    if (gameState === 'START') { renderStartScreen(); return; }
    if (gameState === 'INTRO') { renderIntroScreen(); return; }
    if (gameState === 'INSTRUCTIONS') { renderInstructions(); return; }

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
