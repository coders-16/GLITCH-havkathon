/**
 * The Last Light - Input Manager
 * Keyboard and mouse tracking with canvas coordinate projection
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.justPressedKeys = {};
        this.mouse = { x: 0, y: 0, isDown: false, clicked: false };
        this.canvas = null;

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    bindCanvas(canvas) {
        this.canvas = canvas;
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onKeyDown(e) {
        if (!this.keys[e.code]) {
            this.justPressedKeys[e.code] = true;
        }
        this.keys[e.code] = true;

        // Prevent space/arrow scroll
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }

        // Initialize Audio on first user gesture
        if (window.soundManager) {
            window.soundManager.init();
            window.soundManager.resume();
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
        this.justPressedKeys[e.code] = false;
    }

    onMouseMove(e) {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouse.x = (e.clientX - rect.left) * scaleX;
        this.mouse.y = (e.clientY - rect.top) * scaleY;
    }

    onMouseDown(e) {
        this.mouse.isDown = true;
        this.mouse.clicked = true;
        if (window.soundManager) {
            window.soundManager.init();
            window.soundManager.resume();
        }
    }

    onMouseUp(e) {
        this.mouse.isDown = false;
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isJustPressed(code) {
        if (this.justPressedKeys[code]) {
            this.justPressedKeys[code] = false;
            return true;
        }
        return false;
    }

    isMouseClicked() {
        if (this.mouse.clicked) {
            this.mouse.clicked = false;
            return true;
        }
        return false;
    }

    resetFrame() {
        this.mouse.clicked = false;
        this.justPressedKeys = {};
    }
}

window.inputManager = new InputManager();
