/**
 * The Last Light - Particle Engine
 * Handles spark embers, light flares, mirror beams, comic stars, and shadow vapor
 */

class Particle {
    constructor(x, y, vx, vy, color, size, life, type = 'spark') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.initialSize = size;
        this.life = life;
        this.maxLife = life;
        this.type = type; // 'spark', 'star', 'smoke', 'freeze', 'glow'
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.life -= dt;
        this.rotation += this.rotSpeed;

        if (this.type === 'spark') {
            this.vy += 0.03; // slight gravity/float
            this.size = this.initialSize * (this.life / this.maxLife);
        } else if (this.type === 'smoke') {
            this.size += dt * 8;
            this.vx *= 0.96;
            this.vy *= 0.96;
        } else if (this.type === 'freeze') {
            this.vx *= 0.92;
            this.vy *= 0.92;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const progress = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'spark') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = progress;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'star') {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.globalAlpha = Math.min(1, progress * 1.5);

            // 4-pointed comic star
            ctx.beginPath();
            const s = this.size;
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(0, 0, s, 0);
            ctx.quadraticCurveTo(0, 0, 0, s);
            ctx.quadraticCurveTo(0, 0, -s, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'freeze') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = progress;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        } else if (this.type === 'smoke') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = progress * 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let p of this.particles) {
            p.draw(ctx);
        }
    }

    emitSparks(x, y, count = 2) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const colors = ['#ffe066', '#ffb703', '#ffffff', '#fb8500'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 1.5 + Math.random() * 2.5;
            const life = 0.3 + Math.random() * 0.4;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color, size, life, 'spark'
            ));
        }
    }

    emitFlareBurst(x, y) {
        // High count burst of comic stars and radiant embers
        for (let i = 0; i < 28; i++) {
            const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
            const speed = 2.5 + Math.random() * 4.5;
            const color = (i % 2 === 0) ? '#ffea00' : '#ffffff';
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color, 3.5 + Math.random() * 3, 0.5 + Math.random() * 0.3,
                (i % 3 === 0) ? 'star' : 'spark'
            ));
        }
    }

    emitLampBurst(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffd166', 2.5 + Math.random() * 2.5, 0.6 + Math.random() * 0.4, 'star'
            ));
        }
    }

    emitShadowFreeze(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.5;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#a0c4ff', 3 + Math.random() * 3, 0.4 + Math.random() * 0.3, 'freeze'
            ));
        }
    }

    emitDarkSmoke(x, y) {
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.6;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#212529', 4 + Math.random() * 4, 0.5 + Math.random() * 0.3, 'smoke'
            ));
        }
    }

    clear() {
        this.particles = [];
    }
}

window.particleSystem = new ParticleSystem();
