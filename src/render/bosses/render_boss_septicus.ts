import { G, ctx, TILE_SIZE } from '../../core/globals.js';
import { sprSepticus1, sprSepticus2, sprSepticus3, sprSepticus4, sprSepticus5, sprManhole } from '../../assets/assets.js';
import { drawSprite } from '../utils/render_utils.js';
import type { IBoss } from '../../types.js';

/**
 * Septicus: The sewer octo-boss.
 */
export function drawSepticus(boss: IBoss) {
    let dir = boss.vx < 0 ? -1 : 1, vx = boss.vibrateX || 0;
    let scaleOffset = Math.sin(Date.now() * 0.005) * 4;
    let waterY = 13 * TILE_SIZE + 12;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(boss.x - 50 + vx, boss.y - 100, boss.width + 100, (waterY) - (boss.y - 100));
    ctx.clip();
    
    const frames = [sprSepticus1, sprSepticus2, sprSepticus3, sprSepticus4, sprSepticus5];
    const frameIdx = Math.floor(G.timerAcc * 8) % frames.length;
    drawSprite(ctx, frames[frameIdx], boss.x - scaleOffset/2 + vx, boss.y - scaleOffset, boss.width + scaleOffset, boss.height + scaleOffset, dir < 0);
    ctx.restore();

    if (boss.hp > 0 && !boss.isSinking) {
        ctx.save();
        ctx.fillStyle = '#8B4513';
        ctx.font = `bold ${Math.floor((boss.height + scaleOffset) * 0.11)}px monospace`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 2;
        ctx.fillText("SEPT", boss.x + boss.width/2 + vx, boss.y + boss.height * 0.45 - scaleOffset);
        ctx.restore();
    }

    if (boss.projs) { 
        for (let p of boss.projs) { 
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.timer * 12); 
            drawSprite(ctx, sprManhole, -20, -20, 40, 40, false); 
            ctx.restore(); 
        } 
    }
}
