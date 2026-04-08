import { G, player, TILE_SIZE, canvas, particlePool, getNextParticle, getNextLaser, addScore } from '../core/globals.js';
import { playSound } from '../assets/audio.js';
import { updatePhysics } from '../physics/core/physics_core.js';
import { updateBombs } from '../physics/hazards/physics_bombs.js';
import { updateLasers } from '../physics/hazards/physics_lasers.js';
import { checkRectCollision, playerDeath, getCollidingTiles } from '../physics/core/physics_utils.js';
import { bossExplode } from '../physics/bosses/physics_boss.js';
import { updateSpatialGrid, queryGrid } from '../core/spatial_grid.js';
/**
 * Internal logic step for moving entities, AI, and entity-specific collisions.
 */
export function updateGame(dt) {
    if (G.gameState === 'PLAYING') {
        G.timerAcc += dt;
        if (G.timerAcc >= 1) {
            G.timer--;
            G.timerAcc -= 1;
            if (G.timer <= 0)
                playerDeath();
        }
    }
    updateSpatialGrid();
    updatePhysics(dt);
    for (let p of particlePool) {
        if (!p.active)
            continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.size *= 0.95;
        if (p.life <= 0)
            p.active = false;
    }
    updateLasers(dt);
    updateBombs(dt);
    if (G.gameState !== 'PLAYING')
        return;
    // --- CAMERA ENGINE ---
    let camTX = player.x + player.width / 2, camTY = player.y + player.height / 2;
    if (G.boss && G.boss.active && G.boss.isSinking) {
        camTX = G.boss.x + G.boss.width / 2;
        camTY = G.boss.y + G.boss.height / 2;
    }
    G.camera.x += (camTX - canvas.width / 2 - G.camera.x) * 0.05;
    G.camera.y += (camTY - canvas.height / 2 - G.camera.y) * 0.05;
    G.camera.x = Math.max(0, Math.min(G.mapCols * TILE_SIZE - canvas.width, G.camera.x));
    G.camera.y = Math.max(0, Math.min(G.mapRows * TILE_SIZE - canvas.height, G.camera.y));
    // --- ENTITY INTERACTIONS ---
    const nearEntities = queryGrid(player.x - 50, player.y - 50, player.width + 100, player.height + 100);
    for (const ent of nearEntities) {
        if (ent.type === 'hotdog' || ent.type === 'checkpoint' || ent.type === 'valve' || ent.type === 'detonator' || ent.type === 'gear') {
            const i = ent;
            if (!i.collected && checkRectCollision(player, i)) {
                i.collected = true;
                if (i.type === 'hotdog') {
                    player.lives++;
                    playSound('powerup');
                }
                else if (i.type === 'checkpoint') {
                    if (!G.checkpointPos || G.checkpointPos.x !== i.x + 8 || G.checkpointPos.y !== i.y - 2) {
                        G.checkpointPos = { x: i.x + 8, y: i.y - 2 };
                        playSound('powerup');
                        for (let pC = 0; pC < 20; pC++) {
                            let p = getNextParticle();
                            p.active = true;
                            p.type = 'checkpoint';
                            p.x = i.x + 16;
                            p.y = i.y + 16;
                            p.vx = (Math.random() - 0.5) * 100;
                            p.vy = -50 - Math.random() * 100;
                            p.size = 6;
                            p.life = 0.5 + Math.random() * 0.5;
                            p.maxLife = 1.0;
                        }
                    }
                }
                else if (i.type === 'valve') {
                    playSound('powerup');
                    if (G.boss && G.boss.active) {
                        G.gameState = 'VALVE_CUTSCENE';
                        G.valveCutsceneTimer = 0;
                        G.activeValvePos = { x: i.x, y: i.y };
                        G.purifiedValves.push({ x: i.x, y: i.y });
                        G.boss.hp--;
                        G.boss.hurtTimer = 0.5;
                        G.isMapCached = false;
                        playSound('explosion');
                        if (G.boss.hp <= 0)
                            bossExplode();
                    }
                }
                else if (i.type === 'detonator') {
                    playSound('powerup');
                    if (G.boss && G.boss.active) {
                        bossExplode();
                        player.cutsceneTimer = 0;
                        G.gameState = 'CREDITS_CUTSCENE';
                    }
                }
                else {
                    addScore(1000);
                    playSound('collect');
                }
            }
        }
        else if (ent.type === 'bot' || ent.type === 'laserBot') {
            const e = ent;
            if (checkRectCollision(player, e)) {
                if (player.vy > 0 && player.y + player.height - player.vy * dt <= e.y + 15) {
                    playSound('stomp');
                    player.vy = -400;
                    player.doubleJump = true;
                    addScore(200);
                    for (let pC = 0; pC < 20; pC++) {
                        let rad = Math.random() * Math.PI * 2, spd = 50 + Math.random() * 150, p = getNextParticle();
                        p.active = true;
                        p.type = 'gear';
                        p.x = e.x + e.width / 2;
                        p.y = e.y + e.height / 2;
                        p.vx = Math.cos(rad) * spd;
                        p.vy = Math.sin(rad) * spd - 50;
                        p.size = 16;
                        p.life = 0.8 + Math.random() * 0.4;
                        p.maxLife = 1.2;
                    }
                    const idx = G.enemies.indexOf(e);
                    if (idx !== -1)
                        G.enemies.splice(idx, 1);
                }
                else {
                    playerDeath();
                    return;
                }
            }
        }
    }
    // --- AI UPDATES ---
    for (let i = G.enemies.length - 1; i >= 0; i--) {
        let e = G.enemies[i];
        if (e.type === 'bot') {
            let ogX = e.x;
            e.x += e.vx * e.dir * dt;
            let hitWall = false;
            for (let t of getCollidingTiles(e)) {
                if (t.type === 1)
                    hitWall = true;
            }
            let pitCheck = { x: e.x + (e.dir === 1 ? e.width : -1), y: e.y + e.height + 1, width: 1, height: 1 };
            let overPit = true;
            for (let t of getCollidingTiles(pitCheck)) {
                if (t.type === 1 || t.type === 6)
                    overPit = false;
            }
            if (hitWall || overPit) {
                e.x = ogX;
                e.dir *= -1;
            }
        }
        else if (e.type === 'laserBot') {
            e.dir = player.x < e.x ? -1 : 1;
            if (Math.abs(player.y - e.y) < 150 && Math.abs(player.x - e.x) < 500) {
                e.cooldown -= dt;
                if (e.cooldown <= 0) {
                    e.cooldown = 1.6;
                    let l = getNextLaser();
                    l.active = true;
                    l.x = e.dir === 1 ? e.x + e.width : e.x - 16;
                    l.y = e.y + 4;
                    l.width = 16;
                    l.height = 4;
                    l.vx = 350 * e.dir;
                    playSound('laser');
                }
            }
        }
    }
}
