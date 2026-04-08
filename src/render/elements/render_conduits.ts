import { G, ctx, TILE_SIZE } from '../../core/globals.js';
import { sprPipe } from '../../assets/assets.js';
import { drawSprite, drawGlow } from '../utils/render_utils.js';

/**
 * Renders the vertical pipe infrastructure for the Septicus boss fight.
 * Includes dynamic "water flow" animations once valves are purified.
 */
export function renderConduits() {
    const { items, purifiedValves, activeValvePos, mapRows } = G;
    
    // Conduits are unique to the Sewer (Septicus) encounter
    if (G.boss && G.boss.type === 'septicus') {
        for (let i of items) {
            if (i.type === 'valve' || i.type === 'detonator') {
                let px = i.x, py = (Math.floor(i.y / TILE_SIZE) + 3) * TILE_SIZE; 
                
                // Static Pipe Stem
                ctx.fillStyle = '#5e4533'; ctx.fillRect(i.x, 0, TILE_SIZE, py - TILE_SIZE);
                ctx.fillStyle = '#6d5241'; ctx.fillRect(i.x + 12, 0, 8, py - TILE_SIZE);
                drawSprite(ctx, sprPipe, px, py - TILE_SIZE, 40, 40, false);
                
                // Flow Animation (Blue water pouring out of bottom)
                let pv = purifiedValves.find(v => v.x === i.x && v.y === i.y);
                if (pv) {
                    let isActive = (activeValvePos && activeValvePos.x === pv.x && activeValvePos.y === pv.y);
                    ctx.save(); 
                    ctx.globalAlpha = isActive ? 1.0 : 0.7; 
                    ctx.fillStyle = '#1e90ff'; 
                    let flowOffset = Math.sin(Date.now() * 0.01) * 3, startY = py - 10, endY = mapRows * TILE_SIZE; 
                    ctx.fillRect(px + 10 + flowOffset, startY, isActive ? 22 : 11, endY - startY);
                    drawGlow(ctx, px + 20, endY - 5, isActive ? 70 : 35, 'rgba(0, 187, 255, 0.5)');
                    ctx.restore();
                }
            }
        }
    }
}
