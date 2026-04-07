import { G, player, TILE_SIZE, getNextParticle, getNextLaser } from './globals.js';
import { playSound } from '../assets/audio.js';
import { checkRectCollision, playerDeath } from './physics_utils.js';
import { updateAuhGr } from './physics_boss_auhgr.js';
import { updateMasticator } from './physics_boss_masticator.js';
import { updateSepticus } from './physics_boss_septicus.js';
/**
 * Inverse Kinematics (IK) physics chain for highly procedural fiber optics.
 * Allows strings to float like "living snakes" and prevents positional wrapping when turning.
 */
function updateLivingChain(chain, targetLength, headX, headY, idealDist, waveOffset, windX = 0, windY = 0, wiggle = 0.5) {
    if (chain.length < targetLength) {
        chain.length = 0; // reset
        for (let i = 0; i < targetLength; i++)
            chain.push({ x: headX, y: headY });
    }
    // Attach head
    chain[0].x = headX;
    chain[0].y = headY;
    // Ambient breathing / living force
    const time = Date.now() * 0.005;
    // Resolve IK Constraints (forward kinematic pass)
    for (let i = 1; i < chain.length; i++) {
        let p0 = chain[i - 1];
        let p1 = chain[i];
        // Autonomous life (wriggle and float like snakes, plus directional environmental wind)
        // TIP-SCALING: Movement becomes exponentially stronger towards the tips of the hair
        const tipFactor = (i / chain.length) * wiggle;
        p1.x += Math.sin(time + i * 0.5 + waveOffset) * tipFactor + windX;
        p1.y += Math.cos(time * 0.8 + i * 0.4 + waveOffset) * tipFactor + windY;
        // Stick constraint calculation (forces consistent distance)
        let dx = p0.x - p1.x;
        let dy = p0.y - p1.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let diff = dist - idealDist;
        // Spring stiffness: 0.5 pushes/pulls it halfway to the ideal distance per frame
        p1.x += (dx / dist) * diff * 0.8;
        p1.y += (dy / dist) * diff * 0.8;
    }
}
/**
 * Triggers the spectacular destruction sequence for any defeated boss.
 * Cleans up entity state, unlocks exits/valves, and mutates the current map
 * layout to permit the player to progress.
 */
export function bossExplode() {
    const boss = G.boss;
    if (!boss)
        return;
    const bDyn = boss;
    // Custom death transition logic for Septicus
    if (boss.type === 'septicus' && !boss.isSinking && !bDyn.isDying && boss.hp <= 0) {
        bDyn.isDying = true;
        boss.timer = 0;
        boss.vx = 0;
        boss.vy = 0;
        boss.vibrateX = 0;
        G.acidPurified = true;
        G.isMapCached = false; // Purify acid globally
        if (boss.projs)
            boss.projs = [];
        playSound('explosion');
    }
    else if (bDyn.isDying || boss.isSinking) {
        return; // Prevent double-triggering
    }
    else {
        // Standard boss death
        boss.active = false;
        playSound('gameOver');
    }
    // High-density explosion particles emitted from the boss's center
    for (let i = 0; i < 40; i++) {
        let p = getNextParticle();
        p.active = true;
        p.type = 'normal';
        p.size = 15;
        p.x = boss.x + Math.random() * boss.width;
        p.y = boss.y + Math.random() * boss.height;
        p.vx = (Math.random() - 0.5) * 500;
        p.vy = (Math.random() - 0.5) * 500;
        p.life = 1.0;
        p.maxLife = 1.0;
    }
    // Auto-collect all level-ending triggers (e.g. Acid Purifier Valve)
    for (let it of G.items) {
        if (it.type === 'valve' || it.type === 'detonator')
            it.collected = true;
    }
    // General map mutation unlocking the pathway strictly upwards
    if (boss.type !== 'goliath') {
        let pCol = Math.floor((boss.x + boss.width / 2) / TILE_SIZE);
        let pRow = Math.floor((boss.y + boss.height) / TILE_SIZE);
        // For Septicus, we punch open a specialized hole in the ceiling (Row 5 - 10)
        if (boss.type === 'septicus') {
            pCol = 98;
            pRow = 11;
            for (let i = 0; i < 6; i++) {
                let br = 5 + i, bc = 82 + i * 2;
                if (G.map[br]) {
                    G.map[br][bc] = 1;
                    G.map[br][bc + 1] = 1;
                }
            }
        }
        // Generate an exit portal above the dead boss location
        if (G.map[Math.max(0, pRow - 1)])
            G.map[Math.max(0, pRow - 1)][pCol] = 5;
        G.isMapCached = false;
    }
}
/**
 * The master physics router for all boss logic.
 * Checks generic collision data, then pipes execution off to the
 * specific boss's individual physics module.
 *
 * @param dt Delta time for framerate independent momentum calculations
 */
