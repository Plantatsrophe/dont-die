import { G, canvas, ctx, TILE_SIZE } from '../../core/globals.js';
import { sprPortal } from '../../assets/assets.js';
import { drawSprite, drawGlow } from '../utils/render_utils.js';
import { renderVirtualHazards } from '../elements/render_hazards_virtual.js';
export { renderConduits } from '../elements/render_conduits.js';
export { preRenderMap } from './render_map_cache.js';
/**
 * Animated Tiles Renderer.
 * Draws dynamic tiles (Portals) that require per-frame animation.
 * Culling is implemented to only render tiles currently visible in the camera view.
 */
export function renderAnimatedTiles() {
    const { map, mapRows, mapCols, camera } = G;
    // Viewport Culling
    let startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    let endCol = Math.min(mapCols - 1, Math.floor((camera.x + canvas.width) / TILE_SIZE));
    let startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    let endRow = Math.min(mapRows - 1, Math.floor((camera.y + canvas.height) / TILE_SIZE));
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (map[row][col] === 5) { // Exit Portal
                let tx = col * TILE_SIZE, ty = row * TILE_SIZE;
                let pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
                let undulate = 1 + Math.cos(Date.now() / 120) * 0.1;
                let pW = TILE_SIZE * pulse, pH = TILE_SIZE * undulate;
                drawGlow(ctx, tx + TILE_SIZE / 2, ty + TILE_SIZE / 2, 40, 'rgba(0, 255, 255, 0.5)');
                drawSprite(ctx, sprPortal, tx + (TILE_SIZE - pW) / 2, ty + (TILE_SIZE - pH) / 2, pW, pH, false);
            }
        }
    }
    renderVirtualHazards(); // Call dynamic hazard renderer
}
