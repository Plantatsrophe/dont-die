import { G, offscreenMapCanvas, offscreenMapCtx, TILE_SIZE } from '../../core/globals.js';
import { drawGlow } from '../utils/render_utils.js';

/**
 * Map Caching Logic (Pre-Renderer).
 * Draws the entire level's static tiles onto an offscreen canvas once per level load.
 */
export function preRenderMap() {
    if (G.isMapCached) return;
    const { map, mapRows, mapCols, currentLevel } = G;
    const bId = Math.floor(currentLevel / 20) % 5;

    offscreenMapCanvas.width = mapCols * TILE_SIZE; 
    offscreenMapCanvas.height = mapRows * TILE_SIZE;
    offscreenMapCtx.clearRect(0, 0, offscreenMapCanvas.width, offscreenMapCanvas.height);
    
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            let tile = map[row][col], tx = col * TILE_SIZE, ty = row * TILE_SIZE;
            
            if (tile === 1 || tile === 6) {
                if (bId === 2) { // MINE
                    const leftSame = col > 0 && map[row][col-1] === 1;
                    const rightSame = col < mapCols-1 && map[row][col+1] === 1;
                    offscreenMapCtx.fillStyle = '#1a120b'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                    offscreenMapCtx.fillStyle = '#2b1d12'; offscreenMapCtx.beginPath();
                    if (!leftSame) offscreenMapCtx.moveTo(tx, ty + 20); else offscreenMapCtx.moveTo(tx, ty + 15);
                    offscreenMapCtx.lineTo(tx + 20, ty + 10); offscreenMapCtx.lineTo(tx + 40, ty + 25); offscreenMapCtx.lineTo(tx + 40, ty + 40); offscreenMapCtx.lineTo(tx, ty + 40);
                    offscreenMapCtx.fill();
                    offscreenMapCtx.fillStyle = '#3d2b1f'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, 6);
                    offscreenMapCtx.fillStyle = '#1a120b'; offscreenMapCtx.fillRect(tx, ty + 6, TILE_SIZE, 2);
                    if (!leftSame) { offscreenMapCtx.fillStyle = 'rgba(0,0,0,0.3)'; offscreenMapCtx.fillRect(tx, ty, 2, TILE_SIZE); }
                    if (!rightSame) { offscreenMapCtx.fillStyle = 'rgba(0,0,0,0.5)'; offscreenMapCtx.fillRect(tx + TILE_SIZE - 2, ty, 2, TILE_SIZE); }
                    if ((row * 7 + col * 3) % 11 < 3) {
                        offscreenMapCtx.fillStyle = (col % 2 === 0) ? '#ffd700' : '#ff8c00';
                        offscreenMapCtx.fillRect(tx + 12 + (row%4)*4, ty + 12 + (col%4)*4, 2, 2);
                    }
                } else { // INDUSTRIAL
                    offscreenMapCtx.fillStyle = '#2f2c2b'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                    offscreenMapCtx.fillStyle = '#6e3c15'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, 4);
                    offscreenMapCtx.fillStyle = '#110d0c'; offscreenMapCtx.fillRect(tx, ty + 4, TILE_SIZE, 2);
                    offscreenMapCtx.strokeStyle = '#1a1818'; offscreenMapCtx.lineWidth = 2; offscreenMapCtx.strokeRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
                if (row < mapRows - 1 && (map[row+1][col] === 2 || map[row+1][col] === 9)) {
                    offscreenMapCtx.fillStyle = '#4a3d38'; offscreenMapCtx.fillRect(tx + 10, ty, 5, TILE_SIZE); offscreenMapCtx.fillRect(tx + 25, ty, 5, TILE_SIZE);
                    for (let i = 0; i < 4; i++) { offscreenMapCtx.fillStyle = '#78432a'; offscreenMapCtx.fillRect(tx + 10, ty + i * 10 + 5, 20, 3); }
                }
            } else if (tile === 2 || tile === 9) {
                if (tile === 9) {
                    if (bId === 2) {
                        offscreenMapCtx.fillStyle = '#1a120b'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                        offscreenMapCtx.fillStyle = '#2b1d12'; offscreenMapCtx.beginPath(); offscreenMapCtx.moveTo(tx, ty + 20); offscreenMapCtx.lineTo(tx + 20, ty + 10); offscreenMapCtx.lineTo(tx + 40, ty + 25); offscreenMapCtx.lineTo(tx + 40, ty + 40); offscreenMapCtx.lineTo(tx, ty + 40); offscreenMapCtx.fill();
                        offscreenMapCtx.fillStyle = '#3d2b1f'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, 6); offscreenMapCtx.fillStyle = '#1a120b'; offscreenMapCtx.fillRect(tx, ty + 6, TILE_SIZE, 2);
                    } else {
                        offscreenMapCtx.fillStyle = '#2f2c2b'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                        offscreenMapCtx.fillStyle = '#6e3c15'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, 4);
                        offscreenMapCtx.fillStyle = '#110d0c'; offscreenMapCtx.fillRect(tx, ty + 4, TILE_SIZE, 2);
                    }
                }
                offscreenMapCtx.fillStyle = '#4a3d38'; offscreenMapCtx.fillRect(tx + 10, ty, 5, TILE_SIZE); offscreenMapCtx.fillRect(tx + 25, ty, 5, TILE_SIZE);
                for (let i = 0; i < 4; i++) { offscreenMapCtx.fillStyle = '#78432a'; offscreenMapCtx.fillRect(tx + 10, ty + i * 10 + 5, 20, 3); }
            } else if (tile === 3) {
                let spikeGrad = offscreenMapCtx.createLinearGradient(0, ty + TILE_SIZE, 0, ty); spikeGrad.addColorStop(0, '#332a22'); spikeGrad.addColorStop(1, '#ff3300');
                offscreenMapCtx.fillStyle = spikeGrad; offscreenMapCtx.beginPath(); let spikesCount = 4, w = TILE_SIZE / spikesCount;
                for (let s = 0; s < spikesCount; s++) { offscreenMapCtx.moveTo(tx + s * w + w/2, ty + TILE_SIZE/2); offscreenMapCtx.lineTo(tx + (s+1) * w, ty + TILE_SIZE); offscreenMapCtx.lineTo(tx + s * w, ty + TILE_SIZE); }
                offscreenMapCtx.fill(); drawGlow(offscreenMapCtx, tx + TILE_SIZE/2, ty + TILE_SIZE/2 + 4, 30, 'rgba(255, 30, 0, 0.3)');
            } else if (tile === 15) {
                offscreenMapCtx.fillStyle = G.acidPurified ? '#003366' : '#0a210f'; offscreenMapCtx.fillRect(tx, ty + 12, TILE_SIZE, TILE_SIZE - 12);
                offscreenMapCtx.fillStyle = G.acidPurified ? '#1e90ff' : '#1b5c21'; offscreenMapCtx.fillRect(tx, ty + 12, TILE_SIZE, 4);
                drawGlow(offscreenMapCtx, tx + TILE_SIZE/2, ty + 16, 20, G.acidPurified ? 'rgba(0, 187, 255, 0.4)' : 'rgba(62, 232, 85, 0.4)');
            } else if (tile === 16) {
                if (bId === 0) {
                    offscreenMapCtx.fillStyle = '#1a1818'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                    offscreenMapCtx.strokeStyle = '#333333'; offscreenMapCtx.lineWidth = 2; offscreenMapCtx.strokeRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                } else if (bId === 1) {
                    offscreenMapCtx.fillStyle = '#0a1a0d'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                } else if (bId === 2) {
                    offscreenMapCtx.fillStyle = '#0d0a08'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                    offscreenMapCtx.fillStyle = '#2b1d12'; 
                    if (row === 0 || row === mapRows - 1) offscreenMapCtx.fillRect(tx, ty + 12, TILE_SIZE, 16); 
                    if (col === 0 || col === mapCols - 1) offscreenMapCtx.fillRect(tx + 12, ty, 16, TILE_SIZE);
                } else {
                    offscreenMapCtx.fillStyle = '#0a000a'; offscreenMapCtx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                    offscreenMapCtx.strokeStyle = '#ff00ff'; offscreenMapCtx.lineWidth = 1; offscreenMapCtx.strokeRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
            }
        }
    }

    if (bId === 3) {
        offscreenMapCtx.save(); offscreenMapCtx.strokeStyle = '#00ffff'; offscreenMapCtx.lineWidth = 2; offscreenMapCtx.shadowBlur = 8; offscreenMapCtx.shadowColor = '#00ffff'; offscreenMapCtx.globalCompositeOperation = 'lighter';
        for (let row = 0; row < mapRows; row++) {
            for (let col = 0; col < mapCols; col++) {
                let tile = map[row][col], tx = col * TILE_SIZE, ty = row * TILE_SIZE;
                if (ty >= 40 && (tile === 1 || tile === 6 || tile === 16)) offscreenMapCtx.strokeRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            }
        }
        offscreenMapCtx.restore();
    }
    G.isMapCached = true;
}
