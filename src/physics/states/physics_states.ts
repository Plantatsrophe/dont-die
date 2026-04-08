import { G, player, canvas, TILE_SIZE } from '../../core/globals.js';
import { playSound, stopBackgroundMusic } from '../../assets/audio.js';
import { parseMap, resetPlayerPosition } from '../../logic/spawning/spawner.js';

/**
 * Handles the logic for the player's death sequence.
 */
export function updateDeathState(dt: number) {
    if (player.dyingTimer === undefined) player.dyingTimer = 0;
    player.dyingTimer += dt;
    
    if (player.dyingTimer > 1.8) {
        player.lives--;
        if (player.lives <= 0) {
            stopBackgroundMusic(); playSound('gameOver'); G.gameState = 'GAMEOVER';
        } else {
            G.timer = 60;
            let stash = new Set<string>();
            if (G.currentLevel === 59) {
                for (let i of G.items) { if (i.collected) stash.add(`${Math.floor(i.x)},${Math.floor(i.y)}`); }
            }
            parseMap((G.currentLevel === 59 || G.currentLevel === 79) ? true : false);
            if (G.currentLevel === 59) {
                for (let i of G.items) { if (stash.has(`${Math.floor(i.x)},${Math.floor(i.y)}`)) i.collected = true; }
            }
            resetPlayerPosition();
            if(G.boss) {
                if(G.currentLevel === 59 && G.checkpointPos) {
                    G.boss.y = G.checkpointPos.y + (5 * TILE_SIZE); G.boss.active = true; G.boss.triggered = true;
                    G.boss.vx = 0; G.boss.vy = 0; G.boss.phase = 0; G.boss.timer = 0; G.boss.hasSeenPlayer = true;
                } else if(G.boss.active) {
                    G.boss.x = G.boss.startX ?? G.boss.x; G.boss.y = G.boss.startY ?? G.boss.y;
                    G.boss.vx = 0; G.boss.vy = 0; G.boss.phase = 0; G.boss.hasSeenPlayer = false;
                }
            }
            G.gameState='PLAYING';
        }
    }
}

/**
 * Handles the level clear / portal absorption logic.
 */
export function updateLevelClearState(dt: number) {
    if(player.portalX !== undefined && player.portalY !== undefined) {
        player.x += (player.portalX - player.width/2 - player.x) * 4 * dt;
        player.y += (player.portalY - player.height/2 + 16 - player.y) * 4 * dt;
    }
    player.vx = 0; player.vy = 0;
    G.camera.x = Math.max(0, Math.min(G.mapCols*TILE_SIZE - canvas.width, player.x - canvas.width/2 + player.width/2));
    G.camera.y = Math.max(0, Math.min(G.mapRows*TILE_SIZE - canvas.height, player.y - canvas.height/2 + player.height/2));
    G.winTimer += dt; 
    if(G.winTimer > 2) G.gameState = 'WIN'; 
}

/**
 * Handles the valve cutscene pan logic.
 */
export function updateValveCutsceneState(dt: number) {
    G.valveCutsceneTimer += dt;
    if(G.valveCutsceneTimer > 5.0) { G.gameState='PLAYING'; G.activeValvePos = null; if(G.boss) G.boss.vibrateX = 0; }
    if(G.activeValvePos) {
        let tx = G.activeValvePos.x - canvas.width/2 + 16;
        let ty = (G.activeValvePos.y + 40) - canvas.height/2 + 16;
        G.camera.x += (tx - G.camera.x) * 3 * dt; G.camera.y += (ty - G.camera.y) * 3 * dt;
        G.camera.x = Math.max(0, Math.min(G.mapCols*TILE_SIZE - canvas.width, G.camera.x));
        G.camera.y = Math.max(0, Math.min(G.mapRows*TILE_SIZE - canvas.height, G.camera.y));
    }
    if(G.boss && G.boss.active) G.boss.vibrateX = Math.sin(Date.now() * 0.05) * 8;
}
