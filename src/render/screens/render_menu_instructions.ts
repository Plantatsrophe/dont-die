import { canvas, ctx } from '../../core/globals.js';
import { sprHotdog, sprGear, sprRef } from '../../assets/assets.js';
import { drawSprite, drawKey } from '../utils/render_utils.js';

/**
 * Instructions Screen: Visual guide to controls and items.
 */
export function renderInstructions() {
    ctx.save();
    ctx.globalAlpha = 1.0; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white'; ctx.font = '25px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("HOW TO SURVIVE", canvas.width / 2, 80);
    
    // MOVEMENT
    ctx.fillStyle = '#f1c40f'; ctx.font = '18px "Press Start 2P", sans-serif';
    ctx.fillText("MOVEMENT", 220, 140);
    drawKey(ctx, 110, 160, 36, 36, 'W'); drawKey(ctx, 70, 200, 36, 36, 'A');
    drawKey(ctx, 110, 200, 36, 36, 'S'); drawKey(ctx, 150, 200, 36, 36, 'D');
    ctx.fillStyle = 'white'; ctx.font = '12px "Press Start 2P", sans-serif'; ctx.fillText("OR", 220, 200);
    drawKey(ctx, 290, 160, 36, 36, 'UP'); drawKey(ctx, 250, 200, 36, 36, 'LEFT');
    drawKey(ctx, 290, 200, 36, 36, 'DOWN'); drawKey(ctx, 330, 200, 36, 36, 'RIGHT');

    // ITEMS
    ctx.fillStyle = '#f1c40f'; ctx.font = '18px "Press Start 2P", sans-serif'; ctx.fillText("ITEMS", 600, 140);
    drawSprite(ctx, sprGear, 480, 160, 24, 24, false);
    ctx.fillStyle = 'white'; ctx.font = '10px "Press Start 2P", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText("GEAR: +1000 POINTS", 520, 178);
    drawSprite(ctx, sprHotdog, 480, 200, 24, 24, false);
    ctx.fillText("HOTDOG: +1 LIFE", 520, 218);
    drawSprite(ctx, sprRef, 480, 240, 24, 24, Math.floor(Date.now() / 400) % 2 === 0);
    ctx.fillText("FUDGE: CHECKPOINT", 520, 258);

    // JUMP
    ctx.textAlign = 'center'; ctx.fillStyle = '#f1c40f'; ctx.font = '18px "Press Start 2P", sans-serif';
    ctx.fillText("JUMP", 220, 270);
    ctx.fillStyle = 'white'; ctx.font = '12px "Press Start 2P", sans-serif';
    ctx.fillText("(TAP TWICE FOR DOUBLE JUMP)", 220, 290);
    drawKey(ctx, 220 - 120, 310, 240, 36, 'SPACEBAR');
    
    // GOAL
    ctx.fillStyle = '#ff2222'; ctx.font = '18px "Press Start 2P", sans-serif'; ctx.fillText("OBJECTIVE", canvas.width / 2, 400);
    ctx.fillStyle = 'white'; ctx.font = '12px "Press Start 2P", sans-serif';
    ctx.fillText("GET BACK IN TIME FOR THE SHOW.", canvas.width / 2, 440);
    ctx.fillText("STOMP SOME BOTS.", canvas.width / 2, 470);
    ctx.fillText("DON'T DIE...", canvas.width / 2, 500);

    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#f1c40f'; ctx.font = '15px "Press Start 2P", sans-serif';
        ctx.fillText('PRESS ENTER TO DROP IN', canvas.width / 2, 560);
    }
    ctx.restore();
}
