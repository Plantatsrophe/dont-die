/**
 * GLITCH BOSS PHYSICS UTILITIES
 * ----------------------------
 * Specialized math and analysis routines for the Level 79 encounter.
 * Includes Inverse Kinematics (IK) for trails and sprite-space anchor detection.
 */
/**
 * Inverse Kinematics (IK) physics chain for highly procedural fiber optics.
 * Allows strings to float like "living snakes" and prevents positional wrapping when turning.
 */
export function updateLivingChain(chain, targetLength, headX, headY, idealDist, waveOffset, windX = 0, windY = 0, wiggle = 0.5) {
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
        // TIP-SCALING: Movement becomes exponentially stronger towards the tips of the hair
        const tipFactor = (i / chain.length) * wiggle;
        p1.x += Math.sin(time + i * 0.5 + waveOffset) * tipFactor + windX;
        p1.y += Math.cos(time * 0.8 + i * 0.4 + waveOffset) * tipFactor + windY;
        // Autonomous life (wriggle and float like snakes, plus directional environmental wind)
        let dx = (p0.x - p1.x);
        let dy = (p0.y - p1.y);
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > idealDist) {
            let angle = Math.atan2(dy, dx);
            p1.x = p0.x - Math.cos(angle) * idealDist;
            p1.y = p0.y - Math.sin(angle) * idealDist;
        }
        // Apply environmental Forces (Gravity, wind, and horizontal wiggle)
        p1.y += (windY + Math.sin(time + waveOffset + i * 0.5) * wiggle);
        p1.x += (windX + Math.cos(time + waveOffset + i * 0.4) * wiggle);
    }
}
/**
 * Finds the X and Y peaks of the rider's hat (ID 10) in a 64x64 glitch sprite frame.
 */
export function findGlitchHatPeaks(frame) {
    let left = { minX: 99, maxX: -1, minY: 99, bestX: 25, bestY: 10 };
    let right = { minX: 99, maxX: -1, minY: 99, bestX: 31, bestY: 10 };
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 64; x++) {
            if (frame[y * 64 + x] === 10) {
                if (x < 32) {
                    if (y < left.minY) {
                        left.minY = y;
                        left.minX = x;
                        left.maxX = x;
                    }
                    else if (y === left.minY) {
                        left.minX = Math.min(left.minX, x);
                        left.maxX = Math.max(left.maxX, x);
                    }
                }
                else {
                    if (y < right.minY) {
                        right.minY = y;
                        right.minX = x;
                        right.maxX = x;
                    }
                    else if (y === right.minY) {
                        right.minX = Math.min(right.minX, x);
                        right.maxX = Math.max(right.maxX, x);
                    }
                }
            }
        }
    }
    if (left.minY !== 99) {
        left.bestX = (left.minX + left.maxX) / 2;
        left.bestY = left.minY;
    }
    if (right.minY !== 99) {
        right.bestX = (right.minX + right.maxX) / 2;
        right.bestY = right.minY;
    }
    return { x1: left.bestX, y1: left.bestY, x2: right.bestX, y2: right.bestY };
}
/**
 * Finds the Mane (Neck) and Tail (Rear) anchors on the horse's body.
 */
export function findGlitchBodyAnchors(frame) {
    let neck = { x: 38, y: 24, minY: 99 };
    let rear = { left: 10, right: 54, y: 50 };
    let minX = 99, maxX = -1;
    for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
            const p = frame[y * 64 + x];
            if (p === 18 || p === 11 || p === 17) {
                if (x < minX)
                    minX = x;
                if (x > maxX)
                    maxX = x;
                if (x > 20 && x < 45 && y > 15 && y < 35 && y < neck.minY) {
                    neck.minY = y;
                    neck.x = x;
                    neck.y = y;
                }
            }
        }
    }
    if (minX !== 99) {
        rear.left = minX;
        rear.right = maxX;
    }
    return { neck, rear };
}
