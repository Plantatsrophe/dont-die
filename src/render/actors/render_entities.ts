import { G, ctx, getNextParticle } from '../../core/globals.js';
import { sprRocketPad, sprSewerGrate, sprRef, sprValveWheel, sprHotdog, sprGear, sprBot, sprLaserBot } from '../../assets/assets.js';
import { drawSprite, drawGlow } from '../utils/render_utils.js';
import { renderParticles } from '../elements/render_particles.js';
import { renderProjectiles } from '../elements/render_projectiles.js';
import { renderReflectors } from '../elements/render_reflectors.js';

/**
 * Main switch-board for rendering all entities in the physical world.
 */
export function renderEntities() {
    const { platforms, items, enemies, bombs, activeValvePos, valveCutsceneTimer, timerAcc } = G;

    // --- 1. MOVING PLATFORMS ---
    let biome = Math.floor(G.currentLevel / 20) % 5;
    for (let plat of platforms) {
        if (biome === 1) {
            drawSprite(ctx, sprSewerGrate, plat.x, plat.y, plat.width, plat.height, false);
            if (plat.type === 'h-grate' && Math.random() > 0.96) {
                const p = getNextParticle();
                p.active = true; p.type = 'normal'; p.color = '#2ecc71';
                p.x = plat.x + Math.random() * plat.width; p.y = plat.y + plat.height;
                p.vx = 0; p.vy = 40 + Math.random() * 40;
                p.size = 3; p.life = 0.6; p.maxLife = 1.0;
            }
        } else {
            drawGlow(ctx, plat.x + plat.width/2, plat.y + 8, 30, 'rgba(255, 100, 0, 0.4)');
            drawSprite(ctx, sprRocketPad, plat.x, plat.y, plat.width, plat.height, false);
            if (Math.random() > 0.2) {
                ctx.fillStyle = Math.random() > 0.5 ? '#ff2222' : '#f1c40f';
                ctx.fillRect(plat.x + 8 + Math.random() * 4, plat.y + plat.height, 2 + Math.random() * 2, 2 + Math.random() * 4);
            }
        }
    }

    // --- 2. ITEMS ---
    for (let i of items) {
        if (i.type === 'checkpoint') {
            const isActive = G.checkpointPos && G.checkpointPos.x === i.x + 8 && G.checkpointPos.y === i.y - 2;
            const flip = isActive ? false : (Math.floor(Date.now() / 400) % 2 === 0);
            drawSprite(ctx, sprRef, i.x, i.y + 7, i.width, i.height, flip);
            drawGlow(ctx, i.x + 16, i.y + 16, isActive ? 35 : 20, isActive ? 'rgba(50, 255, 100, 0.5)' : 'rgba(255, 255, 255, 0.2)');
        } else if (i.type === 'valve') {
            let isPurifying = (activeValvePos && activeValvePos.x === i.x && activeValvePos.y === i.y);
            ctx.save(); ctx.translate(i.x + 16, i.y + 16); ctx.rotate(isPurifying ? (valveCutsceneTimer * 12) : 0);
            drawSprite(ctx, sprValveWheel, -16, -16, 32, 32, false); ctx.restore();
            drawGlow(ctx, i.x + 16, i.y + 16, i.collected ? 25 : 30, i.collected ? 'rgba(0, 187, 255, 0.5)' : 'rgba(255, 0, 0, 0.4)');
        } else if (!i.collected) {
            if (i.type === 'hotdog') drawSprite(ctx, sprHotdog, i.x, i.y, i.width, i.height, false);
            else if (i.type === 'detonator') {
                ctx.fillStyle = '#ff5500'; ctx.fillRect(i.x, i.y + 16, 32, 16); ctx.fillStyle = '#ff0000'; ctx.fillRect(i.x + 8, i.y + 8, 16, 8);
                drawGlow(ctx, i.x + 16, i.y + 16, 50, 'rgba(255, 0, 0, 0.8)');
            } else drawSprite(ctx, sprGear, i.x, i.y, i.width, i.height, false);
        }
    }

    // --- 3. ENEMIES ---
    for (let e of enemies) {
        let wobbleY = Math.floor(timerAcc * 8) % 2 === 0 ? 2 : 0;
        if (e.type === 'bot') drawSprite(ctx, sprBot, e.x - 7, e.y - 14 + wobbleY, 38, 38, e.dir < 0);
        else if (e.type === 'laserBot') drawSprite(ctx, sprLaserBot, e.x - 7, e.y - 14, 38, 38, e.dir < 0);
    }

    // --- 4. BOMB HAZARDS ---
    for (let b of bombs) {
        let bx = b.x, by = b.y + 10;
        ctx.fillStyle = '#2b1a10'; ctx.fillRect(bx+6, by+10, 20, 4); ctx.fillRect(bx+6, by+22, 20, 4);
        ctx.fillStyle = '#D32F2F'; ctx.fillRect(bx+6, by+4, 6, 26); ctx.fillRect(bx+13, by+4, 6, 26); ctx.fillRect(bx+20, by+4, 6, 26);
        ctx.fillStyle = '#5D4037'; ctx.fillRect(bx+15, by-4, 2, 8); 
        ctx.fillStyle = '#FFC107'; ctx.beginPath(); ctx.arc(bx+16+(Math.random()-0.5)*4, by-4+(Math.random()-0.5)*4, 3, 0, Math.PI*2); ctx.fill();
    }

    renderProjectiles();
    renderParticles();
    renderReflectors();
}
