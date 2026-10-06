
Symbols
‎getElementById‎
No definitions or references found
Skip to content
Manjusha321-art
the-last-light
Repository navigation
Code
Issues
Pull requests
Agents
Actions
Projects
Security and quality
Insights
the-last-light/js/gameplay
/game.js
author
coders-16
Complete game release: The Last Light - Themes: Comic, Twist, Light
9a3db71
 · 
7 hours ago
548 lines (444 loc) · 18.4 KB

Code

Blame
/**
 * The Last Light - Master Game Controller
 * State machine, comic rendering pipeline, level progression, and climax endings
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = 'TITLE_SCREEN'; // TITLE_SCREEN, PLAYING, TRANSITION, CLIMAX_CHOICE, ENDING
        this.currentLevelIndex = 0;
        this.currentLevel = null;

        this.player = null;
        this.lamps = [];
        this.mirrors = [];
        this.receptors = [];
        this.shadows = [];
        this.npcs = [];
        this.hiddenGlyphs = [];
        this.beams = [];

        this.pageTransitionAlpha = 0;
        this.isTransitioning = false;
        this.transitionTimer = 0;

        this.endingChosen = null; // 'DAWN' or 'ARC'
        this.lastTime = 0;

        this.init();
    }

    init() {
        window.inputManager.bindCanvas(this.canvas);
        window.lightingEngine.resize(this.canvas.width, this.canvas.height);

        // UI Event Listeners
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const muted = window.soundManager.toggleMute();
                muteBtn.innerText = muted ? '🔇 UNMUTE' : '🔊 MUTE';
            });
        }

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (this.currentLevel) this.loadLevel(this.currentLevelIndex);
            });
        }

        // Start animation loop
        requestAnimationFrame((t) => this.loop(t));
    }

    startGame() {
        const titleOverlay = document.getElementById('titleOverlay');
        if (titleOverlay) titleOverlay.classList.add('hidden');

        window.soundManager.init();
        window.soundManager.resume();

        this.state = 'PLAYING';
        this.loadLevel(0);
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        const levelData = window.LEVELS[index];
        this.currentLevel = levelData;

        // Spawn player
        this.player = new window.PlayerLumi(levelData.playerStart.x, levelData.playerStart.y);

        // Instantiate entities
        this.lamps = levelData.lamps.map(l => new window.StreetLamp(l.x, l.y, l.id, l.initiallyActive));
        this.mirrors = levelData.mirrors.map(m => new window.Mirror(m.x, m.y, m.angleDeg, m.length));
        this.receptors = levelData.receptors.map(r => new window.SolarReceptor(r.x, r.y, r.id, r.label));
        this.shadows = levelData.shadows.map(s => new window.ShadowCreature(s.x, s.y, s.patrolPoints, s.dialogue));
        this.npcs = levelData.npcs.map(n => new window.ComicNPC(n.x, n.y, n.name, n.role, n.dialogue, n.avatarColor));
        this.hiddenGlyphs = levelData.hiddenGlyphs.map(g => new window.MemoryGlyph(g.x, g.y, g.secretText, g.normalText));
        this.beams = [];

        // Clear particles
        if (window.particleSystem) window.particleSystem.clear();

        // Start soundtrack for this area
        if (window.soundManager) {
            window.soundManager.startMusic(levelData.ambientTheme);
        }

        // Display area title splash
        if (window.comicFX) {
            window.comicFX.spawn(levelData.title.toUpperCase(), 480, 260, {
                scale: 1.8,
                duration: 2.2,
                color: '#ffd166'
            });
        }

        // Narration prompt
        if (window.dialogueSystem && levelData.narrationStart) {
            window.dialogueSystem.setNarration(levelData.narrationStart, 5.0, false);
        }

        this.updateHUD();
    }

    triggerLevelTransition(nextAreaIndex) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.transitionTimer = 0;

        if (window.soundManager) window.soundManager.playFlare();
        if (window.comicFX) window.comicFX.spawn('PAGE TURN!', 480, 320, { color: '#06d6a0', scale: 2.0 });

        setTimeout(() => {
            this.loadLevel(nextAreaIndex - 1);
            this.isTransitioning = false;
        }, 800);
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        window.inputManager.resetFrame();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.state === 'TITLE_SCREEN') return;

        // Dialogue System update
        if (window.dialogueSystem) {
            window.dialogueSystem.update(dt);

            // Advance dialogue on space or click
            if (window.dialogueSystem.activeDialogue) {
                if (window.inputManager.isJustPressed('Space') ||
                    window.inputManager.isJustPressed('KeyE') ||
                    window.inputManager.isJustPressed('Enter') ||
                    window.inputManager.isMouseClicked()) {
                    window.dialogueSystem.advance();
                }
                return; // Pause player movement during speech
            }
        }

        // Comic FX and Particles
        if (window.comicFX) window.comicFX.update(dt);
        if (window.particleSystem) window.particleSystem.update(dt);

        if (this.state === 'PLAYING') {
            this.updateGameplay(dt);
        }
    }

    updateGameplay(dt) {
        const input = window.inputManager;
        const player = this.player;
        const level = this.currentLevel;

        // Player flare trigger (Space bar)
        if (input.isJustPressed('Space')) {
            player.triggerFlare();
        }

        // Update player
        player.update(dt, input, level.walls);

        // Update Receptors
        for (let rec of this.receptors) {
            rec.update(dt);
        }

        // Calculate Light Beams from Emitters
        this.calculateBeams();

        // Check Lamp ignition
        for (let lamp of this.lamps) {
            if (!lamp.active) {
                const dist = Math.hypot(player.x - lamp.x, player.y - (lamp.y - 10));
                // Flare or direct proximity
                if (player.isFlaring && dist < 140) {
                    lamp.ignite();
                    this.updateHUD();
                } else if (dist < 55 && input.isJustPressed('KeyE')) {
                    lamp.ignite();
                    this.updateHUD();
                }
            }
        }

        // Check Mirror rotation (Click or [E])
        const mouse = input.mouse;
        for (let mirror of this.mirrors) {
            const distMouse = Math.hypot(mouse.x - mirror.x, mouse.y - mirror.y);
            const distPlayer = Math.hypot(player.x - mirror.x, player.y - mirror.y);

            if (input.isMouseClicked() && distMouse < 32 && distPlayer < 120) {
                mirror.rotate();
            } else if (distPlayer < 50 && input.isJustPressed('KeyE')) {
                mirror.rotate();
            }
        }

        // Update Shadow Creatures & freeze checking
        for (let shadow of this.shadows) {
            shadow.update(dt);

            // Check if caught in Lumi's flare
            const distToPlayer = Math.hypot(player.x - shadow.x, player.y - shadow.y);
            if (player.isFlaring && distToPlayer < player.lightRadius * 1.5) {
                shadow.freeze(4.0);
            }

            // Check if hit by any active beam
            for (let beam of this.beams) {
                if (window.lightingEngine.isPointNearBeam(shadow.x, shadow.y, beam, 25)) {
                    shadow.freeze(3.0);
                }
            }

            // Talk to frozen shadow
            if (shadow.frozen && distToPlayer < 50 && input.isJustPressed('KeyE')) {
                window.dialogueSystem.startDialogue({ lines: shadow.dialogueLines });
            }
        }

        // Update NPCs
        for (let npc of this.npcs) {
            npc.update(dt);
            const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
            if (dist < 55 && input.isJustPressed('KeyE')) {
                window.dialogueSystem.startDialogue(npc.dialogue);
            }
        }

        // Update Memory Glyphs
        for (let glyph of this.hiddenGlyphs) {
            glyph.update(dt);
        }

        // Check Area Completion
        const isComplete = level.isObjectiveComplete(this);
        if (isComplete) {
            // Check exit trigger in Areas 1-3
            if (level.exitTrigger) {
                const trig = level.exitTrigger;
                if (player.x >= trig.x && player.x <= trig.x + trig.w &&
                    player.y >= trig.y && player.y <= trig.y + trig.h) {
                    this.triggerLevelTransition(trig.nextArea);
                }
            } else if (level.id === 4 && this.state !== 'CLIMAX_CHOICE') {
                // Final Page reached & singularity charged!
                this.state = 'CLIMAX_CHOICE';
                this.showClimaxChoiceUI();
            }
        }
    }

    calculateBeams() {
        this.beams = [];
        const level = this.currentLevel;
        if (!level || !level.emitters) return;

        for (let emitter of level.emitters) {
            if (!emitter.active) continue;

            const trace = window.lightingEngine.traceBeam(
                emitter.x, emitter.y, emitter.angle, emitter.length,
                this.mirrors, level.walls, this.receptors
            );

            this.beams.push({
                segments: trace.segments,
                glowColor: 'rgba(255, 230, 110, 0.45)',
                coreColor: '#fff9db'
            });

            if (trace.hitReceptor) {
                trace.hitReceptor.trigger();
            }
        }
    }

    showClimaxChoiceUI() {
        if (window.soundManager) window.soundManager.playRevealTwist();
        if (window.comicFX) {
            window.comicFX.spawn('THE CLIMAX!', 480, 240, { scale: 2.2, color: '#e63946' });
            window.comicFX.triggerGlitch(2.0);
        }

        const modal = document.getElementById('choiceModal');
        if (modal) modal.classList.remove('hidden');

        const btnA = document.getElementById('choiceBtnA');
        const btnB = document.getElementById('choiceBtnB');

        if (btnA) {
            btnA.onclick = () => this.triggerEnding('DAWN');
        }
        if (btnB) {
            btnB.onclick = () => this.triggerEnding('ARC');
        }
    }

    triggerEnding(choice) {
        this.endingChosen = choice;
        this.state = 'ENDING';

        const modal = document.getElementById('choiceModal');
        if (modal) modal.classList.add('hidden');

        const endingOverlay = document.getElementById('endingOverlay');
        if (endingOverlay) endingOverlay.classList.remove('hidden');

        const titleEl = document.getElementById('endingTitle');
        const descEl = document.getElementById('endingText');
        const subtextEl = document.getElementById('endingSubtext');

        if (choice === 'DAWN') {
            if (titleEl) titleEl.innerText = "ENDING A: THE TRUE DAWN";
            if (descEl) descEl.innerHTML = `
                Lumi releases the contained surge deep into the earth's cooling sinks.<br><br>
                The blinding overload gently fades away. Above the city, the true sun rises for the first time in days.<br>
                The citizens wake from the shadows, rubbing their eyes, as Lumi dissolves peacefully into the golden morning breeze.<br><br>
                <em>"The city did not need to be relit... it only needed the morning."</em>
            `;
            if (subtextEl) subtextEl.innerText = "★ You restored natural peace to the graphic novel world.";
        } else {
            if (titleEl) titleEl.innerText = "ENDING B: THE LIVING ARC";
            if (descEl) descEl.innerHTML = `
                Lumi channels the boundless surge across the entire skyline grid!<br><br>
                Every lamp, billboard, and comic frame crackles with vibrant neon energy.<br>
                Lumi ascends to the highest spire, immortalized as the city's legendary guardian superhero: <strong>The Living Spark</strong>.<br><br>
                <em>"Born of lightning, bound to light... the story will never go dark again."</em>
            `;
            if (subtextEl) subtextEl.innerText = "★ You embraced the spark and became the legend of the comic book.";
        }

        if (window.soundManager) {
            window.soundManager.startMusic(4);
            window.soundManager.playFlare();
        }
    }

    updateHUD() {
        const titleEl = document.getElementById('hudChapter');
        const objEl = document.getElementById('hudObjective');
        if (titleEl && this.currentLevel) titleEl.innerText = this.currentLevel.title;
        if (objEl && this.currentLevel) objEl.innerText = this.currentLevel.objectiveDescription;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'TITLE_SCREEN') {
            return;
        }

        ctx.save();

        // 1. Camera Shake from Comic FX
        if (window.comicFX) window.comicFX.applyCameraShake(ctx);

        // 2. Draw Comic Page Background (Newsprint halftone texture)
        this.renderComicPageBackground(ctx);

        // 3. Draw Level Environment & Walls
        this.renderEnvironment(ctx);

        // 4. Draw Hidden Glyphs (under darkness)
        for (let glyph of this.hiddenGlyphs) {
            glyph.draw(ctx);
        }

        // 5. Draw Streetlamps
        for (let lamp of this.lamps) {
            lamp.draw(ctx);
        }

        // 6. Draw Receptors
        for (let rec of this.receptors) {
            rec.draw(ctx);
        }

        // 7. Draw Mirrors
        for (let mirror of this.mirrors) {
            mirror.draw(ctx);
        }

        // 8. Draw NPCs
        for (let npc of this.npcs) {
            npc.draw(ctx);
        }

        // 9. Draw Shadow Creatures
        for (let shadow of this.shadows) {
            shadow.draw(ctx);
        }

        // 10. Draw Exit Gate Indicator
        this.renderExitGate(ctx);

        // 11. Draw Particles (under darkness)
        if (window.particleSystem) window.particleSystem.draw(ctx);

        // 12. Draw Lumi Player
        if (this.player) this.player.draw(ctx);

        // 13. Dynamic 2D Lighting & Fog of War
        if (window.lightingEngine && this.player) {
            const allLights = [
                ...this.lamps,
                ...(this.currentLevel.emitters ? this.currentLevel.emitters.map(e => ({ x: e.x, y: e.y, radius: 40, active: e.active })) : [])
            ];
            window.lightingEngine.renderLighting(ctx, this.player, allLights, this.beams, this.hiddenGlyphs, this.currentLevel.panels);
        }

        // 14. Draw Comic Panel Outlines & Numbers
        if (window.comicFX && this.currentLevel) {
            window.comicFX.drawPanelBorders(ctx, this.currentLevel.panels);
        }

        // 15. Draw Comic FX (Onomatopoeia Popups: POW, BZZT, FLASH)
        if (window.comicFX) window.comicFX.draw(ctx);

        // 16. Draw Comic Dialogue & Speech Bubbles
        if (window.dialogueSystem) window.dialogueSystem.draw(ctx);

        // 17. In-Game Comic Energy HUD
        this.renderInGameHUD(ctx);

        ctx.restore();
    }

    renderComicPageBackground(ctx) {
        // Warm vintage comic paper / newsprint tone
        ctx.fillStyle = '#f4ede2';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Subtle comic grid dots
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        for (let x = 15; x < this.canvas.width; x += 24) {
            for (let y = 15; y < this.canvas.height; y += 24) {
                ctx.fillRect(x, y, 1.5, 1.5);
            }
        }
    }

    renderEnvironment(ctx) {
        const level = this.currentLevel;
        if (!level) return;

        // Draw Walls / Gutters with thick comic ink
        ctx.fillStyle = '#1c1f2e';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        for (let wall of level.walls) {
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        }
    }

    renderExitGate(ctx) {
        const level = this.currentLevel;
        if (!level || !level.exitTrigger) return;
        const trig = level.exitTrigger;
        const isUnlocked = level.isObjectiveComplete(this);

        ctx.save();
        ctx.fillStyle = isUnlocked ? '#06d6a0' : '#d90429';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;

        ctx.strokeRect(trig.x, trig.y, trig.w, trig.h);
        ctx.fillRect(trig.x, trig.y, trig.w, trig.h);

        // Comic arrow or lock symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px "Impact", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isUnlocked) {
            ctx.fillText('NEXT', trig.x + trig.w / 2, trig.y + trig.h / 2 - 8);
            ctx.fillText('PAGE ▶', trig.x + trig.w / 2, trig.y + trig.h / 2 + 8);
        } else {
            ctx.fillText('LOCKED', trig.x + trig.w / 2, trig.y + trig.h / 2);
        }

        ctx.restore();
    }

    renderInGameHUD(ctx) {
        if (!this.player) return;

        // Spark Energy Bar in bottom-left comic badge
        ctx.save();
        const hudX = 30;
        const hudY = 570;
        const hudW = 190;
        const hudH = 26;

        // Badge border
        ctx.fillStyle = '#141724';
        ctx.fillRect(hudX, hudY, hudW, hudH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(hudX, hudY, hudW, hudH);

        // Energy Bar Fill
        const fillW = Math.max(0, (this.player.energy / this.player.maxEnergy) * (hudW - 60));
        ctx.fillStyle = this.player.energy > 25 ? '#ffd166' : '#d90429';
        ctx.fillRect(hudX + 54, hudY + 4, fillW, hudH - 8);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "Impact", sans-serif';
        ctx.fillText('SPARK:', hudX + 8, hudY + 18);

        // Flare control prompt
        ctx.fillStyle = '#141724';
        ctx.font = 'bold 11px "Comic Neue", sans-serif';
        ctx.fillText('[SPACE] FLARE   •   [E / CLICK] INTERACT', hudX + 210, hudY + 18);

        ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
godot_project content loaded
