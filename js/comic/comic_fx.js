/**
 * The Last Light - Comic Visual FX & Onomatopoeia Engine
 * Comic sound effect splashes, jagged starbursts, panel frames, and narrative glitch warps
 */

class ComicEffect {
    constructor(text, x, y, options = {}) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = options.color || '#ffea00';
        this.textColor = options.textColor || '#111118';
        this.borderColor = options.borderColor || '#000000';
        this.scale = 0.2;
        this.maxScale = options.scale || 1.35;
        this.life = options.duration || 1.1;
        this.maxLife = this.life;
        this.rotation = (options.rotation !== undefined) ? options.rotation : (Math.random() - 0.5) * 0.35;
        this.style = options.style || 'burst'; // 'burst', 'bubble', 'cloud', 'lightning'
        this.vy = -0.55;
    }

    update(dt) {
        this.life -= dt;
        this.y += this.vy * dt * 60;

        const t = 1 - (this.life / this.maxLife);
        if (t < 0.2) {
            // Explosive pop-in
            this.scale = (t / 0.2) * this.maxScale;
        } else {
            // Gentle settle & fade
            this.scale = this.maxScale - (t - 0.2) * 0.15;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = Math.min(1, (this.life / this.maxLife) * 2.2);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = alpha;

        // Draw Comic Jagged Starburst Background
        if (this.style === 'burst') {
            this.drawBurst(ctx, this.color);
        }

        // Draw Comic Text
        ctx.font = '900 28px "Bangers", "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 3D Comic drop shadow
        ctx.fillStyle = '#000000';
        for (let ox = 2; ox <= 5; ox++) {
            ctx.fillText(this.text, ox, ox);
        }

        // Thick outline
        ctx.lineWidth = 7;
        ctx.strokeStyle = this.borderColor;
        ctx.strokeText(this.text, 0, 0);

        // Core text
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }

    drawBurst(ctx, fillColor) {
        const points = 14;
        const outerR = 64;
        const innerR = 40;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = (i % 2 === 0) ? outerR : innerR;
            const a = (i / (points * 2)) * Math.PI * 2;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Starburst shadow
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Main starburst body
        ctx.save();
        ctx.translate(-3, -3);
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class ComicFXManager {
    constructor() {
        this.effects = [];
        this.screenShake = 0;
        this.shakeDecay = 0.92;
        this.glitchIntensity = 0;
    }

    triggerShake(amount = 8) {
        this.screenShake = Math.max(this.screenShake, amount);
    }

    triggerGlitch(duration = 1.0) {
        this.glitchIntensity = duration;
        if (window.soundManager) window.soundManager.playRevealTwist();
    }

    spawn(text, x, y, options = {}) {
        const effect = new ComicEffect(text, x, y, options);
        this.effects.push(effect);
        if (window.soundManager) window.soundManager.playComicPop();
    }

    update(dt) {
        // Update screen shake
        if (this.screenShake > 0.05) {
            this.screenShake *= this.shakeDecay;
        } else {
            this.screenShake = 0;
        }

        // Update glitch
        if (this.glitchIntensity > 0) {
            this.glitchIntensity -= dt;
            if (this.glitchIntensity < 0) this.glitchIntensity = 0;
        }

        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const fx = this.effects[i];
            fx.update(dt);
            if (fx.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    applyCameraShake(ctx) {
        if (this.screenShake > 0.1) {
            const sx = (Math.random() - 0.5) * this.screenShake * 2;
            const sy = (Math.random() - 0.5) * this.screenShake * 2;
            ctx.translate(sx, sy);
        }
    }

    draw(ctx) {
        for (let fx of this.effects) {
            fx.draw(ctx);
        }

        // Draw Comic Glitch Lines if twist glitch is active
        if (this.glitchIntensity > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 30, 80, 0.12)';
            for (let i = 0; i < 4; i++) {
                const gy = Math.random() * 640;
                const gh = 4 + Math.random() * 20;
                ctx.fillRect(0, gy, 960, gh);
            }
            ctx.restore();
        }
    }

    drawPanelBorders(ctx, panels) {
        ctx.save();
        for (let p of panels) {
            // Draw Panel Border (Classic bold comic ink)
            ctx.strokeStyle = '#141724';
            ctx.lineWidth = 5;
            ctx.strokeRect(p.x, p.y, p.w, p.h);

            // Panel Header / Number
            if (p.title) {
                ctx.fillStyle = '#141724';
                ctx.fillRect(p.x, p.y, Math.min(140, p.w * 0.4), 22);

                ctx.fillStyle = '#f8f9fa';
                ctx.font = 'bold 11px "Impact", sans-serif';
                ctx.fillText(p.title.toUpperCase(), p.x + 8, p.y + 15);
            }

            // Dark panel indicator if unlit
            if (p.locked) {
                ctx.fillStyle = 'rgba(10, 12, 18, 0.85)';
                ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);

                ctx.fillStyle = '#6c757d';
                ctx.font = 'italic bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("[ RESTORE LIGHT TO REVEAL PANEL ]", p.x + p.w / 2, p.y + p.h / 2);
                ctx.textAlign = 'left';
            }
        }
        ctx.restore();
    }
}

window.comicFX = new ComicFXManager();
