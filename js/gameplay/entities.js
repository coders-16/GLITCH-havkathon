/**
 * The Last Light - Gameplay Entities
 * Lumi (player spark), Streetlamps, Rotatable Mirrors, Receptors, Shadow Creatures, NPCs, Memory Glyphs
 */

class PlayerLumi {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.vx = 0;
        this.vy = 0;
        this.speed = 210;
        this.lightRadius = 115;
        this.energy = 100;
        this.maxEnergy = 100;
        this.isFlaring = false;
        this.flareTimer = 0;
        this.flareCooldown = 0;
        this.stepTimer = 0;
        this.animTimer = 0;
        this.facing = 1; // 1: right, -1: left
    }

    update(dt, input, walls) {
        this.animTimer += dt;

        // Flare timer countdown
        if (this.isFlaring) {
            this.flareTimer -= dt;
            if (this.flareTimer <= 0) {
                this.isFlaring = false;
            }
        }
        if (this.flareCooldown > 0) {
            this.flareCooldown -= dt;
        }

        // Energy passive regeneration if near lit lamps, or slow drain on flare
        if (!this.isFlaring && this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + dt * 10);
        }

        // Handle Movement
        let dx = 0;
        let dy = 0;
        if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        if (dx > 0) this.facing = 1;
        else if (dx < 0) this.facing = -1;

        // Acceleration & friction
        const accel = 1200;
        this.vx += dx * accel * dt;
        this.vy += dy * accel * dt;

        this.vx *= 0.82;
        this.vy *= 0.82;

        // Move with collision against walls
        const newX = this.x + this.vx * dt;
        if (!this.checkWallCollision(newX, this.y, walls)) {
            this.x = newX;
        } else {
            this.vx = 0;
        }

        const newY = this.y + this.vy * dt;
        if (!this.checkWallCollision(this.x, newY, walls)) {
            this.y = newY;
        } else {
            this.vy = 0;
        }

        // Emit ember particles
        if (Math.hypot(this.vx, this.vy) > 10) {
            this.stepTimer += dt;
            if (this.stepTimer > 0.08) {
                this.stepTimer = 0;
                if (window.particleSystem) {
                    window.particleSystem.emitSparks(this.x, this.y, 1);
                }
                if (window.soundManager) {
                    window.soundManager.playFootstep();
                }
            }
        }

        // Flare particles
        if (this.isFlaring && Math.random() < 0.4 && window.particleSystem) {
            window.particleSystem.emitSparks(this.x, this.y, 2);
        }
    }

    triggerFlare() {
        if (this.flareCooldown > 0 || this.energy < 25) return false;

        this.energy -= 25;
        this.isFlaring = true;
        this.flareTimer = 1.2;
        this.flareCooldown = 1.6;

        if (window.soundManager) window.soundManager.playFlare();
        if (window.particleSystem) window.particleSystem.emitFlareBurst(this.x, this.y);
        if (window.comicFX) {
            window.comicFX.spawn('FLASH!', this.x, this.y - 35, { color: '#ffea00' });
            window.comicFX.triggerShake(4);
        }
        return true;
    }

    checkWallCollision(testPointX, testPointY, walls) {
        for (let wall of walls) {
            // Circle vs Rect
            const closestX = Math.max(wall.x, Math.min(testPointX, wall.x + wall.w));
            const closestY = Math.max(wall.y, Math.min(testPointY, wall.y + wall.h));
            const distanceX = testPointX - closestX;
            const distanceY = testPointY - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
            if (distanceSquared < (this.radius * this.radius)) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Subtle floating pulse
        const floatY = Math.sin(this.animTimer * 5) * 3;
        ctx.translate(0, floatY);

        // Core Golden Halo with comic stroke
        const pulse = Math.sin(this.animTimer * 8) * 2;
        const currentRadius = this.radius + pulse;

        // Outer comic spark aura
        ctx.fillStyle = this.isFlaring ? '#ffea00' : '#ffd166';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;

        // Draw comic teardrop/spark flame shape
        ctx.beginPath();
        ctx.moveTo(0, -currentRadius * 1.5);
        ctx.bezierCurveTo(currentRadius * 1.3, -currentRadius * 0.5, currentRadius * 1.3, currentRadius, 0, currentRadius * 1.2);
        ctx.bezierCurveTo(-currentRadius * 1.3, currentRadius, -currentRadius * 1.3, -currentRadius * 0.5, 0, -currentRadius * 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner brilliant white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 2, currentRadius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Expressive comic eyes
        const eyeOffsetX = this.facing * 4;
        ctx.fillStyle = '#111118';

        // Blinking
        const isBlinking = (Math.floor(this.animTimer * 3.5) % 12 === 0);
        if (isBlinking) {
            ctx.fillRect(eyeOffsetX - 5, 0, 4, 1.5);
            ctx.fillRect(eyeOffsetX + 1, 0, 4, 1.5);
        } else {
            ctx.beginPath();
            ctx.arc(eyeOffsetX - 3, 0, 2.5, 0, Math.PI * 2);
            ctx.arc(eyeOffsetX + 3, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Eye sparkle highlights
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(eyeOffsetX - 4, -1, 1.2, 1.2);
            ctx.fillRect(eyeOffsetX + 2, -1, 1.2, 1.2);
        }

        ctx.restore();
    }
}

class StreetLamp {
    constructor(x, y, id, initiallyActive = false) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.active = initiallyActive;
        this.radius = 165;
        this.w = 32;
        this.h = 64;
    }

    ignite() {
        if (this.active) return false;
        this.active = true;
        if (window.soundManager) window.soundManager.playLampIgnite();
        if (window.particleSystem) window.particleSystem.emitLampBurst(this.x, this.y - 25);
        if (window.comicFX) {
            window.comicFX.spawn('BZZZZT!', this.x, this.y - 45, { color: '#ffd166' });
            window.comicFX.triggerShake(5);
        }
        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Lamp Post Base & Pole (Comic ink style)
        ctx.fillStyle = '#1c1f2e';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        // Base
        ctx.beginPath();
        ctx.roundRect(-10, 8, 20, 8, 3);
        ctx.fill();
        ctx.stroke();

        // Pole
        ctx.fillRect(-3, -24, 6, 32);
        ctx.strokeRect(-3, -24, 6, 32);

        // Lantern Housing
        ctx.beginPath();
        ctx.moveTo(-12, -24);
        ctx.lineTo(12, -24);
        ctx.lineTo(8, -42);
        ctx.lineTo(-8, -42);
        ctx.closePath();

        ctx.fillStyle = this.active ? '#fff3b0' : '#3d405b';
        ctx.fill();
        ctx.stroke();

        // Lantern Cap
        ctx.beginPath();
        ctx.arc(0, -44, 9, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = '#1c1f2e';
        ctx.fill();
        ctx.stroke();

        // Glowing Glass Core if active
        if (this.active) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -32, 6, 0, Math.PI * 2);
            ctx.fill();

            // Tiny light sparkles around lantern
            const t = Date.now() * 0.003;
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(Math.cos(t) * 12 - 1, -32 + Math.sin(t) * 8 - 1, 2, 2);
        } else {
            // Prompt to kindle
            ctx.fillStyle = '#ffd166';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[SPACE]', 0, 26);
        }

        ctx.restore();
    }
}

