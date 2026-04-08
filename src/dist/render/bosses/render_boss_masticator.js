import { G, ctx } from '../../core/globals.js';
import { drawGlow } from '../utils/render_utils.js';
/**
 * Masticator: A massive robot with dynamic swinging swords and walking legs.
 */
export function drawMasticator(boss) {
    let cx = boss.x, cy = boss.y - 15, bw = boss.width, bh = boss.height, dir = G.boss.vx < 0 ? -1 : 1;
    let walkParam = (G.boss.vx !== 0) ? Date.now() / 100 : 0;
    // Procedural leg segments
    let leg1 = (walkParam > 0) ? Math.sin(walkParam) * 12 : 0, leg2 = (walkParam > 0) ? Math.sin(walkParam + Math.PI) * 12 : 0;
    ctx.fillStyle = '#888';
    let leg1X = cx + 10 + leg1, leg2X = cx + bw - 25 + leg2;
    ctx.fillRect(leg1X, cy + bh, 15, 15);
    ctx.fillRect(leg2X, cy + bh, 15, 15);
    ctx.fillStyle = '#555';
    let footStartOffset = (dir === 1) ? -5 : -15;
    ctx.fillRect(leg1X + footStartOffset, cy + bh + 10, 25, 5);
    ctx.fillRect(leg2X + footStartOffset, cy + bh + 10, 25, 5);
    let drawSword = (innerCtx) => {
        innerCtx.save();
        innerCtx.translate(0, 40);
        let swordAngle = (walkParam > 0) ? Math.sin(walkParam) * (Math.PI / 8) * dir : 0;
        innerCtx.rotate(swordAngle);
        innerCtx.fillStyle = '#EaEaEa';
        innerCtx.beginPath();
        innerCtx.moveTo(-10, -10);
        innerCtx.lineTo(-10, -80);
        innerCtx.lineTo(0, -100);
        innerCtx.lineTo(10, -80);
        innerCtx.lineTo(10, -10);
        innerCtx.fill();
        innerCtx.fillStyle = '#111';
        innerCtx.fillRect(-6, -10, 12, 24);
        innerCtx.restore();
    };
    ctx.fillStyle = '#888';
    ctx.save();
    ctx.translate(cx - 7.5, cy + 30);
    ctx.rotate((walkParam > 0) ? Math.sin(walkParam) * 0.3 : 0);
    ctx.fillRect(-7.5, 0, 15, 30);
    if (dir === -1)
        drawSword(ctx);
    ctx.restore();
    ctx.save();
    ctx.translate(cx + bw + 7.5, cy + 30);
    ctx.rotate((walkParam > 0) ? Math.sin(walkParam + Math.PI) * 0.3 : 0);
    ctx.fillRect(-7.5, 0, 15, 30);
    if (dir === 1)
        drawSword(ctx);
    ctx.restore();
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(cx, cy, bw, bh);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(cx + 15, cy + 15, 18, 10);
    ctx.fillRect(cx + bw - 33, cy + 15, 18, 10);
    drawGlow(ctx, cx + 24, cy + 20, 20, 'rgba(255, 0, 0, 0.6)');
    drawGlow(ctx, cx + bw - 24, cy + 20, 20, 'rgba(255, 0, 0, 0.6)');
    ctx.fillStyle = '#111';
    ctx.fillRect(cx + 10, cy + 45, bw - 20, (boss.phase === 2) ? 35 : 20);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
        let tx = cx + 15 + i * (bw - 30) / 4, ty = cy + 45 + ((boss.phase === 2) ? 35 : 20);
        ctx.beginPath();
        ctx.moveTo(tx, cy + 45);
        ctx.lineTo(tx + 5, cy + 45 + 10);
        ctx.lineTo(tx + 10, cy + 45);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 5, ty - 10);
        ctx.lineTo(tx + 10, ty);
        ctx.fill();
    }
    if (boss.hurtTimer > 0) {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(cx, cy, bw, bh);
        ctx.globalAlpha = 1;
    }
}
