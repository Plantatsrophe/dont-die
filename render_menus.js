import { G, canvas, ctx, introText, player } from './globals.js';
import { sprHero, sprHotdog, sprBot, sprGear, sprRef } from './assets.js';
import { drawSprite, drawKey } from './render_utils.js';

export function renderStartScreen() {
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!window.logoLoaded && typeof logoBase64 !== 'undefined') { window.logoLoaded = new Image(); window.logoLoaded.src = logoBase64; }
    let logoImg = window.logoLoaded;
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        if (!window.logoOsc) {
            let nw = 160, ratio = logoImg.naturalWidth / logoImg.naturalHeight, nh = Math.round(160 / ratio);
            window.logoOsc = document.createElement('canvas'); window.logoOsc.width = nw; window.logoOsc.height = nh;
            window.logoOsc.getContext('2d').drawImage(logoImg, 0, 0, nw, nh);
        }
        ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 0.35;
        let scaleRatio = canvas.width / window.logoOsc.width, displayH = window.logoOsc.height * scaleRatio;
        ctx.drawImage(window.logoOsc, 0, 0, window.logoOsc.width, window.logoOsc.height, 0, (canvas.height - displayH) / 2, canvas.width, displayH);
        ctx.globalAlpha = 1.0;
    }
    ctx.fillStyle = '#f1c40f'; ctx.textAlign = 'center'; ctx.font = '25px "Press Start 2P"'; ctx.fillText("DON'T DIE", canvas.width / 2, canvas.height / 2 - 140);
    ctx.font = '15px "Press Start 2P"'; ctx.fillText("A GRFC™ GAME", canvas.width / 2, canvas.height / 2 - 110);
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText('PRESS ENTER TO START', canvas.width / 2, 540);
    ctx.fillText('TOP 10 SURVIVORS', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '10px "Press Start 2P"';
    for (let i = 0; i < G.highScores.length; i++) {
        let hs = G.highScores[i];
        ctx.fillText(`${(i + 1).toString().padStart(2, ' ')}. ${hs.name.padEnd(8, ' ')} ... ${hs.score.toString().padStart(7, ' ')}`, canvas.width / 2, canvas.height / 2 + (i * 15));
    }
    let sprFlip = Math.floor(Date.now() / 600) % 2 === 0;
    drawSprite(ctx, sprHero, canvas.width/2 - 200, canvas.height/2 + 15, 32, 40, sprFlip);
    drawSprite(ctx, sprBot, canvas.width/2 + 160, canvas.height/2 + 15, 38, 38, !sprFlip);
}

export function renderIntroScreen() {
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px "Press Start 2P"'; ctx.fillStyle = '#f1c40f'; ctx.textAlign = 'center';
    let paragraphs = introText.split('\n'), yCursor = G.introY, lineHeight = 28, maxWidth = canvas.width - 120;
    for (let j = 0; j < paragraphs.length; j++) {
        let line = '', words = paragraphs[j].split(' ');
        for(let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) { ctx.fillText(line, canvas.width / 2, yCursor); line = words[n] + ' '; yCursor += lineHeight; }
            else line = testLine;
        }
        ctx.fillText(line, canvas.width / 2, yCursor); yCursor += lineHeight * 2;
    }
    if (Math.floor(Date.now() / 500) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.font = '10px "Press Start 2P"'; ctx.fillText('PRESS ENTER OR TOUCH TO SKIP', canvas.width / 2, canvas.height - 30); }
}

export function renderInstructions() {
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; ctx.font = '25px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("HOW TO SURVIVE", canvas.width / 2, 80);
    ctx.font = '18px "Press Start 2P"'; ctx.fillStyle = '#f1c40f'; ctx.fillText("MOVEMENT", 220, 140);
    drawKey(ctx, 110, 160, 36, 36, 'W'); drawKey(ctx, 70, 200, 36, 36, 'A'); drawKey(ctx, 110, 200, 36, 36, 'S'); drawKey(ctx, 150, 200, 36, 36, 'D');
    ctx.textAlign = 'center'; ctx.font = '18px "Press Start 2P"'; ctx.fillStyle = '#f1c40f'; ctx.fillText("JUMP", canvas.width / 2, 270);
    drawKey(ctx, canvas.width/2 - 120, 310, 240, 36, 'SPACEBAR');
    ctx.fillText("ITEMS", 600, 140);
    drawSprite(ctx, sprGear, 480, 160, 24, 24, false); drawSprite(ctx, sprHotdog, 480, 200, 24, 24, false); drawSprite(ctx, sprRef, 480, 240, 24, 24, Math.floor(Date.now() / 400) % 2 === 0);
    ctx.fillStyle = '#ff2222'; ctx.fillText("OBJECTIVE", canvas.width / 2, 380);
    ctx.fillStyle = 'white'; ctx.font = '12px "Press Start 2P"'; ctx.fillText("REACH THE TIME PORTAL ALIVE.", canvas.width / 2, 420);
    if (Math.floor(Date.now() / 500) % 2 === 0) { ctx.fillStyle = '#f1c40f'; ctx.font = '15px "Press Start 2P"'; ctx.fillText('PRESS ENTER TO DROP IN', canvas.width / 2, 540); }
}
