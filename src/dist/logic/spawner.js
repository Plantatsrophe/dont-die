import { G, player, keys, TILE_SIZE, offscreenMapCanvas } from '../core/globals.js';
import { staticLevels } from '../data/levels.js';
import { spawnMovingPlatform, spawnBoss } from './entity_spawner.js';
let lastLevel = -1;
export function parseMap(resetEntities = true) {
    if (G.currentLevel !== lastLevel) {
        G.cleanedPipes = [];
        G.checkpointPos = null;
        lastLevel = G.currentLevel;
    }
    let currentMapData = staticLevels[G.currentLevel].map;
    G.mapRows = currentMapData.length;
    G.mapCols = currentMapData[0].length;
    G.map = [];
    if (resetEntities) {
        G.items = [];
        G.enemies = [];
        G.lasers = [];
        G.platforms = [];
        G.bombs = [];
        G.boss = { active: false, timer: 0, hp: 0, phase: 0, hurtTimer: 0, vibrateX: 0, vx: 0, vy: 0, hasSeenPlayer: false, x: 0, y: 0, width: 0, height: 0, type: 'boss', squash: 1, squashTimer: 0 };
        G.purifiedValves = [];
    }
    G.particles = [];
    G.isMapCached = false;
    G.acidPurified = false;
    offscreenMapCanvas.width = G.mapCols * TILE_SIZE;
    offscreenMapCanvas.height = G.mapRows * TILE_SIZE;
    let spawnFound = false;
    for (let row = 0; row < G.mapRows; row++) {
        let rowData = [];
        for (let col = 0; col < G.mapCols; col++) {
            let char = currentMapData[row][col], tile = parseInt(char, 10);
            if (char === 'H')
                tile = 11;
            else if (char === 'C')
                tile = 14;
            else if (char === 'A')
                tile = 15;
            if (tile === 4) {
                if (resetEntities)
                    G.items.push({ x: col * TILE_SIZE + 8, y: row * TILE_SIZE + 8, width: 24, height: 24, collected: false, type: 'gear' });
                rowData.push(0);
            }
            else if (tile === 11) {
                if (resetEntities)
                    G.items.push({ x: col * TILE_SIZE + 8, y: row * TILE_SIZE + 8, width: 24, height: 24, collected: false, type: 'hotdog' });
                rowData.push(0);
            }
            else if (tile === 14) {
                if (resetEntities)
                    G.items.push({ x: col * TILE_SIZE, y: row * TILE_SIZE, width: 32, height: 32, collected: false, type: 'checkpoint' });
                rowData.push(0);
            }
            else if (char === 'U' || char === 'P' || tile === 6) {
                if (resetEntities)
                    spawnMovingPlatform(char, row, col, currentMapData);
                rowData.push(0);
            }
            else if (char === '7' || (row === 8 && col === 1 && !spawnFound)) {
                if (!G.checkpointPos) {
                    player.startX = col * TILE_SIZE + 6;
                    player.startY = (row + 1) * TILE_SIZE - player.height;
                }
                spawnFound = true;
                rowData.push(0);
            }
            else if (tile === 8) {
                if (resetEntities)
                    G.enemies.push({ type: 'bot', x: col * TILE_SIZE + 8, y: (row + 1) * TILE_SIZE - 24, width: 24, height: 24, vx: 50, vy: 0, dir: 1, cooldown: 0 });
                rowData.push(0);
            }
            else if (char === 'L') {
                if (resetEntities)
                    G.enemies.push({ type: 'laserBot', x: col * TILE_SIZE + 8, y: (row + 1) * TILE_SIZE - 24, width: 24, height: 24, vx: 0, vy: 0, dir: -1, cooldown: 1.0 });
                rowData.push(0);
            }
            else if (char === 'B') {
                if (resetEntities)
                    spawnBoss(col, row);
                rowData.push(0);
            }
            else if (char === 'V') {
                if (resetEntities)
                    G.items.push({ x: col * TILE_SIZE, y: row * TILE_SIZE, width: 32, height: 32, collected: false, type: 'valve' });
                rowData.push(0);
            }
            else if (char === 'D') {
                if (resetEntities)
                    G.items.push({ x: col * TILE_SIZE, y: row * TILE_SIZE, width: 32, height: 32, collected: false, type: 'detonator' });
                rowData.push(0);
            }
            else if (char === 'M') {
                if (resetEntities)
                    G.bombs.push({ active: false, x: col * TILE_SIZE + 4, y: row * TILE_SIZE, width: 32, height: 32, vx: 0, vy: 0, col, row, type: 'bomb' });
                rowData.push(0);
            }
            else {
                rowData.push(isNaN(tile) ? 0 : tile);
            }
        }
        G.map.push(rowData);
    }
}
export function resetPlayerPosition() {
    if (G.checkpointPos) {
        player.x = G.checkpointPos.x;
        player.y = G.checkpointPos.y;
    }
    else {
        player.x = player.startX;
        player.y = player.startY;
    }
    player.vx = 0;
    player.vy = 0;
    player.droppingThrough = false;
    player.isOnGround = false;
    player.isClimbing = false;
}
export function resetFullGame() {
    player.lives = 3;
    player.score = 0;
    G.timer = 60;
    parseMap();
    resetPlayerPosition();
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.Space = false;
    G.gameStartTime = new Date().getTime();
}
// Expose to window for console access (Cheats/Debugging)
window.parseMap = parseMap;
window.resetPlayerPosition = resetPlayerPosition;
window.skipLevel = function (lvl) {
    if (lvl !== undefined) {
        G.currentLevel = Math.max(0, Math.min(lvl, staticLevels.length - 1));
    }
    parseMap();
    resetPlayerPosition();
    return `Skipped to Level ${G.currentLevel}`;
};
window.goToLevel = window.skipLevel;
window.nextLevel = function () {
    return window.skipLevel(G.currentLevel + 1);
};
window.addLives = function (n = 1) {
    player.lives += n;
    return `Added ${n} lives. Current lives: ${player.lives}`;
};
window.godMode = function (on = true) {
    if (on)
        player.lives = 999;
    else
        player.lives = 3;
    return `God Mode ${on ? 'Enabled' : 'Disabled'}`;
};
Object.defineProperty(window, 'currentLevel', {
    get: function () { return G.currentLevel; },
    set: function (val) { window.skipLevel(val); },
    configurable: true
});
