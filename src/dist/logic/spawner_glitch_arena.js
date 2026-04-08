import { G, TILE_SIZE, reflectorPool } from '../core/globals.js';
/**
 * Handles the procedural platform generation for Level 79 (Glitch Boss).
 */
export function buildGlitchArena() {
    if (G.currentLevel !== 79)
        return;
    reflectorPool.length = 0;
    reflectorPool.push({ x: 800, y: 200, width: 40, height: 40, active: true, isUsable: true }, { x: 2000, y: 100, width: 40, height: 40, active: true, isUsable: true }, { x: 3200, y: 200, width: 40, height: 40, active: true, isUsable: true });
    let curX = 100, curRow = 7;
    if (G.map[12])
        G.map[12][4] = 1;
    if (G.map[10])
        G.map[10][6] = 1;
    const targets = [
        { x: 800, row: 7 }, { x: 2000, row: 4 }, { x: 3200, row: 7 }, { x: 3800, row: 10 }
    ];
    for (let target of targets) {
        while (curX < target.x - 60) {
            curX += 110 + Math.random() * 40;
            let rowDiff = target.row - curRow;
            let move = (rowDiff === 0) ? (Math.floor(Math.random() * 3) - 1) : Math.sign(rowDiff);
            curRow = Math.max(4, Math.min(12, curRow + move));
            let col = Math.floor(curX / TILE_SIZE);
            if (G.map[curRow] && G.map[curRow][col] !== undefined)
                G.map[curRow][col] = 1;
        }
        let col = Math.floor(target.x / TILE_SIZE);
        if (G.map[target.row]) {
            for (let i = -1; i <= 2; i++) {
                if (G.map[target.row][col + i] !== undefined)
                    G.map[target.row][col + i] = 1;
            }
        }
        curX = target.x;
        curRow = target.row;
    }
}
