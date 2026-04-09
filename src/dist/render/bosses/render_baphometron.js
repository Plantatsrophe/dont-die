import { G, ctx, TILE_SIZE } from '../../core/globals.js';
/**
 * Main entry point for Baphometron visual execution.
 * Called by render_bosses.ts.
 */
export function drawBaphometron() {
    const controller = G.baphometronController;
    if (!controller)
        return;
    // --- PHASE 1: TELEGRAPHS (Back Layer) ---
    renderBaphometronTelegraphs(controller);
    // --- PHASE 2: PHYSICAL HAZARDS (Fists, Kicks, Spikes) ---
    renderBaphometronLimbs(controller);
    renderBaphometronSpikes(controller);
    // --- PHASE 3: SCRIPTED EVENTS (Laser & Head) ---
    renderBaphometronHead(controller);
    renderBaphometronLaser(controller);
}
/**
 * Draws the translucent warning pillars/lines before hazards spawn.
 */
function renderBaphometronTelegraphs(controller) {
    const spikes = controller.getSpikes();
    const limbs = controller.getLimbs();
    ctx.save();
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    // Spike Telegraphs
    spikes.forEach(s => {
        if (s.active && s.state === 'falling' && s.timer > 0) {
            // Stronger opacity as timer nears zero
            const alpha = 0.2 + (1.5 - s.timer) / 1.5 * 0.4;
            ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.strokeRect(s.x, 0, s.width, (G.mapRows - 1) * TILE_SIZE);
            // Central beam
            ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.5})`;
            ctx.fillRect(s.x + s.width / 2 - 2, 0, 4, (G.mapRows - 1) * TILE_SIZE);
        }
    });
    // --- SOLUTION C: FIST DESCENT SHADOW ---
    limbs.forEach(limb => {
        if (limb.active && limb.type === 'fist' && limb.state === 'telegraph') {
            const progress = (1.5 - limb.timer) / 1.5; // 0.0 to 1.0
            const descentY = -400 + (progress * 550); // From off-screen to primed position
            const alpha = 0.3 + progress * 0.3;
            const pulse = 0.8 + Math.sin(Date.now() / 100) * 0.2;
            const jitter = (Math.random() - 0.5) * 5 * progress;
            ctx.save();
            ctx.setLineDash([]); // Solid lines for HUD
            // 1. High-Contrast Rim Glow
            ctx.shadowBlur = 15 + (progress * 20);
            ctx.shadowColor = '#ff6600';
            ctx.strokeStyle = `rgba(255, 100, 0, ${pulse})`;
            ctx.lineWidth = 3;
            // 2. The Ghost Fist (Stroke Only for Transparency)
            ctx.strokeRect(limb.x + jitter, descentY, limb.width, limb.height);
            // 3. HUD Corner Brackets
            const bSize = 20;
            ctx.strokeStyle = `rgba(255, 200, 0, ${pulse})`;
            ctx.lineWidth = 4;
            // Top Left
            ctx.beginPath();
            ctx.moveTo(limb.x - 10, descentY + bSize);
            ctx.lineTo(limb.x - 10, descentY - 10);
            ctx.lineTo(limb.x + bSize, descentY - 10);
            ctx.stroke();
            // Top Right
            ctx.beginPath();
            ctx.moveTo(limb.x + limb.width + 10 - bSize, descentY - 10);
            ctx.lineTo(limb.x + limb.width + 10, descentY - 10);
            ctx.lineTo(limb.x + limb.width + 10, descentY + bSize);
            ctx.stroke();
            // Bottom Right
            ctx.beginPath();
            ctx.moveTo(limb.x + limb.width + 10, descentY + limb.height + 10 - bSize);
            ctx.lineTo(limb.x + limb.width + 10, descentY + limb.height + 10);
            ctx.lineTo(limb.x + limb.width + 10 - bSize, descentY + limb.height + 10);
            ctx.stroke();
            // Bottom Left
            ctx.beginPath();
            ctx.moveTo(limb.x - 10 + bSize, descentY + limb.height + 10);
            ctx.lineTo(limb.x - 10, descentY + limb.height + 10);
            ctx.lineTo(limb.x - 10, descentY + limb.height + 10 - bSize);
            ctx.stroke();
            // 4. Central Horizontal Targeting Line (Expanding)
            const lineWidth = (limb.width + 40) * progress;
            ctx.lineWidth = 1;
            ctx.strokeRect(limb.x + limb.width / 2 - lineWidth / 2, descentY + limb.height / 2, lineWidth, 1);
            ctx.restore();
        }
    });
    ctx.restore();
}
/**
 * Draws the physical limbs (Fists and Kicks).
 */
function renderBaphometronLimbs(controller) {
    const limbs = controller.getLimbs();
    limbs.forEach(limb => {
        if (!limb.active || limb.state === 'telegraph')
            return;
        ctx.save();
        // Base metallic color
        ctx.fillStyle = '#333333';
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 4;
        if (limb.type === 'fist') {
            // Draw a heavy, notched block for the fist
            ctx.fillRect(limb.x, limb.y, limb.width, limb.height);
            ctx.strokeRect(limb.x, limb.y, limb.width, limb.height);
            // Glowing knuckles/runes
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(limb.x + 10, limb.y + limb.height - 30, 10, 10);
            ctx.fillRect(limb.x + 35, limb.y + limb.height - 30, 10, 10);
            ctx.fillRect(limb.x + 60, limb.y + limb.height - 30, 10, 10);
        }
        else {
            // Draw the Sweep Kick (horizontal pillar)
            ctx.fillRect(limb.x, limb.y, limb.width, limb.height);
            ctx.strokeRect(limb.x, limb.y, limb.width, limb.height);
            // Friction/Heat glow on the bottom edge
            ctx.fillStyle = '#ffaa00';
            ctx.globalAlpha = 0.6 + Math.random() * 0.4;
            ctx.fillRect(limb.x, limb.y + limb.height - 5, limb.width, 5);
        }
        ctx.restore();
    });
}
/**
 * Draws the Sky Spikes with metallic texture and orange runes.
 */
function renderBaphometronSpikes(controller) {
    const spikes = controller.getSpikes();
    spikes.forEach(s => {
        if (!s.active || s.state === 'inactive')
            return;
        ctx.save();
        // Shattering effect (scaling/alpha)
        if (s.state === 'shattering') {
            ctx.globalAlpha = s.timer / 0.3;
            const scale = 1 + (0.3 - s.timer) * 2;
            ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(s.x + s.width / 2), -(s.y + s.height / 2));
        }
        // 1. Spike Body (Dark Grey)
        ctx.fillStyle = '#222222';
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.fillRect(s.x, s.y, s.width, s.height);
        ctx.strokeRect(s.x, s.y, s.width, s.height);
        // 2. Glowing Runes
        if (s.state !== 'shattering') {
            const pulse = 0.7 + Math.sin(Date.now() / 200) * 0.3;
            ctx.fillStyle = `rgba(255, 100, 0, ${pulse})`;
            ctx.fillRect(s.x + 15, s.y + 20, 10, 10);
            ctx.fillRect(s.x + 15, s.y + 50, 10, 10);
            ctx.fillRect(s.x + 15, s.y + 80, 10, 10);
        }
        // 3. Top Surface Highlight (Better visibility for platforms)
        if (s.state === 'stuck') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(s.x, s.y, s.width, 10);
        }
        ctx.restore();
    });
}
/**
 * Draws the high-intensity plasma laser during scripted transitions.
 */
function renderBaphometronLaser(controller) {
    if (!controller.isExecutingLaser)
        return;
    // Use the controller's internal timer to animate the lifecycle (3.5s total)
    const t = controller.getScriptedTimer();
    // Stage calculation (Total 5.0s)
    // 5.0 -> 3.5: Arrival (Head Deploying)
    // 3.5 -> 2.0: Charge
    // 2.0 -> 0.0: Blast
    if (t > 3.5)
        return; // Wait for head to arrive before starting laser visuals
    ctx.save();
    const arenaX = 800;
    const arenaWidth = 800;
    const centerX = arenaX + arenaWidth / 2;
    const groundY = (G.mapRows - 1) * TILE_SIZE;
    // --- STAGE 1: THE CHARGE (3.5 >= t > 2.0) ---
    if (t > 2.0) {
        const chargeFactor = (3.5 - t) / 1.5; // 0 to 1 over charge duration
        const glowSize = 10 + chargeFactor * 50;
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = '#ff4400';
        ctx.fillStyle = `rgba(255, 255, 255, ${chargeFactor * 0.8})`;
        // Central Core Glow (Matches Head Beacon Position - Head is now stationary)
        const progress = 1.0;
        const sourceY = -250 + progress * 460 - 20;
        // Spiraling charge particles (converging on head beacon)
        for (let i = 0; i < 12; i++) {
            const angle = (Date.now() / 150) + (i * Math.PI / 6);
            const dist = 400 * (1 - chargeFactor);
            ctx.beginPath();
            ctx.arc(centerX + Math.cos(angle) * dist, sourceY + Math.sin(angle) * dist, 4 + chargeFactor * 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(centerX, sourceY, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }
    // --- STAGE 2: THE BLAST (t <= 2.0) ---
    else {
        const blastFactor = Math.min(1.0, t / 2.0); // 1 to 0
        const jitter = (Math.random() - 0.5) * 30;
        const beamWidth = 350 * blastFactor;
        // Origin matches the Head Beacon position
        const progress = 1.0;
        const sourceY = -250 + progress * 460 - 20; // Corrected offset for beacon bulb
        // Massive Outer Glow
        ctx.shadowBlur = 120 * blastFactor;
        ctx.shadowColor = '#ff6600';
        ctx.fillStyle = `rgba(255, 120, 0, ${blastFactor * 0.9})`;
        ctx.fillRect(centerX - beamWidth / 2 + jitter, sourceY, beamWidth, groundY - sourceY);
        // Core Plasma Pillar
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = `rgba(255, 255, 255, ${blastFactor})`;
        ctx.fillRect(centerX - (beamWidth * 0.3) / 2 + jitter, sourceY, beamWidth * 0.3, groundY - sourceY);
        // Ground Impact Sparks (bursting outward)
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = '#ffff00';
            const sX = centerX + (Math.random() - 0.5) * beamWidth * 1.5;
            const sY = groundY - Math.random() * 80;
            ctx.fillRect(sX, sY, 3, 3);
        }
    }
    ctx.restore();
}
/**
 * Draws the massive Baphometron Head based on the user's prototype reference.
 * Only appears during scripted laser events.
 */
function renderBaphometronHead(controller) {
    if (!controller.isExecutingLaser)
        return;
    const t = controller.getScriptedTimer();
    const progress = Math.min(1.0, (5.0 - t) / 1.5); // 0 to 1 over first 1.5s (T: 5.0 -> 3.5)
    const headY = -250 + progress * 460; // Descend from ceiling to center (Y:210)
    const arenaX = 800;
    const arenaWidth = 800;
    const centerX = arenaX + arenaWidth / 2;
    ctx.save();
    ctx.translate(centerX, headY);
    // 1. HORNS (Red translucent glow)
    ctx.fillStyle = '#ff2400';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4400';
    // Left Horn
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-120, -120);
    ctx.lineTo(-60, -120);
    ctx.lineTo(-40, 0);
    ctx.fill();
    // Right Horn
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(120, -120);
    ctx.lineTo(60, -120);
    ctx.lineTo(40, 0);
    ctx.fill();
    // 2. BEACON (Blue Glass Bulb)
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(0, -20, 30, 0, Math.PI * 2);
    ctx.fill();
    // Inner white glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-10, -30, 8, 0, Math.PI * 2);
    ctx.fill();
    // 3. MAIN HEAD BLOCK
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 4;
    ctx.fillRect(-100, 0, 200, 180);
    ctx.strokeRect(-100, 0, 200, 180);
    // 4. EYES (Red Circular Lenses)
    const eyePulse = 0.8 + Math.sin(Date.now() / 150) * 0.2;
    ctx.shadowBlur = 20 * eyePulse;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = `rgba(255, 60, 0, ${eyePulse})`;
    // Left Eye
    ctx.beginPath();
    ctx.arc(-45, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    // Right Eye
    ctx.beginPath();
    ctx.arc(45, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    // 5. WHITE STAR (Forehead)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    drawStar(ctx, 0, 40, 5, 20, 10);
    // 6. JAGGED MOUTH
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-60, 140);
    ctx.lineTo(-30, 160);
    ctx.lineTo(0, 140);
    ctx.lineTo(30, 160);
    ctx.lineTo(60, 140);
    ctx.stroke();
    ctx.restore();
}
/**
 * Helper to draw a star polygon.
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}
