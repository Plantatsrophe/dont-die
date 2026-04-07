import { G, player, keys } from './globals.js';
import { playSound } from '../assets/audio.js';
/**
 * Timestamp of the last 'Down' input press.
 * Used to detect double-tap gestures for dropping through one-way platforms.
 */
let lastDownPressTime = 0;
/**
 * Processes a 'Down' input event.
 * If the user double-taps 'Down' within 300ms, it sets the 'droppingThrough'
 * flag which allows the physics engine to ignore one-way floor collisions for a brief window.
 *
 * @param el Optional UI element to highlight (useful for touch controls)
 */
export function processDownInput(el) {
    if (!keys.ArrowDown) {
        let now = Date.now();
        // Check for double-tap within 300ms window
        if (now - lastDownPressTime < 300) {
            player.droppingThrough = true;
            // Reset flag after 200ms to avoid falling through multiple floors indefinitely
            setTimeout(() => { player.droppingThrough = false; }, 200);
        }
        lastDownPressTime = now;
    }
    keys.ArrowDown = true;
    if (el)
        el.classList.add('active');
}
/**
 * Central jump logic used by keyboard, touch, and bot stomp events.
 * Manages the transition between grounded, climbing, and double-jump states.
 * Now includes support for Coyote Time and Jump Buffering.
 */
export function handleJump() {
    if (G.gameState !== 'PLAYING')
        return;
    // Normal Jump (Grounded, Climbing, or Coyote Time grace period)
    if (player.isOnGround || player.isClimbing || player.coyoteTimer > 0) {
        player.riding = null; // Instantly detach from any moving platform
        player.vy = player.jumpPower;
        player.isOnGround = false;
        player.isClimbing = false;
        player.doubleJump = true; // Empower the second jump
        player.coyoteTimer = 0; // Consume Coyote Time
        player.jumpBufferTimer = 0; // Clear any pending jump requests
        playSound('jump');
    }
    // Mid-air Double Jump
    else if (player.doubleJump) {
        player.riding = null;
        player.vy = player.jumpPower * 0.9; // Second jump is slightly less powerful (90%)
        player.doubleJump = false;
        playSound('jump');
    }
    // Jump Buffer fallback (missed timing)
    else {
        player.jumpBufferTimer = 0.15; // Remember intent for 150ms
    }
}
/**
 * Triggered when the jump key is released to allow for variable jump heights.
 * If the player is still ascending, cutting the velocity yields a shorter hop.
 */
export function handleJumpRelease() {
    if (player.vy < 0) {
        player.vy *= 0.5;
    }
}
