import { G, player } from './globals.js';
import { checkRectCollision, playerDeath } from './physics_utils.js';
/**
 * Handles the logic for dynamic hazards in the Virtual biome (bId 3).
 * Includes toggling Corrupted Memory Sectors and expanding Malware Nodes.
 *
 * @param dt Delta time for interval tracking
 */
export function updateVirtualHazards(dt) {
    // Only execute if inside the Virtual Biome (bId 3)
    if (Math.floor(G.currentLevel / 20) % 5 !== 3)
        return;
    // 1. Corrupted Memory Sectors (Flickering deadly zones)
    for (let s of G.corruptedSectors) {
        s.timer -= dt;
        if (s.timer <= 0) {
            s.isActive = !s.isActive;
            s.timer = s.toggleInterval;
        }
        if (s.isActive && checkRectCollision(player, s)) {
            playerDeath();
            return;
        }
    }
    // 2. Malware Nodes (Triggered proximity mines)
    for (let n of G.malwareNodes) {
        let dx = (player.x + player.width / 2) - n.x;
        let dy = (player.y + player.height / 2) - n.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (n.state === 'IDLE') {
            if (dist < n.triggerDistance)
                n.state = 'EXPANDING';
        }
        else if (n.state === 'EXPANDING') {
            n.radius += 300 * dt;
            if (dist < n.radius) {
                playerDeath();
                return;
            }
            if (n.radius >= n.maxRadius) {
                n.state = 'COOLDOWN';
                n.cooldownTimer = 1.0;
            }
        }
        else if (n.state === 'COOLDOWN') {
            n.cooldownTimer -= dt;
            n.radius = Math.max(8, n.radius - 200 * dt); // Visual shrink
            if (n.cooldownTimer <= 0) {
                n.state = 'IDLE';
                n.radius = 8;
            }
        }
    }
}
