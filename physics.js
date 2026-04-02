function checkRectCollision(r1, r2) {
    return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
    );
}

function getCollidingTiles(rect) {
    let tiles = [];
    let startCol = Math.floor((rect.x + 0.0001) / TILE_SIZE);
    let endCol = Math.floor((rect.x + rect.width - 0.0001) / TILE_SIZE);
    let startRow = Math.floor((rect.y + 0.0001) / TILE_SIZE);
    let endRow = Math.floor((rect.y + rect.height - 0.0001) / TILE_SIZE);

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (row >= 0 && row < mapRows && col >= 0 && col < mapCols) {
                tiles.push({
                    row: row, col: col,
                    type: map[row][col],
                    rect: {
                        x: col * TILE_SIZE,
                        y: row * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE
                    }
                });
            }
        }
    }
    return tiles;
}

function playerDeath() {
    if (gameState === 'DYING') return;
    playSound('die');
    gameState = 'DYING';
    player.dyingTimer = 0;
    
    // Reset inputs immediately
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.Space = false;

    // Flush active hazard beams seamlessly logically intuitively explicitly securely!
    for (let l of laserPool) {
        l.active = false;
    }
    
    // Stop Masticator immediately upon player death correctly smoothly gracefully!
    if (boss && boss.active) {
        if (boss.type === 'masticator') {
            boss.phase = 0;
            boss.vx = 0;
            boss.hasSeenPlayer = false;
        }
        // Despawn all active shovel projectiles immediately!
        if (boss.projs) boss.projs = [];
    }

    // 4 Quadrant Fragmentation Matrix! dynamically allocated via strict pooling seamlessly!
    for (let i = 0; i < 4; i++) {
        let qx = (i % 2 === 0) ? 0 : 0.5;
        let qy = (i < 2) ? 0 : 0.5;
        let p = particlePool.find(pp => !pp.active);
        if (p) {
            p.active = true;
            p.type = 'playerQuad';
            p.qx = qx;
            p.qy = qy;
            p.x = player.x + (qx * player.width) + (player.width / 4);
            p.y = player.y + (qy * player.height) + (player.height / 4);
            p.vx = (qx === 0 ? -1 : 1) * (150 + Math.random() * 50);
            p.vy = (qy === 0 ? -1 : 1) * (150 + Math.random() * 50) - 100;
            p.size = Math.max(player.width, player.height) / 2;
            p.life = 1.5;
            p.maxLife = 2.0;
            p.flip = player.lastDir === -1;
        }
    }

    player.vx = 0;
    player.vy = 0;
    player.isOnGround = false;
    player.isClimbing = false;
}

