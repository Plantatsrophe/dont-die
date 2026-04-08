import { player, TILE_SIZE, getNextParticle } from './globals.js';
import { playSound } from '../assets/audio.js';
import { playerDeath } from './physics_utils.js';
import { handleSepticusDeath, updateSepticusProjectiles } from './physics_boss_septicus_utils.js';
/**
 * Executes physics and AI for the Septicus boss (Sewer Level 39).
 *
 * @param boss The generic boss entity
 * @param dt Delta time
 * @param bDyn Dynamic binding reference to the boss
 */
export function updateSepticus(boss, dt, bDyn) {
    if (handleSepticusDeath(boss, dt, bDyn))
        return;
    // --- AWAKENING TRIGGER ---
    if (!bDyn.triggered) {
        if (player.x > TILE_SIZE * 12) {
            bDyn.triggered = true;
            boss.x = player.x - boss.width / 2;
            playSound('powerup');
        }
        boss.vx = 0;
        boss.vy = 0;
        return;
    }
    // Maintain buoyancy
    if (boss.y > (boss.startY || 0)) {
        boss.y -= 350 * dt;
        if (boss.y < (boss.startY || 0))
            boss.y = (boss.startY || 0);
        return;
    }
    // Reset if player retreats
    if (player.x < TILE_SIZE * 11) {
        boss.vx = 0;
        boss.phase = 0;
        boss.timer = 0;
        boss.y += (boss.vy ?? 0) * dt;
        if (boss.y > (boss.startY || 0)) {
            boss.y = (boss.startY || 0);
            boss.vy = 0;
        }
        else
            boss.vy = (boss.vy ?? 0) + 800 * dt;
        return;
    }
    boss.y += (boss.vy ?? 0) * dt;
    if (boss.y > (boss.startY || 0)) {
        boss.y = (boss.startY || 0);
        boss.vy = 0;
    }
    else
        boss.vy = (boss.vy ?? 0) + 800 * dt;
    let reach = 140, dist = Math.abs(player.x - (boss.x + boss.width / 2));
    if (boss.phase === 0) { // Phase 0: Float and track
        let spd = (boss.hp < 3) ? 220 : 180;
        boss.vx = (player.x < boss.x + boss.width / 2) ? -spd : spd;
        boss.x += boss.vx * dt;
        boss.x = Math.max(TILE_SIZE * 10, Math.min(TILE_SIZE * 90, boss.x));
        if (boss.hp <= 2 && boss.y >= (boss.startY || 0) && player.y < boss.y - 120 && Math.random() < 0.02)
            boss.vy = -600;
        if (boss.hp === 1 && boss.timer > ((boss.projs?.length || 0) > 0 ? 0 : 3.0)) {
            boss.phase = 3;
            boss.timer = 0;
            bDyn.throwsLeft = 3;
        }
        else if (dist < reach && boss.timer > 2) {
            boss.phase = 1;
            boss.timer = 0;
            boss.vx = 0;
        }
    }
    else if (boss.phase === 1) { // Phase 1: Wind-up
        if (boss.timer > 0.8) {
            boss.phase = 2;
            boss.timer = 0;
            playSound('shoot');
        }
    }
    else if (boss.phase === 2) { // Phase 2: Circular sweep
        if (boss.timer > 1.0) {
            boss.phase = 0;
            boss.timer = 0;
        }
        let sa = boss.timer * Math.PI, dir = (player.x < boss.x ? -1 : 1);
        let sx = (boss.x + boss.width / 2) + Math.cos(sa) * reach * dir;
        let sy = (boss.y + boss.height / 2) - Math.sin(sa) * reach;
        let dx2 = player.x + player.width / 2 - sx, dy2 = player.y + player.height / 2 - sy;
        if (Math.sqrt(dx2 * dx2 + dy2 * dy2) < 22)
            playerDeath();
    }
    else if (boss.phase === 3) { // Phase 3: Projectiles
        if (!boss.projs)
            boss.projs = [];
        let spd2 = 140;
        boss.vx = (player.x < boss.x + boss.width / 2) ? -spd2 : spd2;
        boss.x += boss.vx * dt;
        boss.x = Math.max(TILE_SIZE * 10, Math.min(TILE_SIZE * 90, boss.x));
        if (boss.timer > 0.6 && bDyn.throwsLeft > 0) {
            boss.timer = 0;
            bDyn.throwsLeft--;
            let tx = player.x + player.width / 2, ty = player.y + player.height / 2;
            let bx = boss.x + boss.width / 2, by = boss.y + boss.height / 2;
            let ddx = tx - bx, ddy = ty - by, dst = Math.sqrt(ddx * ddx + ddy * ddy), spd3 = 500;
            boss.projs.push({ x: bx, y: by, vx: (ddx / dst) * spd3, vy: (ddy / dst) * spd3, timer: 0, linear: true });
            playSound('shoot');
        }
        if (bDyn.throwsLeft <= 0 && boss.timer > 1.5) {
            boss.phase = 0;
            boss.timer = 0;
        }
    }
    updateSepticusProjectiles(boss, dt);
    // GREEN DROPS
    if (Math.random() < 30 * dt) {
        let p = getNextParticle();
        p.active = true;
        p.type = 'normal';
        p.size = Math.random() * 3 + 2;
        p.x = boss.x + Math.random() * boss.width;
        p.y = boss.y + boss.height;
        p.vx = (Math.random() - 0.5) * 15;
        p.vy = 40 + Math.random() * 80;
        p.color = '#3ee855';
        p.life = 0;
        p.maxLife = 1.0 + Math.random();
    }
    if ((boss.vx ?? 0) !== 0 && Math.random() < 50 * dt) {
        let p = getNextParticle();
        p.active = true;
        p.type = 'normal';
        p.size = Math.random() * 4 + 3;
        p.x = boss.x + ((boss.vx ?? 0) > 0 ? boss.width : 0) + (Math.random() - 0.5) * 30;
        p.y = 13 * TILE_SIZE;
        p.vx = (boss.vx ?? 0) * 0.4 + (Math.random() - 0.5) * 80;
        p.vy = -180 - Math.random() * 150;
        p.color = '#3ee855';
        p.life = 0;
        p.maxLife = 0.5 + Math.random() * 0.5;
    }
}
