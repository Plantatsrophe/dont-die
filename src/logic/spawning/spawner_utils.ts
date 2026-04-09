import { G, player, keys } from '../../core/globals.js';
import { staticLevels } from '../../data/levels.js';
import { parseMap } from './spawner.js';

/**
 * Resets the player location to the latest checkpoint or level start.
 */
export function resetPlayerPosition() {
    if (G.checkpointPos) {
        player.x = G.checkpointPos.x; player.y = G.checkpointPos.y;
    } else {
        player.x = player.startX; player.y = player.startY;
    }
    player.vx = 0; player.vy = 0;
    player.droppingThrough = false; player.isOnGround = false; player.isClimbing = false;

    // Boss Stand-down on respawn
    if (G.baphometronController) {
        G.baphometronController.reset();
    }
}

/**
 * Full game state reset (New Game).
 */
export function resetFullGame() {
    player.lives = 3; player.score = 0; G.timer = 60;
    parseMap(); resetPlayerPosition();
    keys.ArrowLeft = false; keys.ArrowRight = false; keys.ArrowUp = false; keys.ArrowDown = false; keys.Space = false;
    G.gameStartTime = new Date().getTime();
}

/**
 * --- CHEAT HOOKS ---
 */
export function setupCheatHooks() {
    (window as any).parseMap = parseMap;
    (window as any).resetPlayerPosition = resetPlayerPosition;
    (window as any).skipLevel = (lvl: number) => {
        if (lvl !== undefined) G.currentLevel = Math.max(0, Math.min(lvl, staticLevels.length - 1));
        parseMap(); resetPlayerPosition();
        return `Skipped to Level ${G.currentLevel}`;
    };
    (window as any).goToLevel = (window as any).skipLevel;
    (window as any).nextLevel = () => (window as any).skipLevel(G.currentLevel + 1);
    (window as any).addLives = (n: number = 1) => {
        player.lives += n; return `Added ${n} lives. Current lives: ${player.lives}`;
    };
    (window as any).godMode = (on: boolean | undefined) => {
        if (on === undefined) player.isInvincible = !player.isInvincible;
        else player.isInvincible = on;
        if (player.isInvincible) player.lives = 999;
        return `God Mode ${player.isInvincible ? 'ENABLED' : 'DISABLED'}`;
    };
    Object.defineProperty(window, 'currentLevel', {
        get: () => G.currentLevel,
        set: (val) => (window as any).skipLevel(val),
        configurable: true
    });
}
