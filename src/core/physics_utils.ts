import { G, player, keys, TILE_SIZE, laserPool, particlePool, getNextParticle } from './globals.js';
import { playSound } from '../assets/audio.js';
import type { IRect, IEntity, IParticle } from '../types.js';

export function checkRectCollision(r1: IRect, r2: IRect): boolean {
    return r1.x < r2.x+r2.width && r1.x+r1.width > r2.x && r1.y < r2.y+r2.height && r1.y+r1.height > r2.y;
}

// Optimization: Reusable tile array to reduce GC pressure
const TILE_CACHE: any[] = [];

export function getCollidingTiles(rect: IRect) {
    TILE_CACHE.length = 0;
    let sc = Math.floor((rect.x+0.0001)/TILE_SIZE), ec = Math.floor((rect.x+rect.width-0.0001)/TILE_SIZE);
    let sr = Math.floor((rect.y+0.0001)/TILE_SIZE), er = Math.floor((rect.y+rect.height-0.0001)/TILE_SIZE);
    for (let row=sr; row<=er; row++) for (let col=sc; col<=ec; col++) {
        if (row>=0 && row<G.mapRows && col>=0 && col<G.mapCols)
            TILE_CACHE.push({row,col,type:G.map[row][col],rect:{x:col*TILE_SIZE,y:row*TILE_SIZE,width:TILE_SIZE,height:TILE_SIZE}});
    }
    return TILE_CACHE;
}

export function playerDeath() {
    if (G.gameState==='DYING') return;
    playSound('die'); G.gameState='DYING'; player.dyingTimer=0;
    keys.ArrowLeft=false; keys.ArrowRight=false; keys.ArrowUp=false; keys.ArrowDown=false; keys.Space=false;
    for (let l of laserPool) l.active=false;
    if (G.boss&&G.boss.active) { 
        if (G.boss.type==='masticator'){G.boss.phase=0;G.boss.vx=0;G.boss.hasSeenPlayer=false;} 
        G.boss.x = G.boss.startX ?? G.boss.x; G.boss.y = G.boss.startY ?? G.boss.y;
        if (G.boss.projs) G.boss.projs=[]; 
    }
    for (let i=0; i<4; i++) {
        let qx=(i%2===0)?0:1, qy=(i<2)?0:1, p = getNextParticle();
        p.active=true; p.type='playerQuad'; p.qx=qx; p.qy=qy; p.x=player.x+(qx*player.width/2); p.y=player.y+(qy*player.height/2); p.vx=(qx===0?-1:1)*(150+Math.random()*50); p.vy=(qy===0?-1:1)*(150+Math.random()*50)-100; p.size=Math.max(player.width,player.height)/2; p.life=1.5; p.maxLife=2.0; p.flip=player.lastDir===-1;
    }
    player.vx=0; player.vy=0; player.isOnGround=false; player.isClimbing=false; player.riding = null;
}
