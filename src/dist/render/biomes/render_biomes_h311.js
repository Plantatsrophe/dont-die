import { canvas, ctx } from '../../core/globals.js';
/**
 * H311 Core: Hellish red glow and shifting heavy metal plates.
 * @param px Camera parallax offset
 */
export function drawH311Parallax(px) {
    // Random screen flicker for tension
    if (Math.random() > 0.95) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // The "Sun" / Heat Core (Deeper Blood Red)
    let mX = (canvas.width * 0.75 - px) % (canvas.width + 400);
    if (mX < -250)
        mX += canvas.width + 600;
    ctx.fillStyle = '#b50202';
    ctx.beginPath();
    ctx.arc(mX, 180, 120, 0, Math.PI * 2);
    ctx.fill();
    // Wispy Smog Plumes (Scattered arrangement in top half)
    ctx.fillStyle = 'rgba(10, 0, 0, 0.45)';
    for (let i = 0; i < 8; i++) {
        const drift = (Date.now() / 15) % canvas.width;
        // Pseudo-random scattering using prime-based offsets
        const seedX = (i * 373.13) % 1;
        const seedY = (i * 927.42) % 1;
        // Horizontal spacing with jitter
        let cX = ((i * 300 + seedX * 200) - px * 12 - drift) % (canvas.width + 600);
        if (cX < -400)
            cX += canvas.width + 1000;
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
export function drawH311Midground(px) {
    ctx.fillStyle = 'rgba(5, 0, 0, 0.95)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(10, 0, 0, 0.5)';
    for (let i = 0; i < 4; i++) {
        const seed = (i * 723.11) % 1;
        const spacing = 600;
        let cX = ((i * spacing + seed * 300) - px) % (canvas.width + 800);
        if (cX < -400)
            cX += canvas.width + 1200;
        // Draw a Monolithic Spire (Jagged jagged pillar)
        const sW = 60 + seed * 80;
        const sH = 200 + seed * 300;
        ctx.beginPath();
        ctx.moveTo(cX, canvas.height);
        ctx.lineTo(cX + sW / 2, canvas.height - sH);
        ctx.lineTo(cX + sW, canvas.height);
        ctx.fill();
        // Draw a Sky-Chain (Colossal twisted chain)
        const chainX = cX + spacing / 2;
        const chainW = 20;
        const chainH = 300 + seed * 200;
        ctx.beginPath();
        // Slightly curved vertical line
        ctx.moveTo(chainX, 0);
        ctx.bezierCurveTo(chainX + 20, 100, chainX - 20, 200, chainX, chainH);
        ctx.lineWidth = chainW;
        ctx.strokeStyle = 'rgba(5, 0, 0, 0.95)';
        ctx.stroke();
        // Chain "cap" / jagged break
        ctx.beginPath();
        ctx.arc(chainX, chainH, 15, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
}
