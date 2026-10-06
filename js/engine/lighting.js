/**
 * The Last Light - 2D Comic Lighting Engine
 * Dynamic illumination, mirror beam raycasting, halftone darkness, and hidden memory reveal
 */

class LightingEngine {
    constructor() {
        this.darknessCanvas = document.createElement('canvas');
        this.darknessCtx = this.darknessCanvas.getContext('2d');
        this.halftonePattern = null;
        this.width = 960;
        this.height = 640;
        this.darknessAlpha = 0.94; // Dark ink atmosphere
        this.initHalftonePattern();
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.darknessCanvas.width = w;
        this.darknessCanvas.height = h;
    }

    initHalftonePattern() {
        // Create an 8x8 halftone dot tile for comic shading
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 8;
        patternCanvas.height = 8;
        const pCtx = patternCanvas.getContext('2d');

        pCtx.fillStyle = '#0f111a';
        pCtx.fillRect(0, 0, 8, 8);

        pCtx.fillStyle = '#1c1f2e';
        pCtx.beginPath();
        pCtx.arc(4, 4, 2, 0, Math.PI * 2);
        pCtx.fill();

        this.halftonePattern = this.darknessCtx.createPattern(patternCanvas, 'repeat');
    }

    renderLighting(mainCtx, player, lightSources, beams, hiddenObjects, panels) {
        const dCtx = this.darknessCtx;
        dCtx.clearRect(0, 0, this.width, this.height);

        // 1. Fill entire world with comic shadow & halftone
        dCtx.save();
        dCtx.fillStyle = '#090a10';
        dCtx.fillRect(0, 0, this.width, this.height);

        // Apply halftone dot overlay on the darkness
        if (this.halftonePattern) {
            dCtx.globalAlpha = 0.45;
            dCtx.fillStyle = this.halftonePattern;
            dCtx.fillRect(0, 0, this.width, this.height);
        }
        dCtx.restore();

        // 2. Cut out light sources using 'destination-out'
        dCtx.save();
        dCtx.globalCompositeOperation = 'destination-out';

        // Lumi's primary aura
        const baseRadius = player.isFlaring ? player.lightRadius * 1.6 : player.lightRadius;
        // Subtle organic light flicker
        const flicker = Math.sin(Date.now() * 0.008) * 4 + (Math.random() - 0.5) * 3;
        const finalRadius = Math.max(30, baseRadius + flicker);

        this.drawRadialLight(dCtx, player.x, player.y, finalRadius, 1.0);

        // Ambient lights from lamps, spotlights, checkpoints
        for (let light of lightSources) {
            if (light.active) {
                const r = light.radius + Math.sin(Date.now() * 0.005 + light.x) * 3;
                this.drawRadialLight(dCtx, light.x, light.y, r, light.intensity || 0.95);
            }
        }

        // Projector & Mirror Light Beams (cut through darkness)
        for (let beam of beams) {
            this.drawBeamPath(dCtx, beam);
        }

        dCtx.restore();

        // 3. Draw warm golden glow beneath darkness
        mainCtx.save();
        // Warm glow around Lumi
        const glowGrad = mainCtx.createRadialGradient(player.x, player.y, 2, player.x, player.y, finalRadius * 0.9);
        glowGrad.addColorStop(0, 'rgba(255, 236, 179, 0.25)');
        glowGrad.addColorStop(0.5, 'rgba(255, 183, 3, 0.12)');
        glowGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
        mainCtx.fillStyle = glowGrad;
        mainCtx.beginPath();
        mainCtx.arc(player.x, player.y, finalRadius, 0, Math.PI * 2);
        mainCtx.fill();

        // Warm glow around active lamps
        for (let light of lightSources) {
            if (light.active) {
                const lGrad = mainCtx.createRadialGradient(light.x, light.y, 4, light.x, light.y, light.radius);
                lGrad.addColorStop(0, 'rgba(255, 240, 180, 0.3)');
                lGrad.addColorStop(0.6, 'rgba(255, 170, 0, 0.15)');
                lGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');
                mainCtx.fillStyle = lGrad;
                mainCtx.beginPath();
                mainCtx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
                mainCtx.fill();
            }
        }
        mainCtx.restore();

        // 4. Check & reveal hidden memory glyphs / twist secrets
        for (let obj of hiddenObjects) {
            let illuminated = false;
            // Check distance to Lumi
            const dx = obj.x - player.x;
            const dy = obj.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < finalRadius * 0.95) illuminated = true;

            // Check distance to active lights
            if (!illuminated) {
                for (let light of lightSources) {
                    if (light.active) {
                        const ldx = obj.x - light.x;
                        const ldy = obj.y - light.y;
                        if (Math.sqrt(ldx*ldx + ldy*ldy) < light.radius * 0.95) {
                            illuminated = true;
                            break;
                        }
                    }
                }
            }

            // Check beams
            if (!illuminated) {
                for (let beam of beams) {
                    if (this.isPointNearBeam(obj.x, obj.y, beam, 25)) {
                        illuminated = true;
                        break;
                    }
                }
            }

            obj.isIlluminated = illuminated;
            if (illuminated && !obj.revealed) {
                obj.revealed = true;
                if (obj.onReveal) obj.onReveal();
            }
        }

