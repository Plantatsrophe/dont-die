import { G, canvas, ctx } from '../../core/globals.js';
/**
 * Renders the dynamic Virtual-biome hazards (Sectors and Nodes).
 * Applies magenta neon effects with additive blending.
 */
export function renderVirtualHazards() {
    if (Math.floor(G.currentLevel / 20) % 5 !== 3)
        return;
    const { corruptedSectors, malwareNodes, camera } = G;
    // 1. Corrupted Memory Sectors
    for (let s of corruptedSectors) {
        // Culling: Skip if far outside camera view
        if (s.x + s.width < camera.x || s.x > camera.x + canvas.width || s.y + s.height < camera.y || s.y > camera.y + canvas.height)
            continue;
        ctx.save();
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        if (s.isActive) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff00ff';
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
            ctx.fillRect(s.x, s.y, s.width, s.height);
        }
        else {
            ctx.globalAlpha = 0.3;
        }
        ctx.strokeRect(s.x + 2, s.y + 2, s.width - 4, s.height - 4);
        ctx.beginPath();
        ctx.moveTo(s.x + 4, s.y + 4);
        ctx.lineTo(s.x + s.width - 4, s.y + s.height - 4);
        ctx.moveTo(s.x + s.width - 4, s.y + 4);
        ctx.lineTo(s.x + 4, s.y + s.height - 4);
        ctx.stroke();
        ctx.restore();
    }
    // 2. Malware Nodes (Starbursts)
    for (let n of malwareNodes) {
        if (n.x + n.maxRadius < camera.x || n.x - n.maxRadius > camera.x + canvas.width || n.y + n.maxRadius < camera.y || n.y - n.maxRadius > camera.y + canvas.height)
            continue;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.strokeStyle = '#ff00ff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff00ff';
        ctx.globalCompositeOperation = 'lighter';
        let spikes = 8, rot = Date.now() * 0.004;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            let r = (i % 2 === 0) ? n.radius : n.radius * 0.4;
            let angle = (i / spikes) * Math.PI + rot;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.stroke();
        if (n.state === 'EXPANDING') {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.4)';
            ctx.fill();
        }
        ctx.restore();
    }
}
