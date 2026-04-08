import { G, canvas, ctx } from '../core/globals.js';
/**
 * renderVirtualBackground: High-dynamic "Blocky Circuitry" background.
 * Features an infinite parallax grid, glitching data artifacts, and screen-tear effects.
 *
 * @param px Camera X parallax offset
 * @param py Camera Y parallax offset
 */
export function renderVirtualBackground(px, py) {
    ctx.save();
    // Layer 1: Infinite Parallax Grid
    const gridSize = 120;
    const offsetX = Math.floor(-(px * 0.5) % gridSize);
    const offsetY = Math.floor(-(py * 0.2) % gridSize);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    // Layer 2: Moving Data Blocks (Glitch Artifacts)
    for (let i = 0; i < 12; i++) {
        let pulse = Math.sin(Date.now() * 0.006 + i * 1.7);
        if (pulse > 0.6) {
            let color = (i % 2 === 0) ? '#ff00ff' : '#00ffff';
            ctx.fillStyle = color;
            ctx.globalAlpha = Math.min(1.0, (pulse - 0.6) * 3.0);
            let bx = Math.floor((i * 213 + px * 0.7) % (canvas.width + 200)) - 100;
            let by = Math.floor((i * 77 + py * 0.3) % (canvas.height + 200)) - 100;
            let bw = (i % 4 === 0) ? 64 : 24;
            let bh = (i % 4 === 0) ? 16 : 24;
            ctx.fillRect(bx, by, bw, bh);
        }
    }
    ctx.globalAlpha = 1.0;
    // Layer 3: Macro-Block Displacement (The Screen Tear)
    if (Math.random() > 0.985) {
        const sourceX = Math.floor(Math.random() * (canvas.width - 200));
        const sourceY = Math.floor(Math.random() * (canvas.height - 100));
        const w = 200 + Math.floor(Math.random() * 200);
        const h = 50 + Math.floor(Math.random() * 100);
        const offset = (Math.random() > 0.5 ? 30 : -30);
        ctx.drawImage(ctx.canvas, sourceX, sourceY, w, h, Math.floor(sourceX + offset), Math.floor(sourceY + offset), w, h);
    }
    // DYNAMIC STATUS LABEL
    const time = Date.now();
    const cycle = (time / 12000) % 1;
    const isBossDefeated = G.currentLevel === 79 && G.boss && !G.boss.active && G.boss.hp <= 0;
    let statusText = isBossDefeated ? "OFFLINE" : "ONLINE";
    let statusColor = isBossDefeated ? "#ff00ff" : "#00ffff";
    let textX = canvas.width / 2;
    let textY = 100;
    const isGlitching = !isBossDefeated && cycle > 0.80;
    if (isGlitching) {
        const flicker = Math.sin(time * 0.01) > 0;
        statusText = flicker ? "OFFLINE" : "ONLINE";
        statusColor = flicker ? "#ff00ff" : "#ffffff";
        textX += (Math.random() - 0.5) * 2;
        textY += (Math.random() - 0.5) * 2;
    }
    ctx.fillStyle = statusColor;
    ctx.font = "20px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(`VIRTUAL SYSTEM ${statusText}`, textX, textY);
    ctx.textAlign = "left";
    ctx.restore();
}