class Mirror {
    constructor(x, y, angleDeg = 45, length = 44) {
        this.x = x;
        this.y = y;
        this.angleDeg = angleDeg; // 0, 45, 90, 135, etc.
        this.length = length;
        this.radius = 24;
    }

    rotate() {
        this.angleDeg = (this.angleDeg + 45) % 360;
        if (window.soundManager) window.soundManager.playMirrorTurn();
        if (window.comicFX) {
            window.comicFX.spawn('CLACK!', this.x, this.y - 28, { color: '#06d6a0' });
        }
    }

    getNormal(incidentAngle) {
        // Normal perpendicular to mirror face
        const mirrorAngleRad = (this.angleDeg * Math.PI) / 180;
        // Two possible normals: +90° or -90°
        const n1 = mirrorAngleRad + Math.PI / 2;
        const n2 = mirrorAngleRad - Math.PI / 2;

        // Choose the normal pointing against incident ray
        const cosDiff1 = Math.cos(incidentAngle - n1);
        return (cosDiff1 < 0) ? n1 : n2;
    }

    getStartPoint() {
        const rad = (this.angleDeg * Math.PI) / 180;
        return {
            x: this.x - Math.cos(rad) * (this.length / 2),
            y: this.y - Math.sin(rad) * (this.length / 2)
        };
    }

