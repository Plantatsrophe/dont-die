import { G, ctx } from '../../core/globals.js';
import { drawMasticator } from './render_boss_masticator.js';
import { drawSepticus } from './render_boss_septicus.js';
import { drawAuhGr } from './render_boss_auhgr.js';
import { drawGlitch } from './render_boss_glitch.js';
import { drawBaphometron } from './render_baphometron.js';

/**
 * Orchestrates the rendering logic for the current level's active boss.
 * Determines the specific drawing style based on the boss type (Septicus, Auh-Gr, etc.).
 */
export function renderBoss() {
    const boss = G.boss; if (!boss || !boss.active) return;
    
    if (boss.type === 'masticator') {
        drawMasticator(boss);
    } else if (boss.type === 'septicus') {
        drawSepticus(boss);
    } else if (boss.type === 'auh-gr') {
        drawAuhGr(boss);
    } else if (boss.type === 'glitch') {
        drawGlitch(boss);
    } else if (boss.type === 'baphometron') {
        drawBaphometron();
    }
}
