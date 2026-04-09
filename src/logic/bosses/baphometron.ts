import { G, TILE_SIZE, getNextParticle } from '../../core/globals.js';
import { ISpikeEntity } from '../../types.js';
import { checkRectCollision } from '../../physics/core/physics_utils.js';

/**
 * BaphometronController.ts
 * 
 * This module acts as the Director/Controller for the pure-survival boss fight 
 * against Baphometron, a giant robot. It manages timing, phase transitions, 
 * and attack triggers using frame-rate independent delta time (dt).
 */

/**
 * Valid states for Baphometron's physical limbs.
 */
type LimbState = 'telegraph' | 'executing' | 'recovery';

/**
 * Interface representing a limb entity (Fist or Kick) in the object pool.
 */
interface ILimbEntity {
    active: boolean;
    type: 'fist' | 'kick';
    state: LimbState;
    x: number;
    y: number;
    width: number;
    height: number;
    timer: number;
    direction: number; // 1 for right-moving, -1 for left-moving
    startSide: 'left' | 'right';
}

export class BaphometronController {
    // Current time remaining in the survival encounter (starts at 120s)
    public timeRemaining: number = 120.0;
    
    // The current active phase of the fight (1, 2, or 3)
    public currentPhase: number = 1;

    // State flags for attack management
    public isExecutingLaser: boolean = false; // Blocks standard attacks during scripted events
    public hasFinished: boolean = false;      // Clamps logic once time hits zero
    public globalCooldown: number = 0;        // Prevents simultaneous starts (0.5s)
    
    // Attack timers for recurring moves
    private fistCooldown: number = 0;
    private kickCooldown: number = 0;
    private laserCooldown: number = 25.0; // Initial laser timer
    
    // Scripted event flags to ensure they only fire once
    private laser30Triggered: boolean = false;
    private scriptedEventTimer: number = 0; // Duration for pauses during transitions

    // Object Pools for limbs to prevent GC stutters
    private fistPool: ILimbEntity[] = [];
    private kickPool: ILimbEntity[] = [];
    private spikePool: ISpikeEntity[] = [];

    // Callbacks to communicate with the main game engine
    private onSurvivalComplete: () => void;
    private onTriggerShake: () => void;

    /**
     * Initializes the controller with base cooldowns, pools, and communication hooks.
     * 
     * @param onComplete Callback for when survival concludes
     * @param onShake Callback to trigger camera screen shake logic
     */
    constructor(onComplete: () => void, onShake: () => void) {
        this.onSurvivalComplete = onComplete;
        this.onTriggerShake = onShake;

        // Initial setup for Phase 1 cooldowns
        this.fistCooldown = 5.0;
        this.kickCooldown = 7.0;
        this.laserCooldown = 20.0; // Ready for first rotation early

        // Initialize defensive Object Pools
        this.fistPool = Array.from({ length: 3 }, () => ({ 
            active: false, type: 'fist', state: 'telegraph', 
            x: 0, y: 0, width: 80, height: 80, timer: 0, direction: 1, startSide: 'left' 
        }));
        this.kickPool = Array.from({ length: 2 }, () => ({ 
            active: false, type: 'kick', state: 'telegraph', 
            x: 0, y: 0, width: 200, height: 80, timer: 0, direction: 1, startSide: 'left' 
        }));
        this.spikePool = Array.from({ length: 6 }, () => ({
            active: false, x: 0, y: 0, width: 40, height: 120, state: 'inactive', timer: 0
        }));
    }

    /**
     * Core update loop for the boss logic.
     * 
     * @param dt High-precision delta time
     */
    public update(dt: number): void {
        if (this.hasFinished) return;

        this.timeRemaining -= dt;

        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.handleFinalLaser();
            return;
        }

        if (this.globalCooldown > 0) {
            this.globalCooldown -= dt;
        }

        this.updatePhase();
        this.handleScriptedEvents();