function updatePhysics(dt) {
    if (gameState === 'DYING') {
        player.dyingTimer += dt;
        
        // Wait till shatter explicitly dissipates
        if (player.dyingTimer > 1.8) {
            player.lives--;
            if (player.lives <= 0) {
                stopBackgroundMusic();
                playSound('gameOver');
                gameState = 'GAMEOVER';
            } else {
                timer = 60;
                parseMap(false); // Preserve collected items across deaths
                resetPlayerPosition();
                if (boss && boss.active) {
                    boss.x = boss.startX !== undefined ? boss.startX : boss.x;
                    boss.y = boss.startY !== undefined ? boss.startY : boss.y;
                    boss.vx = 0;
                    boss.vy = 0;
                    boss.phase = 0;
                    boss.hasSeenPlayer = false;
                }
                gameState = 'PLAYING';
            }
        }
        return; // Halt ALL normal physics processing!
    }

    if (gameState === 'LEVEL_CLEAR') {
        // Fall into the portal dynamically securely gracefully instead of strictly walking!
        if (player.portalX !== undefined) {
            let targetX = player.portalX - player.width / 2;
            let targetY = player.portalY - player.height / 2 + 16;
            player.x += (targetX - player.x) * 4 * dt;
            player.y += (targetY - player.y) * 4 * dt;
        }
        player.vx = 0;
        player.vy = 0;

        // Camera follow
        camera.x = player.x - canvas.width / 2 + player.width / 2;
        if (camera.x > mapCols * TILE_SIZE - canvas.width) camera.x = mapCols * TILE_SIZE - canvas.width;
        if (camera.x < 0) camera.x = 0;

        camera.y = player.y - canvas.height / 2 + player.height / 2;
        if (camera.y > mapRows * TILE_SIZE - canvas.height) camera.y = mapRows * TILE_SIZE - canvas.height;
        if (camera.y < 0) camera.y = 0;

        winTimer += dt;
        if (winTimer > 2) { // Display win screen after walking out 2 seconds
            gameState = 'WIN';
        }
        return; // Halt normal physics
    }

    if (gameState === 'VALVE_CUTSCENE') {
        valveCutsceneTimer += dt;
        if (valveCutsceneTimer > 5.0) {
            gameState = 'PLAYING';
            activeValvePos = null;
            if (boss) boss.vibrateX = 0; // Solidify boss again
        }

        // Camera Pan Override (Focus on the pipe 40px below the valve)
        if (activeValvePos) {
            let targetX = activeValvePos.x - canvas.width / 2 + 16;
            let targetY = (activeValvePos.y + 40) - canvas.height / 2 + 16;
            camera.x += (targetX - camera.x) * 3 * dt;
            camera.y += (targetY - camera.y) * 3 * dt;

            // CRITICAL: Boundary Clamping (Prevents Browser Freeze)
            if (camera.x < 0) camera.x = 0;
            let maxCamX = mapCols * TILE_SIZE - canvas.width;
            if (camera.x > maxCamX) camera.x = maxCamX;
            if (camera.y < 0) camera.y = 0;
            let maxCamY = mapRows * TILE_SIZE - canvas.height;
            if (camera.y > maxCamY) camera.y = maxCamY;
        }
        
        // Vibrate boss during cutscene
        if (boss && boss.active) {
            boss.vibrateX = Math.sin(Date.now() * 0.05) * 8; 
        }

        return; // Halt ALL normal physics 
    }

    // Input Handling
    player.vx = 0;
    if (keys.ArrowLeft) player.vx = -player.speed;
    if (keys.ArrowRight) player.vx = player.speed;

    // Check ladders
    let ladderCheckRect = {x: player.x, y: player.y, width: player.width, height: player.height + 1};
    let clashingLadders = getCollidingTiles(ladderCheckRect);
    let clashingTiles = getCollidingTiles(player);
    let onLadder = false;
    let hitSpike = false;
    let hitGoal = false;

    for (let t of clashingLadders) {
        if (t.type === 2 || t.type === 6) onLadder = true;
    }
    for (let t of clashingTiles) {
        if (t.type === 3) {
            // Shrunken Spike Hitbox (bottom 20px, horizontally padded)
            let spikeHitbox = {
                x: t.rect.x + 8,
                y: t.rect.y + 20,
                width: 24,
                height: 20
            };
            if (checkRectCollision(player, spikeHitbox)) {
                hitSpike = true;
            }
        } else if (t.type === 15) {
            // Acid bounding rigidly kills explicitly 
            hitSpike = true;
        }
        if (t.type === 5) {
            hitGoal = true;
            player.portalX = t.rect.x + 16; // Center exactly horizontally implicitly elegantly
            player.portalY = t.rect.y + 16; // Center strictly explicitly!
        }
    }
    
    if (hitSpike) {
        playerDeath();
        return;
    }
    if (hitGoal && gameState !== 'LEVEL_CLEAR') {
        gameState = 'LEVEL_CLEAR';
        winTimer = 0;
        playSound('win');
        
        // Time Bonus: 100 points per remaining second
        player.score += timer * 100;
        
        return;
    }
    
    if (onLadder) {
        if (keys.ArrowUp || keys.ArrowDown) {
            player.isClimbing = true;
            player.doubleJump = false; // Climbing resets double jump
        }
    } else {
        player.isClimbing = false;
    }

    if (player.isClimbing) {
        player.vy = 0;
        if (keys.ArrowUp) player.vy = -player.speed * 0.6;
        if (keys.ArrowDown) player.vy = player.speed * 0.6;
    } else {
        player.vy += player.gravity * dt;
        if (player.vy > 800) player.vy = 800; // Terminal velocity
    }

    // Move X and Check Map Collisions
    player.x += player.vx * dt;
    let tilesAfterX = getCollidingTiles(player);
    for (let t of tilesAfterX) {
        if (t.type === 1) { // Wall
            let isFloating = t.col > 0 && t.col < mapCols - 1;
            if (mapRows === 15) {
                isFloating = isFloating && t.row > 0 && t.row < 13;
            } else if (mapRows === 60) {
                isFloating = isFloating && t.row > 0 && t.row < 59;
            }
            if (!isFloating) {
                if (player.vx > 0) { // moving right
                    player.x = t.rect.x - player.width;
                } else if (player.vx < 0) { // moving left
                    player.x = t.rect.x + t.rect.width;
                }
                player.vx = 0;
            }
        }
    }

    // Move Y and Check Map Collisions
    player.isOnGround = false;
    player.y += player.vy * dt;
    
    // Moving Platform Y-axis collision explicitly tracked natively organically!
    let onPlatform = false;
    for (let plat of platforms) {
        if (
            player.vy >= 0 && 
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            (player.y + player.height - player.vy * dt) <= plat.y + 4 // 4px leniency visually
        ) {
            player.y = plat.y - player.height;
            player.isOnGround = true;
            player.doubleJump = false;
            player.vy = 0;
            // Native momentum inheritance purely!
            player.x += plat.vx * dt;
            onPlatform = true;
            break;
        }
    }

    let tilesAfterY = getCollidingTiles(player);
    for (let t of tilesAfterY) {
        if (onPlatform) break; // Disable subsequent down-collisions if securely anchored!
        if (t.type === 1) { // Wall
            let isFloating = t.col > 0 && t.col < mapCols - 1;
            if (mapRows === 15) {
                isFloating = isFloating && t.row > 0 && t.row < 13;
            } else if (mapRows === 60) {
                isFloating = isFloating && t.row > 0 && t.row < 59;
            }
            
            if (isFloating) {
                if (player.vy > 0 && !player.droppingThrough) { // moving down cleanly structurally seamlessly!
                    let prevBottom = player.y - player.vy * dt + player.height;
                    if (prevBottom <= t.rect.y + 0.1) {
                        player.y = t.rect.y - player.height;
                        player.isOnGround = true;
                        player.doubleJump = false;
                        player.vy = 0;
                    }
                }
            } else {
                if (player.vy > 0) { // moving down mathematically explicitly!
                    player.y = t.rect.y - player.height;
                    player.isOnGround = true;
                    player.doubleJump = false;
                    player.vy = 0;
                } else if (player.vy < 0) { // moving up inherently natively explicitly natively nicely optimally!
                    player.y = t.rect.y + t.rect.height;
                    player.vy = 0;
                }
            }
        } else if (t.type === 6) { // Ladder Top
            if (player.vy > 0 && !keys.ArrowDown) { // moving down, and NOT pressing down to climb
                let prevBottom = player.y - player.vy * dt + player.height;
                if (prevBottom <= t.rect.y + 0.1) {
                    player.y = t.rect.y - player.height;
                    player.isOnGround = true;
                    player.doubleJump = false;
                    player.vy = 0;
                }
            }
        }
    }
    
    // Play Footstep Audio 
    if (player.isOnGround && player.vx !== 0 && !player.isClimbing) {
        player.walkTimer += dt;
        if (player.walkTimer > 0.15) {
            playSound('playerMove');
            player.walkTimer = 0;
        }
    } else {
        player.walkTimer = 0;
    }

    // Bounds check
    if (player.y > mapRows * TILE_SIZE) playerDeath(); // Adjusted death line natively tied to lowest chunk organically
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > mapCols * TILE_SIZE) player.x = mapCols * TILE_SIZE - player.width;
    
    updateBoss(dt);
    updateBombs(dt);
}

