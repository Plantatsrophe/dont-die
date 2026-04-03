const pal = {
  0: null, 1: '#f1c27d', 2: '#ff2222', 3: '#f1c40f', 4: '#5c4033',
  5: '#888888', 6: '#444444', 7: '#2ecc71', 8: '#ffffff', 9: '#00ffff',
  10: '#000000', 11: '#3366cc', 12: '#8b4513', 13: '#222222', 14: '#3ee855', 15: '#00bbff'
};

export function drawSprite(ctx, spr, x, y, w, h, flipX) {
    let gridSize = Math.sqrt(spr.length);
    let pxW = w / gridSize;
    let pxH = h / gridSize;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            let colIndex = flipX ? (gridSize - 1 - c) : c;
            let val = spr[r * gridSize + colIndex];
            if (val !== 0 && pal[val]) {
                ctx.fillStyle = pal[val];
                ctx.fillRect(x + c * pxW, y + r * pxH, pxW + 0.5, pxH + 0.5);
            }
        }
    }
}

export function drawGlow(ctx, x, y, radius, colorStr) {
    let grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, colorStr);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

export function drawKey(ctx, x, y, w, h, label) {
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
