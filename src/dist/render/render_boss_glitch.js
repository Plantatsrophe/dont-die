import { G, ctx, player } from '../core/globals.js';
import { sprGlitch1, sprGlitch2, sprGlitch3, sprGlitch4, sprGlitch5 } from '../assets/assets.js';
import { drawSprite, drawGlow } from './render_utils.js';
import { drawFiberStrands } from './render_utils_fiber.js';
/**
 * Glitch: Rider on Virtual Steed (64x64).
 */
export function drawGlitch(boss) {
    const dir = player.x < boss.x ? -1 : 1;
    const isFlipped = dir < 0;
    const time = Date.now() * 0.1;
    // Hair, Mane, Tail
    drawFiberStrands(boss.hairTrail1, 5, time, isFlipped, 1.0, boss, true, 0.5);
    drawFiberStrands(boss.hairTrail2, 5, time + 20, isFlipped, 0.9, boss, true, 0.5);
    drawFiberStrands(boss.maneTrail, 8, 180, isFlipped, 0.8, undefined, false, 0.2, 1.0, 0.5, true);
    drawFiberStrands(boss.tailTrail, 6, 260, isFlipped, 0.9, undefined, false, 1.2);
    const frames = [sprGlitch1, sprGlitch2, sprGlitch3, sprGlitch4, sprGlitch5];
    const frameIdx = Math.floor(G.timerAcc * 10) % frames.length;
    ctx.save();
    drawSprite(ctx, frames[frameIdx], boss.x, boss.y, boss.width, boss.height, dir < 0, 64);
    if (boss.state === 'TELEGRAPH_DASH') {
        renderGlitchTelegraph(boss);
    }
    const glowX = dir === 1 ? boss.x + boss.width - 8 : boss.x + 8;
    drawGlow(ctx, glowX, boss.y + boss.height * 0.6, 40, 'rgba(0, 255, 255, 0.4)');
    ctx.restore();
}
/**
 * Singular DASH Telegraph effect for Glitch.
 */
function renderGlitchTelegraph(boss) {
    const intensity = Math.min(1.0, boss.timer / 1.0);
    const time = Date.now();
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, -10 * intensity, 0, 80 * intensity, 'rgba(0, 255, 255, 0.4)', intensity);
    drawGlow(ctx, 10 * intensity, 0, 80 * intensity, 'rgba(255, 0, 0, 0.4)', intensity);
    drawGlow(ctx, 0, 0, 50 * intensity, 'rgba(255, 255, 255, 0.8)', intensity);
    const rotSpeed = time * 0.01 * (1 + intensity * 3);
    ctx.rotate(rotSpeed);
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -time * 0.1;
    ctx.strokeStyle = `hsl(${(time * 0.2) % 360}, 100%, 70%)`;
    ctx.lineWidth = 4 + intensity * 8;
    ctx.beginPath();
    ctx.arc(0, 0, 60 + intensity * 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = intensity * 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 40 + Math.sin(time * 0.1) * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
