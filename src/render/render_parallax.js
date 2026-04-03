import { G, canvas, ctx, TILE_SIZE } from '../core/globals.js';
import { sprGear } from '../assets/assets.js';
import { drawSprite } from './render_utils.js';

export function renderParallax() {
    const { currentLevel, camera } = G;
    const bId = Math.floor(currentLevel / 20) % 5;
    
    let boss = G.boss;
    let hpRatio = 1.0;
    if (currentLevel === 39) {
        if (!boss || !boss.active || boss.hp <= 0 || boss.isSinking) hpRatio = 0.0;
        else hpRatio = boss.hp / boss.maxHp;
    }

    // Sky Gradients
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (bId === 1) { // Acid
        let c1 = hpRatio > 0.5 ? '#0a1a0f' : (hpRatio > 0.1 ? '#0a161f' : '#0a0f1a');
        let c2 = hpRatio > 0.5 ? '#1b5c21' : (hpRatio > 0.1 ? '#1b4a5c' : '#1b3a5c');
        skyGradient.addColorStop(0, c1); skyGradient.addColorStop(1, c2);
    } else if (bId === 2) { // Shaft
        skyGradient.addColorStop(0, '#030014'); skyGradient.addColorStop(1, '#2c0c4a');
    } else if (bId === 3) { // Factory
        skyGradient.addColorStop(0, '#050f14'); skyGradient.addColorStop(1, '#1a4159');
    } else if (bId === 4) { // Goliath
        skyGradient.addColorStop(0, '#2b0202'); skyGradient.addColorStop(1, '#7a0505');
    } else { // Slums
        skyGradient.addColorStop(0, '#0a0a1a'); skyGradient.addColorStop(1, '#a34110');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Biome Specific Parallax Layers
    if (bId === 0) { // Slums
        let px = camera.x * 0.2;
        for (let i = 0; i < 30; i++) {
            let h = 80 + (Math.sin(i * 999) * 40);
            let w = 40 + (Math.cos(i * 777) * 20);
            let x = ((i * 60) - px) % (canvas.width + 100);
            if (x < -100) x += canvas.width + 200;
            ctx.fillStyle = '#05050f';
            ctx.fillRect(x, canvas.height - h, w, h);
            ctx.fillStyle = '#f1c40f';
            for (let wy = canvas.height - h + 10; wy < canvas.height - 10; wy += 15) {
                for (let wx = x + 5; wx < x + w - 5; wx += 10) {
                    if (Math.sin(i * wx * wy) > 0.5) ctx.fillRect(wx, wy, Math.sin(wx)>0?2:1, Math.sin(wy)>0?2:1);
                }
            }
        }
    } else if (bId === 1) { // Acid
        let px = camera.x * 0.3;
        ctx.fillStyle = '#2a140b'; ctx.fillRect(0, 0, canvas.width, 40);
        ctx.fillStyle = '#170a05'; ctx.fillRect(0, 30, canvas.width, 10);
        for(let j = 0; j < 8; j++) {
            let hX = ((j * 150) - px * 1.5) % (canvas.width + 100);
            if (hX < -100) hX += canvas.width + 200;
            let hDripY = 40 + ((Date.now() / (12 + (j%3)*4)) % (canvas.height - 80));
            ctx.fillStyle = hpRatio > 0.5 ? '#3ee855' : (hpRatio > 0.1 ? '#3eb5e8' : '#00bbff'); 
            ctx.fillRect(hX, hDripY, 3, 15 + (j%2)*5);
        }
        for(let i = 0; i < 6; i++) {
            let x = ((i * 200) - px) % (canvas.width + 200);
            if(x < -200) x += canvas.width + 400;
            ctx.fillStyle = '#3a1f11'; ctx.fillRect(x, 0, 40, canvas.height);
            ctx.fillStyle = '#1c0e07'; ctx.fillRect(x + 25, 0, 15, canvas.height);
            let dripY = 120 + (i%3)*50 + ((Date.now() / (10 + (i%2)*5)) % (canvas.height - 150));
            ctx.fillStyle = hpRatio > 0.5 ? '#3ee855' : (hpRatio > 0.1 ? '#3eb5e8' : '#00bbff'); 
            ctx.fillRect(x + 10, dripY, 3, 10 + (i%4)*5);
        }
        ctx.fillStyle = hpRatio > 0.5 ? '#07170a' : (hpRatio > 0.1 ? '#071217' : '#040b1a');
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    } else if (bId === 2) { // Shaft
        let py = camera.y * 0.4;
        ctx.strokeStyle = '#221333'; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = -10; i < 20; i++) {
            let offset = (i * 50 + py) % (canvas.height + 500);
            if (offset < -300) offset += canvas.height + 600;
            ctx.moveTo(0, offset); ctx.lineTo(canvas.width, offset + canvas.width);
            ctx.moveTo(canvas.width, offset); ctx.lineTo(0, offset + canvas.width);
        }
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
            let gy = (-py * 0.6 + i * 250) % (canvas.height + 150);
            if (gy < -150) gy += canvas.height + 300;
            let gx = 80 + (i * 140) % canvas.width;
            ctx.save(); ctx.translate(gx, gy); ctx.rotate(Date.now() / (800 + i*300));
            ctx.globalAlpha = 0.2; ctx.scale(3, 3);
            drawSprite(ctx, sprGear, -12, -12, 24, 24, false);
            ctx.restore();
        }
    } else if (bId === 3) { // Factory
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'; ctx.lineWidth = 4;
        let px = camera.x * 0.15;
        for (let i = 0; i < 9; i++) {
            let sY = 50 + i * 50;
            let sX = ((i * 140) - px) % (canvas.width + 300);
            if (sX < -150) sX += canvas.width + 400;
            ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(sX + 60, sY); ctx.lineTo(sX + 100, sY + (i%2===0?40:-40));
            ctx.lineTo(sX + 220, sY + (i%2===0?40:-40)); ctx.stroke();
            let glow = 0.3 + Math.abs(Math.sin(Date.now() / 250 + i)) * 0.7;
            ctx.fillStyle = `rgba(0, 255, 255, ${glow})`; ctx.beginPath();
            ctx.arc(sX + 220, sY + (i%2===0?40:-40), 8, 0, Math.PI * 2); ctx.fill();
        }
    } else if (bId === 4) { // Goliath
        if (Math.random() > 0.95) { ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        let px = camera.x * 0.05, mX = (canvas.width * 0.75 - px) % (canvas.width + 400);
        if (mX < -250) mX += canvas.width + 600;
        ctx.fillStyle = '#db2323'; ctx.beginPath(); ctx.arc(mX, 180, 120, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(43, 2, 2, 0.85)'; let cx = camera.x * 0.4;
        for (let i = 0; i < 7; i++) {
            let cX = ((i * 180) - cx - (Date.now()/12 % canvas.width)) % (canvas.width + 300);
            if (cX < -200) cX += canvas.width + 500;
            ctx.fillRect(cX, 70 + i * 60, 160 + (i%4)*60, 25);
        }
    }
}

export function renderParallaxLayer2() {
    const { currentLevel, camera } = G;
    const bId = Math.floor(currentLevel / 20) % 5;
    if (bId === 0) {
        let bgOffset1 = -(camera.x * 0.2) % 200;
        for (let i = -1; i < canvas.width / 200 + 2; i++) {
            let x = bgOffset1 + i * 200;
            ctx.fillStyle = '#1c0d14'; ctx.fillRect(x + 20, 100, 60, canvas.height);
            ctx.fillRect(x + 80, 150, 40, canvas.height); ctx.fillRect(x + 150, 80, 50, canvas.height);
            let flicker = Math.sin(Date.now() / 150 + i * 42);
            if (flicker > 0) { ctx.fillStyle = '#ff5500'; ctx.fillRect(x + 35, 115, 3, 4 + flicker*4); }
        }
        let bgOffset2 = -(camera.x * 0.5) % 150;
        ctx.fillStyle = '#1c0707';
        for (let i = -1; i < canvas.width / 150 + 2; i++) {
            let x = bgOffset2 + i * 150;
            ctx.beginPath(); ctx.moveTo(x, canvas.height); ctx.lineTo(x + 75, canvas.height - 150); ctx.lineTo(x + 150, canvas.height); ctx.fill();
        }
    }
}
