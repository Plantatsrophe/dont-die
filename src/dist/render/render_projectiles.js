import { ctx, laserPool } from '../core/globals.js';
import { sprLaser } from '../assets/assets.js';
import { drawSprite, drawGlow } from './render_utils.js';
/**
 * Renders all active projectiles (Lasers & Bombs) in the world.
 */
export function renderProjectiles() {
    // 1. LASERS (SNIPERS, GLITCH, REFLECTORS)
    for (let l of laserPool) {
        if (!l.active)
            continue;
        ctx.save();
        if (l.reflectionPhase === 'ABSORBING') {
            let scale = Math.max(0, (l.beamTimer || 0) / 0.2);
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, l.x, l.y, 25 * scale, 'rgba(0, 255, 255, 0.8)');
            ctx.fillStyle = '#ffffff';
            ctx.translate(l.x, l.y);
            ctx.rotate(Date.now() * 0.01);
            ctx.fillRect(-8 * scale, -2 * scale, 16 * scale, 4 * scale);
        }
        else if (l.reflectionPhase === 'FIRING') {
            const alpha = Math.max(0, (l.beamTimer || 0) / 0.4);
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.targetX, l.targetY);
            ctx.stroke();
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.7})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.targetX, l.targetY);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.targetX, l.targetY);
            ctx.stroke();
            drawGlow(ctx, l.x, l.y, 50 * alpha, 'rgba(0, 255, 255, 0.6)');
            drawGlow(ctx, l.targetX, l.targetY, 40 * alpha, 'rgba(255, 255, 255, 0.8)');
        }
        else if (l.hue !== undefined) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsl(${l.hue}, 100%, 60%)`;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(l.x, l.y, 16, 4);
            ctx.strokeStyle = `hsl(${l.hue}, 100%, 60%)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(l.x, l.y, 16, 4);
        }
        else {
            drawGlow(ctx, l.x + 8, l.y + 2, 30, 'rgba(255, 0, 0, 0.6)');
            drawSprite(ctx, sprLaser, l.x - 4, l.y - 10, 24, 24, l.vx < 0);
        }
        ctx.restore();
    }
}
