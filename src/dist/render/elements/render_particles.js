import { player, ctx, particlePool } from '../../core/globals.js';
import { sprGear, sprHeroDead } from '../../assets/assets.js';
import { drawSprite } from '../utils/render_utils.js';
/**
 * Renders all active particles currently in the global particle pool.
 * Includes score gears, player gibs, and generic pixel debris.
 */
export function renderParticles() {
    for (let p of particlePool) {
        if (!p.active)
            continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        if (p.type === 'gear') {
            ctx.translate(p.x, p.y);
            ctx.rotate(Date.now() / 150 + p.vx);
            drawSprite(ctx, sprGear, -8, -8, 16, 16, false);
        }
        else if (p.type === 'playerQuad') {
            const qx = p.qx ?? 0, qy = p.qy ?? 0;
            ctx.translate(p.x, p.y);
            ctx.rotate(Date.now() / 200 * (qx === 0 ? -1 : 1));
            let sx = -(qx * player.width / 2 + player.width / 4), sy = -(qy * player.height / 2 + player.height / 4);
            ctx.beginPath();
            ctx.rect(-player.width / 4, -player.height / 4, player.width / 2, player.height / 2);
            ctx.clip();
            drawSprite(ctx, sprHeroDead, sx, sy, player.width, player.height, p.flip ?? false);
        }
        else {
            ctx.fillStyle = p.color || `rgb(180, 180, 180)`;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.restore();
    }
}
