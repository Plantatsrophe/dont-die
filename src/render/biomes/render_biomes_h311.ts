import { G, TILE_SIZE, canvas, ctx, offscreenParallaxCanvas, offscreenParallaxCtx } from '../../core/globals.js';

/**
 * H311 Core: Hellish red glow and shifting heavy metal plates.
 * @param px Camera parallax offset
 */
export function drawH311Parallax(px: number) {
    // Random heat shimmer / screen flicker (Lowered frequency per user request)
    if (Math.random() > 0.995) { ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    
    // THE CELESTIAL HEAT CORE (3D Spherical Shading)
    let mX = (canvas.width * 0.75 - px) % (canvas.width + 400);
    if (mX < -250) mX += canvas.width + 600;
    
    // Volumetric Shading (Offset highlight for 3D effect)
    const grad = ctx.createRadialGradient(mX - 35, 150, 10, mX, 180, 150);
    grad.addColorStop(0, '#ff5500');   // Incandescent Center
    grad.addColorStop(0.3, '#b50202'); // Core Blood Red
    grad.addColorStop(0.9, '#1a0000'); // Shadowed Perimeter
    grad.addColorStop(1, '#050000');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 50;
    ctx.shadowColor = '#b50202';
    ctx.beginPath();
    ctx.arc(mX, 180, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Surface Cracks & Plates (Spherical Curvature Distortion)
    ctx.fillStyle = 'rgba(5, 0, 0, 0.3)';
    for (let i = 0; i < 6; i++) {
        const sDir = (i * 60) * (Math.PI / 180);
        const sDist = 30 + (i * 12);
        const scX = mX + Math.cos(sDir) * sDist;
        const scY = 180 + Math.sin(sDir) * sDist;
        
        // Distortion: Flatten ellipses as they move toward the sphere's edge
        const edgeDist = sDist / 120;
        const widthMult = 1 - (edgeDist * 0.7);
        const heightMult = 1 - (edgeDist * 0.4);
        
        ctx.beginPath();
        ctx.ellipse(scX, scY, 14 * widthMult, 8 * heightMult, sDir + Math.PI/2, 0, Math.PI * 2);
        ctx.fill();
    }

    // BACKGROUND VOLCANO (Cinematic pulsing eruptor)
    drawVolcano(ctx, px);
    
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
 * Unified generation to prevent overlapping of massive robotic structures.
 * @param px Camera parallax offset (typically ~0.15x)
 */
export function drawH311Midground(px: number) {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(10, 0, 0, 0.5)';

    // Unified Staggered Layout (Tighter spacing for higher density)
    const UNIFIED_SPACING = 200; 
    
    // --- LEVEL CLIMAX CALCULATIONS ---
    // Calculate where the level ends in parallax-space (0.15x multiplier)
    const parallaxEnd = (G.mapCols * TILE_SIZE) * 0.15;
    const maxSlot = Math.floor(parallaxEnd / UNIFIED_SPACING);

    const start = Math.floor(px / UNIFIED_SPACING) - 2;
    const end = Math.floor((px + canvas.width) / UNIFIED_SPACING) + 2;

    for (let i = start; i <= end; i++) {
        // Boundary: Stop generating after the level end
        if (i < 0 || i > maxSlot) continue;

        // Climax Override: The very last slot is ALWAYS a Primary Skull
        const isClimax = (i === maxSlot);

        // Deterministic pseudo-randomness for this slot
        const seed = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
        
        // 1. Skip logic (Lowered to 10% to increase overall density)
        // Never skip the climax skull
        if (!isClimax && seed < 0.1) continue;

        // 2. Depth / Color Logic (Randomly assign to Primary or Secondary layer)
        // Climax skull is always Primary depth
        const depthSeed = Math.abs((Math.sin((i + 777) * 12.9898) * 43758.5453) % 1);
        const isSecondary = isClimax ? false : (depthSeed < 0.4);
        const drawColor = isSecondary ? 'rgba(3, 0, 0, 0.9)' : 'rgba(5, 0, 0, 0.95)';
        
        // 3. Horizontal Jitter (Within slot boundaries to prevent overlap)
        // Climax Skull is anchored exactly to the parallax end (edge of the world)
        const jitter = isClimax ? 0 : ((seed - 0.5) * 60); 
        const cX = isClimax ? (parallaxEnd - px) : (i * UNIFIED_SPACING - px + jitter);

        // 4. Content Selection (Weighted: prioritized Skulls and Spires)
        const typePool = [0, 1, 2, 0, 2];
        const typeIdx = isClimax ? 0 : typePool[Math.floor(seed * typePool.length)];

        drawLandmark(ctx, cX, seed, typeIdx, drawColor);
    }
    
    ctx.restore();
    ctx.lineWidth = 1;
}

/**
 * Shared helper for drawing the 3 types of landmarks.
 */
function drawLandmark(ctx: CanvasRenderingContext2D, cX: number, seed: number, typeIdx: number, color: string) {
    const skyColor = `rgb(100, 0, 0)`;
    ctx.fillStyle = color;

    if (typeIdx === 0) {
        // 1. DRAW AGGRESSIVE ROBOTIC SKULL
        const sW = 120 + seed * 60;
        const sH = 110 + seed * 40;
        // Unified Anchor: The chain ends exactly at the skull's top
        const anchorY = 300 + seed * 120; 
        
        ctx.save(); ctx.translate(cX, anchorY); ctx.fillStyle = color;
        ctx.beginPath(); const tW = sW * 0.7; ctx.moveTo((sW - tW) / 2, 0); ctx.lineTo((sW + tW) / 2, 0); ctx.lineTo(sW, sH * 0.4); ctx.lineTo(sW * 0.9, sH); ctx.lineTo(sW * 0.1, sH); ctx.lineTo(0, sH * 0.4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sW * 0.1, 20); ctx.bezierCurveTo(-60 - seed * 50, -20, -80, -120 - seed * 60, -30, -180 - seed * 100); ctx.bezierCurveTo(-40, -100, -20, -50, sW * 0.25, 10); ctx.closePath();
        ctx.moveTo(sW * 0.9, 20); ctx.bezierCurveTo(sW + 60 + seed * 50, -20, sW + 80, -120 - seed * 60, sW + 30, -180 - seed * 100); ctx.bezierCurveTo(sW + 40, -100, sW + 20, -50, sW * 0.75, 10); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.rect(sW * 0.15, sH, sW * 0.7, 50); ctx.fill();
        ctx.fillStyle = skyColor; ctx.shadowBlur = 0; ctx.beginPath(); // Face
        ctx.moveTo(sW * 0.2, sH * 0.4); ctx.lineTo(sW * 0.2 + 25, sH * 0.4 + 15); ctx.lineTo(sW * 0.2 + 25, sH * 0.4); ctx.closePath();
        ctx.moveTo(sW * 0.8, sH * 0.4); ctx.lineTo(sW * 0.8 - 25, sH * 0.4 + 15); ctx.lineTo(sW * 0.8 - 25, sH * 0.4); ctx.closePath(); ctx.fill();
        for (let j = 0; j < 3; j++) ctx.fillRect(sW * 0.25, sH + 10 + j * 12, sW * 0.5, 5);
        ctx.restore();

        // 2. SKY-CHAIN (Taut interlocking links, nested between horns)
        const chainX = cX + sW / 2;
        const cp1x = chainX + 4, cp1y = 80;   
        const cp2x = chainX - 4, cp2y = 200;
        const chainEndY = anchorY - 60; // Offset upwards to sit between horns
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3; 
        const numLinks = Math.ceil(chainEndY / 28);
        const tStep = 1 / numLinks;
        
        for (let t = 0; t <= 1; t += tStep) {
            const nt = 1 - t;
            const tx = nt * nt * nt * chainX + 3 * nt * nt * t * cp1x + 3 * nt * t * t * cp2x + t * t * t * chainX;
            const ty = nt * nt * nt * 0 + 3 * nt * nt * t * cp1y + 3 * nt * t * t * cp2y + t * t * t * chainEndY;
            
            ctx.beginPath();
            const stepIndex = Math.round(t * numLinks);
            if (stepIndex % 2 === 0) {
                ctx.ellipse(tx, ty, 10, 18, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(tx, ty, 4, 18, 0, 0, Math.PI * 2);
            }
            ctx.stroke();
        }

        // Joint Ball: Nested between the horns
        ctx.beginPath(); ctx.arc(chainX, chainEndY, 18, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    } else if (typeIdx === 1) {
        // 2. DRAW MECHANICAL OBELISK (Grounded monoliths, tops below moon center @ 180)
        const obW = 50 + seed * 40; 
        const obH = 240 + seed * 160; 
        const obY = canvas.height;
        ctx.save(); ctx.fillStyle = color; ctx.beginPath();
        ctx.moveTo(cX, obY); 
        ctx.lineTo(cX + obW * 0.2, obY - obH * 0.9); 
        ctx.lineTo(cX + obW * 0.8, obY - obH * 0.9); 
        ctx.lineTo(cX + obW, obY);
        ctx.moveTo(cX + obW * 0.2, obY - obH * 0.9); 
        ctx.lineTo(cX + obW * 0.5, obY - obH); 
        ctx.lineTo(cX + obW * 0.8, obY - obH * 0.9); 
        ctx.fill();
        ctx.fillStyle = skyColor; ctx.shadowBlur = 0;
        for (let k = 1; k < 6; k++) { const gapY = obY + (obH * 0.15 * k); if (gapY < canvas.height - 30) ctx.fillRect(cX + obW * 0.2, gapY, obW * 0.6, 4); }
        ctx.restore();
    } else {
        // 3. DRAW INDUSTRIAL SPIRE (Capped at 400px to stay below moon midline)
        const spW = 30 + seed * 20; const spH = 250 + seed * 150; const spY = canvas.height - spH;
        ctx.save(); ctx.fillStyle = color; ctx.beginPath();
        ctx.rect(cX, spY + spH * 0.1, spW, spH * 0.9);
        ctx.moveTo(cX, spY + spH * 0.1); ctx.lineTo(cX + spW / 2, spY); ctx.lineTo(cX + spW, spY + spH * 0.1);
        ctx.fill();
        ctx.fillStyle = skyColor; ctx.shadowBlur = 0;
        for (let k = 1; k < 12; k++) { const gY = spY + (spH * 0.08 * k); if (gY < canvas.height - 40) ctx.fillRect(cX + spW * 0.1, gY, spW * 0.8, 4); }
        ctx.restore();
    }
    
    ctx.restore();
    ctx.lineWidth = 1;
}

/**
 * Renders a massive background volcano with dynamic eruption pulses.
 */
function drawVolcano(ctx: CanvasRenderingContext2D, px: number) {
    // Parallax position (Slowest layer, same as moon)
    let vX = (canvas.width * 0.2 - px) % (canvas.width + 800);
    if (vX < -600) vX += canvas.width + 1200;
    
    const vBaseW = 700;
    const vH = 350;
    const vY = canvas.height;
    
    // Pulse calculation for violent eruptions
    const time = Date.now() / 800;
    const pulse = (Math.sin(time) + 1) / 2; // Smooth 0 to 1 oscillation
    const eruptionIntensity = Math.pow(pulse, 3); // Exponential for sudden peaks
    
    ctx.save();
    ctx.translate(vX, vY);
    
    // 1. BLACK SILHOUETTE
    ctx.fillStyle = '#0a0000';
    ctx.beginPath();
    ctx.moveTo(-vBaseW / 2, 0);
    ctx.lineTo(-80, -vH);
    ctx.lineTo(80, -vH);
    ctx.lineTo(vBaseW / 2, 0);
    ctx.closePath();
    ctx.fill();
    
    // 2. MAGMA RIVERS (Fluid, forking, and animated)
    const flowOffset = (Date.now() / 40) % 200;
    const magmaBaseColor = '#800000';
    const magmaCoreColor = `rgba(255, 120, 0, ${0.4 + eruptionIntensity * 0.6})`;

    const drawRiver = (startX: number, startY: number, segments: {cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number}[]) => {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Base Layer (Cooling edges)
        ctx.strokeStyle = magmaBaseColor;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        segments.forEach(s => ctx.bezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y));
        ctx.stroke();
        
        // Liquid Core (Molten flow)
        ctx.strokeStyle = magmaCoreColor;
        ctx.lineWidth = 5;
        ctx.setLineDash([30, 20, 50, 15]); // Segmented molten chunks
        ctx.lineDashOffset = -flowOffset;
        ctx.stroke();
        ctx.setLineDash([]);
    };

    // Main Left River (Connecting to rim overflow points)
    drawRiver(-75, -vH + 5, [
        { cp1x: -100, cp1y: -250, cp2x: -120, cp2y: -150, x: -160, y: -100 },
        { cp1x: -180, cp1y: -80, cp2x: -220, cp2y: -40, x: -300, y: 0 }
    ]);
    // Fork off Main Left
    drawRiver(-160, -100, [
        { cp1x: -140, cp1y: -80, cp2x: -100, cp2y: -40, x: -80, y: 0 }
    ]);

    // Main Right River (Connecting to rim overflow points)
    drawRiver(65, -vH + 8, [
        { cp1x: 100, cp1y: -200, cp2x: 120, cp2y: -150, x: 150, y: -80 },
        { cp1x: 180, cp1y: -40, cp2x: 220, cp2y: -20, x: 280, y: 0 }
    ]);
    // Small Center Trickle
    drawRiver(10, -vH + 11, [
        { cp1x: 0, cp1y: -100, cp2x: 25, cp2y: -50, x: 15, y: 0 }
    ]);

    // 3. LAVA POOL (Bubbling Rim & Overflow - Rendered ON TOP of rivers)
    const boil = Math.sin(Date.now() / 180) * 4;
    const poolIntensity = 0.7 + eruptionIntensity * 0.3;
    
    // Outer Glow
    ctx.shadowBlur = 30 * poolIntensity;
    ctx.shadowColor = '#ff6600';
    ctx.fillStyle = `rgba(255, 140, 0, ${poolIntensity})`;
    ctx.beginPath();
    ctx.ellipse(0, -vH, 80 + boil, 12 + (boil * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hot Core of the pool
    ctx.fillStyle = `rgba(255, 230, 150, ${poolIntensity})`;
    ctx.beginPath();
    ctx.ellipse(0, -vH + 2, 45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. PULSING ERUPTION PILLAR
    if (eruptionIntensity > 0.2) {
        ctx.shadowBlur = 60 * eruptionIntensity;
        ctx.shadowColor = '#ff2200';
        
        ctx.fillStyle = `rgba(255, 80, 0, ${eruptionIntensity * 0.8})`;
        ctx.beginPath();
        // Fire Pillar
        const pW = 55 * eruptionIntensity;
        const pH = 350 * eruptionIntensity;
        ctx.moveTo(-pW, -vH);
        ctx.bezierCurveTo(-pW * 2, -vH - pH * 0.5, pW * 2, -vH - pH * 0.5, pW, -vH);
        ctx.fill();
        
        // Inner Core Glow
        ctx.fillStyle = `rgba(255, 255, 255, ${eruptionIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(0, -vH - 5, 25 * eruptionIntensity, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