function updateBoss(dt) {
    if (!boss || !boss.active || (boss.hp <= 0 && !boss.isSinking)) return;
    
    // Boss takes damage natively explicitly organically!
    if (boss.hurtTimer > 0) boss.hurtTimer -= dt;
    
    // Collision with player securely implicitly!
    let bRect = {x: boss.x + 20, y: boss.y + 20, width: boss.width - 40, height: boss.height - 40};
    if (checkRectCollision(player, bRect)) {
        playerDeath();
    }
    
    boss.timer += dt;
    
    if (boss.type === 'masticator') {
        if (boss.phase === 0) { // Idle/Waiting
            boss.vx = 0;
            // Activate when visible on screen or if already triggered
            if (boss.hasSeenPlayer || (boss.x > camera.x && boss.x < camera.x + 800)) {
                boss.hasSeenPlayer = true;
                boss.phase = 1;
                boss.vx = (player.x < boss.x) ? -300 : 300;
                playSound('shoot'); 
            }
        } else if (boss.phase === 1) { // Charging
            boss.x += boss.vx * dt;
            
            let startCol = Math.floor(boss.x / TILE_SIZE);
            let endCol = Math.floor((boss.x + boss.width) / TILE_SIZE);
            let startRow = Math.floor(boss.y / TILE_SIZE);
            let endRow = Math.floor((boss.y + boss.height) / TILE_SIZE);
            
            let hitPillar = false;
            let hitCol = -1;
            
            for(let r=startRow; r<=endRow; r++) {
                for(let c=startCol; c<=endCol; c++) {
                    if (map[r] && map[r][c] !== 0 && map[r][c] !== undefined && r < 13) {
                        if (map[r][c] === 1) {
                            hitPillar = true;
                            hitCol = c;
                        }
                        
                        // Spawn crumbling bricks
                        let p = particlePool.find(pp => !pp.active);
                        if (p) {
                            p.active = true; p.type = 'normal'; p.size = 12;
                            p.x = c * TILE_SIZE + 20; p.y = r * TILE_SIZE + 20;
                            p.vx = (Math.random()-0.5)*500; p.vy = -300 - Math.random()*300;
                            p.color = '#B0B0B0'; p.life = 1.0; p.maxLife = 1.0;
                        }
                        map[r][c] = 0; // Boss consumes the tile
                        isMapCached = false;
                    }
                }
            }
            
            if (hitPillar) {
                // Destroy the entire vertical pillar
                for (let pr = 12; pr >= 0; pr--) {
                    let rowStr = staticLevels[currentLevel].map[pr];
                    if (rowStr && rowStr[hitCol] === '1') {
                        map[pr][hitCol] = 0;
                        
                        // Mutate static map data permanently to prevent respawns
                        staticLevels[currentLevel].map[pr] = rowStr.substring(0, hitCol) + "0" + rowStr.substring(hitCol + 1);

                        let p = particlePool.find(pp => !pp.active);
                        if (p) {
                            p.active = true; p.type = 'normal'; p.size = 12;
                            p.x = hitCol * TILE_SIZE + 20; p.y = pr * TILE_SIZE + 20;
                            p.vx = (Math.random()-0.5)*500; p.vy = -300 - Math.random()*300;
                            p.color = '#B0B0B0'; p.life = 1.0; p.maxLife = 1.0;
                        }
                    }
                }
                isMapCached = false;
                
                // Stunned
                boss.phase = 2;
                boss.vx = 0; boss.timer = 0; 
                playSound('explosion');
                
                // Trigger bomb drop
                for (let b of bombs) {
                    if (!b.active && Math.abs(b.col - hitCol) <= 3) {
                        b.active = true;
                        b.vx = (boss.x + boss.width/2 > b.x) ? 50 : -50; 
                    }
                }
            } else {
                // Check if the player successfully juked behind the boss
                if ((boss.vx > 0 && player.x + player.width < boss.x) || 
                    (boss.vx < 0 && player.x > boss.x + boss.width)) {
                    boss.phase = 3; // Skidding delay phase
                    boss.timer = 0;
                }
            }
        } else if (boss.phase === 3) {
            // Skidding physics
            boss.vx *= 0.9; 
            boss.x += boss.vx * dt;
            if (boss.timer > 0.4) {
                boss.phase = 1; // Resume charging natively
                boss.vx = (player.x < boss.x) ? -300 : 300;
                playSound('shoot');
            }
        } else if (boss.phase === 2) { // Stunned timer
            if (boss.timer > 3.0) {
                boss.phase = 0; // Ready to charge again
                boss.timer = 0;
            }
        }
    } else if (boss.type === 'septicus') {
        // Advanced Septicus AI: Tracking, Jumping, and Shovel Throwing
        
        // --- SINKING DEATH CUTSCENE ---
        if (boss.isSinking) {
            boss.timer += dt;
            boss.y += 80 * dt; // Cinematic SLOW SINK (800px deep over 10s)
            if (boss.timer > 10.0) { // Sinking takes longer to reach depths
                // Finalize death after 5 seconds
                boss.isSinking = false; // Stop sinking loop
                boss.active = false; // FINALLY DEACTIVATE
            }
            return; // EXIT Septicus block immediately! This prevents fall-through to Rising AI or Player-freezing early returns.
        } else if (!boss.triggered) {
            // Trigger when player is past the start and likely on the first moving platform
            if (player.x > TILE_SIZE * 12) {
                boss.triggered = true;
                boss.x = player.x - boss.width/2; // Emerge directly under player!
                playSound('powerup'); // Sound for trigger
            }
            boss.vx = 0; boss.vy = 0;
            return; // Stay hidden
        }
        
        // Rising Animation
        if (boss.y > boss.startY) {
            boss.y -= 350 * dt; // Faster, more surprising emergence!
            if (boss.y < boss.startY) boss.y = boss.startY;
            return; // Don't attack while rising
        }

        // --- SAFE ZONE LOGIC ---
        // Stop all attacks and tracking if player retreats to the starting ledge
        if (player.x < TILE_SIZE * 11) {
            boss.vx = 0;
            boss.phase = 0;
            boss.timer = 0;
            // Apply gravity so he stays grounded
            boss.y += boss.vy * dt;
            if (boss.y > boss.startY) {
                boss.y = boss.startY;
                boss.vy = 0;
            } else {
                boss.vy += 800 * dt;
            }
            return; 
        }

        // Apply Gravity to Boss for Jumping
        if (!boss.vy) boss.vy = 0;
        boss.y += boss.vy * dt;
        if (boss.y > boss.startY) {
            boss.y = boss.startY;
            boss.vy = 0;
        } else {
            boss.vy += 800 * dt; // Gravity
        }

        let reach = 140;
        let dist = Math.abs(player.x - (boss.x + boss.width/2));
        
        if (boss.phase === 0) { // Tracking
            let trackSpeed = (boss.hp < 3) ? 140 : 100; // Faster in lower HP
            if (player.x < boss.x + boss.width/2) boss.vx = -trackSpeed;
            else boss.vx = trackSpeed;
            boss.x += boss.vx * dt;
            
            // Limit boss to floor area
            boss.x = Math.max(TILE_SIZE * 10, Math.min(TILE_SIZE * 90, boss.x));
            
            // JUMPING logic (HP 2 or less)
            if (boss.hp <= 2 && boss.y >= boss.startY && player.y < boss.y - 120 && Math.random() < 0.02) {
                boss.vy = -600; // Jump high!
            }

            // PHASE CHANGE logic
            if (boss.hp === 1 && boss.timer > (boss.projs?.length > 0 ? 0 : 3.0)) {
                boss.phase = 3; // Throw Shovel Barrage
                boss.timer = 0;
                boss.throwsLeft = 3; // Multi-throw barrage!
            } else if (dist < reach && boss.timer > 2) {
                boss.phase = 1; // Wind-up
                boss.timer = 0;
                boss.vx = 0;
            }
        } else if (boss.phase === 1) { // Wind-up
            if (boss.timer > 0.8) {
                boss.phase = 2; // Swing
                boss.timer = 0;
                playSound('shoot'); // Reuse sound for swing
            }
        } else if (boss.phase === 2) { // Swing
            if (boss.timer > 1.0) {
                boss.phase = 0; // Back to tracking
                boss.timer = 0;
            }
            
            // Shovel Collision Logic
            let swingAngle = boss.timer * Math.PI; // 0 to 180 degrees
            let shovelX = (boss.x + boss.width/2) + Math.cos(swingAngle) * reach * (player.x < boss.x ? -1 : 1);
            let shovelY = (boss.y + boss.height/2) - Math.sin(swingAngle) * reach;
            
            let dx = player.x + player.width/2 - shovelX;
            let dy = player.y + player.height/2 - shovelY;
            if (Math.sqrt(dx*dx + dy*dy) < 22) {
                playerDeath();
            }
        } else if (boss.phase === 3) { // Throw Shovel Barrage (HP 1 only)
            if (!boss.projs) boss.projs = [];
            
            // Allow Chasing during barrage
            let trackSpeed = 140;
            if (player.x < boss.x + boss.width/2) boss.vx = -trackSpeed;
            else boss.vx = trackSpeed;
            boss.x += boss.vx * dt;
            boss.x = Math.max(TILE_SIZE * 10, Math.min(TILE_SIZE * 90, boss.x));

            if (boss.timer > 0.6 && boss.throwsLeft > 0) { // Fast barrage
                boss.timer = 0;
                boss.throwsLeft--;
                
                // Linear Aiming Logic (Fast, no gravity compensation needed)
                let tx = player.x + player.width/2;
                let ty = player.y + player.height/2;
                let bx = boss.x + boss.width/2;
                let by = boss.y + boss.height/2;
                
                let dx = tx - bx;
                let dy = ty - by;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                let speed = 600; 
                let aimedVx = (dx / dist) * speed; 
                let aimedVy = (dy / dist) * speed;
                
                boss.projs.push({ x: bx, y: by, vx: aimedVx, vy: aimedVy, timer: 0, linear: true });
                playSound('shoot');
            }
            
            if (boss.throwsLeft <= 0 && boss.timer > 1.5) {
                boss.phase = 0;
                boss.timer = 0;
            }
        } else if (boss.isSinking) {
            // No attacks while sinking
        }

        // Global Boss Projectiles Update (Always update if any exist)
        if (boss.projs) {
            for (let i = boss.projs.length - 1; i >= 0; i--) {
                let p = boss.projs[i];
                if (!p) break; // Array was cleared mid-loop by playerDeath()
                p.timer += dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (!p.linear) p.vy += 600 * dt; // Gravity on normal shovels

                // Precise Collision with projectile
                let pdx = player.x + player.width/2 - p.x;
                let pdy = player.y + player.height/2 - p.y;
                if (Math.sqrt(pdx*pdx + pdy*pdy) < 25) {
                    playerDeath();
                }

                // Remove far-off projectiles
                if (p.y > boss.startY + 400 || p.x < 0 || p.x > mapCols * TILE_SIZE) {
                    boss.projs.splice(i, 1);
                }
            }
        }
    } else if (boss.type === 'warden') {
        // Shaft Boss 
        if (player.y < boss.y) boss.y -= 70 * dt;
        boss.x += Math.cos(boss.timer * 4) * 80 * dt;
    } else if (boss.type === 'core') {
        // Laser Boss 
        if (boss.timer > 1.5) {
            boss.timer = 0;
            let l = laserPool.find(lp => !lp.active);
            if (l) {
                l.active = true; l.width = 16; l.height = 8;
                l.x = boss.x + boss.width/2;
                l.y = player.y + player.height/2; 
                l.vx = (Math.random() > 0.5 ? -250 : 250);
                playSound('shoot');
            }
        }
    } else if (boss.type === 'goliath') {
        boss.x = Math.max(boss.x, camera.x - 30); 
        if (boss.timer > 2.0 && gameState !== 'CREDITS_CUTSCENE' && gameState !== 'CREDITS') {
            boss.timer = 0;
            // Sweep rockets
            for(let i=0; i<3; i++) {
                let l = laserPool.find(lp => !lp.active);
                if (l) {
                    l.active = true; l.width = 30; l.height = 15;
                    l.x = boss.x + boss.width;
                    l.y = boss.y + 40 + (i*40);
                    l.vx = 400 + Math.random()*100;
                }
            }
            playSound('shoot');
        }
    }
}