        // Handle Scripted Event Lifecycle
        if (this.scriptedEventTimer > 0) {
            this.scriptedEventTimer -= dt;
            if (this.scriptedEventTimer <= 0) {
                this.scriptedEventTimer = 0;
                this.endLaser();
                console.log("Baphometron: Scripted Event Complete. Resuming attacks.");
            }
        }

        // Process physics and state for all active limbs in the pool
        this.updateLimbs(dt);
        this.updateSpikes(dt);

        if (!this.isExecutingLaser) {
            this.handleRecurringAttacks(dt);
        }
    }

    /**
     * Processes movement, telegraphs, and cleanup for all active limbs.
     */
    private updateLimbs(dt: number): void {
        const worldWidth = G.mapCols * TILE_SIZE;
        const groundY = (G.mapRows - 1) * TILE_SIZE; // Bottom floor level

        [...this.fistPool, ...this.kickPool].forEach(limb => {
            if (!limb.active) return;

            // --- TELEGRAPH PHASE ---
            if (limb.state === 'telegraph') {
                limb.timer -= dt;
                if (limb.timer <= 0) {
                    limb.state = 'executing';
                    if (limb.type === 'fist') {
                        limb.y = -600; // Start fist high above the screen
                    }
                }
            } 
            // --- EXECUTING PHASE ---
            else if (limb.state === 'executing') {
                if (limb.type === 'fist') {
                    limb.y += 1200 * dt; // Rapid drop speed
                    if (limb.y + limb.height >= groundY) {
                        limb.y = groundY - limb.height;
                        limb.state = 'recovery';
                        limb.timer = 0.5; // Stay on floor for weight
                        this.onTriggerShake(); // Impact juice
                    }
                } else {
                    // KICK: Sliding Rectangular Foot Logic
                    const sweepSpeed = 1200;
                    if (limb.startSide === 'left') {
                        limb.x += sweepSpeed * dt;
                    } else {
                        limb.x -= sweepSpeed * dt;
                    }

                    // Deactivate once the entire foot is off-screen
                    if (limb.startSide === 'left' && limb.x > worldWidth) limb.active = false;
                    if (limb.startSide === 'right' && limb.x + limb.width < 0) limb.active = false;
                }
            }
            // --- RECOVERY PHASE ---
            else if (limb.state === 'recovery') {
                limb.timer -= dt;
                if (limb.timer <= 0) limb.active = false; // Final despawn
            }

            // --- LAWNMOWER EFFECT ---
            // If this is a Kick in the 'executing' state, it shatters any stuck spikes in its path.
            if (limb.active && limb.state === 'executing' && limb.type === 'kick') {
                const kickRect = { x: limb.x, y: limb.y, width: limb.width, height: limb.height };
                this.spikePool.forEach(spike => {
                    // Only shatter 'stuck' spikes to avoid affecting falling or already shattered ones
                    if (spike.active && spike.state === 'stuck') {
                        const spikeRect = { x: spike.x, y: spike.y, width: spike.width, height: spike.height };
                        if (checkRectCollision(kickRect, spikeRect)) {
                            spike.state = 'shattering';
                            spike.timer = 0.3;
                            this.triggerShatterParticles(spike);
                        }
                    }
                });
            }
        });
    }

    /**
     * Updates movement and state transitions for the spike pool.
     */
    private updateSpikes(dt: number): void {
        const groundY = (G.mapRows - 1) * TILE_SIZE;

        this.spikePool.forEach(spike => {
            if (!spike.active) return;

            if (spike.state === 'falling') {
                spike.timer -= dt;
                // Telegraph ends, physical spike begins falling
                if (spike.timer <= 0) {
                    spike.y += 800 * dt; // Fall speed
                    
                    // Impact check
                    if (spike.y + spike.height >= groundY) {
                        spike.y = groundY - spike.height;
                        spike.state = 'stuck';
                        this.onTriggerShake(); // Slam juice
                        console.log("Baphometron: Sky Spike IMPACT.");
                    }
                }
            } else if (spike.state === 'shattering') {
                spike.timer -= dt;
                if (spike.timer <= 0) {
                    spike.active = false;
                    spike.state = 'inactive';
                }
            }
        });
    }

    /**
     * Spawns a new Sky Spike with a 1.5s telegraph.
     */
    private spawnSpike(): void {
        const spike = this.spikePool.find(s => !s.active);
        if (!spike) return;

        const worldWidth = G.mapCols * TILE_SIZE;
        // Target Screen 2 (X: 800 - 1600)
        const arenaXStart = 800;
        const arenaWidth = 800;
        
        spike.active = true;
        spike.state = 'falling';
        spike.x = arenaXStart + 40 + Math.random() * (arenaWidth - 120);
        spike.y = -spike.height; // Spawn off-screen
        spike.timer = 1.5; // Telegraph duration
        console.log(`Baphometron: Sky Spike charging at X: ${Math.floor(spike.x)}`);
    }

    /**
     * Triggers a burst of metallic shards when a spike shatters.
     */
    private triggerShatterParticles(spike: ISpikeEntity): void {
        for (let i = 0; i < 12; i++) {
            const p = getNextParticle();
            p.active = true;
            p.type = 'normal';
            p.size = 4 + Math.random() * 6;
            p.x = spike.x + spike.width / 2;
            p.y = spike.y + 20; // Top of spike shattering
            p.vx = (Math.random() - 0.5) * 300;
            p.vy = -100 - Math.random() * 200;
            p.life = 0.5 + Math.random() * 0.4;
            p.maxLife = p.life;
            p.color = '#555555'; // Metallic grey
        }
    }

    public endLaser(): void {
        this.isExecutingLaser = false;
        this.fistCooldown = Math.max(this.fistCooldown, 1.5);
        this.kickCooldown = Math.max(this.kickCooldown, 1.5);
    }

    private updatePhase(): void {
        // Stretched for 120s duration
        if (this.timeRemaining <= 40) this.currentPhase = 3;
        else if (this.timeRemaining <= 80) this.currentPhase = 2;
        else this.currentPhase = 1;
    }

    private handleScriptedEvents(): void {
        // Triggered when 30 seconds have ELAPSED (120 - 30 = 90)
        if (this.timeRemaining <= 90.0 && !this.laser30Triggered) {
            this.laser30Triggered = true;
            this.triggerLaser("Mid-Fight Transition", 5.0);
        }
    }

    private handleFinalLaser(): void {
        this.hasFinished = true;
        this.triggerLaser("Final Blast / Victory");
        if (this.onSurvivalComplete) this.onSurvivalComplete();
    }

    private handleRecurringAttacks(dt: number): void {
        let fistInterval = this.currentPhase === 3 ? 1.5 : (this.currentPhase === 2 ? 3.0 : 5.0);
        let kickInterval = this.currentPhase === 3 ? 2.0 : (this.currentPhase === 2 ? 4.0 : 7.0);
        let laserInterval = this.currentPhase === 3 ? 15.0 : 25.0;

        this.fistCooldown -= dt;
        this.kickCooldown -= dt;
        this.laserCooldown -= dt;

        // Spike frequency increases in later phases
        let spikeInterval = this.currentPhase === 3 ? 2.0 : (this.currentPhase === 2 ? 4.0 : 6.0);
        
        // --- 1. LASER ATTACK (Highest Priority) ---
        if (this.laserCooldown <= 0 && this.globalCooldown <= 0) {
            this.triggerLaser("Recurring Rotation", 5.0);
            this.laserCooldown = laserInterval; // Reset based on current phase
            this.globalCooldown = 1.0; 
            return; // Laser takes priority over limbs
        }

        // --- 2. FIST ATTACK ---
        if (this.fistCooldown <= 0 && this.globalCooldown <= 0) {
            const fist = this.fistPool.find(f => !f.active);
            if (fist) {
                this.spawnFist(fist);
                this.fistCooldown = fistInterval;
                this.globalCooldown = 0.5;
            }
        } 
        
        if (this.kickCooldown <= 0 && this.globalCooldown <= 0) {
            const kick = this.kickPool.find(k => !k.active);
            if (kick) {
                this.spawnKick(kick);
                this.kickCooldown = kickInterval;
                this.globalCooldown = 0.5;

                // SPECIAL: Always spawn a spike when a kick is triggered to ensure the player has a chance
                this.spawnSpike();
            }
        }

        // Random spike spawns (independent of kicks in higher phases)
        if (this.currentPhase >= 2 && Math.random() < (0.01 * this.currentPhase)) {
            this.spawnSpike();
        }
    }

    /**
     * Configures a Fist attack with overlap prevention.
     */
    private spawnFist(fist: ILimbEntity): void {
        const worldWidth = G.mapCols * TILE_SIZE;
        let chosenX = 0;
        let attempts = 0;

        // --- OVERLAP PREVENTION ---
        // Retry logic to ensure we don't spawn two fists directly on top of each other
        while (attempts < 3) {
            chosenX = 100 + Math.random() * (worldWidth - 200);
            const tooClose = this.fistPool.some(f => f.active && Math.abs(f.x - chosenX) < 120);
            if (!tooClose) break;
            attempts++;
        }

        fist.active = true;
        fist.state = 'telegraph';
        fist.x = chosenX;
        fist.y = 0;
        fist.width = 80;
        fist.height = 80;
        fist.timer = 1.5;
        console.log(`Baphometron: Fist targeted at X: ${Math.floor(chosenX)}`);
    }

    /**
     * Configures a Kick attack with side-based telegraph.
     */
    private spawnKick(kick: ILimbEntity): void {
        const worldWidth = G.mapCols * TILE_SIZE;
        kick.startSide = Math.random() > 0.5 ? 'left' : 'right';
        kick.active = true;
        kick.state = 'telegraph';
        kick.timer = 5.0; // Approval for 5s warn time
        kick.width = 250;
        kick.height = 160;
        
        // Initial position for telegraph visibility
        if (kick.startSide === 'left') {
            kick.x = 0;
        } else {
            kick.x = worldWidth - kick.width;
        }

        const groundY = (G.mapRows - 1) * TILE_SIZE;
        kick.y = groundY - kick.height;

        console.log(`Baphometron: Kick charging from ${kick.startSide} side!`);
    }

    private triggerLaser(context: string, duration: number = 5.0): void {
        console.log(`Baphometron: Triggering Scripted Laser (${context})`);
        this.isExecutingLaser = true;
        this.clearActiveHazards();
        this.scriptedEventTimer = duration;
    }

    private clearActiveHazards(): void {
        this.fistPool.forEach(f => f.active = false);
        this.kickPool.forEach(k => k.active = false);
    }

    /**
     * Exposes the spike pool for physics and rendering hooks.
     */
    public getSpikes(): ISpikeEntity[] {
        return this.spikePool;
    }

    /**
     * Exposes the limb pools for rendering hooks.
     */
    public getLimbs(): ILimbEntity[] {
        return [...this.fistPool, ...this.kickPool];
    }

    /**
     * Exposes the scripted event timer for visual synchronization.
     */
    public getScriptedTimer(): number {
        return this.scriptedEventTimer;
    }

    /**
     * Resets the entire encounter state for soft respawns.
     * Re-locks the arena and STANDS DOWN all active hazards.
     */
    public reset(): void {
        this.timeRemaining = 120.0;
        this.currentPhase = 1;
        this.hasFinished = false;
        this.isExecutingLaser = false;
        
        // Reset Cooldowns (including the GCD to prevent skips)
        this.globalCooldown = 0;
        this.fistCooldown = 5.0;
        this.kickCooldown = 7.0;
        this.laserCooldown = 20.0;
        this.scriptedEventTimer = 0;
        
        // Reset Scripted Event Flags
        this.laser30Triggered = false;
        
        // Cleanup all physical hazards
        this.clearActiveHazards();
        
        // Release the engine flags for Screen 2
        G.isBaphometronFightActive = false;

        // Clear Spike Pool
        this.spikePool.forEach(s => {
            s.active = false;
            s.state = 'inactive';
        });

        console.log("Baphometron: Stand-down executed. Resetting encounter.");
    }
}
