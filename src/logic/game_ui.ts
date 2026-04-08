import { G, canvas } from '../core/globals.js';
import { parseMap, resetFullGame, resetPlayerPosition } from './spawning/spawner.js';

/**
 * Central UI State Machine.
 * Handles the "Enter" or "Accept" button logic across all game screens
 * (Start, Instructions, Win, Game Over, High Scores).
 */
export function handleUIAccept() {
    if (G.gameState === 'ENTER_INITIALS') { 
        window.saveScore(); 
        resetFullGame(); 
        G.gameState = 'START'; 
    }
    else if (G.gameState === 'WIN') { 
        G.currentLevel++; 
        if (G.currentLevel >= 99) G.currentLevel = 0; 
        G.timer = 60; 
        parseMap(); 
        resetPlayerPosition(); 
        G.gameState = 'PLAYING'; 
    }
    else if (G.gameState === 'GAMEOVER' || G.gameState === 'CREDITS') { 
        G.gameState = 'ENTER_INITIALS'; 
    }
    else if (G.gameState === 'START') { 
        G.introY = canvas.height * 0.66; 
        G.gameState = 'INTRO'; 
    }
    else if (G.gameState === 'INTRO') { 
        G.gameState = 'INSTRUCTIONS'; 
    }
    else if (G.gameState === 'INSTRUCTIONS') { 
        G.currentLevel = 0; 
        resetFullGame(); 
        G.gameState = 'PLAYING'; 
    }
}
