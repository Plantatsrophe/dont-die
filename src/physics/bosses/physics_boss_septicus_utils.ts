import { G, TILE_SIZE, getNextParticle, player } from '../../core/globals.js';
import { playSound } from '../../assets/audio.js';
import { playerDeath } from '../core/physics_utils.js';

/**
 * Handles the death and sinking sequence for Septicus.
 */
export function handleSepticusDeath(boss: any, dt: number, bDyn: any): boolean {
    if (bDyn.isDying) {
        boss.timer += dt; 
        let shake = Math.min((boss.timer / 3.0) * 15, 15);
        boss.vibrateX = (Math.random()-0.5) * shake * 2;
        if (Math.random() < 30 * dt) { 
            let p = getNextParticle(); p.active=true; p.type='normal'; p.size=Math.random()*6+4; 
            p.x=boss.x+Math.random()*boss.width; p.y=boss.y+Math.random()*boss.height; 
            p.vx=(Math.random()-0.5)*400; p.vy=(Math.random()-0.5)*400; 
            p.color=(Math.random()>0.5?'#3ee855':'#ffffff'); p.life=0; p.maxLife=0.6+Math.random()*0.4; 
        }
        if (boss.timer > 3.0) {
            bDyn.isDying = false; boss.isSinking = true; boss.timer = 0; 
            playSound('gameOver'); boss.vibrateX = 0;
            for(let i=0; i<40; i++){ 
                let p=getNextParticle(); p.active=true; p.type='explosion'; p.size=15; 
                p.x=boss.x+Math.random()*boss.width; p.y=boss.y+Math.random()*boss.height; 
                p.vx=(Math.random()-0.5)*600; p.vy=(Math.random()-0.5)*600; p.life=1.0; p.maxLife=1.0; 
            }
            if (G.camera) (G.camera as any).vibrate = 20;
        } 
        return true;
    }
    if (boss.isSinking) { 
        boss.y += 18 * dt; 
        if (boss.timer > 10.0) { boss.isSinking = false; boss.active = false; } 
        return true; 
    }
    return false;
}

/**
 * Updates individual projectiles for Septicus.
 */
export function updateSepticusProjectiles(boss: any, dt: number) {
    if (!boss.projs) return;
    for(let i = boss.projs.length - 1; i >= 0; i--) {
        let p = boss.projs[i];
        if (!p) break;
        p.timer += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if(!p.linear) p.vy += 600 * dt;
        let pdx = player.x + player.width/2 - p.x, pdy = player.y + player.height/2 - p.y;
        if(Math.sqrt(pdx*pdx + pdy*pdy) < 25) playerDeath();
        if(p.y > (boss.startY || 0) + 400 || p.x < 0 || p.x > G.mapCols * TILE_SIZE) boss.projs.splice(i, 1);
    } 
}
