import { G, player, TILE_SIZE, getNextLaser } from './globals.js';
import { playSound } from '../assets/audio.js';
import { updateLivingChain } from './physics_boss_glitch_utils.js';
/**
 * Executes physics and AI for the Glitch boss (Level 79).
 * Glitch features polarized combat zones and procedural Medusa Lasers.
 *
 * @param boss The generic boss entity
 * @param dt Delta time
 */
export function updateGlitch(boss, dt) {
    if (!boss.hairTrail1)
        boss.hairTrail1 = [];
    if (!boss.hairTrail2)
        boss.hairTrail2 = [];
    if (!boss.maneTrail)
        boss.maneTrail = [];
    if (!boss.tailTrail)
        boss.tailTrail = [];
    // --- 1. STATE MACHINE INITIALIZATION ---
    if (!boss.state) {
        boss.state = 'IDLE';
        boss.timer = 0;
        boss.facingDir = 1;
    }
    // Lock facing direction during dashes, otherwise track player
    if (boss.state !== 'DASH' && boss.state !== 'RECOVER') {
        boss.facingDir = player.x < boss.x ? -1 : 1;
    }
    const isFlipped = boss.facingDir === -1;
    // --- 2. COMBAT LOGIC ---
    switch (boss.state) {
        case 'IDLE':
            boss.vx = 0;
            boss.timer += dt;
            if (boss.timer > 2.0) {
                boss.timer = 0;
                // --- BOSS CONSTRAINT: POLARIZED COMBAT ZONES ---
                const isPlayerOnStartPlatform = (player.x < 500 && player.y < 400);
                const isPlayerOnFloor = (player.y > (8 * TILE_SIZE) + 10);
                if (isPlayerOnStartPlatform) {
                    boss.timer = 0; // PEACE ZONE
                }
                else if (isPlayerOnFloor) {
                    boss.state = 'TELEGRAPH_DASH';
                }
                else {
                    boss.state = 'TELEGRAPH_LASER';
                }
            }
            break;
        case 'TELEGRAPH_DASH':
            boss.timer += dt;
            boss.vibrateX = Math.sin(Date.now() * 0.1) * 8;
            if (boss.timer > 1.0) {
                boss.timer = 0;
                boss.vibrateX = 0;
                boss.state = 'DASH';
                boss.vx = boss.facingDir === 1 ? 900 : -900;
                playSound('shoot');
            }
            break;
        case 'DASH':
            boss.x += boss.vx * dt;
            const leftBound = G.camera.x + 20;
            const rightBound = G.camera.x + 800 - boss.width - 20;
            if (boss.x < leftBound || boss.x > rightBound) {
                boss.x = Math.max(leftBound, Math.min(boss.x, rightBound));
                boss.state = 'RECOVER';
                boss.vx = 0;
                playSound('explosion');
            }
            break;
        case 'RECOVER':
            boss.timer += dt;
            if (boss.timer > 1.0) {
                boss.timer = 0;
                boss.state = 'IDLE';
            }
            break;
        case 'TELEGRAPH_LASER':
            boss.vx = 0;
            boss.timer += dt;
            if (boss.timer > 1.2) {
                boss.timer = 0;
                boss.state = 'LASER_ATTACK';
                const trails = [boss.hairTrail1, boss.hairTrail2];
                for (let trail of trails) {
                    if (!trail || trail.length === 0)
                        continue;
                    let l = getNextLaser();
                    l.active = true;
                    l.width = 16;
                    l.height = 8;
                    const tipNode = trail[trail.length - 1];
                    l.x = tipNode.x;
                    l.y = tipNode.y;
                    const ldx = (player.x + player.width / 2) - tipNode.x;
                    const ldy = (player.y + player.height / 2) - tipNode.y;
                    const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
                    l.vx = (ldx / ldist) * 450;
                    l.vy = (ldy / ldist) * 450;
                    l.hue = (Date.now() * 0.2 + (Math.random() * 40)) % 360;
                    l.passThroughTiles = true;
                }
                playSound('shoot');
            }
            break;
        case 'LASER_ATTACK':
            boss.timer += dt;
            if (boss.timer > 0.5) {
                boss.timer = 0;
                boss.state = 'IDLE';
            }
            break;
    }
    const vMin = G.camera.x + 20;
    const vMax = G.camera.x + 800 - boss.width - 20;
    boss.x = Math.max(vMin, Math.min(boss.x, vMax));
    // --- 3. COORDINATE MAPPING & ANCHORS ---
    const sX = boss.width / 64, sY = boss.height / 64;
    const anchors = {
        lx1: isFlipped ? 30 : 20, lx2: isFlipped ? 43 : 33, ly: 5,
        lmx: isFlipped ? 22 : 41, lmy: 20,
        ltx: isFlipped ? 58 : 5, lty: 36
    };
    const hX1 = boss.x + (anchors.lx1 * sX), hY1 = boss.y + (anchors.ly * sY);
    const hX2 = boss.x + (anchors.lx2 * sX), hY2 = boss.y + (anchors.ly * sY);
    const mX = boss.x + (anchors.lmx * sX), mY = boss.y + (anchors.lmy * sY);
    const tX = boss.x + (anchors.ltx * sX), tY = boss.y + (anchors.lty * sY);
    if (boss.lastFlipped !== undefined && boss.lastFlipped !== isFlipped) {
        const mirror = (trail, ax) => {
            for (let i = 1; i < trail.length; i++)
                trail[i].x = 2 * ax - trail[i].x;
        };
        mirror(boss.hairTrail1, hX1);
        mirror(boss.hairTrail2, hX2);
        mirror(boss.maneTrail, mX);
        mirror(boss.tailTrail, tX);
    }
    boss.lastFlipped = isFlipped;
    // --- 4. TRAIL UPDATE ---
    let drag = (Math.abs(boss.vx) > 0.5) ? (isFlipped ? 1.5 : -1.5) : 0;
    updateLivingChain(boss.hairTrail1, 20, hX1, hY1, 2.0, 0, (drag || -1.5), -2.0, 3.5);
    updateLivingChain(boss.hairTrail2, 20, hX2, hY2, 2.0, 100, (drag || 1.5), -2.0, 3.5);
    updateLivingChain(boss.maneTrail, 8, mX, mY, 2.5, 50, 0, 0, 0.8);
    updateLivingChain(boss.tailTrail, 20, tX, tY, 2.5, 50, (isFlipped ? 1.5 : -1.5), 0, 2.0);
}
