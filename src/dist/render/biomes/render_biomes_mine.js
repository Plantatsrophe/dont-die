import { canvas, ctx } from '../../core/globals.js';
import { sprGear } from '../../assets/assets.js';
import { drawSprite } from '../utils/render_utils.js';
/**
 * Mine: Vertical support infrastructure for the climbable biome.
 * @param py Camera Y scroll for vertical parallax
 */
export function drawMineParallax(py) {
    // 1. Dark Cavern Walls (Depth)
    ctx.fillStyle = '#0a0805';
    for (let i = 0; i < 5; i++) {
        let rx = ((i * 250) - py * 0.05) % (canvas.width + 300);
        if (rx < -300)
            rx += canvas.width + 600;
        ctx.fillRect(rx, 0, 60 + (i % 2) * 40, canvas.height);
    }
    // 2. Heavy Industrial Support Beams (Wooden Mining Infrastructure)
    for (let i = -2; i < 5; i++) {
        let by = (i * 350 + py * 0.6) % (canvas.height + 700);
        if (by < -350)
            by += canvas.height + 1050;
        // Vertical support posts
        ctx.fillStyle = '#2b1d12';
        ctx.fillRect(30, by, 30, 350);
        ctx.fillRect(canvas.width - 60, by, 30, 350);
        ctx.fillStyle = '#3d2b1f'; // Grain detail
        ctx.fillRect(40, by, 5, 350);
        ctx.fillRect(canvas.width - 50, by, 5, 350);
        // Horizontal cross-beams (Lintels)
        ctx.fillStyle = '#261a12';
        ctx.fillRect(10, by + 40, canvas.width - 20, 25);
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(10, by + 45, canvas.width - 20, 5);
        // Iron brackets/bolts
        ctx.fillStyle = '#111';
        ctx.fillRect(25, by + 35, 40, 35);
        ctx.fillRect(canvas.width - 65, by + 35, 40, 35);
    }
    // 3. Rusted Chains and Pulleys (Distant background)
    ctx.strokeStyle = '#1a120b';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
        let cx = 100 + i * 300 + Math.sin(i) * 50;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, canvas.height);
        ctx.stroke();
        let gy = (i * 400 - py * 0.3) % (canvas.height + 400);
        if (gy < -200)
            gy += canvas.height + 800;
        ctx.save();
        ctx.translate(cx, gy);
        ctx.rotate(Date.now() / (2000 + i * 500));
        ctx.globalAlpha = 0.25;
        ctx.scale(4, 4);
        drawSprite(ctx, sprGear, -12, -12, 24, 24, false);
        ctx.restore();
    }
    // 4. Muddy Water Drips (Damp cavern feel)
    ctx.fillStyle = 'rgba(166, 139, 119, 0.3)';
    for (let i = 0; i < 8; i++) {
        let dx = (i * 140 + Math.sin(Date.now() * 0.001 + i) * 20) % canvas.width;
        let dy = (Date.now() / (12 + (i % 4) * 4) + i * 200) % (canvas.height + 200);
        ctx.fillRect(dx, dy - 100, 2, 25);
    }
}
