import { canvas, ctx, offscreenParallaxCanvas, offscreenParallaxCtx } from '../../core/globals.js';

/**
 * H311 Core: Hellish red glow and shifting heavy metal plates.
 * @param px Camera parallax offset
 */
export function drawH311Parallax(px: number) {
    // Random heat shimmer / screen flicker (Lowered frequency per user request)
    if (Math.random() > 0.995) { ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    
    // The "Sun" / Heat Core (Deeper Blood Red)
    let mX = (canvas.width * 0.75 - px) % (canvas.width + 400);
    if (mX < -250) mX += canvas.width + 600;
    ctx.fillStyle = '#b50202'; ctx.beginPath(); ctx.arc(mX, 180, 120, 0, Math.PI * 2); ctx.fill();
    
    // Wispy Smog Plumes (Scattered arrangement in top half)
    ctx.fillStyle = 'rgba(10, 0, 0, 0.45)';
    for (let i = 0; i < 8; i++) {
        const drift = (Date.now() / 15) % canvas.width;
        
        // Pseudo-random scattering using prime-based offsets
        const seedX = (i * 373.13) % 1;
        const seedY = (i * 927.42) % 1;
        
        // Horizontal spacing with jitter
        let cX = ((i * 300 + seedX * 200) - px * 12 - drift) % (canvas.width + 600);
        if (cX < -400) cX += canvas.width + 1000;
        
        // Vertical positioning (Strictly above the sun/moon bottom)
        // Restricted to a tight upper-band (40px to 250px)
        const cY = 40 + (seedY * 210);
        
        const widthBase = 80 + (i % 3) * 60;
        const heightBase = 12 + (i % 2) * 8;

        // Draw stretched "wisp" (No tilt)
        ctx.beginPath();
        ctx.ellipse(cX, cY, widthBase, heightBase, 0, 0, Math.PI * 2);
        ctx.ellipse(cX + widthBase * 0.4, cY + 8, widthBase * 0.7, heightBase * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Mid-ground silhouettes: Colossal spires and sky-chains.
 * @param px Camera parallax offset (typically ~0.15x)
 */
export function drawH311Midground(px: number) {
    const drawColor = 'rgba(5, 0, 0, 0.95)';
    
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(10, 0, 0, 0.5)';

    for (let i = 0; i < 6; i++) {
        const seed = (i * 723.11) % 1;
        const spacing = 1200; 
        const totalWidth = 6 * spacing; 
        
        // Robust wrap for negative numbers (Double Modulo)
        let baseX = (((i * spacing - px) % totalWidth) + totalWidth) % totalWidth;
        
        // Offset so 0 becomes visible as it enters from the right
        // We want 0-spacing as the display range
        if (baseX > canvas.width + 600) baseX -= totalWidth;

        // Position within this slot
        const cX = baseX + (seed * (spacing * 0.3));

        // --- STAGGER: Alternating content to prevent clustering ---
        if (i % 2 === 0) {
            // 1. DRAW AGGRESSIVE ROBOTIC SKULL
            const sW = 120 + seed * 60;
            const sH = 110 + seed * 40;
            const skullY = canvas.height - sH - 70;

            // Sample sky color for features
            const skyRatio = (skullY + sH / 2) / canvas.height;
            const skyRed = Math.floor(10 + skyRatio * 171); 
            const skyColor = `rgb(${skyRed}, 0, 0)`;

            ctx.save();
            ctx.translate(cX, skullY);
            ctx.fillStyle = drawColor;

            // Cranium (Hex-Hull)
            ctx.beginPath();
            const topW = sW * 0.7;
            ctx.moveTo((sW - topW) / 2, 0); ctx.lineTo((sW + topW) / 2, 0); ctx.lineTo(sW, sH * 0.4); ctx.lineTo(sW * 0.9, sH); ctx.lineTo(sW * 0.1, sH); ctx.lineTo(0, sH * 0.4); ctx.closePath();
            ctx.fill();

            // Symmetrical Bezier Horns
            ctx.beginPath();
            ctx.moveTo(sW * 0.1, 20); ctx.bezierCurveTo(-60 - seed * 50, -20, -80, -120 - seed * 60, -30, -180 - seed * 100); ctx.bezierCurveTo(-40, -100, -20, -50, sW * 0.25, 10); ctx.closePath();
            ctx.moveTo(sW * 0.9, 20); ctx.bezierCurveTo(sW + 60 + seed * 50, -20, sW + 80, -120 - seed * 60, sW + 30, -180 - seed * 100); ctx.bezierCurveTo(sW + 40, -100, sW + 20, -50, sW * 0.75, 10); ctx.closePath();
            ctx.fill();

            // Industrial Jaw
            ctx.beginPath(); ctx.rect(sW * 0.15, sH, sW * 0.7, 50); ctx.fill();

            // Face Detailing (Gaps)
            ctx.fillStyle = skyColor; ctx.shadowBlur = 0;
            ctx.beginPath();
            const eyeW = 25; const eyeH = 15;
            ctx.moveTo(sW * 0.2, sH * 0.4); ctx.lineTo(sW * 0.2 + eyeW, sH * 0.4 + eyeH); ctx.lineTo(sW * 0.2 + eyeW, sH * 0.4); ctx.closePath();
            ctx.moveTo(sW * 0.8, sH * 0.4); ctx.lineTo(sW * 0.8 - eyeW, sH * 0.4 + eyeH); ctx.lineTo(sW * 0.8 - eyeW, sH * 0.4); ctx.closePath();
            ctx.fill();
            for (let j = 0; j < 3; j++) ctx.fillRect(sW * 0.25, sH + 10 + j * 12, sW * 0.5, 5);
            ctx.restore();

            // Sky-Chain
            const chainX = cX + sW / 2;
            ctx.beginPath(); ctx.moveTo(chainX, 0); ctx.bezierCurveTo(chainX + 15, 60, chainX - 15, 160, chainX, 250 + seed * 150); ctx.lineWidth = 25; ctx.strokeStyle = drawColor; ctx.stroke();
            ctx.beginPath(); ctx.arc(chainX, 250 + seed * 150, 18, 0, Math.PI * 2); ctx.fillStyle = drawColor; ctx.fill();
        } else {
            // 2. DRAW MECHANICAL OBELISK
            const obW = 50 + seed * 40;
            const obH = 350 + seed * 250;
            const obY = canvas.height - obH;
            
            // Sample sky color for panel gaps
            const skyRatio = (obY + obH / 2) / canvas.height;
            const skyRed = Math.floor(10 + skyRatio * 171); 
            const skyColor = `rgb(${skyRed}, 0, 0)`;

            ctx.save();
            ctx.fillStyle = drawColor;
            ctx.beginPath();
            ctx.moveTo(cX, canvas.height); ctx.lineTo(cX + obW * 0.2, obY + obH * 0.1); ctx.lineTo(cX + obW * 0.8, obY + obH * 0.1); ctx.lineTo(cX + obW, canvas.height);
            ctx.moveTo(cX + obW * 0.2, obY + obH * 0.1); ctx.lineTo(cX + obW * 0.5, obY); ctx.lineTo(cX + obW * 0.8, obY + obH * 0.1);
            ctx.fill();
            
            // Mechanical Details
            ctx.fillStyle = skyColor; ctx.shadowBlur = 0;
            for (let k = 1; k < 6; k++) {
                const gapY = obY + (obH * 0.15 * k);
                if (gapY < canvas.height - 30) ctx.fillRect(cX + obW * 0.2, gapY, obW * 0.6, 4);
            }
            ctx.restore();
        }
    }
    
    ctx.restore();
    ctx.lineWidth = 1;
}
