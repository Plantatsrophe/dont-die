import { G, player, keys } from '../../core/globals.js';
import { staticLevels } from '../../data/levels.js';
import { parseMap } from './spawner.js';
/**
 * Resets the player location to the latest checkpoint or level start.
 */
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
/**
 * Full game state reset (New Game).
 */
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
/**
 * --- CHEAT HOOKS ---
 */
export function setupCheatHooks() {
    window.parseMap = parseMap;
    window.resetPlayerPosition = resetPlayerPosition;
    window.skipLevel = (lvl) => {
        if (lvl !== undefined)
            G.currentLevel = Math.max(0, Math.min(lvl, staticLevels.length - 1));
        parseMap();
        resetPlayerPosition();
        return `Skipped to Level ${G.currentLevel}`;
    };
    window.goToLevel = window.skipLevel;
    window.nextLevel = () => window.skipLevel(G.currentLevel + 1);
    window.addLives = (n = 1) => {
        player.lives += n;
        return `Added ${n} lives. Current lives: ${player.lives}`;
    };
    window.godMode = (on) => {
        if (on === undefined)
            player.isInvincible = !player.isInvincible;
        else
            player.isInvincible = on;
        if (player.isInvincible)
            player.lives = 999;
        return `God Mode ${player.isInvincible ? 'ENABLED' : 'DISABLED'}`;
    };
    Object.defineProperty(window, 'currentLevel', {
        get: () => G.currentLevel,
        set: (val) => window.skipLevel(val),
        configurable: true
    });
}