export function updateBoss(dt) {
    const boss = G.boss;
    if (!boss)
        return;
    const bDyn = boss;
    // --- TRIGGER LOGIC FOR AUH-GR ---
    // Auh-Gr natively starts inactive and invisible, waiting far below the map.
    // The player triggers the climb upon reaching a Y-threshold.
    if (boss.type === 'auh-gr' && !boss.triggered) {
        const firstPlatformRow = 114;
        const triggerY = firstPlatformRow * 40; // 40 = nominal Y scaling
        // If player descends far enough into the cavern, trigger the boss
        if (player.y < triggerY && player.y > triggerY - 200) {
            boss.triggered = true;
            boss.active = true; // Ignite boss logic
            playSound('powerup');
        }
        if (!boss.active)
            return; // Keep Auh-Gr dormant to avoid memory waste
    }
    // Skip processing if totally dead or inactive
    if (!boss.active || (boss.hp <= 0 && !boss.isSinking && !bDyn.isDying))
        return;
    // Decrement damage cooldown frame delay
    if (boss.hurtTimer > 0)
        boss.hurtTimer -= dt;
    // Global player collision detection for any normal damage-type boss.
    // Notice Auh-Gr is physically exempt because he uses complex math hitboxes instead.
    if (boss.type !== 'auh-gr') {
        let bRect = { x: boss.x + 5, y: boss.y + 5, width: boss.width - 10, height: boss.height - 10 };
        if (checkRectCollision(player, bRect))
            playerDeath();
    }
    // Universal internal clock increment for phase-shifting
    boss.timer += dt;
    // --- ROUTE TO SPECIFIC HANDLERS ---
    if (boss.type === 'masticator') {
        updateMasticator(boss, dt);
    }
    else if (boss.type === 'septicus') {
        updateSepticus(boss, dt, bDyn);
    }
    else if (boss.type === 'auh-gr') {
        updateAuhGr(boss, dt);
    }
    else if (boss.type === 'glitch') {
        // Glitch Boss (Level 79) - Shoots rapid-fire straight lasers directly at the player
        if (!boss.hairTrail1)
            boss.hairTrail1 = [];
        if (!boss.hairTrail2)
            boss.hairTrail2 = [];
        if (!boss.maneTrail)
            boss.maneTrail = [];
        if (!boss.tailTrail)
            boss.tailTrail = [];
        // --- MOVEMENT LOGIC ---
        // Stationary: Glitch stays put so physics can be observed clearly.
        boss.vx = 0;
        // Procedural Anchor Math (64x64 grid)
        const isFlipped = player.x < boss.x;
        const dragDir = isFlipped ? 1.5 : -1.5; // Wind force pulling opposite of facing direction
        // 1. Rider Hair (Two Pony Tails centered perfectly in the raised wide gaps)
        const hX1 = boss.x + (isFlipped ? 65 : 13), hY = boss.y + 12;
        const hX2 = boss.x + (isFlipped ? 37 : 41);
        // Anti-Gravity Snake Vectors (pull outward from ears, and strongly upward)
        const pullX1 = isFlipped ? 1.5 : -1.5;
        const pullX2 = isFlipped ? -1.5 : 1.5;
        updateLivingChain(boss.hairTrail1, 20, hX1, hY, 2.0, 0, pullX1, -2.0, 3.5);
        updateLivingChain(boss.hairTrail2, 20, hX2, hY, 2.0, 100, pullX2, -2.0, 3.5);
        // 2. Steed Mane (Just behind the head)
        const mX = boss.x + (isFlipped ? 18 : 46), mY = boss.y + 24;
        updateLivingChain(boss.maneTrail, 8, mX, mY, 2.5, 50, 0, 0, 0.8);
        // 3. Steed Tail (Extended rump tail trailing behind)
        const tX = boss.x + (isFlipped ? 58 : 6), tY = boss.y + 48;
        updateLivingChain(boss.tailTrail, 25, tX, tY, 2.0, 200, dragDir, 0, 0.8);
        if (boss.timer > 1.5) {
            boss.timer = 0;
            const trails = [boss.hairTrail1, boss.hairTrail2];
            for (let trail of trails) {
                if (!trail || trail.length === 0)
                    continue;
                let l = getNextLaser();
                l.active = true;
                l.width = 16;
                l.height = 8;
                // Calculate the true physical tip for this specific pony tail
                const tipNode = trail[trail.length - 1];
                const tipX = tipNode.x;
                const tipY = tipNode.y;
                l.x = tipX;
                l.y = tipY;
                // Calculate angled trajectory towards the player's center
                const ldx = player.x + player.width / 2 - tipX;
                const ldy = player.y + player.height / 2 - tipY;
                const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
                l.vx = (ldx / ldist) * 350;
                l.vy = (ldy / ldist) * 350;
            }
            playSound('shoot');
        }
    }
    else if (boss.type === 'goliath') {
        // Goliath Boss (Level 99 Final Encounter)
        // A colossal super-tank that chases the player from the left.
        // It stays locked to the left side of the camera's viewport.
        boss.x = Math.max(boss.x, G.camera.x - 30);
        // Every 2 seconds it fires a 3-spread of massive lasers
        if (boss.timer > 2.0 && G.gameState !== 'CREDITS_CUTSCENE' && G.gameState !== 'CREDITS') {
            boss.timer = 0;
            for (let i = 0; i < 3; i++) {
                let l = getNextLaser();
                l.active = true;
                l.width = 30;
                l.height = 15;
                l.x = boss.x + boss.width;
                l.y = boss.y + 40 + (i * 40);
                l.vx = 400 + Math.random() * 100; // Fire forwards (right) rapidly
            }
            playSound('shoot');
        }
    }
}