function bossExplode() {
    if (boss.type === 'septicus' && !boss.isSinking && boss.hp <= 0) {
        boss.isSinking = true;
        boss.timer = 0;
        boss.vx = 0; boss.vy = 0;
        boss.vibrateX = 0; // Solidify for final sink
        if (boss.projs) boss.projs = []; // DESPAWN all frozen shovels immediately!
        isMapCached = false; // Refresh map for victory blue
        playSound('gameOver');
        // Fall through to common portal/item logic below!
    } else if (boss.isSinking) {
        return; // Already sinking, don't re-trigger
    } else {
        boss.active = false; 
        playSound('gameOver'); 
    }
    
    // Common Explosion Particles for ALL bosses
    for (let i=0; i<40; i++) {
        let p = particlePool.find(pp => !pp.active);
        if (p) {
            p.active = true; p.type = 'normal'; p.size = 15;
            p.x = boss.x + Math.random()*boss.width; p.y = boss.y + Math.random()*boss.height;
            p.vx = (Math.random()-0.5)*500; p.vy = (Math.random()-0.5)*500;
            p.life = 1.0; p.maxLife = 1.0;
        }
    }
    
    for (let it of items) {
        if (it.type === 'valve' || it.type === 'detonator') it.collected = true;
    }
    
    // Open the portal gracefully inherently!
    if (boss.type !== 'goliath') {
        let pCol = Math.floor((boss.x+boss.width/2) / TILE_SIZE);
        let pRow = Math.floor((boss.y+boss.height) / TILE_SIZE);
        
        // Portal Placement Overrides
        if (boss.type === 'septicus') {
            pCol = 98; // Far right inherent natively!
            pRow = 11;
            
            // Build bridge staircase for safe descent
            // From Valve 3 (row 4, col 80ish) down to Exit (row 11, col 90ish)
            for (let i = 0; i < 6; i++) {
                let brRow = 5 + i;
                let brCol = 82 + i * 2;
                if (map[brRow]) {
                    map[brRow][brCol] = 1;
                    map[brRow][brCol + 1] = 1;
                }
            }
        }
        
        map[Math.max(0, pRow-1)][pCol] = 5;
        isMapCached = false;
    }
}