    getEndPoint() {
        const rad = (this.angleDeg * Math.PI) / 180;
        return {
            x: this.x + Math.cos(rad) * (this.length / 2),
            y: this.y + Math.sin(rad) * (this.length / 2)
        };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Circular brass mounting base
        ctx.fillStyle = '#8d99ae';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotate to mirror angle
        ctx.rotate((this.angleDeg * Math.PI) / 180);

        // Mirror backing
        ctx.fillStyle = '#2b2d42';
        ctx.fillRect(-this.length / 2, -5, this.length, 10);
        ctx.strokeRect(-this.length / 2, -5, this.length, 10);

        // Reflective Silver / Cyan Face
        ctx.fillStyle = '#e0fbfc';
        ctx.fillRect(-this.length / 2 + 2, -2, this.length - 4, 4);

        // Highlight sheen
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -2, 16, 2);

        ctx.restore();

        // Interaction hint
        ctx.fillStyle = '#90e0ef';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[CLICK / E]', this.x, this.y + 24);
    }
}

class SolarReceptor {
    constructor(x, y, id, label = 'RECEPTOR') {
        this.x = x;
        this.y = y;
        this.id = id;
        this.label = label;
        this.radius = 20;
        this.activated = false;
        this.activeTimer = 0;
    }

    trigger() {
        if (!this.activated) {
            this.activated = true;
            if (window.soundManager) window.soundManager.playBeamHit();
            if (window.comicFX) {
                window.comicFX.spawn('CHARGED!', this.x, this.y - 30, { color: '#06d6a0' });
            }
        }
        this.activeTimer = 0.2; // Stay active while beam hits
    }

