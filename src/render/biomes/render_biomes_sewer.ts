import { G, canvas, ctx } from '../../core/globals.js';

/**
 * Sewer: Wet, brick-patterned tunnels with toxic drips and dynamic pipe-cleaning state.
 * @param px Camera parallax offset
 * @param hpRatio Current player health for color-shifting toxic drips
 */
export function drawSewerParallax(px: number, hpRatio: number) {
    // 1. Distant Brick Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
    for (let r = 0; r < canvas.height / 20 + 2; r++) {
        let ry = r * 20;
        ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(canvas.width, ry); ctx.stroke();
        let shift = (r % 2 === 0) ? 0 : 20;
        for (let c = -1; c < canvas.width / 40 + 2; c++) {
            let bx = (c * 40 + shift - (G.camera.x * 0.1) % 40);
            ctx.beginPath(); ctx.moveTo(bx, ry); ctx.lineTo(bx, ry + 20); ctx.stroke();
        }
    }

    // 2. Large Tunnel Arches
    for (let a = 0; a < 4; a++) {
        let ax = ((a * 400) - px * 0.5) % (canvas.width + 400);
        if (ax < -400) ax += canvas.width + 800;
        ctx.fillStyle = '#010401';
        ctx.beginPath(); ctx.ellipse(ax + 200, canvas.height, 180, 250, 0, Math.PI, Math.PI * 2); ctx.fill();
        let grad = ctx.createRadialGradient(ax+200, canvas.height, 50, ax+200, canvas.height, 200);
        grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grad; ctx.fill();
    }

    // 3. Fast Foreground Toxic Drips
    for(let j = 0; j < 8; j++) {
        let hX = ((j * 150) - px * 1.5) % (canvas.width + 100);
        if (hX < -100) hX += canvas.width + 200;
        let hDripY = 40 + ((Date.now() / (12 + (j%3)*4)) % (canvas.height - 80));
        ctx.fillStyle = hpRatio > 0.5 ? '#3ee855' : (hpRatio > 0.1 ? '#3eb5e8' : '#00bbff'); 
        ctx.fillRect(hX, hDripY, 3, 15 + (j%2)*5);
    }

    // 4. Vertical Drainage Pipes with Dynamic "Cleaning" visual logic
    for(let i = 0; i < 6; i++) {
        let x = ((i * 200) - px) % (canvas.width + 200);
        if(x < -200) x += canvas.width + 400;
        
        // Base pipe geometry
        ctx.fillStyle = '#2a140b'; ctx.fillRect(x, 0, 40, canvas.height); 
        ctx.fillStyle = '#3a1f11'; ctx.fillRect(x + 10, 0, 20, canvas.height); 
        ctx.fillStyle = '#4d2a1a'; ctx.fillRect(x + 15, 0, 5, canvas.height);  
        ctx.fillStyle = '#1c0e07'; ctx.fillRect(x + 30, 0, 10, canvas.height); 

        // Concrete support brackets
        ctx.fillStyle = '#2a140b';
        for (let cp = 0; cp < 3; cp++) {
            let cpy = 100 + cp * 180;
            ctx.fillRect(x - 4, cpy, 48, 12);
            ctx.fillStyle = '#4d2a1a'; ctx.fillRect(x - 4, cpy + 2, 48, 3);
            ctx.fillStyle = '#2a140b';
        }

        const mColors = ['#1b5c21', '#1e5014', '#3ee855'];
        let currentV = G.purifiedValves.length - 1;
        
        // Tracking: Detect pipe purification triggered by the Septicus cutscene
        if (G.gameState === 'VALVE_CUTSCENE' && x > -50 && x < canvas.width + 50) {
            if (!G.cleanedPipes.some((p:any) => p.id === i)) G.cleanedPipes.push({ id: i, vIdx: currentV });
        }

        let mAlpha = 1.0;
        let pRecord = G.cleanedPipes.find((p: any) => p.id === i);
        if (pRecord) {
            if (pRecord.vIdx < currentV) mAlpha = 0; // Already cleaned
            else if (pRecord.vIdx === currentV && G.gameState === 'VALVE_CUTSCENE') {
                mAlpha = Math.max(0, 1.0 - (G.valveCutsceneTimer / 5.0)); // Fading out moss/grime
            } else mAlpha = 0;
        }

        // Moss and Drip particles on the pipes
        if (mAlpha > 0 && (i % 2 === 0 || i % 3 === 0)) {
            ctx.save(); ctx.globalAlpha = mAlpha;
            let my = (i % 2 === 0) ? 200 : 400;
            for (let m = 0; m < 6; m++) {
                ctx.fillStyle = mColors[m % 3];
                let mx = x + (m % 2 === 0 ? -5 : 25) + Math.sin(m) * 5;
                let mry = my + (m * 4);
                let mSize = 6 + (m % 3) * 4;
                ctx.beginPath(); ctx.arc(mx, mry, mSize, 0, Math.PI * 2); ctx.fill();
                if (m === 2 || m === 4) { // Active drip animation
                    ctx.fillStyle = 'rgba(62, 232, 85, 0.4)';
                    ctx.fillRect(mx - 1, mry, 2, 20 + Math.sin(Date.now()*0.002 + m)*10);
                }
            }
            ctx.restore();
        }

        // General ambient pipe drips
        let dripY = 120 + (i%3)*50 + ((Date.now() / (10 + (i%2)*5)) % (canvas.height - 150));
        ctx.fillStyle = hpRatio > 0.5 ? '#3ee855' : (hpRatio > 0.1 ? '#3eb5e8' : '#00bbff'); 
        ctx.fillRect(x + 18, dripY, 3, 10 + (i%4)*5);
    }
    
    // Bottom fog/fluid layer
    ctx.fillStyle = hpRatio > 0.5 ? '#07170a' : (hpRatio > 0.1 ? '#071217' : '#040b1a');
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}
