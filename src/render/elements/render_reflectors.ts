import { G, ctx } from '../../core/globals.js';
import { drawGlow } from '../utils/render_utils.js';

/**
 * Renders the mirror/reflector nodes used in the Level 79 (Glitch) boss fight.
 */
export function renderReflectors() {
    for (let r of G.reflectors) {
        if (!r.active) continue;
        
        ctx.save();
        if (r.isUsable) {
            // ACTIVE STATE: High-intensity cyan glow
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, r.x + r.width/2, r.y + r.height/2, r.width + 10, 'rgba(0, 255, 255, 0.4)');
            
            ctx.beginPath();
            ctx.moveTo(r.x + r.width / 2, r.y);
            ctx.lineTo(r.x + r.width, r.y + r.height / 2);
            ctx.lineTo(r.x + r.width / 2, r.y + r.height);
            ctx.lineTo(r.x, r.y + r.height / 2);
            ctx.closePath();
            
            ctx.fillStyle = 'rgba(0, 150, 255, 0.3)'; ctx.fill();
            ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2; ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(r.x + r.width / 2, r.y + 6);
            ctx.lineTo(r.x + r.width - 6, r.y + r.height / 2);
            ctx.lineTo(r.x + r.width / 2, r.y + r.height - 6);
            ctx.lineTo(r.x + 6, r.y + r.height / 2);
            ctx.closePath();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
        } else {
            // POWERED DOWN STATE
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(r.x + r.width / 2, r.y);
            ctx.lineTo(r.x + r.width, r.y + r.height / 2);
            ctx.lineTo(r.x + r.width / 2, r.y + r.height);
            ctx.lineTo(r.x, r.y + r.height / 2);
            ctx.closePath();
            ctx.strokeStyle = '#888888'; ctx.lineWidth = 1; ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(r.x + 10, r.y + r.height / 2);
            ctx.lineTo(r.x + r.width - 10, r.y + r.height / 2);
            ctx.moveTo(r.x + r.width / 2, r.y + 10);
            ctx.lineTo(r.x + r.width / 2, r.y + r.height - 10);
            ctx.stroke();
        }
        ctx.restore();
    }
}
