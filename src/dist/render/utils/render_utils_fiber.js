import { ctx } from '../../core/globals.js';
import { drawGlow } from './render_utils.js';
/**
 * Generic Procedural Fiber Rendering
 * Draws multiple glow-strands for a given trail of points.
 */
export function drawFiberStrands(points, strandCount, colorHue, isFlipped, alpha = 0.8, boss, isMedusa = false, broadness = 1.0, tallness = 0.0, baseSpread = 0.0, isVertical = false) {
    if (!points || points.length < 2)
        return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.2;
    let orbRadius = 0;
    let orbAlpha = 0;
    let tipX = 0, tipY = 0;
    if (isMedusa && boss) {
        orbRadius = 15;
        const idleAlpha = 0.15 + Math.sin(Date.now() * 0.004) * 0.1;
        if (boss.timer >= 0.7) {
            const charge = (boss.timer - 0.7) / 0.8;
            const swell = Math.sin(charge * Math.PI / 2);
            orbAlpha = idleAlpha + (0.85 - idleAlpha) * swell;
        }
        else if (boss.timer <= 0.4) {
            const fade = boss.timer / 0.4;
            const dissipate = 1.0 - Math.sin(fade * Math.PI / 2);
            orbAlpha = idleAlpha + (0.85 - idleAlpha) * dissipate;
        }
        else {
            orbAlpha = idleAlpha;
        }
        tipX = points[points.length - 1].x;
        tipY = points[points.length - 1].y;
    }
    for (let i = 0; i < strandCount; i++) {
        ctx.shadowBlur = (i < 2) ? 6 : 0;
        ctx.shadowColor = `hsl(${(colorHue + i * 20) % 360}, 100%, 50%)`;
        ctx.strokeStyle = `hsl(${(colorHue + i * 20) % 360}, 100%, 75%)`;
        ctx.beginPath();
        for (let j = 0; j < points.length; j++) {
            const p = points[j];
            const spread = (i - strandCount / 2) * (baseSpread + broadness * (j * 0.5));
            let drawX = p.x + (isVertical ? 0 : spread);
            let drawY = p.y - (j * tallness) + (isVertical ? spread : 0);
            if (j === 0)
                ctx.moveTo(drawX, drawY);
            else
                ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
        if (isMedusa && orbAlpha > 0) {
            ctx.save();
            drawGlow(ctx, tipX, tipY, orbRadius, `rgba(255, 255, 255, 1.0)`, orbAlpha);
            ctx.restore();
        }
    }
    ctx.restore();
}
