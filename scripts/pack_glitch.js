import fs from 'fs';
import path from 'path';

// Read the sprites file
const content = fs.readFileSync('src/assets/sprites_glitch.ts', 'utf8');

// Extract arrays using regex
function getArray(name) {
    const match = content.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\];`));
    if (!match) return [];
    return match[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

const frames = [
    getArray('sprGlitch1'),
    getArray('sprGlitch2'),
    getArray('sprGlitch3'),
    getArray('sprGlitch4')
];

// Convert to a base64-encoded byte string for the HTML
// Each pixel is one byte (0-255)
const buffer = Buffer.alloc(frames.length * 4096);
frames.forEach((frame, i) => {
    frame.forEach((val, j) => {
        buffer[i * 4096 + j] = val;
    });
});

const base64Data = buffer.toString('base64');

// Wrap in a script file
fs.writeFileSync('tmp/glitch_data.js', `window.GLITCH_DATA = "${base64Data}";`);
console.log("Packed Glitch data to tmp/glitch_data.js");