function updateBombs(dt) {
    for (let b of bombs) {
        if (!b.active) continue;

        // Apply Gravity
        b.vy += 800 * dt;
        
        // Track the boss horizontally securely  
        if (boss && boss.active) {
            let targetX = boss.x + boss.width / 2 - b.width / 2;
            b.x += (targetX - b.x) * 10 * dt; // Perfect tracking homing smoothly
            b.vx = 0; 
        }
        
        b.y += b.vy * dt;
        
        // Collision with Stunned Boss seamlessly
        if (boss && boss.active && checkRectCollision(b, boss)) {
            b.active = false;
            b.y = -9999; // Remove from play 
            playSound('explosion');
            
            // Blast Bomb Particles visually 
            for (let i = 0; i < 20; i++) {
                let p = particlePool.find(pp => !pp.active);
                if (p) {
                    p.active = true; p.type = 'explosion'; p.size = 12;
                    p.x = b.x + 16; p.y = b.y + 16;
                    p.vx = (Math.random()-0.5)*400; p.vy = (Math.random()-0.5)*400;
                    p.life = 0.8; p.maxLife = 0.8;
                }
            }
            
            // Damage the boss unconditionally
            boss.hp--;
            boss.hurtTimer = 0.5;
            if (boss.hp <= 0) bossExplode();
        }
    }
}