        // 5. Draw Darkness Canvas onto Main Canvas
        mainCtx.save();
        mainCtx.drawImage(this.darknessCanvas, 0, 0);
        mainCtx.restore();

        // 6. Draw laser beams on top of darkness with bright laser core + comic halftone outline
        this.renderBeamsVisual(mainCtx, beams);
    }

    drawRadialLight(ctx, x, y, radius, intensity) {
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        radGrad.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
        radGrad.addColorStop(0.7, `rgba(0, 0, 0, ${intensity * 0.8})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBeamPath(ctx, beam) {
        if (!beam.segments || beam.segments.length < 2) return;
        ctx.lineWidth = beam.width || 22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';

        ctx.beginPath();
        ctx.moveTo(beam.segments[0].x, beam.segments[0].y);
        for (let i = 1; i < beam.segments.length; i++) {
            ctx.lineTo(beam.segments[i].x, beam.segments[i].y);
        }
        ctx.stroke();
    }

    renderBeamsVisual(ctx, beams) {
        for (let beam of beams) {
            if (!beam.segments || beam.segments.length < 2) continue;

            // Outer comic ink beam
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Outer vibrant laser glow
            ctx.strokeStyle = beam.glowColor || 'rgba(255, 220, 100, 0.45)';
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(beam.segments[0].x, beam.segments[0].y);
            for (let i = 1; i < beam.segments.length; i++) {
                ctx.lineTo(beam.segments[i].x, beam.segments[i].y);
            }
            ctx.stroke();

            // Core electric laser beam
            ctx.strokeStyle = beam.coreColor || '#fff8db';
            ctx.lineWidth = 5;
            ctx.stroke();

            // Beam origin & hit sparks
            for (let pt of beam.segments) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    isPointNearBeam(px, py, beam, threshold = 20) {
        if (!beam.segments) return false;
        for (let i = 0; i < beam.segments.length - 1; i++) {
            const p1 = beam.segments[i];
            const p2 = beam.segments[i + 1];
            const d = this.distToSegment(px, py, p1.x, p1.y, p2.x, p2.y);
            if (d <= threshold) return true;
        }
        return false;
    }

    distToSegment(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    /**
     * Raycast a beam through mirrors and obstacles
     * Returns an array of segment points [{x, y}, {x, y}, ...]
     */
    traceBeam(startX, startY, dirAngle, maxDist, mirrors, walls, receptors) {
        const segments = [{ x: startX, y: startY }];
        let currX = startX;
        let currY = startY;
        let currAngle = dirAngle;
        let remainingBounces = 6;
        let hitReceptor = null;

        while (remainingBounces > 0) {
            let closestHit = null;
            let minDistance = maxDist;
            let hitType = null;
            let hitObject = null;

            // Check walls
            for (let wall of walls) {
                const hit = this.rayIntersectRect(currX, currY, currAngle, wall);
                if (hit && hit.dist < minDistance && hit.dist > 1) {
                    minDistance = hit.dist;
                    closestHit = hit;
                    hitType = 'wall';
                    hitObject = wall;
                }
            }

            // Check mirrors
            for (let mirror of mirrors) {
                const hit = this.rayIntersectMirror(currX, currY, currAngle, mirror);
                if (hit && hit.dist < minDistance && hit.dist > 1) {
                    minDistance = hit.dist;
                    closestHit = hit;
                    hitType = 'mirror';
                    hitObject = mirror;
                }
            }

            // Check receptors
            for (let rec of receptors) {
                const hit = this.rayIntersectCircle(currX, currY, currAngle, rec.x, rec.y, rec.radius || 18);
                if (hit && hit.dist < minDistance && hit.dist > 1) {
                    minDistance = hit.dist;
                    closestHit = hit;
                    hitType = 'receptor';
                    hitObject = rec;
                }
            }

            if (closestHit) {
                segments.push({ x: closestHit.x, y: closestHit.y });
                if (hitType === 'mirror') {
                    // Calculate mirror reflection angle
                    // Mirror has angle: 0 (horizontal), 45, 90 (vertical), 135
                    const mirrorNorm = hitObject.getNormal(currAngle);
                    currAngle = this.reflectAngle(currAngle, mirrorNorm);
                    currX = closestHit.x + Math.cos(currAngle) * 2;
                    currY = closestHit.y + Math.sin(currAngle) * 2;
                    remainingBounces--;
                } else if (hitType === 'receptor') {
                    hitReceptor = hitObject;
                    break;
                } else {
                    // Wall hit stops beam
                    break;
                }
            } else {
                // Reached max distance with no collision
                segments.push({
                    x: currX + Math.cos(currAngle) * minDistance,
                    y: currY + Math.sin(currAngle) * minDistance
                });
                break;
            }
        }

        return { segments, hitReceptor };
    }

    rayIntersectCircle(rx, ry, angle, cx, cy, radius) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const fx = rx - cx;
        const fy = ry - cy;

        const a = dx*dx + dy*dy;
        const b = 2 * (fx*dx + fy*dy);
        const c = (fx*fx + fy*fy) - radius*radius;

        const discriminant = b*b - 4*a*c;
        if (discriminant < 0) return null;

        const t1 = (-b - Math.sqrt(discriminant)) / (2*a);
        if (t1 > 0.01) {
            return {
                x: rx + dx * t1,
                y: ry + dy * t1,
                dist: t1
            };
        }
        return null;
    }

    rayIntersectMirror(rx, ry, angle, mirror) {
        // Mirrors are represented by line segments
        const p1 = mirror.getStartPoint();
        const p2 = mirror.getEndPoint();
        return this.rayIntersectSegment(rx, ry, angle, p1.x, p1.y, p2.x, p2.y);
    }

    rayIntersectRect(rx, ry, angle, rect) {
        // Intersect with 4 boundary segments of rect
        const segments = [
            { x1: rect.x, y1: rect.y, x2: rect.x + rect.w, y2: rect.y },
            { x1: rect.x + rect.w, y1: rect.y, x2: rect.x + rect.w, y2: rect.y + rect.h },
            { x1: rect.x + rect.w, y1: rect.y + rect.h, x2: rect.x, y2: rect.y + rect.h },
            { x1: rect.x, y1: rect.y + rect.h, x2: rect.x, y2: rect.y }
        ];

        let closest = null;
        for (let s of segments) {
            const hit = this.rayIntersectSegment(rx, ry, angle, s.x1, s.y1, s.x2, s.y2);
            if (hit && (!closest || hit.dist < closest.dist)) {
                closest = hit;
            }
        }
        return closest;
    }

    rayIntersectSegment(rx, ry, angle, x1, y1, x2, y2) {
        const rdx = Math.cos(angle);
        const rdy = Math.sin(angle);
        const sdx = x2 - x1;
        const sdy = y2 - y1;

        const cross = rdx * sdy - rdy * sdx;
        if (Math.abs(cross) < 1e-6) return null; // parallel

        const dx = x1 - rx;
        const dy = y1 - ry;

        const t = (dx * sdy - dy * sdx) / cross; // distance along ray
        const u = (dx * rdy - dy * rdx) / cross; // parameter along segment [0, 1]

        if (t > 0.1 && u >= 0 && u <= 1) {
            return {
                x: rx + rdx * t,
                y: ry + rdy * t,
                dist: t
            };
        }
        return null;
    }

    reflectAngle(incidentAngle, normalAngle) {
        // R = V - 2 * (V . N) * N
        const ix = Math.cos(incidentAngle);
        const iy = Math.sin(incidentAngle);
        const nx = Math.cos(normalAngle);
        const ny = Math.sin(normalAngle);

        const dot = ix * nx + iy * ny;
        const rx = ix - 2 * dot * nx;
        const ry = iy - 2 * dot * ny;

        return Math.atan2(ry, rx);
    }
}

window.lightingEngine = new LightingEngine();
