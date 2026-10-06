/**
 * The Last Light - Audio Engine (Web Audio API Synthesizer)
 * 100% Procedural Audio: Dynamic ambient music + retro comic sound effects
 * Zero external audio dependencies for instant offline & browser compatibility
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.currentTrack = null;
        this.musicInterval = null;
        this.initialized = false;
        this.currentArea = 1;
        this.notesPlaying = [];
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.35;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio not supported or blocked:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // --- Sound Effects ---

    playFootstep() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playFlare() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Warm expanding swoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        // White noise burst for spark crackle
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2400;
        noiseFilter.Q.value = 2.0;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.36);
        noise.stop(now + 0.21);
    }

    playMirrorTurn() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.setValueAtTime(920, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    playLampIgnite() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Sub bass boom + warm electrical hum
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(110, now);
        sub.frequency.exponentialRampToValueAtTime(55, now + 0.4);
        subGain.gain.setValueAtTime(0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.41);

        // Ascending harmonic chime
        [330, 440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.06;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.18, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.36);
        });
    }

    playShadowFreeze() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Crystalline ice freeze shimmer
        [987.77, 1318.51, 1567.98].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const st = now + i * 0.03;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, st);
            osc.frequency.linearRampToValueAtTime(freq * 1.25, st + 0.25);

            gain.gain.setValueAtTime(0.2, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(st);
            osc.stop(st + 0.31);
        });
    }

    playComicPop() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.09);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    playTypewriter() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700 + Math.random() * 200, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.035);
    }

    playRevealTwist() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Ominous dissonant warp
        const chord = [220, 233.08, 311.13, 440]; // Dissonant minor 2nd clash
        chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.9);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1800, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.9);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.91);
        });
    }

    playBeamHit() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.26);
    }

    // --- Procedural Ambient Soundtrack ---

    startMusic(areaNum) {
        this.currentArea = areaNum;
        if (!this.initialized) return;
        this.stopMusic();

        const step = 0;
        let stepCounter = 0;

        // Scales per area
        // Area 1: D Minor Pentatonic (D, F, G, A, C)
        const scale1 = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23];
        // Area 2: A Minor / Melodic theatre waltz
        const scale2 = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 440.00];
        // Area 3: Tense C Minor with heavy bass
        const scale3 = [130.81, 155.56, 174.61, 196.00, 207.65, 261.63, 311.13];
        // Area 4: Radiant E Major / Majestic revelation
        const scale4 = [164.81, 207.65, 246.94, 329.63, 415.30, 493.88, 659.25];

        const tick = () => {
            if (this.isMuted) return;
            const now = this.ctx.currentTime;
            let currentScale = scale1;
            let tempo = 550; // ms

            if (this.currentArea === 2) {
                currentScale = scale2;
                tempo = 480;
            } else if (this.currentArea === 3) {
                currentScale = scale3;
                tempo = 380;
            } else if (this.currentArea === 4) {
                currentScale = scale4;
                tempo = 420;
            }

            // Arpeggio note
            if (stepCounter % 2 === 0 || Math.random() < 0.6) {
                const noteIndex = Math.floor(Math.random() * currentScale.length);
                const freq = currentScale[noteIndex];
                this.playPadNote(freq, now, 0.9, 0.05);
            }

            // Occasional bass drone
            if (stepCounter % 8 === 0) {
                const bassFreq = currentScale[0] / 2;
                this.playPadNote(bassFreq, now, 2.2, 0.08);
            }

            stepCounter++;
        };

        this.musicInterval = setInterval(tick, 500);
    }

    playPadNote(freq, start, duration, vol) {
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, start);

            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(vol, start + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(start);
            osc.stop(start + duration + 0.1);
        } catch (e) {}
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

window.soundManager = new SoundManager();
