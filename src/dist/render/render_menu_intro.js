import { G, canvas, ctx, introText } from '../core/globals.js';
/**
 * Intro Crawl: Scrolling text backstory.
 */
export function renderIntroScreen() {
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px "Press Start 2P", sans-serif';
    ctx.fillStyle = '#f1c40f';
    let paragraphs = introText.split('\n'), yCursor = G.introY, lineHeight = 28, maxWidth = canvas.width - 120;
    for (let j = 0; j < paragraphs.length; j++) {
        let line = '', words = paragraphs[j].split(' ');
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                ctx.fillText(line, canvas.width / 2, yCursor);
                line = words[n] + ' ';
                yCursor += lineHeight;
            }
            else
                line = testLine;
        }
        ctx.fillText(line, canvas.width / 2, yCursor);
        yCursor += lineHeight * 2;
    }
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", sans-serif';
        ctx.fillText('PRESS ENTER OR TOUCH TO SKIP', canvas.width / 2, canvas.height - 30);
    }
    ctx.restore();
}
