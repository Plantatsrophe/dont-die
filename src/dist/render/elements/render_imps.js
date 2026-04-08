import { G, ctx, getNextParticle } from '../../core/globals.js';
import { drawSprite } from '../utils/render_utils.js';
import { sprBloodImp1, sprBloodImp2 } from '../../assets/assets.js';
/**
 * Renders Demon Portals with a fiery 'Eye of Sauron' aesthetic.
 */
export function renderPortals() {
    if (!G.demonPortals)
        return;
    for (const portal of G.demonPortals) {
        if (!portal.active)
            continue;
        const centerX = portal.x + portal.width / 2;
        const centerY = portal.y + portal.height / 2;
        const time = Date.now() / 1000;
        // --- SAURON EYE RENDERING ---
        ctx.save();
        ctx.translate(centerX, centerY);
        // 1. Heat Shimmer (Flickering Aura)
        const flicker = 1 + Math.sin(time * 20) * 0.05;
        ctx.scale(flicker, flicker);
        // Outer Glow (Fiery Corona)
        ctx.shadowBlur = 20 + Math.sin(time * 15) * 10;
        ctx.shadowColor = '#ff4400';
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        // 2. Iris (The Red Eye)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#990000';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        // 3. The Pupil (Vertical Slit)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // Draw vertical cat-eye slit
        ctx.ellipse(0, 0, 4, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // 4. Highlight (Glint)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // --- EMBERS (SPARK PARTICLES) ---
        if (Math.random() < 0.2) {
            const p = getNextParticle();
            p.active = true;
            p.type = 'normal';
            p.size = 1 + Math.random() * 2;
            p.x = centerX + (Math.random() - 0.5) * 32;
            p.y = centerY + (Math.random() - 0.5) * 32;
            p.vx = (Math.random() - 0.5) * 50;
            p.vy = -50 - Math.random() * 100; // Drift upwards
            p.life = 0.5 + Math.random() * 0.5;
            p.maxLife = p.life;
            p.color = Math.random() > 0.5 ? '#ff4400' : '#ffd700';
        }
    }
}
/**
 * Renders dive-bombing Blood Imps using custom pixel-art sprites.
 */
export function renderImps() {
    for (const imp of G.enemies) {
        if (imp.type !== 'bloodImp' || !imp.active)
            continue;
        // Toggle animation frame every ~150ms using group timer
        const frame = (Math.floor(G.enemyWalkTimer * 8) % 2 === 0) ? sprBloodImp1 : sprBloodImp2;
        // Flip sprite based on velocity (Imps face their travel direction)
        const flip = imp.vx < 0;
        // Imps are 32x32, but using a 16x16 sprite grid. drawSprite handles scaling.
        drawSprite(ctx, frame, imp.x, imp.y, imp.width, imp.height, flip, 16);
    }
}
