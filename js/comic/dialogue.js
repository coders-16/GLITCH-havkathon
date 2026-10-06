/**
 * The Last Light - Comic Dialogue & Narration Engine
 * Authentic comic speech bubbles, narration boxes, typewriter reveals, and twist subversions
 */

class DialogueSystem {
    constructor() {
        this.activeDialogue = null;
        this.currentLineIndex = 0;
        this.displayedText = '';
        this.fullText = '';
        this.charIndex = 0;
        this.typeTimer = 0;
        this.typeSpeed = 0.025; // seconds per char
        this.isTyping = false;
        this.onCompleteCallback = null;

        // Narration box at the top or bottom of panel
        this.activeNarration = null;
        this.narrationDuration = 0;
    }

    startDialogue(dialogueData, onComplete = null) {
        this.activeDialogue = dialogueData;
        this.currentLineIndex = 0;
        this.onCompleteCallback = onComplete;
        this.loadCurrentLine();
    }

    loadCurrentLine() {
        if (!this.activeDialogue || this.currentLineIndex >= this.activeDialogue.lines.length) {
            this.closeDialogue();
            return;
        }

        const line = this.activeDialogue.lines[this.currentLineIndex];
        this.fullText = line.text;
        this.displayedText = '';
        this.charIndex = 0;
        this.isTyping = true;
        this.typeTimer = 0;

        if (window.soundManager) window.soundManager.playComicPop();
    }

    advance() {
        if (!this.activeDialogue) return;

        if (this.isTyping) {
            // Instantly complete current line
            this.displayedText = this.fullText;
            this.isTyping = false;
        } else {
            // Next line
            this.currentLineIndex++;
            this.loadCurrentLine();
        }
    }

    closeDialogue() {
        const callback = this.onCompleteCallback;
        this.activeDialogue = null;
        this.displayedText = '';
        this.fullText = '';
        this.onCompleteCallback = null;
        if (callback) callback();
    }

    setNarration(text, duration = 4.5, isTwist = false) {
        this.activeNarration = {
            text: text,
            duration: duration,
            maxDuration: duration,
            isTwist: isTwist
        };
        if (isTwist && window.comicFX) {
            window.comicFX.triggerGlitch(1.2);
            window.comicFX.triggerShake(5);
        }
    }

    update(dt) {
        // Update Dialogue Typewriter
        if (this.isTyping && this.fullText) {
            this.typeTimer += dt;
            while (this.typeTimer >= this.typeSpeed && this.charIndex < this.fullText.length) {
                this.typeTimer -= this.typeSpeed;
                this.charIndex++;
                this.displayedText = this.fullText.substring(0, this.charIndex);
                if (this.charIndex % 3 === 0 && window.soundManager) {
                    window.soundManager.playTypewriter();
                }
            }

            if (this.charIndex >= this.fullText.length) {
                this.isTyping = false;
            }
        }

        // Update Narration Box
        if (this.activeNarration) {
            this.activeNarration.duration -= dt;
            if (this.activeNarration.duration <= 0) {
                this.activeNarration = null;
            }
        }
    }

    draw(ctx) {
        // 1. Draw Narration Box if active
        if (this.activeNarration) {
            this.drawNarrationBox(ctx, this.activeNarration);
        }

        // 2. Draw Speech Bubble if active dialogue
        if (this.activeDialogue && this.activeDialogue.lines[this.currentLineIndex]) {
            const currentLine = this.activeDialogue.lines[this.currentLineIndex];
            this.drawSpeechBubble(ctx, currentLine);
        }
    }

    drawNarrationBox(ctx, narration) {
        ctx.save();
        const boxX = 220;
        const boxY = 24;
        const boxW = 520;
        const boxH = 46;

        // Shadow
        ctx.fillStyle = '#000000';
        ctx.fillRect(boxX + 4, boxY + 4, boxW, boxH);

        // Body: Classic yellow comic caption box (or glitched red if twist)
        ctx.fillStyle = narration.isTwist ? '#e63946' : '#fff3b0';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Bold comic border
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Caption Header Tag
        ctx.fillStyle = '#000000';
        ctx.fillRect(boxX, boxY, 80, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px "Impact", sans-serif';
        ctx.fillText(narration.isTwist ? 'GLITCH // MEMORY' : 'NARRATOR', boxX + 6, boxY + 12);

        // Caption Text
        ctx.fillStyle = narration.isTwist ? '#ffffff' : '#1d3557';
        ctx.font = 'bold 14px "Comic Neue", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(narration.text, boxX + boxW / 2, boxY + 28);

        ctx.restore();
    }

    drawSpeechBubble(ctx, line) {
        ctx.save();
        const speaker = line.speaker || 'UNKNOWN';
        const targetX = line.targetX !== undefined ? line.targetX : 480;
        const targetY = line.targetY !== undefined ? line.targetY : 320;

        // Bubble Position (smart clamp above speaker)
        let bubbleW = 340;
        let bubbleH = 88;
        let bubbleX = Math.max(30, Math.min(600, targetX - bubbleW / 2));
        let bubbleY = Math.max(60, targetY - bubbleH - 45);

        // Bubble Tail coordinates
        const tailTipX = targetX;
        const tailTipY = targetY - 10;
        const tailBaseX1 = bubbleX + bubbleW * 0.45;
        const tailBaseX2 = bubbleX + bubbleW * 0.55;
        const tailBaseY = bubbleY + bubbleH;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(bubbleX + 4, bubbleY + 4, bubbleW, bubbleH, 12);
        ctx.fill();

        // Bubble Body
        ctx.fillStyle = line.isGlitch ? '#ffe3e3' : '#ffffff';
        ctx.strokeStyle = line.isGlitch ? '#d90429' : '#141724';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 12);
        ctx.fill();
        ctx.stroke();

        // Bubble Tail
        ctx.beginPath();
        ctx.moveTo(tailBaseX1, tailBaseY - 1);
        ctx.lineTo(tailTipX, tailTipY);
        ctx.lineTo(tailBaseX2, tailBaseY - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Patch over tail border overlap
        ctx.fillStyle = line.isGlitch ? '#ffe3e3' : '#ffffff';
        ctx.fillRect(tailBaseX1 + 1, tailBaseY - 3, tailBaseX2 - tailBaseX1 - 2, 4);

        // Speaker Name Badge
        ctx.fillStyle = line.isGlitch ? '#d90429' : '#2b2d42';
        ctx.fillRect(bubbleX + 12, bubbleY - 10, 110, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "Impact", sans-serif';
        ctx.fillText(speaker.toUpperCase(), bubbleX + 18, bubbleY + 4);

        // Typewritten Dialogue text
        ctx.fillStyle = line.isGlitch ? '#b7094c' : '#1a1a24';
        ctx.font = '500 14px "Comic Neue", "Arial", sans-serif';
        this.wrapText(ctx, this.displayedText, bubbleX + 16, bubbleY + 30, bubbleW - 32, 19);

        // "Press SPACE/E or Click to continue" prompt
        if (!this.isTyping) {
            ctx.fillStyle = '#8d99ae';
            ctx.font = 'italic bold 10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('▼ [SPACE / CLICK]', bubbleX + bubbleW - 12, bubbleY + bubbleH - 8);
        }

        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currY);
                line = words[n] + ' ';
                currY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currY);
    }
}

window.dialogueSystem = new DialogueSystem();
