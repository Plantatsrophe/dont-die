const pal: { [key: number]: string | null } = {
  0: null, 1: '#f1c27d', 2: '#ff2222', 3: '#f1c40f', 4: '#5c4033',
  5: '#888888', 6: '#444444', 7: '#2ecc71', 8: '#ffffff', 9: '#00ffff',
  10: '#000000', 11: '#3366cc', 12: '#8b4513', 13: '#222222', 14: '#3ee855', 15: '#1e90ff', 16: '#5e4533'
};

const GLOW_CACHE = new Map<string, HTMLCanvasElement>();

export function drawSprite(ctx: CanvasRenderingContext2D, spr: number[], x: number, y: number, w: number, h: number, flipX: boolean) {
    let gridSize = Math.sqrt(spr.length);
    let pxW = w / gridSize;
    let pxH = h / gridSize;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            let colIndex = flipX ? (gridSize - 1 - c) : c;
            let val = spr[r * gridSize + colIndex];
            if (val !== 0 && pal[val]) {
                ctx.fillStyle = pal[val]!;
                ctx.fillRect(x + c * pxW, y + r * pxH, pxW + 0.5, pxH + 0.5);
            }
        }
    }
}

export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colorStr: string) {
    const key = `${Math.floor(radius)}_${colorStr}`;
    let cached = GLOW_CACHE.get(key);
    
    if (!cached) {
        cached = document.createElement('canvas');
        const size = Math.ceil(radius * 2);
        cached.width = size;
        cached.height = size;
        const cctx = cached.getContext('2d')!;
        let grad = cctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        grad.addColorStop(0, colorStr);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        cctx.fillStyle = grad;
        cctx.fillRect(0, 0, size, size);
        GLOW_CACHE.set(key, cached);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(cached, x - radius, y - radius);
    ctx.restore();
}

export function drawKey(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
    ctx.fillStyle = '#555'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#888'; ctx.fillRect(x, y, w, 3); ctx.fillRect(x, y, 3, h);
    ctx.fillStyle = '#222'; ctx.fillRect(x, y + h - 4, w, 4); ctx.fillRect(x + w - 4, y, 4, h);
    ctx.fillStyle = '#444'; ctx.fillRect(x + 3, y + 3, w - 7, h - 7);
    ctx.fillStyle = 'white';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    if (label === 'UP') { ctx.beginPath(); ctx.moveTo(x + w/2, y + h/2 - 4); ctx.lineTo(x + w/2 - 6, y + h/2 + 4); ctx.lineTo(x + w/2 + 6, y + h/2 + 4); ctx.fill(); }
    else if (label === 'DOWN') { ctx.beginPath(); ctx.moveTo(x + w/2, y + h/2 + 4); ctx.lineTo(x + w/2 - 6, y + h/2 - 4); ctx.lineTo(x + w/2 + 6, y + h/2 - 4); ctx.fill(); }
    else if (label === 'LEFT') { ctx.beginPath(); ctx.moveTo(x + w/2 - 4, y + h/2); ctx.lineTo(x + w/2 + 4, y + h/2 - 6); ctx.lineTo(x + w/2 + 4, y + h/2 + 6); ctx.fill(); }
    else if (label === 'RIGHT') { ctx.beginPath(); ctx.moveTo(x + w/2 + 4, y + h/2); ctx.lineTo(x + w/2 - 4, y + h/2 - 6); ctx.lineTo(x + w/2 - 4, y + h/2 + 6); ctx.fill(); }
    else { ctx.fillText(label, x + w/2, y + h/2 + 4); }
}