    update(dt) {
        if (this.activeTimer > 0) {
            this.activeTimer -= dt;
            if (this.activeTimer <= 0) {
                this.activated = false;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Base mount
        ctx.fillStyle = '#2b2d42';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-18, -18, 36, 36);
        ctx.fillRect(-18, -18, 36, 36);

        // Solar Sensor Core
        ctx.fillStyle = this.activated ? '#06d6a0' : '#d90429';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (this.activated) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class ShadowCreature {
    constructor(x, y, patrolPoints = [], dialogueLines = null) {
        this.x = x;
        this.y = y;
        this.patrolPoints = patrolPoints;
        this.currentPatrolIdx = 0;
        this.speed = 45;
        this.radius = 16;
        this.frozen = false;
        this.freezeTimer = 0;
        this.animTimer = 0;
        this.dialogueLines = dialogueLines || [
            { speaker: "SHADOW SOUL", text: "Please... the light... it was too bright that night..." },
            { speaker: "SHADOW SOUL", text: "We weren't hiding from you... we were running from the explosion." }
        ];
    }

    freeze(duration = 3.5) {
        if (!this.frozen) {
            if (window.soundManager) window.soundManager.playShadowFreeze();
            if (window.particleSystem) window.particleSystem.emitShadowFreeze(this.x, this.y);
            if (window.comicFX) {
                window.comicFX.spawn('FROZEN!', this.x, this.y - 30, { color: '#90e0ef' });
            }
        }
        this.frozen = true;
        this.freezeTimer = duration;
    }

    update(dt) {
        this.animTimer += dt;

        if (this.frozen) {
            this.freezeTimer -= dt;
            if (this.freezeTimer <= 0) {
                this.frozen = false;
                if (window.particleSystem) window.particleSystem.emitDarkSmoke(this.x, this.y);
            }
            return;
        }

        // Patrol logic
        if (this.patrolPoints.length > 0) {
            const target = this.patrolPoints[this.currentPatrolIdx];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4) {
                this.currentPatrolIdx = (this.currentPatrolIdx + 1) % this.patrolPoints.length;
            } else {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }

        // Emit faint smoke in dark
        if (Math.random() < 0.15 && window.particleSystem) {
            window.particleSystem.emitDarkSmoke(this.x, this.y);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.frozen) {
            // Crystalline frozen ink statue
            ctx.fillStyle = '#48cae4';
            ctx.strokeStyle = '#0077b6';
            ctx.lineWidth = 3;

            // Ice diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -22);
            ctx.lineTo(16, 0);
            ctx.lineTo(0, 22);
            ctx.lineTo(-16, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Inner humanoid silhouette reaching upward (Twist hint!)
            ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
            ctx.beginPath();
            ctx.arc(0, -6, 5, 0, Math.PI * 2);
            ctx.fillRect(-3, -1, 6, 12);
            ctx.fill();

            // Frost sparkles
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-4, -12, 3, 3);
            ctx.fillRect(5, 4, 2, 2);

            // Interaction hint
            ctx.fillStyle = '#caf0f8';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[E] LISTEN', 0, 32);
        } else {
            // Amorphous shadowy tentacle ink entity
            const wobble = Math.sin(this.animTimer * 6) * 3;
            ctx.fillStyle = '#10121a';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(0, 0, this.radius + wobble, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Ghostly piercing white eyes
            ctx.fillStyle = '#edf2f4';
            ctx.fillRect(-7, -4, 4, 3);
            ctx.fillRect(3, -4, 4, 3);

            // Floating shadowy appendages
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2 + this.animTimer * 2;
                const ox = Math.cos(a) * (this.radius + 6);
                const oy = Math.sin(a) * (this.radius + 4);
                ctx.beginPath();
                ctx.arc(ox, oy, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

class ComicNPC {
    constructor(x, y, name, role, dialogueData, avatarColor = '#e76f51') {
        this.x = x;
        this.y = y;
        this.name = name;
        this.role = role;
        this.dialogueData = dialogueData;
        this.avatarColor = avatarColor;
        this.radius = 18;
        this.animTimer = 0;
    }

    update(dt) {
        this.animTimer += dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const bob = Math.sin(this.animTimer * 3) * 2;
        ctx.translate(0, bob);

        // Body outline (Comic character)
        ctx.fillStyle = this.avatarColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;

        // Torso & Head
        ctx.fillRect(-10, -6, 20, 24);
        ctx.strokeRect(-10, -6, 20, 24);

        ctx.beginPath();
        ctx.arc(0, -14, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hat / Hair detail
        ctx.fillStyle = '#264653';
        ctx.fillRect(-12, -22, 24, 6);
        ctx.strokeRect(-12, -22, 24, 6);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-4, -15, 2.5, 2.5);
        ctx.fillRect(2, -15, 2.5, 2.5);

        // Prompt
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.font = '900 11px "Impact", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(`[E] ${this.name.toUpperCase()}`, 0, 32);
        ctx.fillText(`[E] ${this.name.toUpperCase()}`, 0, 32);

        ctx.restore();
    }
}

class MemoryGlyph {
    constructor(x, y, secretText, normalText = "A silent alleyway...") {
        this.x = x;
        this.y = y;
        this.secretText = secretText;
        this.normalText = normalText;
        this.revealed = false;
        this.isIlluminated = false;
        this.revealTimer = 0;
    }

    update(dt) {
        if (this.isIlluminated && this.revealTimer < 1) {
            this.revealTimer += dt * 2.5;
            if (this.revealTimer >= 1 && !this.revealed) {
                this.revealed = true;
                if (window.soundManager) window.soundManager.playRevealTwist();
                if (window.comicFX) {
                    window.comicFX.spawn('TRUTH REVEALED!', this.x, this.y - 30, { color: '#e63946' });
                    window.comicFX.triggerGlitch(1.2);
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Billboard / Wall poster board
        ctx.fillStyle = this.revealed ? '#fee440' : '#495057';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-70, -22, 140, 44);
        ctx.fillRect(-70, -22, 140, 44);

        // Inner text (Glitched red or normal)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.revealed) {
            ctx.fillStyle = '#d90429';
            ctx.font = 'bold 11px "Impact", sans-serif';
            ctx.fillText(this.secretText, 0, 0);
        } else {
            ctx.fillStyle = '#ced4da';
            ctx.font = 'italic 10px sans-serif';
            ctx.fillText(this.normalText, 0, 0);
        }

        ctx.restore();
    }
}

window.PlayerLumi = PlayerLumi;
window.StreetLamp = StreetLamp;
window.Mirror = Mirror;
window.SolarReceptor = SolarReceptor;
window.ShadowCreature = ShadowCreature;
window.ComicNPC = ComicNPC;
window.MemoryGlyph = MemoryGlyph;
