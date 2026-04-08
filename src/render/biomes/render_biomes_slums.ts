import { canvas, ctx } from '../../core/globals.js';

/**
 * Slums: Urban silhouette with flickering windows.
 * @param px Camera parallax offset
 */
export function drawSlumsParallax(px: number) {
    for (let i = 0; i < 30; i++) {
        let h = 80 + (Math.sin(i * 999) * 40);
        let w = 40 + (Math.cos(i * 777) * 20);
        let x = ((i * 60) - px) % (canvas.width + 100);
        if (x < -100) x += canvas.width + 200;
        ctx.fillStyle = '#05050f';
        ctx.fillRect(x, canvas.height - h, w, h);
        
        // Flickering windows logic
        ctx.fillStyle = '#f1c40f';
        for (let wy = canvas.height - h + 10; wy < canvas.height - 10; wy += 15) {
            for (let wx = x + 5; wx < x + w - 5; wx += 10) {
                if (Math.sin(i * wx * wy) > 0.5) ctx.fillRect(wx, wy, Math.sin(wx)>0?2:1, Math.sin(wy)>0?2:1);
            }
        }
    }
}

/**
 * Slums Secondary Layer: Deep urban background.
 */
export function drawSlumsLayer2(px: number) {
    let bgOffset1 = -(px * 0.2) % 200;
    for (let i = -1; i < canvas.width / 200 + 2; i++) {
        let x = bgOffset1 + i * 200;
        ctx.fillStyle = '#1c0d14'; ctx.fillRect(x + 20, 100, 60, canvas.height);
        ctx.fillRect(x + 80, 150, 40, canvas.height); ctx.fillRect(x + 150, 80, 50, canvas.height);
        let flicker = Math.sin(Date.now() / 150 + i * 42);
        if (flicker > 0) { ctx.fillStyle = '#ff5500'; ctx.fillRect(x + 35, 115, 3, 4 + flicker*4); }
    }
    let bgOffset2 = -(px * 0.5) % 150;
    ctx.fillStyle = '#1c0707';
    for (let i = -1; i < canvas.width / 150 + 2; i++) {
        let x = bgOffset2 + i * 150;
        ctx.beginPath(); ctx.moveTo(x, canvas.height); ctx.lineTo(x + 75, canvas.height - 150); ctx.lineTo(x + 150, canvas.height); ctx.fill();
    }
}
