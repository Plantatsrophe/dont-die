import { G, ctx } from '../../core/globals.js';
import { sprAuhGr1, sprAuhGr2, sprAuhGr3 } from '../../assets/assets.js';
import { drawSprite } from '../utils/render_utils.js';
import type { IBoss } from '../../types.js';

/**
 * Auh-Gr: The giant chase machine.
 */
export function drawAuhGr(boss: IBoss) {
    let frames = [sprAuhGr1, sprAuhGr2, sprAuhGr3];
    let frameIdx = Math.floor(G.timerAcc * 24) % frames.length;
    ctx.save();
    drawSprite(ctx, frames[frameIdx], boss.x, boss.y, boss.width, boss.height, false, 48);
    ctx.restore();
}
